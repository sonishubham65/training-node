const User = require('../../models/User');
const Joi = require('@hapi/joi');
const fs = require('fs');
/**
 * 
 * @param {*} req 
 * @description: This function put a resume for an employee
 */
module.exports.update = async (req) => {
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
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @description: This function download a resume for an employee
 */
module.exports.download = async (req, res) => {
    let response = await User.findOne({
        _id: req.user._id,
    });

    // Download resume
    if (response.resume) {
        var filestream = fs.createReadStream(`./public/resumes/${response.resume.filename}`);
        res.setHeader('Content-disposition', 'attachment; filename=' + response.resume.originalname);
        filestream.pipe(res)
    } else {
        res.status(404).json({ message: "You have not updated resume yet." })
    }
}