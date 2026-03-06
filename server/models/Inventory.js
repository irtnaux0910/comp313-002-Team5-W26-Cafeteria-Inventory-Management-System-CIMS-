const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: "Uncategorized" },
    qty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", InventorySchema);