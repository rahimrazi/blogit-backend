const expressAsyncHandler = require("express-async-handler");
const Comment = require("../../model/comment/Comment");
const blockUser = require("../../utils/blockUser");
const validateMongodbId = require("../../utils/validateMongodbId");



//-------------------------------
// Create a new Comment
//-------------------------------

const createCommentCtrl = expressAsyncHandler(async (req, res) => {
  //1. get the user
  const user = req.user;
  //check if user is blocked
  blockUser(user)
  //2. get the postId
  const { postId, description } = req.body;

  try {
    const comment = await Comment.create({
      post: postId,
      user,
      description: description,
    });
    res.json(comment);
  } catch (error) {
    res.json(error);
  }
});

//-------------------------------
// Fetch all comments
//-------------------------------

//just in case needed

const fetchAllComments = expressAsyncHandler(async (req, res) => {
  try {
    const comment = await Comment.find({}).sort({createdAt:-1})
    
    res.json(comment);
  } catch (error) {
    res.json(error);
  }
});

//-------------------------------
// Comment details
//-------------------------------

const fetchCommentCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id)
  try {
    const comment = await Comment.findById(id);
    console.log(comment)
    res.json(comment);
  } catch (error) {
    res.json(error);
  }
});

//-------------------------------
// update comment
//-------------------------------

const updateCommentCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id)
  try {
    const update = await Comment.findByIdAndUpdate(
      id,
      {
        // post: req.body?.postId,
        user: req?.user,
        description: req?.body?.description,
      },
      { new: true, runValidators: true }
    );
    res.json(update);
  } catch (error) {
    res.json(error)
  }
});

//-------------------------------
// delete comment
//-------------------------------
const deleteCommentCtrl = expressAsyncHandler(async (req, res) => {
    const{id} = req.params;
    validateMongodbId(id)
    try {
        const comment = await Comment.findByIdAndDelete(id)
        res.json(comment)
    } catch (error) {
        res.json(error)
    }

})
module.exports = {
  createCommentCtrl,
  fetchAllComments,
  fetchCommentCtrl,
  updateCommentCtrl,
  deleteCommentCtrl
};
