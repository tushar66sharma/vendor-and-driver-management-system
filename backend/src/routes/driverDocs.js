const express = require('express');
const router  = express.Router();
const authMw  = require('../middleware/auth');
const upload  = require('../config/upload');
const DriverDocument = require('../models/DriverDocument');
const fs = require('fs');
const path = require('path');

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

module.exports = router;
