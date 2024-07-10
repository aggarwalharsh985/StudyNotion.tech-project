const User = require("../models/User");
// const user = require("../models/User");
const mailSender = require("../utils/mailSender")
const bcrypt = require("bcrypt")

// resetpassoword tokken 
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from request body
        const email = req.body.email;
        // check user for this emial, email validation 
        const user = await User.findOne({email: email})
        if(!user){
            return res.json({
                success: false,
                message: "Your email is not registered with us"
            })
        }
        // generate token
        const token = crypto.randomUUID();
        // update user by adding token and expiration time
        const updateDetails = await User.findOneAndUpdate(
                                    {email: email},
                                    {
                                        token: token,
                                        resetPasswordExpires: Date.now() + 5*60*60*1000
                                    },
                                    {new: true},
        );
        console.log("DETAILS", updateDetails)

        // create URL
        const url = `http://localhost:3000/update-password/${token}`

        // send mail containing the url
        await mailSender(user.email, 
                        "Password Reset Link",
                        `Password Reset Link: ${url}`
        );
        // return response
        return res.json({
            success: true,
            message: "Email sent successfully please check the email and change the password"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sendig the reset password mail "
        });
    }
};

// reset password 
exports.resetPassword = async (req, res) => {
    try {
        // fetch the data from body
    const {password, confirmpassword, token } = req.body;
    
    // validation
    if(confirmpassword !== password ){
        return res.json({
            success: false,
            message: "password doen not match"
        });  
    }
    // get user detail from db using token 
    const userDetail = await User.findOne({token: token});

    // if no entry than invalid token 
    if(!userDetail){
        return res.json({
            success: false,
            message: "Token is invalid"
        });
    }
    // token time check
    if(userDetail.resetPasswordExpires < Date.now()){
        return res.json({
            success: false,
            message: "Token is expired , please regenrate the token "
        });
    }
    // hashed the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // password update
    await User.findOneAndUpdate(
        {token: token},
        {password: hashedPassword},
        {new: true}
    )
    return res.status(200).json({
        success: true,
        message: "Password reset successfully"
    });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending the reset password mail",
            error: message.error
        })
    }
}