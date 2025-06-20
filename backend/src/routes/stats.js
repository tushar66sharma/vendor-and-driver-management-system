// backend/src/routes/stats.js
const express = require("express");
const router  = express.Router();
const User    = require("../models/User");

router.get("/super", async (req, res) => {
  try {
    const totalUsers   = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: "driver" });

    res.json({
      total_users:   totalUsers,
      total_drivers: totalDrivers,
    });
  } catch (err) {
    console.error("Error in /api/stats/super:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
