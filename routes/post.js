var express = require('express');
var router = express.Router();

const post = require('../controller/post');
const auth = require('../middleware/auth');
router.post('/add', auth, async (req, res, next) => {
    try {
        let response = await post.add(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});
module.exports = router;
