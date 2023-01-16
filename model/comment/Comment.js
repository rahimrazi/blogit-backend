// one comment belong to a particular post
// A post can have multiple comments
// A user can create multiple comments on a single  post
// A comment belongs to a single user
// A commment require a postId and a userId, when a comment is posted it will be going inside the comment model with user reference

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Post',
        required:[true,'post is required']
    },
    user:{
        type: Object,
        required:[true,'user is required']
    },
    description:{
        type: String,
        required: [true,"comment description is required"]
    },


},{timestamps:true})

const Comment = mongoose.model('Comment',commentSchema)
module.exports = Comment;