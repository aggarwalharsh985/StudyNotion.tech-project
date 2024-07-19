const {instance} = require("../config/razorpay");
const Course = require("../models/User");
const crypto = require("crypto")
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const {paymentSuccessEmail} = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress");

// capture the payment and intiate the Razorpay order
exports.capturePayment = async (res, req) => {
    // fetch the user_id and course_id
    const {courses} = req.body;
    const userId = req.user.id;

    // validation {course id}
    if(courses.length === 0){
        return res.json({
            success: false,
            message: "Please provide the valid course id"
        })
    };

    let total_amount = 0
    // validation course details
    for(const course_id of courses){
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
            const uid = new mongoose.Types.ObjectId(userId)
            if(course.studentsEnroled.includes(uid)){
                return res.status(200).json({
                    success: false,
                    message: "Student is already enrolled"
                })
            }
            // Add the price of the course to the total amount
            total_amount += course.price
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: error.message,
            })   
        }
    }

    // order create
    // const amount = course.price;
    // const currency = "INR"

    const options = {
        amount: total_amount * 100,
        currency: "INR",
        receipt: Math.random(Date.now()).toString(),
    };

    try {
        // intiate the payment user razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        // return response
        res.status(200).json({
            success: true,
            data: paymentResponse
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Could not intiate the order"
        })
    }
};

exports.verifyPayment = async (req,res) => {
    const razorpay_order_id = req.body?.razorpay_order_id
    const razorpay_payment_id = req.body?.razorpay_payment_id
    const razorpay_signature_id = req.body?.razorpay_signature
    const courses = req.body?.courses

    const userId = req.user.id

    if(
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature_id ||
        !courses ||
        !userId
    ){
        return res.status(200).json({success: false, message: "Payment failed"})
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
        .createHmac("developer", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex")
    if(expectedSignature === razorpay_signature){
        await enrollStudents(courses, userId, res)
        return res.status(200).json({
            success: true,
            message: "Payment verified"
        })
    }
    return res.status(500).json({
        success: true,
        message: "payment failed"
    })
}

// send payment email success
exports.sendPaymentSuccessEmail = async (req,res) => {
    const {orderId, paymentId, amount} = req.body
    const userId = req.user.id
    
    if(!orderId || !paymentId || !amount || !userId){
        return res.status(400).json({
            sucess: false,
            message: "Please provide all the details "
        })
    }
    try {
        const enrolledStudent = await User.findById(userId)
        
        await mailSender(
            enrolledStudent.email,
            `Payment received`,
            paymentSuccessEmail(
                `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
                amount/100,
                orderId,
                paymentId
            )
        )
    } catch (error) {
        console.log("error in sending the email ", error)
        return res.status(500).json({
            success: false,
            message: "Could not send the mail"
        })
    }
}

// enrolled students in the course
const enrollStudents = async (courses, userId, res) => {
    if(!courses || !userId){
        return res.status(400).json({
            sucess: false,
            message: "Please provide the Course ID and user Id"
        })
    }
    for(const courseId of courses){
        try {
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: courseId},
                {$push: {studentsEnroled: userId}},
                {new: true}
            )
            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    error: "Course not found"
                })
            }
            console.log("Updated course: ", enrolledCourse)
            const courseProgress = await CourseProgress.create({
                courseID: courseId,
                userId: userId,
                completedVideos:[]
            })
            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push:{
                        courses: courseId,
                        courseProgress: courseProgress._id
                    }
                },
                {new:true}
            )
            console.log("Enrolled Students: ",enrolledStudent)
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(
                    enrolledCourse.courseName,
                    `${enrolledStudent.firstName} ${enrollStudents.lastName}`
                )
            )
            console.log("Email sent Sucessfully", emailResponse.response)
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                sucess: false,
                error: error.message
            })
        }
    }
}