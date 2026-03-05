const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// Email validator
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

// GET profile of logged-in user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (e) {
    console.error("GET /users/me ERROR:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE profile (name + email)
router.put("/me", auth, async (req, res) => {
  try {
    let { name, email } = req.body;

    name = String(name || "").trim();
    email = String(email || "").trim();

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    // prevent using an email that belongs to someone else
    const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).select("-password");

    return res.json({
      success: true,
      user: updated,
      message: "Profile updated",
    });
  } catch (e) {
    console.error("PUT /users/me ERROR:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;