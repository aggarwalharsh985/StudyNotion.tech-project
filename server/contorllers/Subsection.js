// const { response } = require("express");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
    try {
        // fetch data
        const {sectionId, description, title, timeDuration} = req.body;

        // extract files and video
        const video = req.files.videoFile;

        // data validation
        if(!sectionId || !description || !title || !timeDuration){
            return res.status(404).json({
                success: false,
                message: "Missing Properties"
            })
        }
        // upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME)

        // create a sub section
        const SubSectionDetail = await SubSection.create({
            title: title,
            description: description,
            timeDuration: timeDuration,
            videoUrl: uploadDetails.secure_url
        })

        // update section with sub section object id
        const updateSection = await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $push:{
                    subSection: SubSectionDetail,
                    
                }
            },
            {new:true}
        )
        // return response
        return res.status(200).json({
            success: true,
            message: "Sub section created successfully ",
            data: updateSection
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error in subsection",
            error: error.message
        })
    }
}

// update subsection
exports.updateSubSection = async (req, res) => {
    try {
        // fetch data
        const {sectionId, description, title, timeDuration, subSectionId} = req.body
        const subSection = await SubSection.findById(subSectionId)

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if(title !== undefined){
            subSection.title = title
        }

        if(description !== undefined){
            subSection.description = description
        }

        if(req.files && req.files.video !== undefined ){
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        await subSection.save()

        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        console.log("updated section", updatedSection)

        return res.status(200).json({
            success: true,
            message: "Subsection updated successfully",
            data: updatedSection
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

// delete subsection
exports.deleteSubSection = async (req,res) => {
    try {
        const {subSectionId, sectionId} = req.body;
        await Section.findByIdAndDelete(
            {_id: sectionId},
            {
                $pull: {
                  subSection: subSectionId,
                },
              }
        )
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
        return res.status(404).json({
            success: false, message: "SubSection not found"
        })
        }
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )
        return res.status(200).json({
            success: true,
            data: updatedSection,
            message: "Sub Section deleted successfully",
        })
        } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Unable to delete section"
        })
    }
}