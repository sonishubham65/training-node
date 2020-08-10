var express = require('express');
var router = express.Router();

const post = require('../../controller/manager/post');

/**
 * @description: This route defines the route path for Creating a new Post.
 * @returns: It returns http status as 201 and a message as successful.
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
 * @description: This route defines the route path for Getting all Post
 * @returns: It returns http status as 200 with data and number of more pages.
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
 * @description: This route defines the route path for Getting Single Post
 * @returns: It returns http status as 200 with post data.
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
 * @description: This route defines the route path for Updaing a Post
 * @returns: It returns http status as 202 and a message as successful.
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
 * @description: This route defines the route path for deleting a Post
 * @returns: It returns http status as 200 and a message as successful.
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
 * @description: This route defines the route path for getting list of applications for a post.
 * @returns: It returns http status as 200 with post data, list of applications and page count.
 */
router.get('/:post_id/application/page/:page', async (req, res, next) => {
    try {
        let response = await post.applications(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});

/**
 * @description: This route defines the route path for details of an application.
 * @returns: It returns http status as 200 and data of application and post.
 */
router.get('/application/details/:_id', async (req, res, next) => {
    try {
        let response = await post.application(req);
        res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
});
module.exports = router;
