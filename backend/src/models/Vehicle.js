const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true },
  model:              { type: String, required: true },
  seatingCapacity:    { type: Number, required: true },
  fuelType:           { type: String, enum: ['petrol','diesel','electric','hybrid'], required: true },
  region:             { type: String, required: true },
  rcFile:             { type: String, required: true }, // e.g. '/uploads/rc-...'
  permitFile:         { type: String, required: true },
  pollutionFile:      { type: String, required: true },
  assigned:          { type: Boolean, default: false },
  driverId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
