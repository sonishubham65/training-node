var express = require('express');
var router = express.Router();

const user = require('../controller/user');
router.post('/signup', async (req, res, next) => {
  try {
    let response = await user.signup(req);
    res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack })
  } catch (e) {
    res.status(500).json({
      messag: e.message
    })
  }
});

router.post('/login', async (req, res, next) => {
  try {
    let response = await user.login(req);
    if (response.data && response.data.refreshToken) {
      res.cookie("refreshToken", refreshToken);
    }
    res.status(response.statusCode).json({ message: response.message, errorStack: response.errorStack, data: response.data, token: response.token })
  } catch (e) {
    res.status(500).json({
      messag: e.message
    })
  }
});

module.exports = router;
