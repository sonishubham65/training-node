const User = require('../../models/User');
const Joi = require('@hapi/joi');
const fs = require('fs');
/**
 * @description: This function updates resume.
 * updates a post.
 * @returns: It returns statuscode and a message as successful.
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
 * @description: This function downloads resume of employee.
 * With a proper validation of requested data.
 * gets the resume of employee.
 * @returns: It downloads the resume.
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