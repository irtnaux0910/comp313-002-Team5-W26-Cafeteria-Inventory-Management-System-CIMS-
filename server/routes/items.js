const router = require("express").Router();
const Item = require("../models/Item");
const auth = require("../middleware/authMiddleware");

// helper: expiry must be future if provided
const isFutureDate = (dateString) => {
  if (!dateString) return true;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  d.setHours(0, 0, 0, 0);
  return d > today;
};

// CREATE item
router.post("/", auth, async (req, res) => {
  try {
    const { name, category, quantity, expiryDate, supplier, reorderLevel } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Item name is required" });
    }

    if (expiryDate && !isFutureDate(expiryDate)) {
      return res
        .status(400)
        .json({ success: false, message: "Expiry date must be a future date" });
    }

    const qty = Number(quantity ?? 0);
    const reorder = Number(reorderLevel ?? 5);

    if (Number.isNaN(qty) || qty < 0) {
      return res.status(400).json({ success: false, message: "Quantity must be 0 or more" });
    }

    if (Number.isNaN(reorder) || reorder < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Reorder level must be 0 or more" });
    }

    const item = await Item.create({
      name: String(name).trim(),
      category: category ? String(category).trim() : "General",
      quantity: qty,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      supplier: supplier ? String(supplier).trim() : "",
      reorderLevel: reorder,
      createdBy: req.user.id,
    });

    res.json({ success: true, item, message: "Item added" });
  } catch (e) {
    console.error("CREATE ITEM ERROR:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// READ all items
router.get("/", auth, async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (e) {
    console.error("GET ITEMS ERROR:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE item
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, category, quantity, expiryDate, supplier, reorderLevel } = req.body;

    // optional validation if fields provided
    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Item name cannot be empty" });
    }

    if (expiryDate !== undefined && expiryDate !== "" && !isFutureDate(expiryDate)) {
      return res
        .status(400)
        .json({ success: false, message: "Expiry date must be a future date" });
    }

    const updateDoc = {};

    if (name !== undefined) updateDoc.name = String(name).trim();
    if (category !== undefined) updateDoc.category = String(category).trim();
    if (supplier !== undefined) updateDoc.supplier = String(supplier).trim();

    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (Number.isNaN(qty) || qty < 0) {
        return res.status(400).json({ success: false, message: "Quantity must be 0 or more" });
      }
      updateDoc.quantity = qty;
    }

    if (reorderLevel !== undefined) {
      const reorder = Number(reorderLevel);
      if (Number.isNaN(reorder) || reorder < 0) {
        return res
          .status(400)
          .json({ success: false, message: "Reorder level must be 0 or more" });
      }
      updateDoc.reorderLevel = reorder;
    }

    if (expiryDate !== undefined) {
      // allow clearing expiry date by sending ""
      updateDoc.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    }

    const updated = await Item.findByIdAndUpdate(req.params.id, updateDoc, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, item: updated, message: "Item updated" });
  } catch (e) {
    console.error("UPDATE ITEM ERROR:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE item
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, message: "Item deleted" });
  } catch (e) {
    console.error("DELETE ITEM ERROR:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;