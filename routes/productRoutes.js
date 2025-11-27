const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true }).populate('merchant', 'name');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth('COMMERCANT'), async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;

    const product = await Product.create({
      merchant: req.user.id,
      name,
      description,
      price,
      imageUrl
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
