var express = require('express');
var router = express.Router();

const post = require('../../controller/manager/post');

/**
 * @description: This route is for adding a new Position
 */
router.post('/', async (req, res, next) => {
    try {
        let response = await post.add(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});

/**
 * @description: This route is for getting a list of Position added by Manager
 */
router.get('/page/:page', async (req, res, next) => {
    try {
        let response = await post.list(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});

/**
 * @description: This route is for getting a single Position
 */
router.get('/:_id', async (req, res, next) => {
    try {
        let response = await post.get(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});

/**
 * @description: This route is for updating a position
 */
router.patch('/:_id', async (req, res, next) => {
    try {
        let response = await post.update(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});

/**
 * @description: This route is for deleting a position
 */
router.delete('/:_id', async (req, res, next) => {
    try {
        let response = await post.delete(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});
/**
 * @description: This route is for list of application for a position
 */
router.get('/:_id/application/page/:page', async (req, res, next) => {
    try {
        let response = await post.applications(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});
module.exports = router;
