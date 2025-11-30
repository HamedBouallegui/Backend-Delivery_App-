const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      phone,
      isApproved: role === 'LIVREUR' ? false : true
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all users (CLIENT and COMMERCANT)
router.get('/users', auth('ADMIN'), async (req, res) => {
  console.log('✅ HIT /api/auth/users for admin', req.user?.id);
  try {
    const { role } = req.query;
    const query = {};
    
    // Filter by role if provided, otherwise get CLIENT and COMMERCANT
    if (role) {
      query.role = role;
    } else {
      query.role = { $in: ['CLIENT', 'COMMERCANT'] };
    }
    
    const users = await User.find(query)
      .select('-passwordHash') // Don't send password hash
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('❌ Error in /users route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update user (approve/disable)
router.put('/users/:id', auth('ADMIN'), async (req, res) => {
  try {
    const { isApproved, role } = req.body;
    const updateData = {};
    
    if (isApproved !== undefined) {
      updateData.isApproved = isApproved;
    }
    if (role && ['CLIENT', 'COMMERCANT'].includes(role)) {
      updateData.role = role;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete user
router.delete('/users/:id', auth('ADMIN'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
