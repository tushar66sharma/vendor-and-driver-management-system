// backend/src/routes/region.js
const express   = require('express');
const router    = express.Router();
const authMw    = require('../middleware/auth');
const User      = require('../models/User');
const Vehicle   = require('../models/Vehicle');

/**
 * GET /api/region/dashboard
 */
router.get('/dashboard', authMw, async (req, res) => {
  if (req.user.role !== 'regional_vendor') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  const region = req.user.region;

  try {
    // 1) Total drivers
    const totalDrivers = await User.countDocuments({
      role: 'driver',
      region,
    });

    // 2) Total vehicles
    const totalVehicles = await Vehicle.countDocuments({ region });

    // 3) Drivers assigned: distinct driverId from vehicles in this region
    const assignedDriverIds = await Vehicle.distinct('driverId', {
      region,
      driverId: { $ne: null },
    });
    const driversAssigned = assignedDriverIds.length;

    // 4) Vehicles assigned
    const vehiclesAssigned = await Vehicle.countDocuments({
      region,
      assigned: true,
    });

    // 5) Fresh fetch of this vendor’s permissions
    const vendor = await User.findById(req.user.userId).select('customPermissions');
    const permissions = vendor?.customPermissions || [];

    return res.json({
      totalDrivers,
      totalVehicles,
      driversAssigned,
      vehiclesAssigned,
      permissions,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
