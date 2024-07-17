const Profile = require("../models/Profile");
const User = require("../models/User");
const mongoose = require("mongoose")
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.updateProfile = async (req, res) => {
    try {
        // fetch data
        const {dateOfBirth = "", about = "", contactNumber = "", gender = ""} = req.body;
        //  get user id
        const id = req.user.id
        
        // validation
        // if(!contactNumber || !gender){
        //     return res.status(404).json({
        //         success: false,
        //         message: "Missing properties",
        //     })
        // }

        // find profile
        const userDetail = await User.findById(id).populate('additionalDetails').exec();
        console.log("userDetail", userDetail)

        const profileDetails = await Profile.findById(userDetail.additionalDetails);
        console.log("profileDetails", profileDetails)

        if (!profileDetails) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }
        
        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();

        const updatedUserDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec()

        return res.status(200).json({
            success: true,
            message: "Profile update successfully",
            updatedUserDetails
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error in Profile",
            error: error.message
        })
    }
} 

// delete account
exports.deleteAccount = async (req,res) => {
    try {
        // get id
        const id = req.user.id;

        // validation
        const userDetails = await User.findById({ _id: id });
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }
        // delete profile
        await Profile.findByIdAndDelete({ _id: new mongoose.Types.ObjectId(userDetails.additionalDetails)});
        await User.findByIdAndDelete({_id:id});

        // return response
        return res.status(200).json({
            success: true,
            message: "User deleted sucessfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be deleted successfully - Invalid server error in Profile"
        })
    }
}

exports.getAllUserDetail = async (req, res) => {
    try {
        const id = req.user.id

        // validation and get user detail
        const userDetail = await User.findById(id).populate("additionalDetails").exec();
        return res.status(200).json({
            success: true,
            message: "User details fetch successfully",
            userDetail
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// update profile photo
exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture
        const userId = req.user.id
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
        console.log(image)
        const updateProfile = await User.findByIdAndUpdate(
            {_id: userId},
            {image: image.secure_url},
            {new: true}
        )
        res.send({
            success: true,
            message: "Image Updated Successfully",
            data: updateProfile
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// enrolled courses
exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id
        let userDetails = await User.findOne({
            _id:userId,
        })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection"
                    }
                }
            })
            .exec()
        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find use with this id ${userDetails}`
            })
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}