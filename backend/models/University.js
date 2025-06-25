const mongoose = require("mongoose");

const UniversitySchema = new mongoose.Schema(
  {
    username: String,
    email:   String,
    fullName: String,
    nameWithInitials: String,
    password: String,
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
    approveRequest: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("University", UniversitySchema);
