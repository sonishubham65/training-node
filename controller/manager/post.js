const Post = require('../../models/Post');
const Application = require('../../models/Application');
const Joi = require('@hapi/joi');
const fs = require('fs')
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Schema = {
    // Schema validator for a Single Post
    post: Joi.object({
        project_name: Joi.string()
            .min(3)
            .max(60)
            .label("Project name")
            .required()
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
            }),
        client_name: Joi.string()
            .min(3)
            .max(30)
            .label("Client name")
            .required()
            .pattern(new RegExp(/^[A-Z a-z 0-9.&'$()-]+$/))
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
                .pattern(new RegExp(/^[A-Z a-z 0-9.&'$()-]+$/))
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
            .error(errors => {
                errors.forEach(error => {
                    console.log(error.code)
                    switch (error.code) {
                        case 'array.includesRequiredKnowns': {
                            error.message = 'Technologies must contains at least one input.';
                        } break;
                    }
                })
                return errors;
            })
            .required(),
        role: Joi.any().valid('Trainee', 'Associate', 'Senior associate', 'Lead', 'Manager', 'Director').label("Role").required(),
        description: Joi.string()
            .min(100)
            .max(1000)
            .label("Description")
            .required()
            .pattern(new RegExp(/^[A-Z a-z 0-9.'# ,?"*&\r\t\n-]+$/))
            .error(errors => {
                console.log(errors)
                errors.forEach(error => {
                    switch (error.code) {
                        case 'string.pattern.base': {
                            error.message = '"Description" should contain letters, number and .\'-@# ,?*& only';
                        } break;
                    }
                })
                return errors;
            }),

        status: Joi.any().allow('open', 'closed').label("Status").required(),
    }),
    // Schema validator for a getting a list of Posts
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
    // Schema validator for a getting a single Post
    get: Joi.object({
        _id: Joi.string()
            .alphanum()
            .length(24)
            .label("_id")
    }),
    //Schema validator for a List of application
    applications: Joi.object({
        page: Joi.number()
            .min(1)
            .label("Page")
            .required(),
        //post Id   
        post_id: Joi.string()
            .alphanum()
            .length(24)
            .required()
            .label("Postition ID"),
        //applicant email    
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } })
            .label("Email"),
    }),
    //Schema validator for getting an application of a post
    application: Joi.object({
        //post Id   
        _id: Joi.string()
            .alphanum()
            .length(24)
            .required()
            .label("Application ID"),
    })
}

/**
 * @description: This function creates a new post.
 * With a proper validation of requested data.
 * Create a new Post.
 * @returns: It returns statuscode and a successful message.
 */
module.exports.add = async (req) => {
    // Validate the requested data
    var { error, value } = await Schema.post.validate(req.body);
    if (error) {
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        // Create a new post
        let post = await Post.create({
            project_name: value.project_name,
            client_name: value.client_name,
            technologies: value.technologies,
            user_id: req.user._id,
            role: value.role,
            description: value.description,
            status: value.status,
        });
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
 * @description: This function gets a list of posts.
 * With a proper validation of requested data.
 * Count all the available posts.
 * Gets a list of posts with limit and offset.
 * @returns: It returns statuscode and a successful message.
 */
module.exports.list = async (req) => {
    // Validate the requested data
    var { error, value } = await Schema.list.validate({ ...req.params, ...req.query });
    if (error) {
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        let find = { user_id: req.user._id };

        // Filter for _id
        if (value._id) {
            find._id = value._id;
        }

        // Filter for project name
        if (value.project_name) {
            find.project_name = { $regex: new RegExp(`.*${value.project_name}.*`), $options: "i" }
        }

        // limit and offset
        let limit = 10;
        let skip = (value.page - 1) * limit;

        // Count all the available posts
        let count = await Post.find(find).sort({ created_at: 'desc' }).countDocuments();
        let posts = [];
        if (count) {
            //Get the list of posts
            posts = await Post.find(find).select([
                "project_name", "client_name", "created_at", "updated_at", "status", "role"
            ]).sort({ _id: 'desc' }).skip(skip).limit(limit);
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
 * @description: This function gets a single post.
 * With a proper validation of requested data.
 * Gets a single post.
 * @returns: It returns statuscode and post data.
 */
module.exports.get = async (req) => {
    // Validate the requested data
    var { error, value } = await Schema.get.validate({ ...req.params });
    if (error) {
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        let find = { user_id: req.user._id, _id: value._id };
        //Get the document
        let post = await Post.findOne(find);
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

/**
 * @description: This function updates a post.
 * With a proper validation of requested parameters and data.
 * updates a post.
 * @returns: It returns statuscode and a message as successful.
 */
module.exports.update = async (req) => {
    // Validate the requested parameters
    var { error, value } = await Schema.get.validate(req.params);
    if (error) {
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        let params = value;
        // Validate the requested data
        var { error, value } = await Schema.post.validate(req.body);
        if (error) {
            return {
                statusCode: 422,
                message: error.message,
                errorStack: error.details[0].path
            }
        } else {
            let body = value;
            body.updated_at = new Date();
            let where = { user_id: req.user._id, _id: params._id };

            // update the post
            let response = await Post.updateOne(where, body, { runValidators: true });
            if (response.n > 0) {
                if (response.nModified) {
                    return {
                        statusCode: 202,
                        message: "Post has been updated successfully."
                    }
                } else {
                    return {
                        statusCode: 200,
                        message: "Trying to update same content."
                    }
                }
            } else {
                return {
                    statusCode: 204
                }
            }
        }
    }
}

/**
 * @description: This function deletes a post.
 * With a proper validation of requested data.
 * deletes a post.
 * @returns: It returns statuscode and a message as successful.
 */
module.exports.delete = async (req) => {
    // Validate the requested data
    var { error, value } = await Schema.get.validate(req.params);
    if (error) {
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {

        let where = { user_id: req.user._id, _id: value._id };

        // delete the post
        let response = await Post.deleteOne(where);
        if (response.deletedCount) {
            return {
                statusCode: 200,
                message: "Post has been deleted successfully."
            }
        } else {
            return {
                statusCode: 204
            }
        }
    }
}

/**
 * @description: This function gets a list of application for post.
 * With a proper validation of requested data.
 * gets a list of applications and total count of applications for a post.
 * @returns: It returns statuscode, post details, list of applications and total count of applications.
 */
module.exports.applications = async (req) => {
    // Validate the requested data
    var { error, value } = await Schema.applications.validate({ ...req.params, ...req.query });
    if (error) {
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        let limit = 10;
        let skip = ((value.page - 1) * limit);

        //Check if post is related to that user only
        let post = await Post.findOne({ _id: value.post_id, user_id: req.user._id }).select(['project_name', 'client_name', 'created_at', 'status', 'role']);

        if (post) {
            // Get applications
            let aggregate = [
                {
                    $lookup: {
                        from: "users",
                        let: { userid: "$user_id" },
                        pipeline: [{
                            $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$userid" }] } }
                        }, {
                            $project: { _id: 0, name: 1, email: 1, resume: { originalname: 1, filename: 1 } }
                        }],
                        as: 'user',
                    },
                },
                { $unwind: "$user" },
                { $match: { post_id: ObjectId(value.post_id) } },
                { $sort: { _id: -1 } },
                {
                    $project: {
                        post_id: 1, status: 1, created_at: 1, user: 1
                    }
                }
            ];

            let applications = await Application.aggregate([...aggregate, ...[{ $limit: limit + skip }, { $skip: skip }]]);
            let total = await Application.aggregate([...aggregate, ...[
                { $group: { _id: null, count: { $sum: 1 } } },
                { $project: { _id: 0 } }
            ]]);

            return {
                statusCode: 200,
                data: {
                    post: post,
                    applications: applications,
                    total: total[0].count
                }
            }
        } else {
            return {
                statusCode: 204
            }
        }
    }
}

/**
 * @description: This function get details of an application.
 * With a proper validation of requested data.
 * gets the details of applications.
 * @returns: It returns statuscode and application details.
 */
module.exports.application = async (req) => {
    // Validate the requested data
    var { error, value } = await Schema.application.validate(req.params);
    if (error) {
        return {
            statusCode: 422,
            message: error.message,
            errorStack: error.details[0].path
        }
    } else {
        let application = await Application.aggregate([
            {
                $lookup: {
                    from: "users",
                    let: { userid: "$user_id" },
                    pipeline: [{
                        $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$userid" }] } }
                    }, {
                        $project: { _id: 0, name: 1, email: 1, resume: { originalname: 1, filename: 1 } }
                    }],
                    as: 'user',
                },
            },
            { $unwind: "$user" },
            {
                $lookup: {
                    from: "posts",
                    let: { userid: "$user_id", postid: "$post_id" },
                    pipeline: [{
                        $match: {
                            $expr: { $eq: ["$_id", { $toObjectId: "$$postid" }] }
                        }
                    }],
                    as: 'post',
                },
            },
            { $unwind: "$post" },
            { $match: { $and: [{ _id: ObjectId(value._id) }, { "post.user_id": ObjectId(req.user._id) }] } },
            { $project: { _id: 1, created_at: 1, user: 1, post: 1 } },
        ])
        if (application.length) {
            return {
                statusCode: 200,
                data: application[0]
            }
        } else {
            return {
                statusCode: 204
            }
        }

    }
}


/**
 * @description: This function downloads resume for an application.
 * With a proper validation of requested data.
 * gets the resume details of an applications.
 * @returns: It downloads the resume.
 */
module.exports.resume = async (req, res) => {
    // Validate the requested data
    var { error, value } = await Schema.application.validate(req.params);
    if (error) {
        res.status(422).json({
            message: error.message,
            errorStack: error.details[0].path
        })
    } else {
        let application = await Application.aggregate([
            {
                $lookup: {
                    from: "users",
                    let: { userid: "$user_id" },
                    pipeline: [{
                        $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$userid" }] } }
                    }, {
                        $project: { _id: 0, name: 1, email: 1, resume: { originalname: 1, filename: 1 } }
                    }],
                    as: 'user',
                },
            },
            { $unwind: "$user" },
            {
                $lookup: {
                    from: "posts",
                    let: { userid: "$user_id", postid: "$post_id" },
                    pipeline: [{
                        $match: {
                            $expr: { $eq: ["$_id", { $toObjectId: "$$postid" }] }
                        }
                    }],
                    as: 'post',
                },
            },
            { $unwind: "$post" },
            { $match: { $and: [{ _id: ObjectId(value._id) }, { "post.user_id": ObjectId(req.user._id) }] } },
            { $project: { _id: 1, created_at: 1, user: 1, post: 1 } },
        ])
        if (application.length) {
            let resume = application[0].user.resume;
            if (resume) {
                var filestream = fs.createReadStream(`./public/resumes/${resume.filename}`);
                res.setHeader('Content-disposition', 'attachment; filename=' + resume.originalname);
                res.setHeader('Access-Control-Expose-Headers', 'Content-disposition');
                filestream.pipe(res);
            } else {
                res.status(500).json({
                    message: "Resume not available."
                });
            }

        } else {
            res.status(204);
        }

    }
}
