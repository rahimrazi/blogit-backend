const express = require("express");
const {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  updatePostCtrl,
  deletePostCtrl,
  toggleAddLikeToPostCtrl,
  toggleAddDisLikeToPostCtrl,
} = require("../../controllers/posts/postCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {
  photoUpload,
  postImageResize,
} = require("../../middlewares/uploads/photoUpload");

const postRoute = express.Router();



postRoute.post(
  "/",
  authMiddleware,
  photoUpload.single("image"),
  postImageResize,
  createPostCtrl
);
postRoute.get("/", fetchPostsCtrl);
postRoute.get("/:id", fetchPostCtrl);


postRoute.put("/likes",authMiddleware,toggleAddLikeToPostCtrl)
postRoute.put("/dislikes",authMiddleware,toggleAddDisLikeToPostCtrl)

postRoute.put("/:id", authMiddleware, updatePostCtrl);



postRoute.delete("/:id", authMiddleware, deletePostCtrl);




module.exports = postRoute;
