const express = require('express');
const router = express.Router();

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/auth');
const { categoryValidator, mongoIdValidator } = require('../middleware/validators');
const { uploadCategoryImage } = require('../middleware/upload');

router.get('/', getAllCategories);
router.get('/:id', mongoIdValidator, getCategoryById);

router.use(protect, authorize('admin'));

router.post('/', uploadCategoryImage, categoryValidator, createCategory);
router.put('/:id', mongoIdValidator, uploadCategoryImage, categoryValidator, updateCategory);
router.delete('/:id', mongoIdValidator, deleteCategory);

module.exports = router;
