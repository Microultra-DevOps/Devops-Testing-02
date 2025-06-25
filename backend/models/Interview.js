const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    interviewName: {
      type: String,
      required: [true, "Interview name is required"],
      trim: true,
    },
    interviewDate: {
      type: String,
      required: true,
    },
    interviewTime: {
      type: String,
      required: [true, "Interview time is required"],
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Invalid time format. Please use HH:MM in 24-hour format.",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);
