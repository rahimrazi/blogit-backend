const express = require('express');
const commentRoutes = express.Router();
const { createCommentCtrl, fetchAllComments } = require("../../controllers/comments/commentCtrl");
const authMiddleware = require('../../middlewares/auth/authMiddleware');

commentRoutes.post('/',authMiddleware,createCommentCtrl)
commentRoutes.get('/',authMiddleware,fetchAllComments)



module.exports =commentRoutes;
