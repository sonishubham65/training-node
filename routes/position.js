var express = require('express');
var router = express.Router();

const position = require('../controller/position');
const authorization = require('../middleware/authorization');
/**
 * @description: This route defines the route path for listing the positions.
 * @returns: It returns http status as 200 and list of positions.
 */
router.get('/page/:page', async (req, res, next) => {
    try {
        let response = await position.list(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        next(e);
    }
});
/**
 * @description: This route defines the route path for details of a position.
 * @returns: It returns http status as 200 and details of a position.
 */
router.get('/:_id', async (req, res, next) => {
    try {
        let response = await position.get(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        next(e);
    }
});
/**
 * @description: This route defines the route path for applying for a position.
 * @returns: It returns http status as 201 and a success message.
 */
router.post('/apply/:_id', authorization.employee, async (req, res, next) => {
    try {
        let response = await position.apply(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        next(e);
    }
});
module.exports = router;
