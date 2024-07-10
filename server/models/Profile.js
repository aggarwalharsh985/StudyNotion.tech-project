const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    
    dateOfBirth: {
        type: String,
        // required: true,
        trim: true,
    },
    about: {
        type: String,
        // required: true,
    },
    contactNumber: {
        type: Number,
        // required: true,
        trim: true,
    },
    gender: {
        type: String,
        // required: true,
    },
});

module.exports = mongoose.model("Profile" , profileSchema);