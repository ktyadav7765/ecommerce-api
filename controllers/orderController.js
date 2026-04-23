const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    'items.product',
    'name image stock isActive price discountPrice'
  );

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty. Add items before ordering.', 400);
  }

  for (const item of cart.items) {
    if (!item.product.isActive) {
      throw new AppError(
        `Product "${item.product.name}" is no longer available`,
        400
      );
    }
    if (item.quantity > item.product.stock) {
      throw new AppError(
        `Not enough stock for "${item.product.name}". Available: ${item.product.stock}`,
        400
      );
    }
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.price,
    image: item.product.image
  }));

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod
  });

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity }
    });
  }

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

  res.json({ success: true, count: orders.length, data: orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (
    order.user._id.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Not authorized to view this order', 403);
  }

  res.json({ success: true, data: order });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments();

  res.json({
    success: true,
    count: orders.length,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total
    },
    data: orders
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.orderStatus === 'delivered') {
    throw new AppError('Order already delivered. Cannot update.', 400);
  }

  if (order.orderStatus === 'cancelled') {
    throw new AppError('Order already cancelled. Cannot update.', 400);
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;

    if (orderStatus === 'delivered') {
      order.deliveredAt = Date.now();
      order.paymentStatus = 'paid';
    }

    if (orderStatus === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      order.paidAt = Date.now();
    }
  }

  await order.save();

  res.json({ success: true, data: order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user.toString() !== req.user.id) {
    throw new AppError('Not authorized to cancel this order', 403);
  }

  if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
    throw new AppError(
      `Cannot cancel order. Order is already ${order.orderStatus}.`,
      400
    );
  }

  order.orderStatus = 'cancelled';

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity }
    });
  }

  await order.save();

  res.json({ success: true, message: 'Order cancelled', data: order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};
