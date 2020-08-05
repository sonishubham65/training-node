const User = require('../../models/User');
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
module.exports.update = async (req) => {
    console.log(req.user._id)
    let response = await User.updateOne({
        _id: req.user._id,
    }, {
        resume: {
            originalname: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            updated_at: new Date()
        }
    }, { runValidators: true });

    // return successfully
    if (response.nModified) {
        return {
            statusCode: 200,
            message: "The resume has been updated successully."
        }
    } else {
        return {
            statusCode: 500,
            message: "Unknown error"
        }
    }

}