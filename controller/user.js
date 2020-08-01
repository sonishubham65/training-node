const User = require('../models/User');
const bcrypt = require('bcrypt');
module.exports.signup = async (req) => {
    var user = await User.findOne({ email: req.body.email });
    if (user) {
        return false;
    } else {
        let salt = await bcrypt.genSalt(parseInt(process.env.ENCRYPTION_saltRounds));
        let hash = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            role: req.body.role,
        });
        return true;
    }
}