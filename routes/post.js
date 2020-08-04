var express = require('express');
var router = express.Router();

const post = require('../controller/post');
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');
router.post('/add', authentication, authorization.manager, async (req, res, next) => {
    try {
        let response = await post.add(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});
router.get('/page/:page', authentication, authorization.manager, async (req, res, next) => {
    try {
        let response = await post.list(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});
router.get('/:_id', authentication, authorization.manager, async (req, res, next) => {
    try {
        let response = await post.get(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});
module.exports = router;
