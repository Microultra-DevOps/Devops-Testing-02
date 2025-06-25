const mongoose = require("mongoose");

const StationSchema = new mongoose.Schema({
  stationName: { type: String, required: true },
  displayName: { type: String, required: true },
  priority: { type: Number, required: true, enum: [1, 2, 3, 4, 5] },
  maxStudents: { type: Number, required: true },
  activeStatus: { type: Boolean, default: true },
  timePeriod: { type: Number, required: true },
  currentStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "CV" }],
});

module.exports = mongoose.model("Station", StationSchema);
