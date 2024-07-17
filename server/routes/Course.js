// Import the required module
const express = require("express");
const router = express.Router();

// Imports all the controllers
// Course controllers import

const {
    createCourse,
    getAllCourses,
    getCourseDetails,
    getFullCourseDetails,
    editCourse,
    getInstructorsCourses,
    deleteCourse,
} = require("../contorllers/Course")

// tag controller Import

// categories controllers import
const {
    showAllCategories,
    createCategory,
    categoryPageDetails
} = require("../contorllers/Category")

// Section Controllers import
const {
    createSection,
    updateSection,
    deleteSection
} = require("../contorllers/Section")

// Sunb-section controllers import
const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require("../contorllers/Subsection");

// const {
//     updateCourseProgress,
//     getProgressPercentage,
//   } = require("../controllers/courseProgress")
// const { createRating } = require("../contorllers/RatingAndReview");

// rating controllers import
// const {
//     createRating,
//     getAverageRating,
//     getAllRatingReview
// } = require("../contorllers/RatingAndReview")

// Importing Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// course can be created by instructor
router.post("/createCourse", auth, isInstructor, createCourse);

// Edit course route
router.post("/editCourse", auth, isInstructor, editCourse)

// Add section to a course
router.post("/addSection", auth, isInstructor, createSection)

// update section 
router.post("/updateSection", auth, isInstructor, updateSection)

// delete section
router.post("/deleteSection", auth, isInstructor, deleteSection)

// Edit sub section
router.post("/updateSubSection", auth, isInstructor, updateSubSection)

// delete subsection
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)

// create sub section
router.post("/addSubSection", auth, isInstructor, createSubSection)

// get all courses under the specific instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorsCourses)

// get all registered courses
router.get("/getAllCourses", getAllCourses)

// get all details for specific course
router.post("/getCourseDetails", getCourseDetails)
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// To Update Course Progress
// router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)

// delete a course
router.delete("/deleteCourse", deleteCourse)

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************

router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************

// router.post("/createRating", auth, isStudent, createRating)
// router.get("/getAverageRating", getAverageRating)
// router.get("/getReviews", getAllRating)

module.exports = router
