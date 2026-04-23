const express = require('express');
const router = express.Router();

const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

const { protect } = require('../middleware/auth');
const { reviewValidator, mongoIdValidator } = require('../middleware/validators');

router.get('/product/:productId', getProductReviews);

router.use(protect);

router.post('/product/:productId', reviewValidator, createReview);
router.put('/:id', mongoIdValidator, reviewValidator, updateReview);
router.delete('/:id', mongoIdValidator, deleteReview);

module.exports = router;

