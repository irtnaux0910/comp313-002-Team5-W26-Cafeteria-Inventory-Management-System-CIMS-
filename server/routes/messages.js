const router = require("express").Router();
const Message = require("../models/Message");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/contacts", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("role");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let contacts = [];

    if (currentUser.role === "admin") {
      contacts = await User.find(
        { role: "user", _id: { $ne: req.user.id } },
        "name email role"
      ).sort({ name: 1 });
    } else {
      contacts = await User.find(
        { role: "admin", _id: { $ne: req.user.id } },
        "name email role"
      ).sort({ name: 1 });
    }

    res.json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("GET CONTACTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load contacts",
    });
  }
});

router.get("/:otherUserId", authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user.id },
      ],
    })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("GET CONVERSATION ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load messages",
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required",
      });
    }

    if (!text || !String(text).trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const receiver = await User.findById(receiverId).select("role");

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const sender = await User.findById(req.user.id).select("role");

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    const validPair =
      (sender.role === "admin" && receiver.role === "user") ||
      (sender.role === "user" && receiver.role === "admin");

    if (!validPair) {
      return res.status(403).json({
        success: false,
        message: "Messages are only allowed between admin and user",
      });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      text: String(text).trim(),
    });

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

module.exports = router;