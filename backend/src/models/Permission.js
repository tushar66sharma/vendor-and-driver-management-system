// backend/src/models/Permission.js
const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  permissionName: { type: String, required: true, unique: true },
  description:    { type: String, default: "" },
  module:         { type: String, default: "" },
  createdAt:      { type: Date,   default: Date.now },
});

module.exports = mongoose.model("Permission", permissionSchema);
