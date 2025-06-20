const mongoose = require('mongoose');

const driverDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,             // one doc per driver
  },
  docType: {
    type: String,
    enum: ['license'],
    default: 'license',
  },
  filePath: {                 // stored on server
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DriverDocument', driverDocumentSchema);
