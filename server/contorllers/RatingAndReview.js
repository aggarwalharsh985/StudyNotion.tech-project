const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course")

// create rating
exports.createRating = async (req, res) => {
    try {
        // get user id
        const userId = req.body.id;

        // fetch data
        const  {rating, review, courseId} = req.body;

        // check  user is enrolled or not 
        const courseDetails = await Course.findOne(
                                    {
                                        _id: courseId,
                                        studentsEnroled: {$elemMatch: {$eq: userId}},
                                    }
        );
        if(!courseDetails){
            return res.status(404).josn({
                success: false,
                message: "Student is not enrolled in the course",
            })
        }

        // check if user already review the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        });
        if(alreadyReviewed){
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed by the user"
            });
        }

        // create rating and review
        const ratingReview = await RatingAndReview.create(
                                        {
                                            rating,review,
                                            course: courseId,
                                            user: userId
                                        }
        );
        // Update course with rating and review 
        const updateCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push: {
                                            ratingAndReview: ratingReview._id
                                        }
                                    },
                                    {new: true}
        )
        console.log(updateCourseDetails)
        // return response
        return res.status(200).json({
            success: true,
            message: "Rating and review created successfully",
            ratingReview
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// get average rating 
exports.getAverageRating = async (req, res) => {
    try {
        // get courseId
        const courseId = req.body.courseId

        // calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: {$avg: "$rating"},
                }
            }
        ])
        // return rating 
        if(result.length > 0){
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating
            })
        }

        // if no rating and review exist 
        return res.status(200).json({
            success: true,
            message: "Average rating is 0, no raring given till now",
            averageRating: 0
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// get all rating and review 
exports.getAllRatingReview = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
                                .sort({rating: "desc"})
                                .populate({
                                    path: "user",
                                    select: "firstName lastName emial image"
                                })
                                .populate({
                                    path: "course",
                                    select: "courseName"
                                })
                                .exec();
            return res.status(200).json({
                success: true,
                message: "All review fetch successfully",
                data: allReviews
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve the rating and review for the course",
            error: error.message
        })
    }
}