// backend/src/routes/admin.js

const express        = require("express");
const router         = express.Router();
const authMw         = require("../middleware/auth");
const User           = require("../models/User");
const DriverDocument = require("../models/DriverDocument");
const Vehicle        = require("../models/Vehicle");

/**
 * GET /api/admin/driver-overview
 * (unchanged)
 */
router.get(
  "/driver-overview",
  authMw,
  async (req, res) => {
    if (req.user.role !== "super_vendor")
      return res.status(403).json({ msg: "Access denied" });

    // 1) All drivers
    const drivers = await User.find({ role: "driver" })
      .select("firstName lastName email region")
      .lean();

    // 2) Their licenses
    const docs = await DriverDocument.find({
      userId: { $in: drivers.map(d => d._id) },
    })
      .select("userId filePath vehicleId")
      .lean();
    const docMap = docs.reduce((m, d) => {
      m[d.userId.toString()] = d;
      return m;
    }, {});

    // 3) Vehicles assigned
    const assigned = await Vehicle.find({
      driverId: { $in: drivers.map(d => d._id) },
    })
      .select("registrationNumber model driverId")
      .lean();
    const assignedMap = assigned.reduce((m, v) => {
      const key = v.driverId.toString();
      if (!m[key]) m[key] = [];
      m[key].push({ _id: v._id, registrationNumber: v.registrationNumber, model: v.model });
      return m;
    }, {});

    // 4) Available (unassigned) vehicles by region
    const avail = await Vehicle.find({ assigned: false })
      .select("registrationNumber model region")
      .lean();
    const availMap = avail.reduce((m, v) => {
      const rk = (v.region || "").toLowerCase();
      if (!m[rk]) m[rk] = [];
      m[rk].push({ _id: v._id, registrationNumber: v.registrationNumber, model: v.model });
      return m;
    }, {});

    // 5) Merge
    const out = drivers.map(d => {
      const k  = d._id.toString();
      const rk = (d.region || "").toLowerCase();
      const dd = docMap[k] || {};
      return {
        userId:            d._id,
        firstName:         d.firstName,
        lastName:          d.lastName,
        email:             d.email,
        region:            d.region,
        license:           dd.filePath || null,
        vehicles:          assignedMap[k] || [],
        availableVehicles: availMap[rk]  || [],
      };
    });

    res.json(out);
  }
);


/**
 * POST /api/admin/vehicles/:id/assign
 * Assigns to driver & updates DriverDocument.vehicleId
 */
router.post(
  "/vehicles/:id/assign",
  authMw,
  async (req, res) => {
    if (req.user.role !== "super_vendor")
      return res.status(403).json({ msg: "Access denied" });

    const { driverId } = req.body;
    const veh = await Vehicle.findById(req.params.id);
    if (!veh) return res.status(404).json({ msg: "Vehicle not found" });

    // validate driver
    const driver = await User.findById(driverId).select("role region");
    if (!driver || driver.role !== "driver")
      return res.status(400).json({ msg: "Invalid driver" });
    if ((driver.region || "").toLowerCase() !== (veh.region || "").toLowerCase())
      return res.status(400).json({ msg: "Region mismatch" });

    // assign vehicle
    veh.driverId = driverId;
    veh.assigned = true;
    await veh.save();

    // update the driver's document record
    const doc = await DriverDocument.findOne({ userId: driverId });
    if (doc) {
      doc.vehicleId = veh._id;
      await doc.save();
    }

    res.json({ msg: "Assigned", vehicle: veh });
  }
);


/**
 * PATCH /api/admin/vehicles/:id/unassign
 * Clears driverId & updates DriverDocument.vehicleId = null
 */
router.patch(
  "/vehicles/:id/unassign",
  authMw,
  async (req, res) => {
    if (req.user.role !== "super_vendor")
      return res.status(403).json({ msg: "Access denied" });

    const veh = await Vehicle.findById(req.params.id);
    if (!veh) return res.status(404).json({ msg: "Vehicle not found" });

    const oldDriverId = veh.driverId;

    veh.driverId = null;
    veh.assigned = false;
    await veh.save();

    // clear from driver document
    if (oldDriverId) {
      const doc = await DriverDocument.findOne({ userId: oldDriverId });
      if (doc) {
        doc.vehicleId = null;
        await doc.save();
      }
    }

    res.json({ msg: "Unassigned" });
  }
);

module.exports = router;
