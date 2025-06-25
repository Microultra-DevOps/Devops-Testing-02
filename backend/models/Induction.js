const mongoose = require("mongoose");

const inductionSchema = new mongoose.Schema(
  {
    induction: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    location: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Induction", inductionSchema);
