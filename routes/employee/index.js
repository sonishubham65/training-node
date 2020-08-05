var express = require('express');
var router = express.Router();
const authentication = require('../../middleware/authentication');
const authorization = require('../../middleware/authorization');

var resume = require('./resume')
router.use('/resume', authentication, authorization.employee, resume);
module.exports = router;
