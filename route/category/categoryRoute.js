const express = require('express');
const authMiddleware = require('../../middlewares/auth/authMiddleware');
const { createCategoryCtrl, fetchAllCategoriesCtrl } = require('../../controllers/category/categoryCtrl');

const categoryRoute = express.Router()

categoryRoute.post('/',authMiddleware,createCategoryCtrl)
categoryRoute.get('/',authMiddleware,fetchAllCategoriesCtrl)

module.exports = categoryRoute