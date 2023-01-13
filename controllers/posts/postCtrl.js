const expressAsyncHandler = require("express-async-handler");
const Post = require("../../model/post/Post");
const Filter = require("bad-words");
const fs = require("fs")

const validateMongodbId = require("../../utils/validateMongodbId");
const User = require("../../model/user/User");
const cloudinaryUploadImg = require("../../utils/cloudinary");
//---------------
//Create Post
//---------------

const createPostCtrl = expressAsyncHandler(async (req, res) => {
  console.log(req.file);
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
    // const post = await Post.create({
    //   ...req.body,
    //   image: imgUploaded?.url,
    //   user: _id,
    // });
    res.json(imgUploaded);
    //remove uploaded img
    fs.unlinkSync(localPath);
  } catch (error) {
    res.json(error);
  }
});

//----------------------------------------------------------------
//Fetch all posts
//--------------------------------------------

const fetchPostsCtrl = expressAsyncHandler(async(req,res)=>{
    try {
        const posts = await Post.find({}).populate('user')
        res.json(posts)
        
    } catch (error) {
        
    }
})

module.exports = {
  createPostCtrl,
  fetchPostsCtrl
};
