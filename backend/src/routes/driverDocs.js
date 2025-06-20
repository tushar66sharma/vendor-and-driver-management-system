const express = require('express');
const router  = express.Router();
const authMw  = require('../middleware/auth');
const upload  = require('../config/upload');
const DriverDocument = require('../models/DriverDocument');
const fs = require('fs');
const path = require('path');
const User           = require('../models/User');

// GET current driver document
router.get('/', authMw, async (req, res) => {
  const doc = await DriverDocument.findOne({ userId: req.user.userId });
  if (!doc) return res.status(404).json({ message: 'No document found' });
  res.json(doc);
});

// POST/PUT upload or replace license
router.post(
  '/',
  authMw,
  upload.single('license'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Remove old file if exists
    const existing = await DriverDocument.findOne({ userId: req.user.userId });
    if (existing) {
      const oldPath = path.join(__dirname, '../../uploads', path.basename(existing.filePath));
      fs.unlink(oldPath, () => {});
      await existing.deleteOne();
    }

    // Save new record
    const newDoc = await DriverDocument.create({
      userId:    req.user.userId,
      docType:  'license',
      filePath: `/uploads/${req.file.filename}`, // serve static
    });

    res.status(201).json(newDoc);
  }
);


router.get('/region', authMw, async (req, res) => {
  try {
    // Only regional_vendor may use this
    if (req.user.role !== 'regional_vendor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // 1) Fetch all drivers in my region
    const drivers = await User.find({
      role:   'driver',
      region: req.user.region,
    })
    .select('firstName lastName email')
    .lean();

    // 2) Fetch all license docs for these drivers
    const userIds = drivers.map(d => d._id);
    const docs = await DriverDocument.find({
      userId: { $in: userIds },
    })
    .select('userId filePath uploadedAt')
    .lean();

    // 3) Build a map: userId → doc
    const docMap = {};
    docs.forEach(d => {
      docMap[d.userId.toString()] = {
        filePath:   d.filePath,
        uploadedAt: d.uploadedAt,
      };
    });

    // 4) Merge drivers + doc info
    const output = drivers.map(d => ({
      userId:     d._id,
      firstName:  d.firstName,
      lastName:   d.lastName,
      email:      d.email,
      filePath:   docMap[d._id.toString()]?.filePath  || null,
      uploadedAt: docMap[d._id.toString()]?.uploadedAt || null,
    }));

    res.json(output);
  } catch (err) {
    console.error('Error fetching regional docs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
