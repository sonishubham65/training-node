const Resume = require('../models/Resume');
const Joi = require('@hapi/joi');
const Schema = {
    // Schema for a Post
    upload_resume: Joi.object({
        _id: Joi.string()
            .alphanum()
            .label("_id")
            .required()
    }),
    // Schema for downloading a resume
    download_resume: Joi.object({
        _id: Joi.string()
            .alphanum()
            .label("_id")
    })
}

/**
 * 
 * @param {*} req 
 * @description: This function put a resume for an employee
 */
//const Formidable = require('formidable');
module.exports.resume = async (req) => {
    let response = await Resume.updateOne({
        user_id: req.user._id,
    }, {
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
    }, {
        new: true,
        upsert: true // Make this update into an upsert
    });

    // return successfully
    return {
        statusCode: 201,
        message: response.nModified ? "The resume has been updated successully." : "The resume has been inserted successully."
    }
}