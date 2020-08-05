var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var resumeSchema = new Schema({
    filename: String,
    originalname: String,
    size: String,
    user_id: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', resumeSchema);