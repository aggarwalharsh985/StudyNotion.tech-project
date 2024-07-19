const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")

// create course hadler function
exports.createCourse = async (req,res) => {
    try {
        // fetch data
        // const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;
        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag: _tag,
            category,
            status,
            instructions: _instructions,
          } = req.body

        // get thumbnail
        const thumbnail = req.files ? req.files.thumbnailImage : null;
    if (!thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image is required",
      });
    }
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)

        console.log("tag : ", tag)
        console.log("instructions: ", instructions)
        console.log("courseDescription: ", courseDescription)
        console.log("courseName : ", courseName)
        console.log("price :", price)
        console.log("category : ", category)
        console.log("whatYouWillLearn : ", whatYouWillLearn)

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length || !thumbnail || !category ||
            !instructions.length){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        if (!status || status === undefined) {
            status = "Draft"
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId , {
            accountType: "Instructor",
        });
        // console.log("Instructor Detail: ", instructorDetail);
        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: "Instructor Details not found"
            })
        }

        // check tag detail valid or not 
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: 'Category Detail not found'
            })
        }

        // upload image to cloudinary 
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)
        console.log("Cloudinary Response:", thumbnailImage);
        // craete a entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            category: categoryDetails._id,
            tag,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions,
        })
        // add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true},
        )
        const categoryDetails2 = await Category.findByIdAndUpdate(
            { _id: category },
            {
              $push: {
                courses: newCourse._id,
              },
            },
            { new: true }
        )
        console.log("HEREEEEEEEE", categoryDetails2)
        // return response
        res.status(200).json({
            success: true,
            message: "Course creaed successfully",
            data: newCourse
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message
        })
    }
}

// Edit Course details
exports.editCourse = async (req, res) => {
    try {
        const {courseId} = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        if(!course){
            return res.status(404).json({error: "course not found"})
        }

        if(req.files){
            console.log("thumbnail updates")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
          }
        await course.save()

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path:"instructor",
                populate:{
                    path:"additionalDetails"
                }
            })
            .populate("category")
            // .populate("ratingAndReviews")
            .populate({
                path:"courseContent",
                populate: {
                    path: "subSection",
                }
            })
            .exec()

        res.json({
            success: true,
            message: "Course updated Successfully",
            data: updatedCourse
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            massage: "Internal server error,",
            error: error.massage
        })
    }
}


// get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find(
            {status: "Published"},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                // ratingAndReview: true,
                studentEnrolled: true,
            }
        )
        .populate("instructor")
        .exec()

        return res.status(200).json({
            success: true,
            data: allCourses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "can not fetch course data",
            error: message.error
        })
    }
}

// get course details
exports.getCourseDetails = async (req, res) => {
    try {
        // get id
        const {courseId} = req.body;
        // find course details
        const courseDetails = await Course.findOne(
                                    {_id:courseId})
                                    .populate(
                                        {
                                            path: "instructor",
                                            populate: {
                                                path: "additionalDetails"
                                            }
                                        }
                                    )
                                    .populate("category")
                                    // .populate(ratingAndReview)
                                    .populate({
                                        path: "courseContent",
                                        populate:{
                                            path:"subSection",
                                            select: "-videoUrl",
                                        }
                                    })
                                    .exec();
                // validation
                if(!courseDetails){
                    return res.status(400).json({
                        success: false,
                        message: `Could not find the course with ${courseId}`
                    })
                }
                // let totalDurationInSeconds = 0
                // courseDetails.courseContent.forEach((content) => {
                //     content.subSection.forEach((subSection) => {
                //         const timeDurationInSeconds = parseInt(subSection.timeDuration)
                //         totalDurationInSeconds += timeDurationInSeconds
                //     })
                // })

                // const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
                // return response
                return res.status(200).json({
                    success: true,
                    message: "Course details fetched successfully",
                    data:{
                        courseDetails
                    }
                })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getFullCourseDetails = async (req, res) => {
    try {
        const {courseId} = req.body
        const userId = req.user.id
        const courseDetails = await Course.findOne({
            _id:courseId
        })
            .populate({
                path:"instructor",
                populate:{
                    path:"additionalDetails"
                }
            })
            .populate("category")
            // .populate("ratingAndReview")
            .populate({
                path:"courseContent",
                populate: {
                    path: "subSection"
                }
            })
            .exec()
        // let courseProgressCount = await CourseProgress.findOne({
        //     courseID: courseId,
        //     userId: userId
        // })
        // console.log("courseProgresCount", courseProgressCount)

        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: `Could not find course with id ${courseId}`,
            })
        }
        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                // totalDuration,
                // completedVideos: courseProgressCount?.completedVideos
                //     ? courseProgressCount?.completedVideos
                //     : [],
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getInstructorsCourses = async (req, res) => {
    try {
        const instructorId = req.user.id
        const instructorCourses = await Course.find({
            instructor:instructorId,
        }).sort({createdAt: -1})

        res.status(200).json({
            success: true,
            data: instructorCourses
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor course",
            error: error.message
        })
    }
}

exports.deleteCourse = async (req,res) => {
    try {
        const {courseId} = req.body

        const course = await Course.findById(courseId)
        if(!course){
            return res.status(400).json({message: "Course not found"})
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                await SubSection.findByIdAndDelete(subSectionId)
                }
            }
            // delete the section
            await Section.findByIdAndDelete(sectionId)
        }
        
        // delete the course
        await Course.findByIdAndDelete(courseId)
        return res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "server error",
            error: error.message
        })
    }
}