var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var CommentSchema = new Schema({
    comment: {
        type: String,
        unique: false,
        required: true
    },
    date: { 
        type: Date, 
        default: new Date()
    },
    question: {type: Schema.Types.ObjectId, ref: 'Question'}
    
});
 
module.exports = mongoose.model('Comment', CommentSchema);