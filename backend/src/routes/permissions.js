// backend/src/routes/permissions.js
const express = require("express");
const router  = express.Router();
const Permission     = require("../models/Permission");
const RolePermission = require("../models/RolePermission");
const User       = require("../models/User");  

// list all permissions
router.get("/", async (req, res) => {
  const items = await Permission.find().sort("permissionName");
  res.json(items);
});

// create
router.post("/", async (req, res) => {
  const { permissionName, description, module } = req.body;
  try {
    const p = new Permission({ permissionName, description, module });
    await p.save();
    res.status(201).json(p);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

// delete
router.delete("/:name", async (req, res) => {
  const name = req.params.name;

  // 1) Prevent deletion if any user has this permission
  const inUse = await User.exists({ customPermissions: name });
  if (inUse) {
    return res
      .status(400)
      .json({ msg: "Cannot delete: permission in use by one or more users" });
  }

  // 2) Safe to delete permission and related role-permissions
  await Permission.deleteOne({ permissionName: name });
  await RolePermission.deleteMany({ permissionName: name });
  res.json({ msg: "deleted" });
});

// get + grant/revoke per role
router.get("/role/:role", async (req, res) => {
  const all = await Permission.find().lean();
  const granted = await RolePermission.find({ role: req.params.role, isGranted: true });
  const set = new Set(granted.map(r => r.permissionName));
  res.json(all.map(p => ({ ...p, isGranted: set.has(p.permissionName) })));
});
router.post("/role/:role", async (req, res) => {
  const { permissionName, isGranted } = req.body;
  await RolePermission.updateOne(
    { role: req.params.role, permissionName },
    { $set: { isGranted, grantedAt: new Date() } },
    { upsert: true }
  );
  res.json({ role: req.params.role, permissionName, isGranted });
});

module.exports = router;
