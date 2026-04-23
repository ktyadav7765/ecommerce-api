const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const createCategory = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.image = req.file.filename;
  }

  const category = await Category.create(req.body);

  res.status(201).json({ success: true, data: category });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');

  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate({
    path: 'products',
    select: 'name price image averageRating'
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.image = req.file.filename;
  }

  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const Product = require('../models/Product');
  const productCount = await Product.countDocuments({ category: req.params.id });

  if (productCount > 0) {
    throw new AppError(
      `Cannot delete category. ${productCount} products belong to it.`,
      400
    );
  }

  await Category.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Category deleted' });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
