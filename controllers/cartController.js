const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate(
    'items.product',
    'name image stock isActive'
  );

  if (!cart) {
    cart = { items: [], totalPrice: 0 };
  }

  res.json({ success: true, data: cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (!product.isActive) {
    throw new AppError('Product is no longer available', 400);
  }

  if (product.stock < quantity) {
    throw new AppError(`Only ${product.stock} items available in stock`, 400);
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    if (newQuantity > product.stock) {
      throw new AppError(
        `Cannot add more. Only ${product.stock} available. You already have ${cart.items[existingItemIndex].quantity} in cart.`,
        400
      );
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = product.discountPrice || product.price;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.discountPrice || product.price
    });
  }

  await cart.save();

  await cart.populate('items.product', 'name image stock');

  res.json({ success: true, data: cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const itemId = req.params.itemId;

  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const item = cart.items.id(itemId);

  if (!item) {
    throw new AppError('Item not found in cart', 404);
  }

  const product = await Product.findById(item.product);

  if (quantity > product.stock) {
    throw new AppError(`Only ${product.stock} available in stock`, 400);
  }

  item.quantity = quantity;
  item.price = product.discountPrice || product.price;

  await cart.save();

  await cart.populate('items.product', 'name image stock');

  res.json({ success: true, data: cart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const item = cart.items.id(req.params.itemId);

  if (!item) {
    throw new AppError('Item not found in cart', 404);
  }

  cart.items.pull(req.params.itemId);

  await cart.save();

  res.json({ success: true, data: cart });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  cart.items = [];
  await cart.save();

  res.json({ success: true, message: 'Cart cleared', data: cart });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
