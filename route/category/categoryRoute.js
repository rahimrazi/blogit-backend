const express = require('express');
const authMiddleware = require('../../middlewares/auth/authMiddleware');
const { createCategoryCtrl } = require('../../controllers/category/categoryCtrl');

const categoryRoute = express.Router()

categoryRoute.post('/',authMiddleware,createCategoryCtrl)

module.exports = categoryRoute