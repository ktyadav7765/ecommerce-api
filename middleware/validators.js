const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// ============ AUTH ============

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

// ============ CATEGORY ============

const categoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
  validate
];

// ============ PRODUCT ============

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('discountPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discount price must be positive'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('brand')
    .optional()
    .trim(),
  validate
];

const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('discountPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discount price must be positive'),
  body('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be non-negative'),
  validate
];

// ============ REVIEW ============

const reviewValidator = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('text')
    .trim()
    .notEmpty().withMessage('Review text is required')
    .isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  validate
];

// ============ CART ============

const addToCartValidator = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
];

const updateCartValidator = [
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
];

// ============ ORDER ============

const createOrderValidator = [
  body('shippingAddress.street')
    .trim()
    .notEmpty().withMessage('Street is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty().withMessage('Country is required'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['cod', 'card', 'upi']).withMessage('Invalid payment method'),
  validate
];

// ============ SHARED ============

const mongoIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate
];

module.exports = {
  registerValidator,
  loginValidator,
  categoryValidator,
  createProductValidator,
  updateProductValidator,
  reviewValidator,
  addToCartValidator,
  updateCartValidator,
  createOrderValidator,
  mongoIdValidator
};
