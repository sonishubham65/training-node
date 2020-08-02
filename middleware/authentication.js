const JWT = require('jsonwebtoken');
const User = require('../models/User');
module.exports = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            res.status(401).json({
                message: "Unauthenticated user."
            });
        } else {
            let token = req.headers.authorization.split(' ')[1];
            let result = JWT.verify(token, process.env.JWT_passphrase);
            if (result._id) {
                let user = await User.findById(result._id);
                if (user) {
                    req.user = user;
                    next();
                } else {
                    res.status(401).json({
                        message: "Invaid Payload."
                    });
                }
            } else {
                res.status(401).json({
                    message: "Invaid token."
                });
            }
        }
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
}