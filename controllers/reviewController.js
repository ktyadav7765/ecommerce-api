const Review = require('../models/Review');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const existingReview = await Review.findOne({
    product: req.params.productId,
    user: req.user.id
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  const review = await Review.create({
    ...req.body,
    product: req.params.productId,
    user: req.user.id
  });

  res.status(201).json({ success: true, data: review });
});

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name')
    .sort('-createdAt');

  res.json({ success: true, count: reviews.length, data: reviews });
});

const updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (review.user.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this review', 403);
  }

  review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      rating: req.body.rating || review.rating,
      text: req.body.text || review.text,
      title: req.body.title || review.title
    },
    { new: true, runValidators: true }
  );

  // Recalculate average rating
  await Review.calcAverageRating(review.product);

  res.json({ success: true, data: review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this review', 403);
  }

  const productId = review.product;

  await Review.findByIdAndDelete(req.params.id);

  // post hook will recalculate average

  res.json({ success: true, message: 'Review deleted' });
});

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview
};
