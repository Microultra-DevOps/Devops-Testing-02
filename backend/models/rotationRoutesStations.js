const mongoose = require("mongoose");

const RotationalStationSchema = new mongoose.Schema(
  {
    stationName: { type: String, required: true },
    stationType: { type: String, enum: ["rotational", "regular"], default: "rotational" }, // Default to rotational
    maxCapacity: { type: Number, required: true }, // Maximum number of students
    duration: { type: Number, required: true }, // Duration in weeks
    currentCapacity: { type: Number, default: 0 }, // Tracks the current number of assigned students
  },
  { timestamps: true }
);

module.exports = mongoose.model("RotationalStation", RotationalStationSchema);