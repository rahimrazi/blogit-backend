const express = require('express');
const commentRoutes = express.Router();
const { createCommentCtrl, fetchAllComments, fetchCommentCtrl, updateCommentCtrl, deleteCommentCtrl } = require("../../controllers/comments/commentCtrl");
const authMiddleware = require('../../middlewares/auth/authMiddleware');

commentRoutes.post('/',authMiddleware,createCommentCtrl)
commentRoutes.get('/',authMiddleware,fetchAllComments)
commentRoutes.get('/:id',authMiddleware,fetchCommentCtrl)
commentRoutes.put('/:id',authMiddleware,updateCommentCtrl)
commentRoutes.delete('/:id',authMiddleware,deleteCommentCtrl)




module.exports =commentRoutes;
