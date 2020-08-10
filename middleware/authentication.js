const JWT = require('jsonwebtoken');
const User = require('../models/User');
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @description: This middleware authenticates the upcoming request with access token.
 * Access token is presented in requested headers as authorization.
 * JWT verifies access token and parse it.
 * Matches
 */
module.exports = async (req, res, next) => {
    try {
        // Check if authorization header is presented in headers.
        if (!req.headers.authorization) {
            res.status(401).json({
                message: "Unauthenticated user."
            });
        } else {
            let token = req.headers.authorization.split(' ')[1];
            if (token) {
                // Verify and parse access token.
                let result = JWT.verify(token, process.env.JWT_passphrase);

                // Get the user and check its status
                let user = await User.findById(result._id);
                if (user) {
                    if (user.status == 'active') {
                        // Save user information in request variable for further use.
                        req.user = user;
                        next();
                    } else {
                        res.status(401).json({
                            message: "The user status has been inactive."
                        });
                    }
                } else {
                    res.status(401).json({
                        message: "Invaid Payload."
                    });
                }
                next();
            } else {
                res.status(401).json({
                    message: "JWT must be provided."
                });
            }
        }
    } catch (e) {
        res.status(500).json({
            messag: e.message
        })
    }
}