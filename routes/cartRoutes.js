const express = require('express');
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cartController');

const { protect } = require('../middleware/auth');
const { addToCartValidator, updateCartValidator } = require('../middleware/validators');

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCartValidator, addToCart);
router.put('/item/:itemId', updateCartValidator, updateCartItem);
router.delete('/item/:itemId', removeCartItem);
router.delete('/clear', clearCart);

module.exports = router;
