const router = require("express").Router();
const Inventory = require("../models/Inventory");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { qty } = req.body;

    if (qty === undefined || qty === null || Number.isNaN(Number(qty))) {
      return res.status(400).json({ success: false, message: "Invalid qty" });
    }

    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      { qty: Number(qty) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, message: "Stock updated successfully", item: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;