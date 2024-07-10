const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    ceratedAt: {
        type: Date,
        default: Date.now,
        expires: 5*60
    }
});

async function sendVerificationEmail(email, otp){
    try {
        const mailResponse = await mailSender(email, "verification email for studynotion", emailTemplate(otp));
        console.log("email send successfully ", mailResponse);

    } catch (error) {
        console.log("error occur while sending the mail ", error);
        throw error;
    }
}
OTPSchema.pre('save', async function(next){
    console.log("New document saved to database");
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
})

module.exports = mongoose.model("OTP", OTPSchema)