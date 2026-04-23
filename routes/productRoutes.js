const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');
const {
  createProductValidator,
  updateProductValidator,
  mongoIdValidator
} = require('../middleware/validators');
const { uploadProductImage } = require('../middleware/upload');

router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', mongoIdValidator, getProductById);

router.use(protect, authorize('admin'));

router.post('/', uploadProductImage, createProductValidator, createProduct);
router.put('/:id', mongoIdValidator, uploadProductImage, updateProductValidator, updateProduct);
router.delete('/:id', mongoIdValidator, deleteProduct);

module.exports = router;
