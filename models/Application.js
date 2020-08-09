var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var applicationSchema = new Schema({
    user_id: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    post_id: {
        type: Schema.ObjectId,
        ref: 'Post',
        required: true,
    },
    status: {
        type: String,
        enum: ['applied'],
    },
    created_at: { type: Date, default: Date.now },
});
applicationSchema.index({ user_id: 1, post_id: 1 }, { unique: true })
module.exports = mongoose.model('Application', applicationSchema);