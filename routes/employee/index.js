var express = require('express');
var router = express.Router();
const authentication = require('../../middleware/authentication');
const authorization = require('../../middleware/authorization');

var resume = require('./resume');
var position = require('./position')
router.use('/resume', authentication, authorization.employee, resume);
router.use('/position', authentication, authorization.employee, position);
module.exports = router;
