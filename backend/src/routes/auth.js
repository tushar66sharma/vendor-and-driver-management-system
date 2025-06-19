const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMw = require("../middleware/auth");
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
router.post("/register", async (req, res) => {
  console.log("🔹 Register payload:", req.body);
  const { email, password, firstName, lastName, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    user = new User({
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      customPermissions: [], // initialize empty
    });
    await user.save();

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate and get token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// @route   GET /api/auth/me
// @desc    Get logged‑in user
router.get("/me", authMw, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-passwordHash");
  res.json(user);
});

router.patch('/me', authMw, async (req, res) => {
  const { region } = req.body;
  if (!['northern','southern','central','eastern','western'].includes(region)) {
    return res.status(400).json({ message: 'Invalid region' });
  }
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { region },
    { new: true, select: '-passwordHash' }
  );
  res.json(user);
});

module.exports = router;
