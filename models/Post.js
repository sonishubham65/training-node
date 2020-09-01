var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var postSchema = new Schema({
    project_name: String,
    client_name: String,
    technologies: Array,
    user_id: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        enum: ['Trainee', 'Associate', 'Senior associate', 'Lead', 'Manager', 'Director'],
        default: 'Trainee'
    },
    description: String,
    status: {
        type: Boolean,
        default: true
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date },
});

module.exports = mongoose.model('Post', postSchema);