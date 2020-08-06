const Post = require('../../models/Post');
const Joi = require('@hapi/joi');
const Schema = {
    // Schema for a list post
    list: Joi.object({
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
    }),
    // Schema for a post
    get: Joi.object({
        _id: Joi.string()
            .alphanum()
            .label("_id")
    })
}
/**
 * 
 * @param {*} req 
 * @description: This function gets a list of positions
 */
module.exports.list = async (req) => {
    // validation
    var { error, value } = await Schema.list.validate({ ...req.params, ...req.query });
    if (error) {
        // return with validation error message
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        let find = { status: "open" };
        /**
         * Filters for _id and project name
         */
        if (value._id) {
            find._id = value._id;
        }
        if (value.project_name) {
            find.project_name = { $regex: new RegExp(`.*${value.project_name}.*`), $options: "i" }
        }
        let limit = 2;
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
                totalPages: Math.ceil(count / limit)
            }
        }
    }
}
/**
 * 
 * @param {*} req 
 * @description: This function gets a post
 */
module.exports.get = async (req) => {
    // validation
    var { error, value } = await Schema.get.validate({ ...req.params });
    if (error) {
        // return with validation error message
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        let find = { _id: value._id, status: "open" };
        //Get the document with user data
        let post = await Post.findOne(find).populate({
            path: 'user_id',
            select: ["name", "email"]
        });
        if (post) {
            return {
                statusCode: 200,
                data: post
            }
        } else {
            return {
                statusCode: 204
            }
        }
    }
}