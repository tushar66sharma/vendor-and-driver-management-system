const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMw  = require('../middleware/auth');

// GET /api/users: list all users with permissions
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('firstName lastName email role customPermissions');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// PATCH /api/users/:id/permissions: update a user's permissions
router.patch('/:id/permissions', async (req, res) => {
  try {
    const { customPermissions } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { customPermissions },
      { new: true, select: 'firstName lastName email role customPermissions' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update permissions' });
  }
});


router.patch('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    // prevent demoting a super_vendor
    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'User not found' });
    if (existing.role === 'super_vendor')
      return res.status(403).json({ message: 'Cannot change super_vendor' });

    // validate incoming role
    if (!['regional_vendor','city_vendor','local_vendor','driver'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: 'firstName lastName email role customPermissions' }
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update role' });
  }
});

router.get('/drivers/region', authMw, async (req, res) => {
  try {
    if (req.user.role !== 'regional_vendor') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    const drivers = await User.find({
      role: 'driver',
      region: req.user.region,
    }).select('_id firstName lastName email');
    res.json(drivers);
  } catch (err) {
    console.error('Fetch drivers error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;