var express = require('express');
var router = express.Router();

const user = require('../controller/user');
router.post('/signup', async (req, res, next) => {
  try {
    let signupResponse = await user.signup(req);
    res.status(signupResponse.statusCode).json({ message: signupResponse.message })
  } catch (e) {
    res.status(500).json({
      messag: e.message
    })
  }
});

router.post('/login', async (req, res, next) => {
  try {
    let loginResponse = await user.login(req);
    res.status(loginResponse.statusCode).json({ message: loginResponse.message, data: loginResponse.data, token: loginResponse.token })
  } catch (e) {
    res.status(500).json({
      messag: e.message
    })
  }
});

module.exports = router;
