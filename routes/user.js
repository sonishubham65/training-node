var express = require('express');
var router = express.Router();

const user = require('../controller/user');
const authentication = require('../middleware/authentication');
/**
 * @description: This route defines the route path for Signup api.
 * @returns: It returns http status as 200 and a message as successful.
 */
router.post('/signup', async (req, res, next) => {
  try {
    let response = await user.signup(req);
    res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack })
  } catch (e) {
    //Handle all the uncaught errors.
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    let response = await user.login(req);
    if (response.refresh_token) {
      res.cookie("refresh_token", response.refresh_token, {
        expires: new Date(Date.now() + 99999999),
        httpOnly: true
      });
    }
    res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data, token: response.token })
  } catch (e) {
    next(e);
  }
});

router.get('/profile', authentication, async (req, res, next) => {
  try {
    let response = await user.profile(req);
    res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data })
  } catch (e) {
    next(e);
  }
});

router.get('/authorize', async (req, res, next) => {
  try {
    let response = await user.authorize(req);
    res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data, token: response.token })
  } catch (e) {
    next(e);
  }
});

module.exports = router;
