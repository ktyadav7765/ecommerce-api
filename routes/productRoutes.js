const express = require('express');
const router = express.Router();
const cache = require('../middleware/cache');

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

router.get(
  '/',
  cache((req) => `products:${JSON.stringify(req.query)}`, 300),
  getAllProducts
);

router.get(
  '/featured',
  cache((req) => `featured:${JSON.stringify(req.query)}`, 300),
  getFeaturedProducts
);

router.get(
  '/category/:categoryId',
  cache((req) => `category-products:${req.params.categoryId}:${JSON.stringify(req.query)}`, 300),
  getProductsByCategory
);

router.get(
  '/slug/:slug',
  cache((req) => `product-slug:${req.params.slug}`, 300),
  getProductBySlug
);

router.get(
  '/:id',
  mongoIdValidator,
  cache((req) => `product-id:${req.params.id}`, 300),
  getProductById
);

router.use(protect, authorize('admin'));

router.post('/', uploadProductImage, createProductValidator, createProduct);
router.put('/:id', mongoIdValidator, uploadProductImage, updateProductValidator, updateProduct);
router.delete('/:id', mongoIdValidator, deleteProduct);

module.exports = router;
