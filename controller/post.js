const Post = require('../models/Post');
const Joi = require('@hapi/joi');

// Schema for a new Post
const postAddSchema = Joi.object({
    project_name: Joi.string()
        .min(3)
        .max(60)
        .label("Project name")
        .required()
        .pattern(new RegExp(/^[A-Z a-z 0-9.&-'$()]+$/))
        .error(errors => {
            errors.forEach(error => {
                switch (error.code) {
                    case 'string.pattern.base': {
                        error.message = '"Project name" should contain letters and number only';
                    } break;
                }
            })
            return errors;
        }),
    client_name: Joi.string()
        .min(3)
        .max(30)
        .label("Client name")
        .required()
        .pattern(new RegExp(/^[A-Z a-z 0-9.&-'$()]+$/))
        .error(errors => {
            errors.forEach(error => {
                switch (error.code) {
                    case 'string.pattern.base': {
                        error.message = '"Client name" should contain letters and number only';
                    } break;
                }
            })
            return errors;
        }),
    technologies: Joi.array().items(
        Joi.string()
            .min(1)
            .max(50)
            .label("Technology")
            .required()
            .pattern(new RegExp(/^[A-Z a-z 0-9.&-'$()]+$/))
            .error(errors => {
                errors.forEach(error => {
                    switch (error.code) {
                        case 'string.pattern.base': {
                            error.message = 'A "Technology" should contain letters and number only';
                        } break;
                    }
                })
                return errors;
            })
    )
        .label("Technologies")
        .required(),
    role: Joi.any().allow('trainee', 'associate', 'senior_associate', 'lead', 'manager', 'director').label("Role").required(),
    description: Joi.string()
        .min(100)
        .max(1000)
        .label("Description")
        .required()
        .pattern(new RegExp(/^[A-Z a-z 0-9.'-@# ,?"*&]+$/))
        .error(errors => {
            errors.forEach(error => {
                switch (error.code) {
                    case 'string.pattern.base': {
                        error.message = '"Description" should contain letters and number only';
                    } break;
                }
            })
            return errors;
        }),

    status: Joi.any().allow('open', 'closed').label("Status").required(),
});

// Schema for a list page
const postListSchema = Joi.object({
    page: Joi.number()
        .min(1)
        .label("Page")
        .required(),
    _id: Joi.string()
        .alphanum()
        .label("_id"),
    project_name: Joi.string()
        .min(3)
        .max(60)
        .label("Project name")
        .pattern(new RegExp(/^[A-Z a-z 0-9.&-'$()]+$/))
        .error(errors => {
            errors.forEach(error => {
                switch (error.code) {
                    case 'string.pattern.base': {
                        error.message = '"Project name" should contain letters and number only';
                    } break;
                }
            })
            return errors;
        })
});


/**
 * 
 * @param {*} req 
 * @description: This function add a post
 */
module.exports.add = async (req) => {
    // validation
    var { error, value } = await postAddSchema.validate(req.body);
    if (error) {
        // return with validation error message
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        // Create a post
        let post = await Post.create({
            project_name: value.project_name,
            client_name: value.client_name,
            technologies: value.technologies,
            user_id: req.user._id,
            role: value.role,
            description: value.description,
            status: value.status,
        });
        // return successfully
        return {
            statusCode: 201,
            message: "The position has been added successully.",
            data: {
                _id: post._id
            }
        }
    }
}

/**
 * 
 * @param {*} req 
 * @description: This function gets a list of post
 */
module.exports.list = async (req) => {
    // validation
    var { error, value } = await postListSchema.validate({ ...req.params, ...req.query });
    if (error) {
        // return with validation error message
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        let find = { user_id: req.user._id };
        /**
         * Filters for _id and project name
         */
        if (value._id) {
            find._id = value._id;
        }
        if (value.project_name) {
            find.project_name = { $regex: new RegExp(`.*${value.project_name}.*`), $options: "i" }
        }
        let limit = 10;
        let skip = (value.page - 1) * limit;
        //Count the available documents
        let count = await Post.find(find).countDocuments();
        let posts = [];
        if (count) {
            //Get the documents
            posts = await Post.find(find).skip(skip).limit(limit);
        }
        return {
            statusCode: 200,
            data: {
                posts: posts,
                count: count
            }
        }
    }
}