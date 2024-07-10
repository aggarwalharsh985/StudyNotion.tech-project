const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");
dotenv.config();

exports.auth = async (req, res, next) => {
    try {

        // extract token from body
        const token = req.cookies.token ||
                      req.body.token ||
                      req.header("Authorization").replace("Bearer ", "");

        // if token missing than return the res
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token is missing "
            })
        }

        // verify the token 
        try {
            const decode = await jwt.verify(token, process.env.JWT_SECRET)
            console.log(decode);
            req.user = decode;
        } catch (error) {
            console.log(error)
            // verification issue
            return res.status(401).json({
                success: false,
                message: "veification issue"
            });
        }
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validation the token"
        });
    }
}

// isStudent 
exports.isStudent = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        if(userDetails.accountType !== "Student"){
            return res.status(401).json({
                success: false,
                message: "This is the protected route for Student only "
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verify, please try again"
        })
    }
}
// isInstructor 
exports.isInstructor = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success: false,
                message: "This is the protected route for Instructor only "
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verify, please try again"
        })
    }
}
// isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success: false,
                message: "This is the protected route for Admin only "
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verify, please try again"
        })
    }
}