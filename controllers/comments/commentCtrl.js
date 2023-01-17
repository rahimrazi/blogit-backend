const expressAsyncHandler = require("express-async-handler");
const Comment = require("../../model/comment/Comment");


//-------------------------------
// Create a new Comment
//-------------------------------

const createCommentCtrl = expressAsyncHandler(async(req,res)=>{
    //1. get the user
    const user = req.user
    //2. get the postId
    const {postId,description} = req.body
    try {
        const comment = await Comment.create({
            post: postId,
            user,
            description:description
        })
        res.json(comment)
    } catch (error) {
       res.json(error) 
    }
})

//-------------------------------
// Fetch all comments
//-------------------------------

//just in case needed

const fetchAllComments = expressAsyncHandler(async(req,res)=>{
    try {
        const comment = await Comment.find({}).sort("{-created}")
        res.json(comment)
    } catch (error) {
        res.json(error)
    }
})

module.exports ={createCommentCtrl,
    fetchAllComments}