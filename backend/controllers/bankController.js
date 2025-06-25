const BankDetails = require("../models/BankDetails");

// Add Bank Details
const addBankDetails = async (req, res) => {
  try {
    const { nic, internId, accountHolderName, bankName, branch, accountNumber } = req.body;

    // Check if NIC or Account Number already exists
    const existingBankDetails = await BankDetails.findOne({ $or: [{ nic }, { accountNumber }] });
    if (existingBankDetails) {
      return res.status(400).json({ message: "NIC or Account Number already exists" });
    }

    const newBankDetails = new BankDetails({ nic, internId, accountHolderName, bankName, branch, accountNumber });
    await newBankDetails.save();

    res.status(201).json({ message: "Bank details added successfully", data: newBankDetails });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get All Bank Details
const getAllBankDetails = async (req, res) => {
  try {
    const bankDetailsList = await BankDetails.find();
    res.status(200).json(bankDetailsList);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Bank Details by NIC
const getBankDetailsByNIC = async (req, res) => {
  try {
    const bankDetails = await BankDetails.findOne({ nic: req.params.nic });
    if (!bankDetails) {
      return res.status(404).json({ message: "Bank details not found" });
    }
    res.status(200).json(bankDetails);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getBankDetailsById = async (req, res) => {
  try {
    const bankDetails = await BankDetails.findById(req.params.id);
    if (!bankDetails) {
      return res.status(404).json({ message: "Bank details not found" });
    }
    res.status(200).json(bankDetails);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateBankDetailsById = async (req, res) => {
  try {
    const updatedBankDetails = await BankDetails.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBankDetails) {
      return res.status(404).json({ message: "Bank details not found" });
    }
    res.status(200).json({ 
      message: "Bank details updated successfully", 
      data: updatedBankDetails 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Bank Details
const updateBankDetails = async (req, res) => {
  try {
    const updatedBankDetails = await BankDetails.findOneAndUpdate({ nic: req.params.nic }, req.body, { new: true });
    if (!updatedBankDetails) {
      return res.status(404).json({ message: "Bank details not found" });
    }
    res.status(200).json({ message: "Bank details updated successfully", data: updatedBankDetails });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete Bank Details
const deleteBankDetails = async (req, res) => {
  try {
    const deletedBankDetails = await BankDetails.findOneAndDelete({ nic: req.params.nic });
    if (!deletedBankDetails) {
      return res.status(404).json({ message: "Bank details not found" });
    }
    res.status(200).json({ message: "Bank details deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete Bank Details by ID
const deleteBankDetailsById = async (req, res) => {
  try {
    const deletedBankDetails = await BankDetails.findByIdAndDelete(req.params.id);
    if (!deletedBankDetails) {
      return res.status(404).json({ message: "Bank details not found" });
    }
    res.status(200).json({ message: "Bank details deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  addBankDetails,
  getAllBankDetails,
  getBankDetailsByNIC,
  updateBankDetails,
  deleteBankDetails,
  getBankDetailsById,
  updateBankDetailsById,
  deleteBankDetailsById
};
