var express = require('express');
var router = express.Router();

const resume = require('../../controller/employee/resume');

const path = require("path")
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

router.put('/', async (req, res, next) => {
    try {
        let response = await new Promise((resolve, reject) => {
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
                    if (req.file) {
                        let response = await resume.update(req);
                        resolve({ statusCode: response.statusCode, message: response.message, data: response.data });
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
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});

router.get('/', async (req, res, next) => {
    try {
        await resume.download(req, res);
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});
module.exports = router;
