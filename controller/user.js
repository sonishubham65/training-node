const User = require('../models/User');
const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');
const signupSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .label("Name")
        .required()
        .pattern(new RegExp(/^[A-Z a-z 0-9.]+$/))
        .error(errors => {
            errors.forEach(error => {
                console.log(error);
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
                console.log(error);
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

module.exports.signup = async (req) => {
    // validation
    var { error, value } = await signupSchema.validate(req.body);
    if (error) {
        // return with error message
        return {
            statusCode: 422,
            message: error.message
        }
    } else {
        var user = await User.findOne({ email: value.email });
        if (user) {
            // return with duplicate resource
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
            // return successful
            return {
                statusCode: 201,
                message: "You're registered successfully."
            }
        }
    }

}