const expressAsyncHandler = require("express-async-handler");
const Post = require("../../model/post/Post");
const Filter = require("bad-words");
const fs = require("fs");

const validateMongodbId = require("../../utils/validateMongodbId");
const User = require("../../model/user/User");
const cloudinaryUploadImg = require("../../utils/cloudinary");
//---------------
//Create Post
//---------------

const createPostCtrl = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;

  // validateMongodbId(req.body.user)
  //check for bad words
  let filter = new Filter();
  const isProfane = filter.isProfane(req.body.title, req.body.description);
  //block user
  if (isProfane) {
    const user = await User.findByIdAndUpdate(_id, {
      isBlocked: true,
    });
    throw new Error(
      "creating failed because post contains profane words and u have been blocked"
    );
  }
  //1.get the path to image file
  const localPath = `public/images/posts/${req.file.filename}`;

  //2.upload to cloudinary
  const imgUploaded = await cloudinaryUploadImg(localPath);

  try {
    const post = await Post.create({
      ...req.body,
      image: imgUploaded?.url,
      user: _id,
    });
    res.json(post);
    //remove uploaded img
    fs.unlinkSync(localPath);
  } catch (error) {
    res.json(error);
  }
});

//----------------------------------------------------------------
//Fetch all posts
//--------------------------------------------

const fetchPostsCtrl = expressAsyncHandler(async (req, res) => {
  try {
    const posts = await Post.find({}).populate("user");
    res.json(posts);
  } catch (error) {}
});

//------------------------------
//Fetch a single post
//------------------------------

const fetchPostCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findById(id).populate("user").populate("disLikes").populate("likes");
    //update number of views
    await Post.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});
//------------------------------
// Update post
//------------------------------

const updatePostCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        ...req.body,
        user: req.user?._id,
      },
      {
        new: true,
      }
    );
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//Delete Post
//------------------------------

const deletePostCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findByIdAndDelete(id);
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

//------------------------------
//Like Post
//------------------------------

const toggleAddLikeToPostCtrl = expressAsyncHandler(async (req, res) => {
  //1.find the post to be liked
  const { postId } = req.body;

  const post = await Post.findById(postId);

  //2 . Find the Logged in User
  const loginUserId = req?.user?._id;

  //3 . Find if the user already liked the post
  const isLiked = post?.isLiked;
  //4 . Find if this user has disliked the post (checking the dislike array)
  const alreadyDisliked = post?.disLikes?.find(
    (userId) => userId.toString() === loginUserId?.toString()
  );

  //5 . Remove user from disLikes array if the user has already disliked
  if (alreadyDisliked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { disLikes: loginUserId },
        isDisLiked: false,
      },
      { new: true }
    );
    res.json(post);
  }
  //Toggle
  //remove the user if he has liked the post
  if (isLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      {
        new: true,
      }
    );
    res.json(post);
  } else {
    //add to Likes

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
    res.json(post);
  }
});
//------------------------------
//disLikes
//------------------------------------
const toggleAddDisLikeToPostCtrl = expressAsyncHandler(async (req, res) => {
  //1.find the post to be disliked
  const { postId } = req.body;
  const post = await Post.findById(postId);

  //2. find the login user
  const loginUserId = req?.user?._id;
  //3. check if this user has already disliked
  const isDisLiked = post?.isDisLiked;
  //4. check if the user has already liked the post
  const alreadyLiked = post?.likes?.find(
    (userId) => userId.toString() === loginUserId?.toString()
  );
  //remove this user from likes array if it already exists
  if (alreadyLiked) {
    const post = await Post.findOneAndUpdate(
      postId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(post);
  }
  //toggling
  //Remove this user from dislikes if already disliked
  if (isDisLiked) {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { disLikes: loginUserId },
        isDisLiked: false,
      },
      { new: true }
    );
    res.json(post);
  } else {
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { disLikes: loginUserId },
        isDisLiked: true,
      },
      { new: true }
    );
    res.json(post);
  }
});

module.exports = {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  updatePostCtrl,
  deletePostCtrl,
  toggleAddLikeToPostCtrl,
  toggleAddDisLikeToPostCtrl,
};
