const express = require("express");
const { accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup } = require("../../controllers/chat/chatControllers");
const authMiddleware = require("../../middlewares/auth/authMiddleware");


const router = express.Router();

router.route('/').post(authMiddleware,accessChat)
router.route('/').get(authMiddleware,fetchChats)
router.route('/group').post(authMiddleware,createGroupChat)
router.route('/rename').put(authMiddleware,renameGroup)
router.route('/groupremove').put(authMiddleware,removeFromGroup)
router.route('/groupadd').put(authMiddleware,addToGroup)



module.exports = router