var express = require('express');
var router = express.Router();

const user = require('../controller/user');
router.post('/signup', async (req, res, next) => {
  try {
    let signupResponse = await user.signup(req);
    if (signupResponse) {
      res.status(200).json({ message: "You're registered successfully." })
    } else {
      res.status(201).json({ messag: "User already exists with this email address." });
    }
  } catch (e) {
    res.status(500).json({
      messag: e.message
    })
  }
});

module.exports = router;
