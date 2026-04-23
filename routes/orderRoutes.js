const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');
const { createOrderValidator, mongoIdValidator } = require('../middleware/validators');

router.use(protect);

router.post('/', createOrderValidator, createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', mongoIdValidator, getOrderById);
router.put('/:id/cancel', mongoIdValidator, cancelOrder);

router.use(authorize('admin'));

router.get('/', getAllOrders);
router.put('/:id/status', mongoIdValidator, updateOrderStatus);

module.exports = router;
