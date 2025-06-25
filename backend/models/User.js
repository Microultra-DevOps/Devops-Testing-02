const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    nameWithInitials: String,
    password: { type: String, required: true },
    userType: { 
      type: String, 
      enum: ["individual", "institute", "admin", "staff"], 
      required: true 
    },
    postalAddress: String,
    contactNumber: String,
    nic: String,
    district: String,
    preferredLanguage: String,
    instituteContactNumber: String,
    instituteContactEmail: String,
    instituteName: String,
    profileImage: String,  
    department: String,
    instituteType: String,
    approveRequest: { type: Boolean, default: false },
    currentStatus: { type: String, default: "pending" },
    resetPasswordOTP: String,
    resetPasswordOTPExpiry: Date,
    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,
    isEmailVerified: { type: Boolean, default: false },
    googleId: String,
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    accountLockedUntil: {
      type: Date,
      default: null,
      select: false
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);