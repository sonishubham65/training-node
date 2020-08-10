var express = require('express');
var router = express.Router();

const user = require('../controller/user');

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
    res.status(500).json({
      messag: e.message
    })
  }
});

router.post('/login', async (req, res, next) => {
  try {
    let response = await user.login(req);
    if (response.refresh_token) {
      res.cookie("refresh_token", response.refresh_token, {
        expires: new Date(Date.now() + 9999999),
        httpOnly: true
      });
    }
    res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data, token: response.token })
  } catch (e) {
    res.status(500).json({
      messag: e.message
    })
  }
});

router.get('/authorize', async (req, res, next) => {
  try {
    let response = await user.authorize(req);
    res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data, token: response.token })
  } catch (e) {
    res.status(500).json({
      messag: e.message
    })
  }
});

module.exports = router;
