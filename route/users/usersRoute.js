const express = require("express");
const {
  userRegisterCtrl,
  loginUserCtrl,fetchUsersCtrl
} = require("../../controllers/users/usersCtrl");
const userRoutes = express.Router();

userRoutes.post("/register", userRegisterCtrl);
userRoutes.post("/login", loginUserCtrl);
userRoutes.get("/", fetchUsersCtrl);

module.exports = userRoutes;
