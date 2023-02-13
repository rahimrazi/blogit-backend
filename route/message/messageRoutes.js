const express = require("express");
const { sendMessage, allMessages } = require("../../controllers/messages/messageControllers");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(authMiddleware, allMessages);
router.route("/").post(authMiddleware, sendMessage);

module.exports = router;