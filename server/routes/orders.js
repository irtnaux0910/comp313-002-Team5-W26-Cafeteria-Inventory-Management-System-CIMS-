const router = require("express").Router();
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const Order = require("../models/Order");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items provided",
      });
    }

    const cleanItems = items.map((item) => ({
      itemId: item.itemId || undefined,
      name: item.name || "",
      category: item.category || "",
      quantity: Number(item.quantity || 0),
      expiryDate: item.expiryDate || null,
      supplier: item.supplier || "",
      reorderLevel: Number(item.reorderLevel || 0),
    }));

    const order = await Order.create({
      userId: req.user.id,
      items: cleanItems,
      status: "pending",
      visibleToUser: true,
    });

    res.json({
      success: true,
      order,
      message: "Order submitted successfully",
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Order save failed",
    });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id,
      visibleToUser: { $ne: false },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load your orders",
    });
  }
});

router.patch("/:id/clear", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "pending") {
      return res.status(400).json({
        success: false,
        message: "Pending orders cannot be cleared yet",
      });
    }

    order.visibleToUser = false;
    await order.save();

    res.json({
      success: true,
      message: "Notification cleared successfully",
    });
  } catch (error) {
    console.error("CLEAR ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear notification",
    });
  }
});

router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email role status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load orders",
    });
  }
});

router.patch("/:id/status", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email role status");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
});

router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order cleared successfully",
    });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear order",
    });
  }
});

module.exports = router;