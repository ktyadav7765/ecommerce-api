const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const APIFeatures = require('../utils/apiFeatures');

const createProduct = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.image = req.file.filename;
  }

  const product = await Product.create(req.body);

  res.status(201).json({ success: true, data: product });
});

const getAllProducts = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Product.find({ isActive: true }),
    req.query
  )
    .filter()
    .search(['name', 'description', 'brand'])
    .sort()
    .selectFields()
    .paginate();

  const products = await features.query.populate('category', 'name');

  const countFeatures = new APIFeatures(
    Product.find({ isActive: true }),
    req.query
  )
    .filter()
    .search(['name', 'description', 'brand']);

  const total = await countFeatures.query.countDocuments();
  const { page, limit } = features.paginationInfo;

  res.json({
    success: true,
    count: products.length,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    },
    data: products
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name'
      },
      options: { sort: { createdAt: -1 } }
    });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.json({ success: true, data: product });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'name' },
      options: { sort: { createdAt: -1 } }
    });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.image = req.file.filename;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.json({ success: true, data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  product.isActive = false;
  await product.save();

  res.json({ success: true, message: 'Product deactivated' });
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const products = await Product.find({
    isFeatured: true,
    isActive: true
  })
    .populate('category', 'name')
    .sort('-createdAt')
    .limit(limit);

  res.json({ success: true, count: products.length, data: products });
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Product.find({ category: req.params.categoryId, isActive: true }),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const products = await features.query.populate('category', 'name');

  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory
};
