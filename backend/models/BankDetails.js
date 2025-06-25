const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema(
  {
    nic: { type: String, required: true, unique: true },
    internId: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    branch: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const BankDetails = mongoose.model("BankDetails", bankDetailsSchema);
module.exports = BankDetails;
