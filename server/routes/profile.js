const express = require("express")
const router = express.Router()

const {auth, isInstructor} = require("../middlewares/auth")
const{
    deleteAccount,
    updateProfile,
    getAllUserDetail,
    updateDisplayPicture,
    getEnrolledCourses,
    // instructorDashboard
} = require("../contorllers/Profile")

// **********************profile routes***********************

// delete user account
router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetail)

// get enrolled courses
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
// router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

module.exports = router