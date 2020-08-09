const bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.set('useCreateIndex', true);
var tokenSchema = new Schema({
    token: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
});
module.exports = mongoose.model('Token', tokenSchema);