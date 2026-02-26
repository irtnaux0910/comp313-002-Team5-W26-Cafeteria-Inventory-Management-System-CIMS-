const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },
    quantity: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date },
    supplier: { type: String, default: "", trim: true },
    reorderLevel: { type: Number, default: 5, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);