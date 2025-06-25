const mongoose = require("mongoose");

const placementReportSchema = new mongoose.Schema(
  {
    internId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    nic: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    supervisorName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Ongoing", "Completed"],
      required: true,
    },
    reportCategory: {
      type: String,
      enum: ["Daily Report", "Weekly Report", "Monthly Report", "Final Report"],
      required: true,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlacementReport", placementReportSchema);
