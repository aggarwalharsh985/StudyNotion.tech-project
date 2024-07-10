const express = require("express")
const router = express.Router()

// import the controllers and middlewares
const {
    login,
    signUp,
    sendotp,
    changePassword
} = require("../contorllers/Auth")

const {
    resetPasswordToken,
    resetPassword
} = require("../contorllers/ResetPassword")

const {auth} = require("../middlewares/auth")

// *********************** Authentication Routes**************************

// Route for user login
router.post("/login", login)
// Route for user signup
router.post("/signup", signUp)
// Router for user changepasword
router.post("/changepassword", auth, changePassword)
// Router for user send otp
router.post("/sendotp", sendotp)

// **************************Reset Password *********************************

// route for generating the resent password token 
router.post("/reset-password-token", resetPasswordToken)

// route for reseting the user's password after verification
router.post("/reset-password", resetPassword)

module.exports = router
