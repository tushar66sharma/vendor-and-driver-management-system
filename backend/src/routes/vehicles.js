// backend/src/routes/vehicles.js
const express  = require('express');
const router   = express.Router();
const authMw   = require('../middleware/auth');
const upload   = require('../config/upload');
const Vehicle  = require('../models/Vehicle');
const DriverDoc = require('../models/DriverDocument');

/* ----------  ADD VEHICLE  ---------- */
router.post(
  '/',
  authMw,
  upload.fields([
    { name: 'rcFile',        maxCount: 1 },
    { name: 'permitFile',    maxCount: 1 },
    { name: 'pollutionFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        registrationNumber,
        model,
        seatingCapacity,
        fuelType,
        region,                 // ← comes from the form
      } = req.body;

      if (!region) return res.status(400).json({ msg: 'Region is required' });
      if (!req.files.rcFile || !req.files.permitFile || !req.files.pollutionFile) {
        return res.status(400).json({ msg: 'All 3 documents required' });
      }

      const veh = await Vehicle.create({
        registrationNumber,
        model,
        seatingCapacity: Number(seatingCapacity),
        fuelType:fuelType.toLowerCase(),
        region,
        rcFile:        `/uploads/${req.files.rcFile[0].filename}`,
        permitFile:    `/uploads/${req.files.permitFile[0].filename}`,
        pollutionFile: `/uploads/${req.files.pollutionFile[0].filename}`,
        createdBy:     req.user.userId,
      });

      res.status(201).json(veh);
    } catch (err) {
      console.error('Vehicle creation error:', err);
      res.status(400).json({ msg: err.message });
    }
  }
);

/* ----------  LIST VEHICLES FOR REGIONAL/DRIVER ---------- */
router.get('/', authMw, async (req, res) => {
  const query = { region: req.user.region };
  const list = await Vehicle.find(query).select('-__v').sort('-createdAt');
  res.json(list);
});
/* ----------  LIST ALL VEHICLES FOR SUPER VENDOR ---------- */
router.get('/all', authMw, async (req, res) => {
  if (req.user.role !== 'super_vendor') {
    return res.status(403).json({ msg: 'Access denied' });
  }
  const list = await Vehicle.find({}).select('-__v').sort('-createdAt');
  res.json(list);
});
/* ----------  ASSIGN DRIVER ---------- */
router.patch('/:vehicleId/assign-driver', authMw, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { driverId }  = req.body;
    if (!driverId) 
      return res.status(400).json({ msg: 'Driver ID is required' });

    // 1) Verify driver has a document entry
    const doc = await DriverDoc.findOne({ userId: driverId });
    if (!doc) {
      return res
        .status(400)
        .json({ msg: 'Cannot assign: driver has no uploaded document' });
    }

    // 2) Update vehicle
    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { $set: { assigned: true, driverId } },
      { new: true }
    );
    if (!vehicle) 
      return res.status(404).json({ msg: 'Vehicle not found' });

    // 3) Update driver’s document record
    doc.vehicleId = vehicle._id;
    await doc.save();

    res.json(vehicle);
  } catch (err) {
    console.error('Assign driver error:', err);
    res.status(500).json({ msg: 'Server error' });
  }

});

/* ----------  UNASSIGN DRIVER ---------- */
router.patch('/:vehicleId/unassign-driver', authMw, async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Find vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });

    const oldDriverId = vehicle.driverId;
    if (!oldDriverId) {
      return res.status(400).json({ msg: 'No driver currently assigned' });
    }

    // Clear vehicle record
    vehicle.driverId = null;
    vehicle.assigned = false;
    await vehicle.save();

    // Clear driver document.vehicleId
    await DriverDoc.updateOne(
      { userId: oldDriverId },
      { $unset: { vehicleId: '' } }
    );

    res.json(vehicle);
  } catch (err) {
    console.error('Unassign driver error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ----------  DELETE VEHICLE ---------- */
router.delete('/:vehicleId', authMw, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });
    if (vehicle.assigned) {
      return res
        .status(400)
        .json({ msg: 'Cannot delete: vehicle is assigned to a driver' });
    }
    await Vehicle.deleteOne({ _id: vehicleId });
    // Also clear any driverDoc.vehicleId just in case (should not exist)
    await DriverDoc.updateMany(
      { vehicleId },
      { $unset: { vehicleId: '' } }
    );
    res.json({ msg: 'Vehicle deleted' });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ----------  DRIVER OWN ASSIGNED ---------- */
router.get(
  '/my-assigned',
  authMw,
  async (req, res) => {
    try {
      // Only drivers should hit this
      if (req.user.role !== 'driver') {
        return res.status(403).json({ msg: 'Access denied' });
      }
      // Find vehicles where driverId matches me
      const list = await Vehicle.find({ driverId: req.user.userId })
        .select('-__v')
        .sort('-createdAt');
      res.json(list);
    } catch (err) {
      console.error('Fetch my-assigned error', err);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);



module.exports = router;

