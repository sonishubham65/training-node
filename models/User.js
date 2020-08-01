const bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: String,
    userName: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['employee', 'manager'],
        default: 'employee'
    },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);