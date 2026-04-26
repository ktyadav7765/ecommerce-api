const express = require('express');
const router = express.Router();
const cache = require('../middleware/cache');

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

router.get(
  '/',
  cache(() => 'categories:all', 300),
  getAllCategories
);

router.get(
  '/:id',
  mongoIdValidator,
  cache((req) => `category:${req.params.id}`, 300),
  getCategoryById
);

router.use(protect, authorize('admin'));

router.post('/', uploadCategoryImage, categoryValidator, createCategory);
router.put('/:id', mongoIdValidator, uploadCategoryImage, categoryValidator, updateCategory);
router.delete('/:id', mongoIdValidator, deleteCategory);

module.exports = router;
