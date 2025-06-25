const mongoose = require("mongoose");

const certificateRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    internId: { type: String, required: true, unique: true }, 
    nic: { type: String, required: true },
    contactNumber: { type: String, required: true },
    sectionUnit: { type: String, required: true },
    trainingCategory: { type: String, required: true },
    periodFrom: { type: String, required: true },
    periodTo: { type: String, required: true },
    workAttended: {
      A: { type: String, required: true },
      B: { type: String, required: true },
      C: { type: String, required: true },
      D: { type: String, required: true },
    },
    traineeSignature: { type: String, required: true },
    certificateRequestStatus: {
      type: String,
      enum: ["pending", "approved", "declined", "completed"],
      default: "pending",
    },
    staffName: { type: String },
    staffUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);


const CertificateRequest = mongoose.model("CertificateRequest", certificateRequestSchema);

module.exports = CertificateRequest;
