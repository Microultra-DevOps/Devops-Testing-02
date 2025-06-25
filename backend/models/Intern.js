const mongoose = require("mongoose");

const InternSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  nameWithInitials: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  postalAddress: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  nic: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  landPhone: {
    type: String,
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
  },
  institute: {
    type: String,
    required: true,
  },
  selectedRole: {
    type: String,
    required: true,
  },
  cvStatus: {
    type: String,
    required: true,
  },
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scheme",
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manager",
  },
  internshipPeriod: {
    type: Number,
    default: 6,
  },
  schemeStartDate: {
    type: Date,
  },
  forRequest: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
  schemeApproved: {
    type: Boolean,
  },
  schemeStatus: {
    type: String,
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Intern", InternSchema);