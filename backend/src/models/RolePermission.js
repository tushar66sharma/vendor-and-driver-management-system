// backend/src/models/RolePermission.js
const mongoose = require("mongoose");

const rolePermSchema = new mongoose.Schema({
  role:           { type: String, required: true },       // e.g. “super_vendor”
  permissionName: { type: String, required: true },       // must match Permission.permissionName
  isGranted:      { type: Boolean, default: true },
  grantedAt:      { type: Date,    default: Date.now },
});

rolePermSchema.index({ role: 1, permissionName: 1 }, { unique: true });

module.exports = mongoose.model("RolePermission", rolePermSchema);
