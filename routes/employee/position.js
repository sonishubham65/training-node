var express = require('express');
var router = express.Router();

const position = require('../../controller/employee/position');

router.get('/page/:page', async (req, res, next) => {
    try {
        let response = await position.list(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});
router.get('/:_id', async (req, res, next) => {
    try {
        let response = await position.get(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});
//Position apply route
router.post('/apply/:_id', async (req, res, next) => {
    try {
        let response = await position.apply(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});
module.exports = router;
