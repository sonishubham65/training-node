var express = require('express');
var router = express.Router();
const resume = require('../../controller/employee/resume');
/**
 * @description: This route defines the route path for updating resume for an employee.
 * @returns: It returns http status as 200 and a message of success.
 */
router.put('/', async (req, res, next) => {
    try {
        let response = await resume.update(req, res);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: e.message
        })
    }
});
/**
 * @description: This route defines the route path for downloading resume for an employee.
 * @returns: It downloads the resume.
 */
router.get('/', async (req, res, next) => {
    try {
        await resume.download(req, res);
    } catch (e) {
        res.status(500).json({
            message: e.message
        })
    }
});
module.exports = router;
