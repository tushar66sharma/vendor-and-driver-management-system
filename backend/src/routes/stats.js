// backend/src/routes/stats.js
const express = require("express");
const router  = express.Router();
const User        = require("../models/User");
const Permission  = require("../models/Permission");
const RolePerm    = require("../models/RolePermission");

router.get("/super", async (req, res) => {
  try {
    // count drivers + regionals as before
    const drivers   = await User.countDocuments({ role: "driver" });
    const regionals = await User.countDocuments({ role: "regional_vendor" });

    // count permission types
    const totalPerms = await Permission.countDocuments();

    // **NEW**: dynamically fetch all distinct roles in the User collection
    const distinctRoles = await User.distinct("role");
    const totalRoles    = distinctRoles.length;

    res.json({
      total_users:       drivers + regionals,
      total_roles:       totalRoles,
      total_permissions: totalPerms,
      roles_breakdown: { // optional: send the list of roles too
        roles: distinctRoles,
      },
    });
  } catch (err) {
    console.error("Error in /api/stats/super:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
