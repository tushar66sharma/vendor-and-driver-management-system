const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "super_vendor",
        "regional_vendor",
        "city_vendor",
        "local_vendor",
        "driver",
      ],
      default: "driver",
    },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    customPermissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("User", userSchema);
