var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Post = require('../models/Post');
const Application = require('../models/Application');
const Joi = require('@hapi/joi');
const Socket = require('../models/Socket');
const Schema = {
    // Schema validator for a Positions listing
    list: Joi.object({
        page: Joi.number()
            .min(1)
            .label("Page")
            .required(),
        _id: Joi.string()
            .alphanum()
            .length(24)
            .label("_id"),
        project_name: Joi.string()
            .min(3)
            .max(60)
            .label("Project name")
            .pattern(new RegExp(/^[A-Z a-z 0-9.&'$()-]+$/))
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
    // Schema validator for a Single Position
    get: Joi.object({
        _id: Joi.string()
            .alphanum()
            .length(24)
            .label("_id")
    })
}
/**
 * @description: This function gets the list of open positions.
 * With a proper validation of requested parameters and data.
 * gets a list of positions.
 * @returns: It returns statuscode, list of positions and page count.
 */
module.exports.list = async (req) => {
    // Schema validation for listing positions 
    var { error, value } = await Schema.list.validate({ ...req.params, ...req.query });
    if (error) {
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        let find = { status: "open" };

        // Filter by _id
        if (value._id) {
            find._id = value._id;
        }
        // Filter by Project Name
        if (value.project_name) {
            find.project_name = { $regex: new RegExp(`.*${value.project_name}.*`), $options: "i" }
        }

        // Limits and offset
        let limit = 10;
        let skip = (value.page - 1) * limit;

        //Count the available documents
        let count = await Post.find(find).countDocuments();
        let posts = [];
        if (count) {

            //Get the documents
            posts = await Post.find(find).sort({ _id: -1 }).skip(skip).limit(limit);
        }
        return {
            statusCode: 200,
            data: {
                posts: posts,
                total: count
            }
        }
    }
}

/**
 * @description: This function gets the details of a position.
 * With a proper validation of requested parameters and data.
 * Gets details of a position.
 * @returns: It returns statuscode and details of position.
 */
module.exports.get = async (req) => {
    // validation
    var { error, value } = await Schema.get.validate({ ...req.params });
    if (error) {
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
            },
            {
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
            },
            { $unwind: '$user' }
        ])
        if (post.length) {
            post = post[0];
            if (post.application.length) {
                post.application = post.application[0]
            } else {
                post.application = undefined
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
        if (application) {
            return {
                statusCode: 409,
                message: "You have already applied for this position."
            }
        } else {
            //Check if post is activated
            let post = await Post.findOne({ _id: value._id, status: 'open' })
            if (post) {
                let application = await Application.create({ post_id: value._id, user_id: req.user.id, status: 'applied' });

                if (application._id) {
                    //Push notification to post owner
                    let socket = await Socket.findOne({
                        user_id: post.user_id
                    }).sort({ _id: -1 })

                    if (socket.socket_id) {
                        io.to(socket.socket_id).emit('application', { id: application._id })
                    }
                    return {
                        statusCode: 201,
                        message: "Thank you for applying on this position."
                    }
                } else {
                    return {
                        statusCode: 204
                    }
                }
            } else {
                return {
                    statusCode: 500,
                    message: "The position is not activated."
                }
            }

        }

    }
}