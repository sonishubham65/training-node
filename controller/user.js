const User = require('../models/User');
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
    role: Joi.any().allow('employee', 'manager').label("Role").required()
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
            message: error.message
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
            message: error.message
        }
    } else {
        var user = await User.findOne({ email: value.email }).select('+password');
        if (user) {
            // Compare password
            let result = await bcrypt.compare(value.password, user.password);
            if (result) {
                var token = JWT.sign({ _id: user._id }, process.env.JWT_passphrase);
                user.login_at = Date.now();
                let result = await user.save();
                // return successful
                return {
                    statusCode: 200,
                    data: user,
                    token: token
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