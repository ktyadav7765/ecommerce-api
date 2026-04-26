const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    price: {
      type: Number,
      required: true
    }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

cartSchema.methods.calcTotalPrice = function () {
  this.totalPrice = this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  this.totalPrice = Math.round(this.totalPrice * 100) / 100;
};

cartSchema.pre('save', function (next) {
  this.calcTotalPrice();
  next();
});
cartSchema.index({ user: 1 });
module.exports = mongoose.model('Cart', cartSchema);

