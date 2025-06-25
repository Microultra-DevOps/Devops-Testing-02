const CertificateRequest = require("../models/certificateRequest");
const moment = require("moment");

// Function to create certificate request
const createCertificateRequest = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Trainee signature is required." });
    }

    const {
      name,
      internId,
      nic,
      contactNumber,
      sectionUnit,
      trainingCategory,
      periodFrom,
      periodTo,
      workAttended,
      // Add staff fields from form
      staffName,
      staffUserId,
    } = req.body;

    if (!name || !internId || !nic || !contactNumber || !sectionUnit || !trainingCategory || !periodFrom || !periodTo || !workAttended) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const fromDate = new Date(periodFrom);
    const toDate = new Date(periodTo);
    const currentDate = new Date();

    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ message: "Invalid date format provided." });
    }

    if ((toDate - currentDate) > 7 * 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: "The periodTo value cannot be more than 7 days from the current date." });
    }

    let workData;
    try {
      workData = typeof workAttended === "string" ? JSON.parse(workAttended) : workAttended;
    } catch (error) {
      return res.status(400).json({ message: "Invalid workAttended format." });
    }

    if (!workData.A || !workData.B || !workData.C || !workData.D) {
      return res.status(400).json({ message: "Work attended details are incomplete." });
    }

    const existingRequest = await CertificateRequest.findOne({ internId });
    if (existingRequest) {
      return res.status(400).json({ message: "A certificate request has already been made for this intern ID." });
    }

    // FIX: Use req.user.id instead of req.userId
    const userId = req.user.id;
    const traineeSignature = req.file.path;

    // Create new certificate request with staff information
    const newRequest = new CertificateRequest({
      userId,
      name,
      internId,
      nic,
      contactNumber,
      sectionUnit,
      trainingCategory,
      // Format dates consistently as ISO strings
      periodFrom: fromDate.toISOString(),
      periodTo: toDate.toISOString(),
      workAttended: workData,
      traineeSignature,
      certificateRequestStatus: "pending",
      // Add staff information
      staffName: staffName || null,
      staffUserId: staffUserId || null
    });

    await newRequest.save();

    res.status(201).json({ message: "Certificate Request Created Successfully", data: newRequest });
  } catch (err) {
    console.error("Error creating certificate request:", err);
    res.status(500).json({ message: "Error creating certificate request", error: err.message });
  }
};

const getUserCertificates = async (req, res) => {
  try {
    // FIX: Use req.user.id instead of req.userId
    const userId = req.user.id;

    const certificates = await CertificateRequest.find({ userId });

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({ message: "No certificates found for this user." });
    }

    res.status(200).json({ message: "Certificates retrieved successfully", data: certificates });
  } catch (err) {
    console.error("Error fetching user certificates:", err);
    res.status(500).json({ message: "Error fetching certificates", error: err.message });
  }
};

const getAllCertificateRequests = async (req, res) => {
  try {
    const { status } = req.query; 
    
    // Add filter to support "completed" status
    const filter = status ? { certificateRequestStatus: status } : {};
    
    const certificates = await CertificateRequest.find(filter);
    
    // Modified to return empty array instead of error when no certificates found
    if (!certificates || certificates.length === 0) {
      return res.status(200).json({ message: "No certificate requests found.", data: [] });
    }
    
    res.status(200).json({ message: "Certificate requests retrieved successfully", data: certificates });
  } catch (err) {
    console.error("Error fetching certificate requests:", err);
    res.status(500).json({ message: "Error fetching certificate requests", error: err.message });
  }
};

const updateCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { status } = req.body; 
    
    // Update valid status values to include "completed"
    if (!status || !['approved', 'declined', 'pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided. Status must be 'approved', 'declined', 'pending', or 'completed'." });
    }
    
    // Add completion date when status is set to "completed"
    const updateData = { 
      certificateRequestStatus: status 
    };
    
    // Add completionDate field if status is "completed"
    if (status === 'completed') {
      updateData.completionDate = new Date().toISOString();
      updateData.completedBy = req.user.id; // Track who completed it
    }
    
    const certificate = await CertificateRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true } 
    );
    
    if (!certificate) {
      return res.status(404).json({ message: "Certificate request not found." });
    }
    
    res.status(200).json({ 
      message: `Certificate request ${status} successfully`, 
      data: certificate 
    });
  } catch (err) {
    console.error(`Error updating certificate status:`, err);
    res.status(500).json({ message: "Error updating certificate status", error: err.message });
  }
};

const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const certificate = await CertificateRequest.findById(id);
    
    if (!certificate) {
      return res.status(404).json({ message: "Certificate request not found." });
    }
    
    res.status(200).json({ message: "Certificate request retrieved successfully", data: certificate });
  } catch (err) {
    console.error("Error fetching certificate request:", err);
    res.status(500).json({ message: "Error fetching certificate request", error: err.message });
  }
};

const deleteCertificateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await CertificateRequest.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: "Certificate request not found." });
    }
    
    res.status(200).json({ 
      message: "Certificate request deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting certificate request:", err);
    res.status(500).json({ message: "Error deleting certificate request", error: err.message });
  }
};

const getStaffCertificates = async (req, res) => {
  try {
    // Get the ID of the logged-in staff member from the token
    const staffUserId = req.user.id;

    // Find certificate requests where this staff member is assigned
    const certificates = await CertificateRequest.find({ staffUserId });

    if (!certificates || certificates.length === 0) {
      return res.status(200).json({ message: "No certificates found for this staff member.", data: [] });
    }

    res.status(200).json({ message: "Staff certificates retrieved successfully", data: certificates });
  } catch (err) {
    console.error("Error fetching staff certificates:", err);
    res.status(500).json({ message: "Error fetching certificates", error: err.message });
  }
};

module.exports = { 
  createCertificateRequest, 
  getUserCertificates, 
  getAllCertificateRequests, 
  updateCertificateStatus, 
  getCertificateById, 
  deleteCertificateRequest, 
  getStaffCertificates 
};