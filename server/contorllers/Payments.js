const instance = require("../config/razorpay");
const Course = require("../models/User");
const User = require("../models/User");
const mailsender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const {default: mongoose} = require("mongoose");
const mailSender = require("../utils/mailSender");

// capture the payment and intiate the Razorpay order
exports.capturePayment = async (res, req) => {
    try {
        // fetch the user_id and course_id
        const {course_id} = req.body;
        const userId = req.user.id;

        // validation {course id}
        if(!course_id){
            return res.json({
                success: false,
                message: "Please provide the valid course id"
            })
        };

        // validation course details
        let course;
        try {
            course = await Course.findById(course_id);
            if(!course){
                return res.json({
                    success: false,
                    message: "Could not find the course"
                });
            }

            // user already pay for the course
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnroled.includes(uid)){
                return res.status(200).json({
                    success: false,
                    message: "Student is already enrolled"
                })
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: error.message,
            })   
        }

        // order create
        const amount = course.price;
        const currency = "INR"

        const options = {
            amount: amount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: course_id,
                userId,
            }
        };
        try {
            // intiate the payment user razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

            // return response
            return res.status(200).json({
                success: true,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount
            });
        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                message: "Could not intiate the order"
            })
        }
    } catch (error) {
        
    }
};

exports.verifySignature = async (req, res) => {
    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("Payment is authorised");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try {
            // find the  course and enrolled the student
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: course_id},
                {$push: {studentsEnroled: userId}},
                {new: true},
            )
            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    message: "could not find "
                })
            }
            console.log(enrolledCourse);

            // find the student and add the course to their list
            const enrolledStudent = await User.findOneAndUpdate(
                {_id:userId},
                {$push: {course:courseId}},
                {new: true},
            );
            console.log(enrolledStudent);

            // send the confirmation mail 
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "congratulations form developer",
                "welcome to the study notion porject"
            );
            console.log(emailResponse);
            return res.status(200).json({
                success: true,
                message: "Signature verified and course added"
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
    else{
        return res.status(500).json({
            success: false,
            message: "Invalid request"
        })
    }
}