const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    livreur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'ASSIGNED', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING'
    },
    paymentMethod: { type: String, enum: ['ONLINE', 'CASH'], required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    deliveryFee: { type: Number, default: 0 },
    tip: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    deliveryDistance: { type: Number, default: 0 },
    deliveryAddress: { type: String, required: true },
    clientLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    livreurLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    }
  },
  { timestamps: true }
);

orderSchema.index({ clientLocation: '2dsphere' });
orderSchema.index({ livreurLocation: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
