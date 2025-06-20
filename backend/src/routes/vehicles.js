// backend/src/routes/vehicles.js
const express  = require('express');
const router   = express.Router();
const authMw   = require('../middleware/auth');
const upload   = require('../config/upload');
const Vehicle  = require('../models/Vehicle');

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
        fuelType,
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

/* ----------  LIST VEHICLES (region or createdBy)  ---------- */
router.get('/', authMw, async (req, res) => {
  const query = req.user.region
    ? { $or: [{ region: req.user.region }, { createdBy: req.user.userId }] }
    : {        createdBy: req.user.userId };

  const list = await Vehicle.find(query).select('-__v').sort('-createdAt');
  res.json(list);
});

module.exports = router;
