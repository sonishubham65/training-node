const User = require('../models/User');
const Token = require('../models/Token');
const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');
const JWT = require('jsonwebtoken');
// Signup request Schema validator
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
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,30}$'))
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
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } })
        .label("Email"),
    role: Joi.any().valid('employee', 'manager').label("Role").required()
});


/**
 * 
 * @param {*} req 
 * @description: This function register a user and throw an error if resource is duplicate.
 */
module.exports.signup = async (req) => {
    // validation
    var { error, value } = await signupSchema.validate(req.body);
    if (error) {
        // return with validation error message
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        var user = await User.findOne({ email: value.email });
        if (user) {
            // return with duplicate resource message
            return {
                statusCode: 409,
                message: "User already exists with this email address."
            }
        } else {
            // Create a hash for password
            let salt = await bcrypt.genSalt(parseInt(process.env.ENCRYPTION_saltRounds));
            let hash = await bcrypt.hash(value.password, salt);
            user = await User.create({
                name: value.name,
                email: value.email,
                password: hash,
                role: value.role,
            });
            // return successfully
            return {
                statusCode: 201,
                message: "You're registered successfully."
            }
        }
    }
}

// Login request Schema validator
const loginSchema = Joi.object({
    email: Joi.string()
        .required()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } })
        .label("Email"),
    password: Joi.string()
        .min(8)
        .max(30)
        .label("Password")
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,30}$'))
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
 * 
 * @param {*} req
 * @description: This function get user details and token with authenticated credentials 
 */
module.exports.login = async (req) => {
    // validation
    var { error, value } = await loginSchema.validate(req.body);
    if (error) {
        // return with validation error message
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        var user = await User.findOne({ email: value.email }).select('+password');
        if (user) {
            // Compare password
            let result = await bcrypt.compare(value.password, user.password);
            if (result) {
                var token = JWT.sign({ _id: user._id, exp: Math.floor(Date.now() / 1000) + (60 * parseInt(process.env.JWT_EXPIRY)) }, process.env.JWT_passphrase);
                user.login_at = Date.now();
                await user.save();

                let response = await Token.create({
                    token: token,
                });
                var refresh_token = JWT.sign({ _id: response._id }, process.env.Refresh_JWT_passphrase);
                // return successful
                return {
                    statusCode: 200,
                    data: user,
                    token: token,
                    refresh_token: refresh_token
                }
            } else {
                // return with invalid credentials
                return {
                    statusCode: 401,
                    message: "Invalid credentials."
                }
            }
        } else {
            // return with no account
            return {
                statusCode: 401,
                message: "We do not have an account with this email address."
            }
        }
    }
}

/**
 * 
 * @param {*} req
 * @description: This function access token by refresh token 
 */
module.exports.authorize = async (req) => {
    let refresh_token = req.cookies.refresh_token;
    console.log(refresh_token);
    if (!refresh_token) {
        // return with validation error message
        return {
            statusCode: 400,
            message: "Refresh token missing."
        }
    } else {
        //parse refresh token 
        let result = JWT.verify(refresh_token, process.env.Refresh_JWT_passphrase);
        //verify refresh token 
        let response = await Token.findOne({ _id: result._id });
        if (response.token) {
            //parse token retrieved from db 
            let tokenParse = JWT.verify(response.token, process.env.JWT_passphrase, { ignoreExpiration: true });
            //make a new access token 
            var token = JWT.sign({ _id: tokenParse._id, exp: Math.floor(Date.now() / 1000) + (60 * parseInt(process.env.JWT_EXPIRY)) }, process.env.JWT_passphrase);
            //return new access token
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