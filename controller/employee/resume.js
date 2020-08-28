const User = require('../../models/User');
const Joi = require('@hapi/joi');
const fs = require('fs');
const path = require("path")
/**
 * @description: This function updates resume.
 * updates a post.
 * @returns: It returns statuscode and a message as successful.
 */
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/resumes'))
    },

    filename: function (req, file, cb) {
        let file_formats = ['docx', 'pdf'];
        if (file_formats.indexOf(file.originalname.split('.').pop().toLowerCase()) == -1) {
            cb({
                message: `The file format only supported are ${file_formats.join(', ')}`,
                errorStack: [file.fieldname]
            });
        } else {
            cb(null, file.fieldname + '-' + Date.now())
        }
    }
})
var upload = multer({ storage: storage, limits: { fileSize: 1000000 } }).single('resume')
/**
 * @description: This function updates resume of employee.
 * With a proper validation of requested data.
 * updates the resume of employee.
 * @returns: It returns the stautscode and success message.
 */
module.exports.update = async (req, res) => {
    return await new Promise((resolve, reject) => {
        // Parse the uploaded file
        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                resolve({
                    statusCode: 422,
                    message: err.message,
                    errorStack: [err.field]
                });
            } else if (err) {
                resolve({
                    statusCode: 422,
                    message: err.message,
                    errorStack: err.errorStack
                });
            } else {
                // validate the file
                if (req.file) {
                    // update the resume
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
                        resolve({
                            statusCode: 200,
                            message: "The resume has been updated successully."
                        });
                    } else {
                        resolve({
                            statusCode: 500,
                            message: "Unknown error"
                        });
                    }
                } else {
                    resolve({
                        statusCode: 422,
                        message: "Resume is required.",
                        errorStack: ['resume']
                    });
                }

            }
        })
    })
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
        res.setHeader('Access-Control-Expose-Headers', 'Content-disposition');
        filestream.pipe(res)
    } else {
        res.status(404).json({ message: "You have not updated resume yet." })
    }
}