const router = require("express").Router();
const User = require("../models/User");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET MY PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load profile",
    });
  }
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const trimmedEmail = String(email).trim();
    const trimmedName = String(name).trim();

    const existingUser = await User.findOne({
      email: trimmedEmail,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: trimmedName,
        email: trimmedEmail,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE MY PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
});

router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ name: 1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
});

router.patch("/:id/block", authMiddleware, adminOnly, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot block your own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "blocked" },
      { new: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User has been blocked",
      user,
    });
  } catch (error) {
    console.error("BLOCK USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to block user",
    });
  }
});

router.patch("/:id/unblock", authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User has been unblocked",
      user,
    });
  } catch (error) {
    console.error("UNBLOCK USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unblock user",
    });
  }
});

router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
});

module.exports = router;