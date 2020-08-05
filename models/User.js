const bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: String,
    userName: String,
    email: String,
    password: {
        type: String,
        select: false,
    },
    role: {
        type: String,
        enum: ['employee', 'manager'],
        default: 'employee'
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
    resume: Object,
    login_at: { type: Date }
});

module.exports = mongoose.model('User', userSchema);