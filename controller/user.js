const User = require('../models/User');
const Token = require('../models/Token');
const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');
const JWT = require('jsonwebtoken');
const CONFIG = require('../config');

/**
 * @description: Schema validator for Signup
*/
const signupSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .label("Name")
        .required()
        .pattern(new RegExp(/^[A-Z a-z 0-9.]+$/))
        .error(errors => {
            errors.forEach(error => {
                switch (error.code) {
                    case 'string.pattern.base': {
                        error.message = '"Name" should contain letters and number only';
                    } break;
                }
            })
            return errors;
        }),
    password: Joi.string()
        .min(8)
        .max(30)
        .label("Password")
        .required()
        .pattern(new RegExp(CONFIG.validation.password.regex))
        .error(errors => {
            errors.forEach(error => {
                switch (error.code) {
                    case 'string.pattern.base': {
                        error.message = '"Password" should contain at least a capital letter, a small letter, a number and a special charcter';
                    } break;
                }
            })
            return errors;
        }),

    email: Joi.string()
        .required()
        .email({ minDomainSegments: 2, tlds: { allow: CONFIG.validation.email.allow } })
        .label("Email"),
    role: Joi.any().valid('employee', 'manager').label("Role").required()
});


/**
 * @description: This function registers a new user.
 * With a proper validation of requested data.
 * Checks with duplicate email entries.
 * Create a hash for password and create a new user.
 * @returns: It returns statuscode and a message as successful.
 */
module.exports.signup = async (req) => {
    // Validate the requested data
    var { error, value } = await signupSchema.validate(req.body);
    if (error) {
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        // Check the existance of email address
        var user = await User.findOne({ email: value.email });
        if (user) {
            return {
                statusCode: 409,
                message: "User already exists with this email address."
            }
        } else {
            // Create a hash for password
            let salt = await bcrypt.genSalt(parseInt(process.env.ENCRYPTION_saltRounds));
            let hash = await bcrypt.hash(value.password, salt);

            // Create a new user
            user = await User.create({
                name: value.name,
                email: value.email,
                password: hash,
                role: value.role,
            });

            return {
                statusCode: 201,
                message: "You're registered successfully."
            }
        }
    }
}

/**
 * @description: Schema validator for Login
*/
const loginSchema = Joi.object({
    email: Joi.string()
        .required()
        .email({ minDomainSegments: 2, tlds: { allow: CONFIG.validation.email.allow } })
        .label("Email"),
    password: Joi.string()
        .min(8)
        .max(30)
        .label("Password")
        .required()
        .pattern(new RegExp(CONFIG.validation.password.regex))
        .error(errors => {
            errors.forEach(error => {
                switch (error.code) {
                    case 'string.pattern.base': {
                        error.message = '"Password" should contain at least a capital letter, a small letter, a number and a special charcter';
                    } break;
                }
            })
            return errors;
        })
});

/**
 * @description: This function logins a user.
 * With a proper validation of requested data.
 * Checks with email entries.
 * Create access token and refresh token.
 * @returns: It returns statuscode userdata and token.
 */
module.exports.login = async (req) => {
    // Validate the requested data
    var { error, value } = await loginSchema.validate(req.body);
    if (error) {
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        // Gets the user for the email address
        var user = await User.findOne({ email: value.email }).select('+password');
        if (user) {
            // Compare the password
            let result = await bcrypt.compare(value.password, user.password);
            if (result) {
                // Create a access token
                var token = JWT.sign({ _id: user._id, exp: Math.floor(Date.now() / 1000) + (60 * parseInt(process.env.JWT_EXPIRY)) }, process.env.JWT_passphrase);
                user.login_at = Date.now();
                await user.save();

                // Create a Auth token
                let response = await Token.create({
                    token: token,
                });

                // Create a refresh token
                var refresh_token = JWT.sign({ _id: response._id }, process.env.Refresh_JWT_passphrase);
                return {
                    statusCode: 200,
                    token: token,
                    refresh_token: refresh_token
                }
            } else {
                return {
                    statusCode: 401,
                    message: "The credentials does not match."
                }
            }
        } else {
            return {
                statusCode: 401,
                message: "We do not have an account with this email address."
            }
        }
    }
}
/**
 * @description: This function gives profile of a user.
 * @returns: It returns statuscode and userdata.
 */
module.exports.profile = async (req) => {
    // Gets the user for the email address
    var user = await User.findOne({ _id: req.user._id }).select('+password');
    return {
        data: user,
        statusCode: 200
    }
}

/**
 * @description: This function authorize a user.
 * With a proper validation of cookie data.
 * verify the refresh token.
 * grant a new access token.
 * @returns: It returns statuscode and new access token.
 */
module.exports.authorize = async (req) => {
    // Validate cookies
    let refresh_token = req.cookies.refresh_token;
    if (!refresh_token) {
        return {
            statusCode: 400,
            message: "Refresh token missing."
        }
    } else {
        // Parse refresh token 
        let result = JWT.verify(refresh_token, process.env.Refresh_JWT_passphrase);
        // Verify refresh token 
        let response = await Token.findOne({ _id: result._id });
        if (response.token) {
            // parse token retrieved from database
            let tokenParse = JWT.verify(response.token, process.env.JWT_passphrase, { ignoreExpiration: true });

            // make a new access token 
            var token = JWT.sign({ _id: tokenParse._id, exp: Math.floor(Date.now() / 1000) + (60 * parseInt(process.env.JWT_EXPIRY)) }, process.env.JWT_passphrase);

            return {
                statusCode: 200,
                token: token
            }
        } else {
            return {
                statusCode: 400,
                message: "Invalid refresh token."
            }
        }
    }
}
