/* const mongoose = require("mongoose");

const UserActivitySchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    activityType: { 
      type: String, 
      enum: ["login", "password_change", "logout", "profile_update"], 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    ipAddress: String,
    deviceType: String,
    deviceName: String,
    browser: String,
    location: String,
    status: { 
      type: String, 
      enum: ["Success", "Failed"], 
      default: "Success" 
    },
    isCurrent: { 
      type: Boolean, 
      default: false 
    },
    method: String, 
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserActivity", UserActivitySchema); ) */