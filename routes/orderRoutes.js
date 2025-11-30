const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();
console.log('orderRoutes.js loaded');

const formatOrder = (order) => {
  if (!order) return null;

  const merchantId = order.merchant?._id || order.merchant;

  return {
    id: order._id,
    merchantId,
    merchant:
      order.merchant && order.merchant.name
        ? {
            id: merchantId,
            name: order.merchant.name
          }
        : null,
    client: order.client
      ? {
          id: order.client._id,
          name: order.client.name,
          phone: order.client.phone || null
        }
      : null,
    items: order.items.map((it) => ({
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      price: it.price
    })),
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    deliveryAddress: order.deliveryAddress,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
};

// Create order
router.post('/', auth('CLIENT'), async (req, res) => {
  try {
    const { merchantId, items, paymentMethod, deliveryAddress, clientLocation } = req.body;

    if (!merchantId || !items || !items.length || !paymentMethod || !deliveryAddress) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const dbItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const quantity = item.quantity || 1;
      const price = product.price;
      totalAmount += quantity * price;

      dbItems.push({
        productId: product._id,
        productName: product.name,
        quantity,
        price
      });
    }

    const created = await Order.create({
      client: req.user.id,
      merchant: merchantId,
      items: dbItems,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      clientLocation: clientLocation
        ? { type: 'Point', coordinates: [clientLocation.lng, clientLocation.lat] }
        : undefined
    });

    const order = await Order.findById(created._id)
      .populate('merchant', 'name')
      .populate('client', 'name phone');

    if (!order) {
      return res.status(500).json({ message: 'Order could not be loaded after creation' });
    }

    res.status(201).json(formatOrder(order));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== STATIC ROUTES (must come before parameterized routes) ==========

// Debug route to test route registration (remove after testing)
router.get('/test', (req, res) => {
  res.json({ message: 'Route registration working!', path: req.path });
});

// Client: get all orders placed by current user
router.get('/my', auth('CLIENT'), async (req, res) => {
  console.log('✅ HIT /api/commandes/my for client', req.user?.id);
  try {
    const orders = await Order.find({ client: req.user.id })
      .populate('merchant', 'name')
      .populate('client', 'name phone');

    res.json(orders.map(formatOrder));
  } catch (error) {
    console.error('❌ Error in /my route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delivery driver: get available orders (status ACCEPTED)
router.get('/available', auth('LIVREUR'), async (req, res) => {
  try {
    const orders = await Order.find({ status: 'ACCEPTED' })
      .populate('merchant', 'name')
      .populate('client', 'name phone');

    res.json(orders.map(formatOrder));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delivery driver: get orders assigned to current driver
router.get('/my-deliveries', auth('LIVREUR'), async (req, res) => {
  try {
    const orders = await Order.find({ livreur: req.user.id })
      .populate('merchant', 'name')
      .populate('client', 'name phone');

    res.json(orders.map(formatOrder));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== PARAMETERIZED ROUTES (must come after static routes) ==========

// Generic status update respecting allowed flow
router.put('/:id/status', auth(), async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ['PENDING', 'ACCEPTED', 'ASSIGNED', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const query = { _id: req.params.id };

    if (status === 'ON_THE_WAY') {
      query.status = 'ASSIGNED';
      if (req.user?.role === 'LIVREUR') {
        query.livreur = req.user.id;
      }
    }

    const order = await Order.findOneAndUpdate(query, { status }, { new: true })
      .populate('merchant', 'name')
      .populate('client', 'name phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found or invalid status transition' });
    }
    res.json(formatOrder(order));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track order with client and delivery locations
router.get('/:id/track', auth(), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name')
      .populate('livreur', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      orderId: order._id,
      status: order.status,
      clientLocation: order.clientLocation,
      livreurLocation: order.livreurLocation,
      livreur: order.livreur
        ? {
            id: order.livreur._id,
            name: order.livreur.name
          }
        : null,
      updatedAt: order.updatedAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delivery driver: assign order to current driver (status ASSIGNED)
router.put('/:id/assign', auth('LIVREUR'), async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: 'ACCEPTED' },
      { status: 'ASSIGNED', livreur: req.user.id },
      { new: true }
    )
      .populate('merchant', 'name')
      .populate('client', 'name phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not available for assignment' });
    }

    res.json(formatOrder(order));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
