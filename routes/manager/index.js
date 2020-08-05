var express = require('express');
var router = express.Router();

var post = require('./post');
const authentication = require('../../middleware/authentication');
const authorization = require('../../middleware/authorization');

router.use('/post', authentication, authorization.manager, post);
module.exports = router;
