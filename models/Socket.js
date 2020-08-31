var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var socketSchema = new Schema({
    user_id: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    socket_id: {
        type: String
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
});

module.exports = mongoose.model('Socket', socketSchema);