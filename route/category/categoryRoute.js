const express = require("express");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {
  createCategoryCtrl,
  fetchAllCategoriesCtrl,
  fetchSingleCategoryCtrl,
  updateCategoryCtrl,
  deleteCategoryCtrl,
} = require("../../controllers/category/categoryCtrl");

const categoryRoute = express.Router();

categoryRoute.post("/", authMiddleware, createCategoryCtrl);
categoryRoute.get("/",fetchAllCategoriesCtrl);
categoryRoute.get("/:id", fetchSingleCategoryCtrl);
categoryRoute.put("/:id", authMiddleware, updateCategoryCtrl);
categoryRoute.delete("/:id", authMiddleware, deleteCategoryCtrl);

module.exports = categoryRoute;
