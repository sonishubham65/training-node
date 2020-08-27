var express = require('express');
var router = express.Router();

const authentication = require('../middleware/authentication');
var position = require('./position');
router.use('/position', authentication, position);

module.exports = router;
