const express = require('express');
const authMiddleware = require('../../middlewares/auth/authMiddleware');
const { createCategoryCtrl, fetchAllCategoriesCtrl, fetchSingleCategoryCtrl } = require('../../controllers/category/categoryCtrl');

const categoryRoute = express.Router()

categoryRoute.post('/',authMiddleware,createCategoryCtrl)
categoryRoute.get('/',authMiddleware,fetchAllCategoriesCtrl)
categoryRoute.get('/:id',authMiddleware,fetchSingleCategoryCtrl)

module.exports = categoryRoute