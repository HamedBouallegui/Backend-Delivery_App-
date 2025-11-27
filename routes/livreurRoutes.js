const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

const calcPeriodFilter = (period) => {
  if (!period) return null;

  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      return null;
  }

  return start;
};

router.get('/earnings', auth('LIVREUR'), async (req, res) => {
  try {
    const { period } = req.query;

    const match = {
      livreur: req.user.id,
      status: 'DELIVERED'
    };

    const startDate = calcPeriodFilter(period);
    if (startDate) {
      match.updatedAt = { $gte: startDate };
    }

    const orders = await Order.find(match)
      .populate('client', 'name')
      .populate('merchant', 'name');

    const summary = orders.reduce(
      (acc, order) => {
        const tip = order.tip || 0;
        const amount = order.totalAmount || 0;
        const base = Math.max(amount - tip, 0);

        acc.totalEarnings += amount;
        acc.totalDeliveries += 1;
        acc.tips += tip;
        acc.basePay += base;

        acc.deliveries.push({
          orderId: order._id,
          customerName: order.client?.name || '',
          restaurant: order.merchant?.name || '',
          amount,
          tip,
          distance: order.deliveryDistance || 0,
          time: order.updatedAt
        });

        return acc;
      },
      {
        totalEarnings: 0,
        totalDeliveries: 0,
        tips: 0,
        basePay: 0,
        deliveries: []
      }
    );

    summary.averagePerDelivery = summary.totalDeliveries
      ? summary.totalEarnings / summary.totalDeliveries
      : 0;

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
