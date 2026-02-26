const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Email validator
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());


// =====================
// REGISTER
// =====================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔍 BASIC VALIDATION
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8 || !/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8+ chars and include 1 number",
      });
    }

    // 🔍 CHECK IF USER EXISTS
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // 🔐 HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
    });

    await newUser.save();

    res.json({ success: true, message: "Staff account created!" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// =====================
// LOGIN
// =====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 BASIC VALIDATION
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // 🔐 COMPARE PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // 🔑 CREATE TOKEN
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;