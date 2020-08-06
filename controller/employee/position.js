var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Post = require('../../models/Post');
const Application = require('../../models/Application');
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
        let post = await Post.aggregate([
            { $match: { _id: ObjectId(value._id), status: "open" } },
            {
                $lookup: {
                    from: "applications",
                    let: { id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                status: "applied",
                                user_id: ObjectId(req.user._id),
                                $expr: {
                                    $eq: ["$post_id", { $toObjectId: "$$id" }]
                                }
                            }
                        },
                        {
                            $project: {
                                status: 1,
                                created_at: 1
                            }
                        }
                    ],
                    as: 'application',
                },

            }, {
                $lookup: {
                    from: "users",
                    let: { userid: "$user_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", { $toObjectId: "$$userid" }]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                email: 1
                            }
                        }
                    ],
                    as: 'user',
                },

            }
        ])
        if (post.length) {
            post = post[0];
            if (post.application.length) {
                post.application = post.application[0];
            } else {
                delete post.application;
            }
            if (post.user.length) {
                post.user = post.user[0];
            } else {
                delete post.user;
            }
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


/**
 * 
 * @param {*} req 
 * @description: This function applies a post
 */
module.exports.apply = async (req) => {
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
        //Insert the application
        let application = await Application.findOne({ post_id: value._id, user_id: req.user.id });
        console.log(application)
        if (application) {
            return {
                statusCode: 409,
                message: "You have already applied for this position."
            }
        } else {
            let application = await Application.create({ post_id: value._id, user_id: req.user.id, status: 'applied' });
            if (application._id) {
                return {
                    statusCode: 201,
                    message: "Thank you for applying on this position."
                }
            } else {
                return {
                    statusCode: 204
                }
            }
        }

    }
}