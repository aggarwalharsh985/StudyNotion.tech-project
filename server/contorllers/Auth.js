const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile")
const mailSender = require("../utils/mailSender")
const {passwordUpdated} = require("../mail/templates/passwordUpdate")
require("dotenv").config();
// send otp
exports.sendotp = async (req,res) => {
    try {
        // fetch email from request's body
        const {email} = req.body;

        // check if user is already exist
        const checkUserPresent = await User.findOne({email});

        // if already exist the return response
        if(checkUserPresent){
            return res.status(401).json({
                success: false,
                message: 'User already exist'
            })
        }
        // generate otp
        var otp = otpGenerator.generate(6 , {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log("OTP generated: ", otp );

        // check unique otp or not 
        let result = await OTP.findOne({otp: otp});
        console.log("Result is Generate OTP Func")
        console.log("OTP", otp)
        console.log("Result", result)
        while(result){
            otp = otpGenerator.generate(6 , {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTP.findOne({otp: otp});
        }
        const otpPayLoad = {email, otp};

        // create an entry for otp 
        const otpBody = await OTP.create(otpPayLoad);
        console.log(otpBody);

        // return response successfull
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message: error.message,

        })
    }
}

// sign up
exports.signUp = async (req, res) => {
    try {
        // data fetch from body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // validdation 
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success: false,
                message: "all fields are required"
            })
        }

        // checking the password 
        if(password !== confirmPassword){
            return res.status(403).json({
                success: false,
                message: "password does not match please try again"
            });
        }
        
        // checking user already exist or not 
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(403).json({
                success: false,
                message: "user already exist"
            })
        }

        // find most recent OTP stored for the user
        const response = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        // console.log(error);
        if(response.length === 0){
            // otp not found 
            return res.status(400).json({
                success: false,
                message: "otp not found"
            })
        }
        // Invalid otp
        else if(otp !== response[0].otp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // hashed password
        const hashedPassword = await bcrypt.hash(password, 10);

        // entry created in db
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        });
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`
        })
        return res.status(200).json({
            success: true,
            user: user,
            message: "user is registered successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "user cannot be registered , please try again",
            // error: message.error
        })
    }
}

// Login
exports.login = async (req,res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(403).json({
                success: false,
                message: "all fields are required please try again "
            })
        }
        // user check exist or not 
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(403).json({
                success: false,
                message: "User is not registered, SignUp first"
            })
        }

        // generate jwt after mathing the password
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                accountType: user.accountType,
                id: user._id
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h"
            });
            user.token = token;
            user.password = undefined;

            // create cookies and send messages
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Login successfully"
            })
        }
        else{
            return res.status(401).json({
                success: false,
                message: "password is incorrect"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login Failure, please try again',
        });
    }
};

// change Password
exports.changePassword = async (req, res) => {
    try {
      // Get user data from req.user
      const userDetails = await User.findById(req.user.id)
  
      // Get old password, new password, and confirm new password from req.body
      const { oldPassword, newPassword } = req.body

      // Validate old password
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      )
      console.log("password bcrypt successfully")
      if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }
  
      // Update password
      const encryptedPassword = await bcrypt.hash(newPassword, 10)
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      )
  
      // Send notification email
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
  
      // Return success response
      return res.status(200).json({
         success: true, message: "Password updated successfully"
        })
    } catch (error) {
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })
    }
}
