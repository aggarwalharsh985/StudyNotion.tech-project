const Section = require("../models/Section")
const Course = require("../models/Course")

exports.createSection = async (req, res) => {
    try {
        // fetch data
        const {sectionName, courseId} = req.body;

        // data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: "Missing properties"
            })
        }
        // create section
        const newSection = await Section.create({sectionName})

        // update course with section object id
        const updateCourseDetail = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {courseContent: newSection._id}
            },
            {new: true}
        );
        // return response
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updateCourseDetail,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Unable to create section , please try again",
            error: error.message
        })
    }
}

// update section
exports.updateSection = async (req, res) => {
    try {
        // fetch data
        const {sectionName, sectionId} = req.body;

        // data validation
        if(!sectionName || !sectionId){
            return res.status(404).json({
                success: false,
                message: "Missing Properties"
            })
        }
        // update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true});

        // return response true
        return res.status(200).json({
            success: true,
            message: "Section updated successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Unable to update section , please try again",
            error: error.message
        })
    }
}

// delete section
exports.deleteSection = async (req, res) => {
    try {
        // get id
        const {sectionId} = req.params;
        
        await Section.findByIdAndDelete({sectionId})

        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Unable to delete section"
        })
    }
}