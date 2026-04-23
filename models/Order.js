const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String
  }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: 'Order must have at least one item'
      }
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['cod', 'card', 'upi']
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'processing'
    },
    itemsPrice: {
      type: Number,
      required: true
    },
    shippingPrice: {
      type: Number,
      default: 0
    },
    taxPrice: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true
    },
    paidAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    }
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.itemsPrice = this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    this.itemsPrice = Math.round(this.itemsPrice * 100) / 100;

    this.taxPrice = Math.round(this.itemsPrice * 0.18 * 100) / 100;

    this.shippingPrice = this.itemsPrice > 500 ? 0 : 50;

    this.totalPrice = Math.round(
      (this.itemsPrice + this.taxPrice + this.shippingPrice) * 100
    ) / 100;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
