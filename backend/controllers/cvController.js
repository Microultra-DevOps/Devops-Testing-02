const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const CV = require("../models/CV");
const User = require("../models/User");
const Interview = require("../models/Interview");
const Induction = require("../models/Induction");
const Station = require("../models/Station");
const Intern = require("../models/Intern");
const Scheme = require('../models/Scheme');
const {
  sendSuccessEmail,
  sendAdminCreatedEmail,
  sendDeclineEmail,
  sendApproveEmail,
  sendInterviewScheduleEmail,
  sendInductionAssignmentEmail,
  sendInterviewRescheduleEmail,
  sendInterviewPassEmail,
  sendInterviewFailEmail,
  sendInductionFailEmail,
  sendInductionPassEmail,
  sendInductionRescheduleEmail,
} = require("../services/cvEmailService");
const upload = require("../config/CVmulterConfig");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const axios = require("axios");
const multer = require("multer");
const { storeFile } = require("../utils/downloadAnuStoreFile");

// Helper function to validate NIC format
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid CV ID format" });
  }
  next();
};

// Create New CV - Admin and Individual
const createCV = async (req, res) => {
  let newUser = null; 

  try {
    const { id: userId, userType } = req.user; 
    const autoApprove = req.body.autoApprove === "true";
    const createdByAdmin = req.body.createdByAdmin === "true";

    // Basic validation
    if (!req.body.nic) {
      return res.status(400).json({ message: "NIC is required." });
    }

    // Check for duplicate NIC
    const existingCV = await CV.findOne({
      nic: req.body.nic,
    })
      .lean()
      .select("_id");

    if (existingCV) {
      return res.status(400).json({
        message: "CV with this NIC already exists.",
      });
    }

    // Generate credentials
    const randomPassword = Math.random().toString(36).slice(-8);
    const username = `${req.body.fullName
      .split(" ")[0]
      .toLowerCase()}${req.body.nic.slice(-4)}`;
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create user account first if created by admin
    if (createdByAdmin) {
      const existingUser = await User.findOne({
        $or: [{ email: req.body.emailAddress }, { nic: req.body.nic }],
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            existingUser.email === req.body.emailAddress
              ? "User with this email already exists"
              : "User with this NIC already exists",
        });
      }

      newUser = await User.create({
        username,
        email: req.body.emailAddress,
        password: hashedPassword,
        userType: "individual", 
        nic: req.body.nic,
        fullName: req.body.fullName,
        contactNumber: req.body.mobileNumber,
        district: req.body.district,
        cvStatus: autoApprove ? "cv-approved" : "cv-submitted",
      });
    }

    // Create properly structured roleData based on selected role
    const selectedRole = req.body.selectedRole;
    const roleData = {};
    
    if (selectedRole === "dataEntry") {
      roleData.dataEntry = {
        // O/L Results - FIXED: Use correct field names from req.body
        language: req.body.language || "",
        mathematics: req.body.mathematics || "",
        science: req.body.science || "",
        english: req.body.english || "",
        history: req.body.history || "",
        religion: req.body.religion || "",
        optional1Name: req.body.optional1Name || "",
        optional1Result: req.body.optional1Result || "",
        optional2Name: req.body.optional2Name || "",
        optional2Result: req.body.optional2Result || "",
        optional3Name: req.body.optional3Name || "",
        optional3Result: req.body.optional3Result || "",
        
        // A/L Results - FIXED: Use correct field names from req.body
        aLevelSubject1Name: req.body.aLevelSubject1Name || "",
        aLevelSubject1Result: req.body.aLevelSubject1Result || "",
        aLevelSubject2Name: req.body.aLevelSubject2Name || "",
        aLevelSubject2Result: req.body.aLevelSubject2Result || "",
        aLevelSubject3Name: req.body.aLevelSubject3Name || "",
        aLevelSubject3Result: req.body.aLevelSubject3Result || "",
        
        // Other fields - FIXED: These were already correct
        preferredLocation: req.body.preferredLocation || "",
        otherQualifications: req.body.otherQualifications || ""
      };
    } else if (selectedRole === "internship") {
      roleData.internship = {
        categoryOfApply: req.body.categoryOfApply || "",
        higherEducation: req.body.higherEducation || "",
        otherQualifications: req.body.otherQualifications || ""
      };
    }

    // Prepare CV data with proper approval status
    const cvData = {
      userId: createdByAdmin ? newUser._id : userId,
      userType: createdByAdmin ? "individual" : userType || "individual", 
      fullName: req.body.fullName,
      nameWithInitials: req.body.nameWithInitials,
      gender: req.body.gender,
      postalAddress: req.body.postalAddress,
      referredBy: req.body.referredBy || "", 
      district: req.body.district,
      birthday: req.body.birthday,
      nic: req.body.nic,
      mobileNumber: req.body.mobileNumber,
      landPhone: req.body.landPhone || "", 
      emailAddress: req.body.emailAddress,
      institute: req.body.institute,
      selectedRole: selectedRole,
      roleData: roleData, // This will now contain the correct data structure
      emergencyContactName1: req.body.emergencyContactName1,
      emergencyContactNumber1: req.body.emergencyContactNumber1,
      emergencyContactName2: req.body.emergencyContactName2 || "", 
      emergencyContactNumber2: req.body.emergencyContactNumber2 || "", 
      previousTraining: req.body.previousTraining,
      createdByAdmin,
      currentStatus: autoApprove ? "cv-approved" : "cv-submitted",
      cvApproval: {
        status: autoApprove ? "cv-approved" : "cv-submitted",
        approvedBy: autoApprove ? userId : null,
        approvedDate: autoApprove ? new Date() : null,
        notes: autoApprove ? "Auto-approved on creation" : null,
      },
    };

    // Process files
    const fileFields = [
      "updatedCv",
      "nicFile",
      "policeClearanceReport",
      "internshipRequestLetter",
    ];

    fileFields.forEach((field) => {
      if (req.files?.[field]?.[0]) {
        cvData[field] = req.files[field][0].path;
      }
    });

    // Create CV
    const newCV = await CV.create(cvData);

    // Generate refNo if not set by hook
    if (!newCV.refNo) {
      newCV.refNo = `REF-${newCV._id.toString().slice(-6).toUpperCase()}`;
      await newCV.save();
    }

    // Update user's cvStatus if created by admin
    if (createdByAdmin && newUser) {
      await User.findByIdAndUpdate(newUser._id, {
        $set: { cvStatus: autoApprove ? "cv-approved" : "cv-pending" },
      });
    }

    // Send appropriate email using imported email services
    if (createdByAdmin) {
      await sendAdminCreatedEmail(
        newCV.fullName,
        newCV.emailAddress,
        newCV.refNo,
        {
          username,
          password: randomPassword,
          status: autoApprove ? "cv-approved" : "cv-pending",
        }
      );
    } else {
      await sendSuccessEmail(newCV.fullName, newCV.emailAddress, newCV.refNo);
    }

    res.status(201).json({
      message: `CV ${
        autoApprove ? "created and approved" : "submitted successfully"
      }`,
      cv: {
        _id: newCV._id,
        refNo: newCV.refNo,
        fullName: newCV.fullName,
        nic: newCV.nic,
        selectedRole: newCV.selectedRole,
        currentStatus: newCV.currentStatus,
      },
      // Only return credentials in development for testing
      ...(process.env.NODE_ENV === "development" && createdByAdmin
        ? {
            credentials: {
              username,
              password: randomPassword,
            },
          }
        : {}),
    });
  } catch (error) {
    console.error("Error creating CV:", error);

    // Clean up user if CV creation failed and user was created
    if (newUser) {
      try {
        await User.deleteOne({ _id: newUser._id });
      } catch (cleanupError) {
        console.error(
          "Failed to clean up user after CV creation failed:",
          cleanupError
        );
      }
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({ message: "Validation failed", errors });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate key error",
        error: error.message.includes("username")
          ? "Username already exists"
          : error.message.includes("email")
          ? "Email already exists"
          : "A CV with this NIC or reference number already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create CV",
      error: error.message,
    });
  }
};

// Get Not Approved Cvs
const getAllNotApprovedCVs = async (req, res) => {
  try {
    const { status, includeAdminCreated } = req.query;

    let query = {
      $or: [
        { "cvApproval.status": "cv-pending" },
        { currentStatus: "cv-pending" },
        { currentStatus: "cv-submitted" },
      ],
    };

    // Explicitly exclude approved CVs
    query.$and = [
      {
        $or: [
          { "cvApproval.status": { $ne: "cv-approved" } },
          { "cvApproval.status": { $exists: false } },
        ],
      },
    ];

    // Filter out admin created CVs if requested
    if (includeAdminCreated === "false") {
      query.userType = { $ne: "admin" };
    }

    const cvs = await CV.find(query)
      .sort({ createdAt: -1 })
      .select(
        "-__v -roleData.dataEntry.olResults -roleData.dataEntry.alResults -roleData.dataEntry.proficiency"
      );

    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error fetching CVs:", error);
    res.status(500).json({
      message: "Failed to fetch CVs",
      error: error.message,
    });
  }
};

//approve CV
const approveCV = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Check if CV is already approved or rejected
    if (cv.cvApproval.status === "cv-approved") {
      return res.status(400).json({
        message: "CV is already approved.",
        cvId: cv._id,
      });
    }
    if (cv.cvApproval.status === "cv-rejected") {
      return res.status(400).json({
        message: "Cannot approve a rejected CV.",
        cvId: cv._id,
      });
    }

    // Update CV status
    cv.cvApproval = {
      cvApproved: true,
      status: "cv-approved",
      approvedBy: userId,
      approvedDate: new Date(),
      notes: notes || "Approved by admin",
    };
    cv.currentStatus = "cv-approved";

    await cv.save();

    // Send approval notification
    await sendApproveEmail(cv.fullName, cv.emailAddress, cv.refNo);

    res.status(200).json({
      message: "CV approved successfully",
      cv: {
        _id: cv._id,
        refNo: cv.refNo,
        fullName: cv.fullName,
        currentStatus: cv.currentStatus,
        cvApproval: cv.cvApproval,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve CV",
      error: error.message,
    });
  }
};
// Decline CV
const declineCV = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Check if CV is already approved or rejected
    if (cv.cvApproval.status === "cv-approved") {
      return res
        .status(400)
        .json({ message: "Cannot decline an approved CV." });
    }
    if (cv.cvApproval.status === "cv-rejected") {
      return res.status(400).json({ message: "CV is already rejected." });
    }

    // Update CV status with the provided notes
    cv.cvApproval = {
      cvApproved: false,
      status: "cv-rejected",
      rejectedBy: userId,
      rejectedDate: new Date(),
      notes: notes || "Declined by admin", // Now properly uses the notes from request body
    };
    cv.currentStatus = "cv-rejected";

    await cv.save();

    // Include the decline reason in the email
    await sendDeclineEmail(cv.fullName, cv.emailAddress, cv.refNo, notes);

    res.status(200).json({
      message: "CV declined successfully",
      cv: {
        _id: cv._id,
        refNo: cv.refNo,
        fullName: cv.fullName,
        currentStatus: cv.currentStatus,
        cvApproval: cv.cvApproval,
      },
      willBeDeletedOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to decline CV",
      error: error.message,
    });
  }
};

// Get all CVs with filtering
const getAllCVsWithFiltering = async (req, res) => {
  try {
    const { status, search = "", filterBy = "fullName", role } = req.query;
    let query = {};
    
    // Status filter - fixing to handle all possible status values
    if (status && status !== "all") {
      // Handle specific status presets first
      if (status === "cv-pending") {
        query.$or = [
          { "cvApproval.status": "cv-pending" },
          { currentStatus: "cv-submitted" },
          { currentStatus: "cv-pending" },
        ];
      } else if (status === "cv-approved") {
        query.$or = [
          { "cvApproval.status": "cv-approved" },
          { currentStatus: "cv-approved" }
        ];
      } else if (status === "cv-rejected") {
        query.$or = [
          { "cvApproval.status": "cv-rejected" },
          { currentStatus: "cv-rejected" }
        ];
      } else {
        // For any other status value, search directly in currentStatus
        query.currentStatus = status;
      }
    }
    
    // Role filter
    if (role && ["dataEntry", "internship"].includes(role)) {
      query.selectedRole = role;
    }
    
    // Search filter
    if (search) {
      // Fix: mobileNumber should be a string, not a variable reference
      const searchableFields = [
        "fullName",
        "nic",
        "refNo",
        "district",
        "institute",
        "userType",
        "selectedRole",
        "referredBy",
        "mobileNumber", 
      ];
      
      // If filterBy is specified and is a valid searchable field, search in that field
      if (filterBy && searchableFields.includes(filterBy)) {
        query[filterBy] = { $regex: search, $options: "i" };
      } else {
        // If filterBy is not specified or invalid, search across multiple fields
        const searchConditions = searchableFields.map(field => ({
          [field]: { $regex: search, $options: "i" }
        }));
        
        query.$or = searchConditions;
      }
    }
    
    const cvs = await CV.find(query)
      .sort({ applicationDate: -1 })
      .select(
        "fullName nic refNo mobileNumber gender userType selectedRole applicationDate district institute referredBy cvApproval currentStatus roleData.internship.categoryOfApply roleData.dataEntry.preferredLocation internshipStartDate internshipEndDate internshipPeriod"
      )
      .lean();
    
    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error in getAllCVsWithFiltering:", error);
    res.status(500).json({
      message: "Failed to fetch CVs",
      error: error.message,
    });
  }
};

//Get CV by ID
const getCVById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const cv = await CV.findById(id)
      .populate("cvApproval.approvedBy", "name email")
      .populate("cvApproval.rejectedBy", "name email")
      .populate("interview.interviews.interviewId")
      .populate("induction.inductionId")
      .populate("schemaAssignment.schemeId")
      .select("+roleData"); // Explicitly include roleData

    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    res.status(200).json(cv);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch CV",
      error: error.message,
    });
  }
};
// Get all CVs
const getAllCV = async (req, res) => {
  try {
    const cvs = await CV.find();

    if (!cvs || cvs.length === 0) {
      return res.status(404).json({ message: "No CVs found" });
    }

    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error fetching all CVs:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch all CVs", error: error.message });
  }
};

// Get approved CVs
const getApprovedCVs = async (req, res) => {
  try {
    const approvedCVs = await CV.find({ cvApproved: true });
    res.status(200).json(approvedCVs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch approved CVs", error: error.message });
  }
};

// Update CV by ID
const updateCV = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const existingCV = await CV.findById(id);
    if (!existingCV) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Parse roleData if it comes as stringified or form-data format
    let roleData = existingCV.roleData;
    
    // If roleData is in the request body as a nested object
    if (req.body.roleData) {
      // Handle both cases - roleData as string or object
      if (typeof req.body.roleData === 'string') {
        try {
          roleData = JSON.parse(req.body.roleData);
        } catch (e) {
          console.error("Failed to parse roleData JSON:", e);
        }
      } else if (typeof req.body.roleData === 'object') {
        roleData = req.body.roleData;
      }
    }

    // File fields to check
    const fileFields = [
      "updatedCv",
      "nicFile",
      "policeClearanceReport",
      "internshipRequestLetter",
    ];

    // Object to store new file paths
    const updatedFiles = {};

    // Check for uploaded files and update paths
    fileFields.forEach((field) => {
      if (req.files && req.files[field] && req.files[field][0]) {
        // Delete old file before replacing it
        if (existingCV[field]) {
          const oldFilePath = path.join(__dirname, "../", existingCV[field]);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        updatedFiles[field] = req.files[field][0].path;
      }
    });

    // Construct the update object - remove roleData from req.body to prevent overwriting
    const { roleData: _, ...restBody } = req.body;

    // Update CV data
    const updatedCV = await CV.findByIdAndUpdate(
      id,
      {
        ...restBody,
        roleData,
        ...updatedFiles,
        lastUpdated: new Date(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "CV updated successfully", cv: updatedCV });
  } catch (error) {
    console.error("Error updating CV:", error.message);
    res.status(500).json({
      message: "Failed to update CV",
      error: error.message,
    });
  }
};

const softDeleteCV = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminName, employeeId, deletionReason, deletionComments } = req.body;

    // Validate CV ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    // Validate required fields
    if (!adminName || !employeeId || !deletionReason) {
      return res.status(400).json({ 
        message: "Admin name, employee ID, and deletion reason are required" 
      });
    }

    // Find the CV (exclude already deleted ones)
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Check if CV is already deleted
    if (cv.isDeleted) {
      return res.status(400).json({ message: "CV is already deleted" });
    }

    // Perform soft delete
    const adminInfo = {
      deletedBy: req.user?.id,
      adminName: adminName.trim(),
      employeeId: employeeId.trim(),
      deletionReason: deletionReason.trim(),
      deletionComments: deletionComments?.trim() || "",
      deletedDate: new Date()
    };

    await cv.softDelete(adminInfo);

    res.status(200).json({ 
      message: "CV deleted successfully",
      deletionInfo: {
        refNo: cv.refNo,
        deletedBy: adminInfo.adminName,
        deletedDate: adminInfo.deletedDate,
        reason: adminInfo.deletionReason
      }
    });
  } catch (error) {
    console.error("Error soft deleting CV:", error);
    res.status(500).json({ 
      message: "Failed to delete CV", 
      error: error.message 
    });
  }
};

// Restore soft deleted CV
const restoreCV = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    // Find the CV including deleted ones
    const cv = await CV.findOne({ _id: id }).setOptions({ includeDeleted: true });
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    if (!cv.isDeleted) {
      return res.status(400).json({ message: "CV is not deleted" });
    }

    await cv.restore();

    res.status(200).json({ 
      message: "CV restored successfully",
      restoredCV: {
        refNo: cv.refNo,
        fullName: cv.fullName
      }
    });
  } catch (error) {
    console.error("Error restoring CV:", error);
    res.status(500).json({ 
      message: "Failed to restore CV", 
      error: error.message 
    });
  }
};

// Get all deleted CVs (for admin review)
const getDeletedCVs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const deletedCVs = await CV.find({ isDeleted: true })
      .select('refNo fullName nic deletionInfo applicationDate')
      .populate('deletionInfo.deletedBy', 'name email')
      .sort({ 'deletionInfo.deletedDate': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CV.countDocuments({ isDeleted: true });

    res.status(200).json({
      deletedCVs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching deleted CVs:", error);
    res.status(500).json({ 
      message: "Failed to fetch deleted CVs", 
      error: error.message 
    });
  }
};

// Get user's deleted CVs (for notification) - FIXED ROUTE
const getUserDeletedCVs = async (req, res) => {
  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({ message: "User email not found in request" });
    }

    const deletedCVs = await CV.find({ 
      emailAddress: userEmail, 
      isDeleted: true 
    })
    .select('refNo fullName nic deletionInfo applicationDate selectedRole')
    .populate('deletionInfo.deletedBy', 'name email')
    .sort({ 'deletionInfo.deletedDate': -1 })
    .setOptions({ includeDeleted: true });

    res.status(200).json({
      deletedCVs,
      count: deletedCVs.length
    });
  } catch (error) {
    console.error("Error fetching user deleted CVs:", error);
    res.status(500).json({ 
      message: "Failed to fetch deleted CVs", 
      error: error.message 
    });
  }
};

// Permanently delete CV (hard delete - use with extreme caution)
const permanentlyDeleteCV = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmDelete } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    if (confirmDelete !== "PERMANENTLY_DELETE") {
      return res.status(400).json({ 
        message: "Confirmation text 'PERMANENTLY_DELETE' is required" 
      });
    }

    // Find and permanently delete
    const cv = await CV.findOneAndDelete({ _id: id, isDeleted: true });
    if (!cv) {
      return res.status(404).json({ 
        message: "CV not found or not in deleted state" 
      });
    }

    res.status(200).json({ 
      message: "CV permanently deleted",
      deletedCV: {
        refNo: cv.refNo,
        fullName: cv.fullName
      }
    });
  } catch (error) {
    console.error("Error permanently deleting CV:", error);
    res.status(500).json({ 
      message: "Failed to permanently delete CV", 
      error: error.message 
    });
  }
};



// Get CVs for logged-in user (active only)
const getUserCVs = async (req, res) => {
  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      return res
        .status(400)
        .json({ message: "User email not found in request" });
    }

    // Only get active CVs (not deleted)
    const cvs = await CV.find({ 
      emailAddress: userEmail,
      isDeleted: { $ne: true }
    });

    if (!cvs.length) {
      return res.status(404).json({ message: "No CVs found." });
    }

    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error fetching user CVs:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch CVs", error: error.message });
  }
};

// Get CV by NIC
const getCVByNIC = async (req, res) => {
  try {
    const { nic } = req.params;

    if (!nic) {
      return res.status(400).json({ message: "NIC is required" });
    }

    const cv = await CV.findOne({ nic });
    if (!cv)
      return res.status(404).json({ message: "CV not found for this NIC" });

    res.status(200).json(cv);
  } catch (error) {
    console.error("Error fetching CV by NIC:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch CV", error: error.message });
  }
};

// Get CV by User ID
const getCVByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find CV by userId and exclude deleted CVs
    const cv = await CV.findOne({ 
      userId: userId,
      isDeleted: { $ne: true }
    }).populate('userId', 'fullName email'); // Optional: populate user details

    if (!cv) {
      return res.status(404).json({ message: "CV not found for this User ID" });
    }

    res.status(200).json(cv);
  } catch (error) {
    console.error("Error fetching CV by User ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch CV", error: error.message });
  }
};

// Alternative version: Get all CVs for a specific user ID
const getAllCVsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find all CVs by userId and exclude deleted CVs
    const cvs = await CV.find({ 
      userId: userId,
      isDeleted: { $ne: true }
    }).populate('userId', 'fullName email')
      .sort({ applicationDate: -1 }); // Sort by most recent first

    if (!cvs.length) {
      return res.status(404).json({ message: "No CVs found for this User ID" });
    }

    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error fetching CVs by User ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch CVs", error: error.message });
  }
};

// ---------------------------------------Controllers for Admin Interview Section ----------------------------------------------------------

// Controller for fetching approved but not scheduled CVs
const getApprovedAndNotScheduledCVs = async (req, res) => {
  try {
    const cvs = await CV.find({
      "cvApproval.status": "cv-approved",
      "interview.status": "interview-not-scheduled",
    })
      .populate("userId", "email fullName")
      .lean();

    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error fetching approved not scheduled CVs:", error);
    res.status(500).json({
      message: "Failed to fetch approved CVs",
      error: error.message,
    });
  }
};
// Schedule interview for a CV
const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewId, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Find CV first to work with the document instance
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Update interview fields
    cv.interview.status = status || "interview-scheduled";
    cv.interview.interviewScheduled = true;
    
    // Add interview to interviews array
    cv.interview.interviews.push({
      interviewId: interview._id,
      interviewName: interview.interviewName,
      interviewDate: interview.interviewDate,
      interviewTime: interview.interviewTime,
      location: interview.location, // Include location here
      result: { status: "interview-pending" }
    });
    
    // Explicitly update the currentStatus field
    cv.currentStatus = "interview-scheduled";
    
    // Save to trigger pre-save hooks that update derived fields
    await cv.save();

    // Populate for response
    await cv.populate("userId", "email fullName");

    // Safely send email if user data exists
    if (cv.userId && cv.userId.email) {
      const fullName = cv.userId.fullName || cv.fullName || "Applicant";
      await sendInterviewScheduleEmail(
        fullName,
        cv.userId.email,
        cv.refNo,
        interview.interviewName,
        interview.interviewDate,
        interview.interviewTime,
        interview.location // Pass location to email function
      );
    }

    res.status(200).json({
      message: "Interview scheduled successfully",
      cv: cv
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({
      message: "Failed to schedule interview",
      error: error.message,
    });
  }
};

// 2. Update the rescheduleInterview function
const rescheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewId, newInterviewId, interviewDate, interviewTime, location, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    // Find the CV document
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Check if there's an interview to reschedule
    if (!cv.interview?.interviews?.length) {
      return res.status(400).json({ message: "No interview found to reschedule" });
    }

    // Find the current interview in the database
    const currentInterview = await Interview.findById(interviewId);
    if (!currentInterview) {
      return res.status(404).json({ message: "Current interview not found" });
    }

    // Find the index of the interview to update
    const interviewIndex = cv.interview.interviews.findIndex(
      (i) => i.interviewId.toString() === interviewId
    );

    if (interviewIndex === -1) {
      return res.status(400).json({ message: "Interview not found in this CV" });
    }

    // Store the current interview details for history
    const previousInterview = cv.interview.interviews[interviewIndex];
    
    // Create a reschedule history entry
    const rescheduleEntry = {
      previousDate: previousInterview.interviewDate,
      previousTime: previousInterview.interviewTime,
      previousLocation: previousInterview.location, // Include previous location
      rescheduledBy: req.user.id,
      rescheduledDate: new Date(),
      notes: notes || "No additional notes provided"
    };

    // If a new interview ID is provided, fetch the new interview details
    let newInterviewDetails = {};
    if (newInterviewId && mongoose.Types.ObjectId.isValid(newInterviewId)) {
      const newInterview = await Interview.findById(newInterviewId);
      if (newInterview) {
        newInterviewDetails = {
          interviewId: newInterviewId,
          interviewName: newInterview.interviewName || newInterview.name,
          interviewDate: newInterview.interviewDate || newInterview.date,
          interviewTime: newInterview.interviewTime || newInterview.time,
          location: newInterview.location // Include new location
        };
      }
    }

    cv.interview.status = "interview-re-scheduled";
    cv.interview.interviewScheduled = true;
    
    cv.interview.interviews[interviewIndex] = {
      ...cv.interview.interviews[interviewIndex],
      interviewId: newInterviewDetails.interviewId || previousInterview.interviewId,
      interviewName: newInterviewDetails.interviewName || previousInterview.interviewName,
      interviewDate: newInterviewDetails.interviewDate || interviewDate || previousInterview.interviewDate,
      interviewTime: newInterviewDetails.interviewTime || interviewTime || previousInterview.interviewTime,
      location: newInterviewDetails.location || location || previousInterview.location, // Include location
      rescheduleCount: (previousInterview.rescheduleCount || 0) + 1,
      rescheduleHistory: [
        ...(previousInterview.rescheduleHistory || []),
        rescheduleEntry
      ],
      result: { 
        ...cv.interview.interviews[interviewIndex].result,
        status: "interview-pending",
      }
    };

    cv.currentStatus = "interview-re-scheduled";
    
    await cv.save();

    // Populate for response
    await cv.populate("userId", "email fullName");

    try {
      // Send email notification about rescheduled interview
      if (cv.userId && cv.userId.email) {
        const fullName = cv.userId.fullName || cv.fullName || "Applicant";
        await sendInterviewRescheduleEmail(
          fullName,
          cv.userId.email,
          cv.refNo,
          cv.interview.interviews[interviewIndex].interviewName,
          cv.interview.interviews[interviewIndex].interviewDate,
          cv.interview.interviews[interviewIndex].interviewTime,
          cv.interview.interviews[interviewIndex].location, // Pass location to email function
          notes || "No additional notes provided"
        );
      }
    } catch (emailError) {
      console.error("Failed to send reschedule email:", emailError);
    }

    res.status(200).json({
      message: "Interview rescheduled successfully",
      cv: cv
    });
  } catch (error) {
    console.error("Error rescheduling interview:", error);
    res.status(500).json({
      message: "Failed to reschedule interview",
      error: error.message,
    });
  }
};

// Pass interview
const passInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { customFeedback } = req.body; 

    // Add proper check for user
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not authenticated",
      });
    }

    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const cv = await CV.findById(id).populate("userId", "email fullName");
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Check if interview exists
    if (!cv.interview?.interviews?.length) {
      return res
        .status(400)
        .json({ message: "No interview scheduled for this CV" });
    }

    // Get the current interview details for the email
    const currentInterview = cv.interview.interviews[0];
    const interviewName = currentInterview.interviewName || "Internship Interview";

    // Update interview result
    cv.interview.interviews[0].result = {
      status: "interview-passed",
      evaluatedBy: userId,
      evaluatedDate: new Date(),
      feedback: customFeedback || null,
    };
    cv.interview.status = "interview-completed";
    cv.currentStatus = "interview-passed";

    await cv.save();

    // Send email notification
    try {
      if (cv.userId && cv.userId.email) {
        const fullName = cv.userId.fullName || cv.fullName || "Applicant";
        const nextSteps = customFeedback || "HR will contact you shortly with details regarding your internship offer.";
        
        await sendInterviewPassEmail(
          fullName,
          cv.userId.email,
          cv.refNo,
          interviewName,
          nextSteps
        );
      }
    } catch (emailError) {
      console.error("Failed to send interview pass email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Interview marked as passed successfully and notification sent",
      data: cv,
    });
  } catch (error) {
    console.error("Error passing interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update interview status",
      error: error.message,
    });
  }
};

// Fail Interview controller with email notification
const failInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedbackMessage } = req.body; 

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid CV ID format" });
    }

    const cv = await CV.findById(id).populate("userId", "email fullName");
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Check if interview exists
    if (!cv.interview?.interviews?.length) {
      return res
        .status(400)
        .json({ message: "No interview scheduled for this CV" });
    }

    // Get the current interview details for the email
    const currentInterview = cv.interview.interviews[0];
    const interviewName = currentInterview.interviewName || "Internship Interview";

    // Update the first interview result
    cv.interview.interviews[0].result = {
      status: "interview-failed",
      evaluatedBy: req.user.id,
      evaluatedDate: new Date(),
      feedback: feedbackMessage || null,
    };
    cv.interview.status = "interview-failed";
    cv.currentStatus = "interview-failed";

    await cv.save();

    // Send email notification
    try {
      if (cv.userId && cv.userId.email) {
        const fullName = cv.userId.fullName || cv.fullName || "Applicant";
        
        await sendInterviewFailEmail(
          fullName,
          cv.userId.email,
          cv.refNo,
          interviewName,
          feedbackMessage || undefined 
        );
      }
    } catch (emailError) {
      console.error("Failed to send interview fail email:", emailError);
    }

    res.status(200).json({
      message: "Interview marked as failed successfully and notification sent",
      cv,
    });
  } catch (error) {
    console.error("Error failing interview:", error);
    res.status(500).json({
      message: "Failed to update interview status",
      error: error.message,
    });
  }
};

const getCVsAssignedToInterviews = async (req, res, next) => {
  try {
    const cvs = await CV.find({
      "interview.interviewScheduled": true,
      "interview.status": { $in: ["interview-scheduled", "interview-re-scheduled"] }, // Include re-scheduled interviews
    })
      .populate("userId", "firstName lastName email")
      .populate({
        path: "interview.interviews.interviewId",
        select: "interviewName interviewDate interviewTime location note",
      });

    res.status(200).json({
      success: true,
      count: cvs.length,
      data: cvs,
    });
  } catch (err) {
    console.error("Error fetching scheduled interviews:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// -------------------------------------------------------- Controllers for Admin Induction Section --------------------------------------------------------
// Assign CV to an Induction
const assignInduction = async (req, res) => {
  try {
    const { id } = req.params;
    const { inductionId, emailData } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid CV ID format",
        field: "cvId",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(inductionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Induction ID format",
        field: "inductionId",
      });
    }

    // Find and validate induction
    const induction = await Induction.findById(inductionId);
    if (!induction) {
      return res.status(404).json({
        success: false,
        message: "Induction program not found",
      });
    }

    // Only validate fields that are actually required
    const requiredFields = ["induction", "startDate", "endDate", "location"];
    const missingFields = requiredFields.filter((field) => !induction[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Induction program is incomplete",
        missingFields,
        details: `Missing: ${missingFields.join(", ")}`,
      });
    }

    const updatedCV = await CV.findByIdAndUpdate(
      id,
      {
        $set: {
          "interview.status": "interview-passed",
          "induction.status": "induction-assigned",
          "induction.inductionAssigned": true,
          "induction.inductionId": induction._id,
          "induction.inductionName": induction.induction,
          "induction.inductionStartDate": induction.startDate,
          "induction.inductionEndDate": induction.endDate,
          "induction.inductionLocation": induction.location,
          "induction.result.status": "induction-pending",
          currentStatus: "induction-assigned",
        },
      },
      { new: true }
    ).populate("userId", "email fullName");

    if (!updatedCV) {
      return res.status(404).json({
        success: false,
        message: "CV record not found",
      });
    }

    // Send email
    const recipientEmail = emailData?.recipientEmail || updatedCV.userId?.email;
    
    if (recipientEmail) {
      try {
        // Use await to ensure email sending completes
        await sendInductionAssignmentEmail({
          recipientName: updatedCV.userId?.fullName || updatedCV.fullName || "Intern",
          recipientEmail: recipientEmail,
          refNo: updatedCV.refNo || "N/A",
          inductionName: induction.induction,
          startDate: induction.startDate,
          endDate: induction.endDate,
          location: induction.location, 
        });
        console.log(`Email successfully sent to ${recipientEmail}`);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Continue with the response even if email fails
      }
    } else {
      console.warn("No recipient email found for induction assignment notification");
    }

    return res.status(200).json({
      success: true,
      message: "Induction assigned successfully",
      cv: updatedCV,
    });
  } catch (error) {
    console.error("Assignment failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during assignment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// Get interview-completed CVs to assign to an induction
const getInterviewPassedCVs = async (req, res) => {
  try {
    console.log("Fetching interview-passed CVs for induction assignment");
    
    // Find CVs with passed interviews that haven't been assigned to induction yet
    const cvs = await CV.find({
      $or: [
        // Interview completed (passed) and induction not assigned
        { 
          "interview.status": "interview-completed",
          $or: [
            { "induction.status": { $exists: false } },
            { "induction.status": "induction-not-assigned" },
            { "induction.status": "induction-not-scheduled" }
          ]
        },
        // Check alternatively for interviews with passed result status
        {
          "interview.interviews": {
            $elemMatch: {
              "result.status": "interview-passed"
            }
          },
          $or: [
            { "induction.status": { $exists: false } },
            { "induction.status": "induction-not-assigned" },
            { "induction.status": "induction-not-scheduled" }
          ]
        }
      ]
    })
    .populate({
      path: "interview.interviews.interviewId",
      select: "interviewName interviewDate interviewTime location"
    })
    .lean();
    
    console.log(`Found ${cvs.length} CVs eligible for induction assignment`);
    
    // For debugging - log the structure of the first CV
    if (cvs.length > 0) {
      console.log("Sample CV structure:", JSON.stringify({
        id: cvs[0]._id,
        refNo: cvs[0].refNo,
        interviewStatus: cvs[0].interview?.status,
        interviewResults: cvs[0].interview?.interviews?.map(i => i.result?.status) || [],
        inductionStatus: cvs[0].induction?.status
      }, null, 2));
    }

    res.status(200).json(cvs);
  } catch (error) {
    console.error("Error fetching interview-passed CVs:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch interview-passed CVs",
      error: error.message
    });
  }
};

// Get CVs assigned to inductions
const getCVsAssignedToInduction = async (req, res) => {
  try {
    // Include both induction-assigned and induction-re-scheduled statuses
    const cvs = await CV.find({
      $or: [
        { "induction.status": "induction-assigned" },
        { "induction.status": "induction-re-scheduled" },
        { "currentStatus": "induction-assigned" },
        { "currentStatus": "induction-re-scheduled" }
      ]
    })
      .populate({
        path: "interview.interviews.interviewId",
        select: "interviewName interviewDate interviewTime location",
      })
      .populate({
        path: "induction.inductionId",
        select: "induction startDate endDate location",
      })
      .select("-password -__v")
      .sort({ createdAt: -1 });

    if (!cvs || cvs.length === 0) {
      return res.status(200).json([]);
    }

    // Format the response to include the populated data
    const formattedCvs = cvs.map((cv) => {
      const interview = cv.interview.interviews[0]; // Assuming one interview per CV
      const induction = cv.induction;

      return {
        ...cv.toObject(),
        interviewWithDetails: {
          name:
            interview?.interviewId?.interviewName ||
            interview?.interviewName ||
            "N/A",
          date: interview?.interviewId?.interviewDate || "N/A",
          time: interview?.interviewId?.interviewTime || "N/A",
        },
        inductionWithDetails: {
          name:
            induction?.inductionId?.induction ||
            induction?.inductionName ||
            "N/A",
          startDate: induction?.inductionId?.startDate || 
            induction?.inductionStartDate || "N/A",
          endDate: induction?.inductionId?.endDate || 
            induction?.inductionEndDate || "N/A",
          location: induction?.inductionId?.location || 
            induction?.inductionLocation || "N/A",
        },
      };
    });

    res.status(200).json(formattedCvs);
  } catch (error) {
    console.error("Error fetching CVs assigned to induction:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching CVs",
      error: error.message,
    });
  }
};

const rescheduleInduction = async (req, res) => {
  try {
    const { id } = req.params;
    const { newInductionId, currentInductionId, reason } = req.body;

    // Validate CV ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid CV ID format" 
      });
    }

    // Validate new induction ID
    if (!newInductionId || !mongoose.Types.ObjectId.isValid(newInductionId)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid new induction ID is required" 
      });
    }

    // Find the CV document
    const cv = await CV.findById(id).populate("userId", "email fullName");
    if (!cv) {
      return res.status(404).json({ 
        success: false,
        message: "CV not found" 
      });
    }

    // Check if there's an induction to reschedule
    if (!cv.induction?.inductionId) {
      return res.status(400).json({ 
        success: false,
        message: "No induction found to reschedule" 
      });
    }

    // Find the new induction
    const newInduction = await Induction.findById(newInductionId);
    if (!newInduction) {
      return res.status(404).json({ 
        success: false,
        message: "New induction program not found" 
      });
    }

    // Validate that the new induction has all required fields
    const requiredFields = ["induction", "startDate", "endDate", "location"];
    const missingFields = requiredFields.filter((field) => !newInduction[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "New induction program is incomplete",
        missingFields,
        details: `Missing: ${missingFields.join(", ")}`,
      });
    }

    // Store the current induction details for history
    const previousInduction = {
      inductionId: cv.induction.inductionId,
      inductionName: cv.induction.inductionName,
      inductionStartDate: cv.induction.inductionStartDate,
      inductionEndDate: cv.induction.inductionEndDate,
      inductionLocation: cv.induction.inductionLocation || "Not specified"
    };

    // Create reschedule history entry
    const rescheduleEntry = {
      previousInductionId: previousInduction.inductionId,
      previousInductionName: previousInduction.inductionName,
      previousStartDate: previousInduction.inductionStartDate,
      previousEndDate: previousInduction.inductionEndDate,
      previousLocation: previousInduction.inductionLocation,
      newInductionId: newInduction._id,
      newInductionName: newInduction.induction,
      newStartDate: newInduction.startDate,
      newEndDate: newInduction.endDate,
      newLocation: newInduction.location,
      rescheduledBy: req.user.id,
      rescheduledDate: new Date(),
      reason: reason || "No reason provided"
    };

    // Update the CV with new induction details
    const updatedCV = await CV.findByIdAndUpdate(
      id,
      {
        $set: {
          "induction.status": "induction-re-scheduled",
          "induction.inductionAssigned": true,
          "induction.inductionId": newInduction._id,
          "induction.inductionName": newInduction.induction,
          "induction.inductionStartDate": newInduction.startDate,
          "induction.inductionEndDate": newInduction.endDate,
          "induction.inductionLocation": newInduction.location,
          "induction.rescheduleCount": (cv.induction.rescheduleCount || 0) + 1,
          "induction.result.status": "induction-pending",
          "currentStatus": "induction-re-scheduled"
        },
        $push: {
          "induction.rescheduleHistory": rescheduleEntry
        }
      },
      { new: true }
    ).populate("userId", "email fullName");

    if (!updatedCV) {
      return res.status(404).json({
        success: false,
        message: "Failed to update CV record"
      });
    }

    // Send email notification about rescheduled induction
    try {
      const recipientEmail = updatedCV.userId?.email;
      const recipientName = updatedCV.userId?.fullName || updatedCV.fullName || "Applicant";
      
      if (recipientEmail) {
        await sendInductionRescheduleEmail({
          recipientName: recipientName,
          recipientEmail: recipientEmail,
          refNo: updatedCV.refNo || "N/A",
          inductionName: newInduction.induction,
          startDate: newInduction.startDate,
          endDate: newInduction.endDate,
          location: newInduction.location,
          previousInductionName: previousInduction.inductionName,
          previousStartDate: previousInduction.inductionStartDate,
          previousEndDate: previousInduction.inductionEndDate,
          reason: reason || "No reason provided"
        });
        console.log(`Reschedule email successfully sent to ${recipientEmail}`);
      } else {
        console.warn("No recipient email found for induction reschedule notification");
      }
    } catch (emailError) {
      console.error("Failed to send induction reschedule email:", emailError);
      // Don't fail the entire operation if email fails
    }

    return res.status(200).json({
      success: true,
      message: "Induction rescheduled successfully",
      cv: updatedCV,
      rescheduleDetails: {
        previousInduction: previousInduction,
        newInduction: {
          id: newInduction._id,
          name: newInduction.induction,
          startDate: newInduction.startDate,
          endDate: newInduction.endDate,
          location: newInduction.location
        },
        reason: reason
      }
    });

  } catch (error) {
    console.error("Error rescheduling induction:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reschedule induction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// Updated Pass induction with email notification
const passInduction = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid CV ID format" 
      });
    }

    const cv = await CV.findById(id).populate("userId", "email fullName");
    if (!cv) {
      return res.status(404).json({ 
        success: false,
        message: "CV not found" 
      });
    }

    // Check if CV has an induction assigned
    if (!cv.induction || !cv.induction.inductionId) {
      return res.status(400).json({
        success: false,
        message: "No induction found for this CV"
      });
    }

    // Check if induction is in a valid state to be passed
    const validStatuses = [
      "induction-assigned", 
      "induction-re-scheduled", 
      "induction-pending"
    ];
    
    if (!validStatuses.includes(cv.induction.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot pass induction. Current status: ${cv.induction.status}`
      });
    }

    // Update induction result and status
    const updatedCV = await CV.findByIdAndUpdate(
      id,
      {
        $set: {
          "induction.result.status": "induction-passed",
          "induction.result.evaluatedDate": new Date(),
          "induction.result.evaluatedBy": req.user.id || null,
          "induction.result.feedback": feedback || null,
          "induction.status": "induction-completed",
          "currentStatus": "induction-passed"
        }
      },
      { new: true }
    ).populate("userId", "email fullName");

    if (!updatedCV) {
      return res.status(404).json({
        success: false,
        message: "Failed to update CV record"
      });
    }

    // Send email notification
    try {
      const recipientEmail = updatedCV.userId?.email;
      const recipientName = updatedCV.userId?.fullName || updatedCV.fullName || "Applicant";
      
      if (recipientEmail) {
        const nextSteps = feedback || "HR will contact you shortly with details regarding your internship placement.";
        
        await sendInductionPassEmail({
          recipientName: recipientName,
          recipientEmail: recipientEmail,
          refNo: updatedCV.refNo || "N/A",
          inductionName: updatedCV.induction.inductionName,
          nextSteps: nextSteps,
          // Include reschedule information if applicable
          wasRescheduled: (updatedCV.induction.rescheduleCount || 0) > 0,
          rescheduleCount: updatedCV.induction.rescheduleCount || 0
        });
        console.log(`Induction pass email successfully sent to ${recipientEmail}`);
      } else {
        console.warn("No recipient email found for induction pass notification");
      }
    } catch (emailError) {
      console.error("Failed to send induction pass email:", emailError);
      // Don't fail the entire operation if email fails
    }

    return res.status(200).json({
      success: true,
      message: "Induction marked as passed successfully and notification sent",
      cv: updatedCV,
      inductionDetails: {
        status: "induction-passed",
        inductionName: updatedCV.induction.inductionName,
        wasRescheduled: (updatedCV.induction.rescheduleCount || 0) > 0,
        rescheduleCount: updatedCV.induction.rescheduleCount || 0,
        evaluatedDate: updatedCV.induction.result.evaluatedDate,
        feedback: feedback
      }
    });

  } catch (error) {
    console.error("Error passing induction:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update induction status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Updated Fail induction with email notification - handles rescheduled inductions
const failInduction = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, allowReschedule = false } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid CV ID format" 
      });
    }

    const cv = await CV.findById(id).populate("userId", "email fullName");
    if (!cv) {
      return res.status(404).json({ 
        success: false,
        message: "CV not found" 
      });
    }

    // Check if CV has an induction assigned
    if (!cv.induction || !cv.induction.inductionId) {
      return res.status(400).json({
        success: false,
        message: "No induction found for this CV"
      });
    }

    // Check if induction is in a valid state to be failed
    const validStatuses = [
      "induction-assigned", 
      "induction-re-scheduled", 
      "induction-pending"
    ];
    
    if (!validStatuses.includes(cv.induction.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot fail induction. Current status: ${cv.induction.status}`
      });
    }

    // Determine the final status based on reschedule policy
    const rescheduleCount = cv.induction.rescheduleCount || 0;
    const maxReschedules = 2; // You can make this configurable
    
    let finalStatus = "induction-failed";
    let nextAction = "terminated";
    
    // If reschedule is allowed and haven't exceeded max reschedules
    if (allowReschedule && rescheduleCount < maxReschedules) {
      finalStatus = "induction-failed-pending-reschedule";
      nextAction = "reschedule-available";
    }

    // Update induction result and status
    const updatedCV = await CV.findByIdAndUpdate(
      id,
      {
        $set: {
          "induction.result.status": "induction-failed",
          "induction.result.evaluatedDate": new Date(),
          "induction.result.evaluatedBy": req.user.id || null,
          "induction.result.feedback": feedback || null,
          "induction.status": finalStatus,
          "currentStatus": finalStatus,
          "induction.nextAction": nextAction
        }
      },
      { new: true }
    ).populate("userId", "email fullName");

    if (!updatedCV) {
      return res.status(404).json({
        success: false,
        message: "Failed to update CV record"
      });
    }

    // Send email notification
    try {
      const recipientEmail = updatedCV.userId?.email;
      const recipientName = updatedCV.userId?.fullName || updatedCV.fullName || "Applicant";
      
      if (recipientEmail) {
        await sendInductionFailEmail({
          recipientName: recipientName,
          recipientEmail: recipientEmail,
          refNo: updatedCV.refNo || "N/A",
          inductionName: updatedCV.induction.inductionName,
          feedback: feedback || "Thank you for your participation in our induction program.",
          // Include reschedule information
          wasRescheduled: rescheduleCount > 0,
          rescheduleCount: rescheduleCount,
          canReschedule: nextAction === "reschedule-available",
          maxReschedules: maxReschedules
        });
        console.log(`Induction fail email successfully sent to ${recipientEmail}`);
      } else {
        console.warn("No recipient email found for induction fail notification");
      }
    } catch (emailError) {
      console.error("Failed to send induction fail email:", emailError);
      // Don't fail the entire operation if email fails
    }

    return res.status(200).json({
      success: true,
      message: "Induction marked as failed successfully and notification sent",
      cv: updatedCV,
      inductionDetails: {
        status: finalStatus,
        inductionName: updatedCV.induction.inductionName,
        wasRescheduled: rescheduleCount > 0,
        rescheduleCount: rescheduleCount,
        canReschedule: nextAction === "reschedule-available",
        maxReschedules: maxReschedules,
        evaluatedDate: updatedCV.induction.result.evaluatedDate,
        feedback: feedback
      }
    });

  } catch (error) {
    console.error("Error failing induction:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update induction status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ------------------------------------------------------------ Controllers for Rotational Section --------------------------------------------------------------------

// Assign CV to stations
// Controller function to assign CVs to station and update status
const assignCVToStations = async (req, res) => {
  try {
    const { cvIds, stationId, startDate, serviceTimePeriod } = req.body;

    // Validate input
    if (!cvIds || !Array.isArray(cvIds) || cvIds.length === 0) {
      return res.status(400).json({ message: "Please select at least one CV" });
    }
    if (!stationId) {
      return res.status(400).json({ message: "Station ID is required" });
    }

    // Calculate end date based on start date and service time period
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + serviceTimePeriod);

    // Update all selected CVs
    const updatePromises = cvIds.map((cvId) =>
      CVModel.findByIdAndUpdate(
        cvId,
        {
          $set: {
            "rotationalAssignment.status": "station-assigned",
            "rotationalAssignment.assignedStations": [
              {
                station: stationId,
                startDate: new Date(startDate),
                endDate: endDate,
                serviceTimePeriod: serviceTimePeriod,
                isCurrent: true,
              },
            ],
          },
        },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.status(200).json({ message: "CVs successfully assigned to station" });
  } catch (error) {
    console.error("Error assigning CVs to station:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------------------------------- Controllers for Admin- Assign Scheme Section --------------------------------------------------------
// Get CVs for scheme assignment
const getCVsForSchemeAssignment = async (req, res) => {
  try {
    const cvs = await CV.find({
      'induction.status': 'induction-completed',
      'schemaAssignment.status': 'schema-not-assigned',
    }).select('_id refNo fullName nic selectedRole emailAddress mobileNumber district institute');

    res.status(200).json(cvs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign scheme to a single CV
const assignSchemeToCV = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      schemeId, 
      managerLevel, 
      internshipPeriod, 
      startDate, 
      forRequest,
      milestones // Optional milestones array
    } = req.body;

    // Validate input
    if (!schemeId || !managerLevel || !internshipPeriod || !startDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate manager level (1-6)
    if (managerLevel < 1 || managerLevel > 6) {
      return res.status(400).json({ message: "Manager level must be between 1 and 6" });
    }

    // Get scheme details
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    // Check if scheme is active
    if (!scheme.isActive) {
      return res.status(400).json({ message: "Scheme is not active" });
    }

    // Check if scheme has available slots
    if (scheme.totalEmptyCount <= 0) {
      return res.status(400).json({ message: "No available slots in this scheme" });
    }

    // Get manager details from scheme based on level
    const levelKey = `level${managerLevel}Manager`;
    const managerDetails = scheme[levelKey];

    if (!managerDetails || !managerDetails.employeeId) {
      return res.status(400).json({ 
        message: `No manager assigned at level ${managerLevel} for this scheme` 
      });
    }

    // Check if manager has available allocation
    if (managerDetails.availableAllocation <= 0) {
      return res.status(400).json({ 
        message: `Manager at level ${managerLevel} has no available allocation` 
      });
    }

    // Calculate end date based on start date and internship period
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(internshipPeriod));

    // Prepare comprehensive update data
    const updateData = {
      $set: {
        // Basic Assignment Info
        "schemaAssignment.schemaAssigned": true,
        "schemaAssignment.status": "schema-assigned",
        "schemaAssignment.schemeId": schemeId,
        "schemaAssignment.schemeName": scheme.schemeName,
        
        // Manager Information
        "schemaAssignment.managerId": managerDetails.employeeId,
        "schemaAssignment.managerName": managerDetails.name,
        "schemaAssignment.managerRole": `Level ${managerLevel} Manager - ${managerDetails.position}`,
        "schemaAssignment.managerLevel": managerLevel,
        "schemaAssignment.managerEmployeeCode": managerDetails.employeeCode,
        "schemaAssignment.managerEmail": managerDetails.email,
        "schemaAssignment.managerDepartment": managerDetails.department,
        "schemaAssignment.managerPosition": managerDetails.position,
        
        // Assignment Details
        "schemaAssignment.internshipPeriod": internshipPeriod,
        "schemaAssignment.startDate": startDate,
        "schemaAssignment.endDate": endDate,
        "schemaAssignment.forRequest": forRequest || "no",
        
        // Assignment Metadata
        "schemaAssignment.assignedDate": new Date(),
        "schemaAssignment.assignedBy": req.user?.employeeId || "system",
        "schemaAssignment.lastModified": new Date(),
        "schemaAssignment.modifiedBy": req.user?.employeeId || "system",
        
        // Scheme Details (cached)
        "schemaAssignment.schemeType.onRequest": scheme.onRequest,
        "schemaAssignment.schemeType.recurring": scheme.recurring,
        "schemaAssignment.schemeType.rotational": scheme.rotational,
        "schemaAssignment.perHeadAllowance": scheme.perHeadAllowance,
        "schemaAssignment.allowanceFrequency": scheme.allowanceFrequency,
        
        // Progress Tracking
        "schemaAssignment.progressPercentage": 0,
        
        // Update main status
        currentStatus: "schema-assigned",
      },
    };

    // Add milestones if provided
    if (milestones && Array.isArray(milestones) && milestones.length > 0) {
      updateData.$set["schemaAssignment.milestones"] = milestones.map(milestone => ({
        ...milestone,
        status: milestone.status || "pending"
      }));
    }

    // If scheme is rotational, set isRotational to true
    if (scheme.rotational === "yes") {
      updateData.$set["rotationalAssignment.isRotational"] = true;
    }

    // Update CV
    const updatedCV = await CV.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedCV) {
      return res.status(404).json({ message: "CV not found" });
    }

    // Update scheme allocation counts
    scheme.totalAllocatedCount += 1;
    scheme.totalEmptyCount = scheme.totalAllocation - scheme.totalAllocatedCount;

    // Update manager's assigned count and available allocation
    scheme[levelKey].assignedCount += 1;
    scheme[levelKey].availableAllocation = 
      scheme[levelKey].allocationCount - scheme[levelKey].assignedCount;

    // Update assignedBy and assignedDate
    scheme[levelKey].assignedDate = new Date();
    if (req.user && req.user.employeeId) {
      scheme[levelKey].assignedBy = req.user.employeeId;
    }

    await scheme.save();

    // Return updated CV with populated scheme details
    const responseCV = await CV.findById(id).populate('schemaAssignment.schemeId');

    res.status(200).json({
      success: true,
      message: "Scheme assigned successfully",
      data: responseCV,
      schemeInfo: {
        totalAllocatedCount: scheme.totalAllocatedCount,
        totalEmptyCount: scheme.totalEmptyCount,
        utilizationPercentage: scheme.utilizationPercentage,
        managerInfo: {
          level: managerLevel,
          name: managerDetails.name,
          position: managerDetails.position,
          availableAllocation: scheme[levelKey].availableAllocation,
          assignedCount: scheme[levelKey].assignedCount
        }
      }
    });
  } catch (error) {
    console.error('Error assigning scheme:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to assign scheme",
      error: error.message 
    });
  }
};

// Batch assign scheme to multiple CVs - Updated for enhanced schema
const batchAssignScheme = async (req, res) => {
  try {
    const {
      cvIds,
      schemeId,
      managerLevel,
      internshipPeriod,
      startDate,
      forRequest,
      milestones // Optional milestones array for all CVs
    } = req.body;

    // Validate input
    if (!cvIds || !Array.isArray(cvIds) || cvIds.length === 0) {
      return res.status(400).json({ message: "Invalid or empty CV IDs array" });
    }
    if (!schemeId || !managerLevel || !internshipPeriod || !startDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate manager level (1-6)
    if (managerLevel < 1 || managerLevel > 6) {
      return res.status(400).json({ message: "Manager level must be between 1 and 6" });
    }

    // Get scheme details
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    // Check if scheme is active
    if (!scheme.isActive) {
      return res.status(400).json({ message: "Scheme is not active" });
    }

    // Check if scheme has enough available slots
    if (scheme.totalEmptyCount < cvIds.length) {
      return res.status(400).json({
        message: `Not enough available slots in this scheme. Available: ${scheme.totalEmptyCount}, Requested: ${cvIds.length}`,
      });
    }

    // Get manager details from scheme based on level
    const levelKey = `level${managerLevel}Manager`;
    const managerDetails = scheme[levelKey];

    if (!managerDetails || !managerDetails.employeeId) {
      return res.status(400).json({ 
        message: `No manager assigned at level ${managerLevel} for this scheme` 
      });
    }

    // Check if manager has enough available allocation
    if (managerDetails.availableAllocation < cvIds.length) {
      return res.status(400).json({
        message: `Manager at level ${managerLevel} doesn't have enough available allocation. Available: ${managerDetails.availableAllocation}, Requested: ${cvIds.length}`,
      });
    }

    // Check if all CVs exist and are not already assigned
    const existingCVs = await CV.find({ 
      _id: { $in: cvIds },
      'schemaAssignment.schemaAssigned': false 
    });

    if (existingCVs.length !== cvIds.length) {
      const foundIds = existingCVs.map(cv => cv._id.toString());
      const missingOrAssigned = cvIds.filter(id => !foundIds.includes(id));
      return res.status(400).json({
        message: `Some CVs not found or already assigned: ${missingOrAssigned.join(', ')}`
      });
    }

    // Calculate end date based on start date and internship period
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(internshipPeriod));

    // Prepare comprehensive base update data
    const baseUpdateData = {
      $set: {
        // Basic Assignment Info
        "schemaAssignment.schemaAssigned": true,
        "schemaAssignment.status": "schema-assigned",
        "schemaAssignment.schemeId": schemeId,
        "schemaAssignment.schemeName": scheme.schemeName,
        
        // Manager Information
        "schemaAssignment.managerId": managerDetails.employeeId,
        "schemaAssignment.managerName": managerDetails.name,
        "schemaAssignment.managerRole": `Level ${managerLevel} Manager - ${managerDetails.position}`,
        "schemaAssignment.managerLevel": managerLevel,
        "schemaAssignment.managerEmployeeCode": managerDetails.employeeCode,
        "schemaAssignment.managerEmail": managerDetails.email,
        "schemaAssignment.managerDepartment": managerDetails.department,
        "schemaAssignment.managerPosition": managerDetails.position,
        
        // Assignment Details
        "schemaAssignment.internshipPeriod": internshipPeriod,
        "schemaAssignment.startDate": startDate,
        "schemaAssignment.endDate": endDate,
        "schemaAssignment.forRequest": forRequest || "no",
        
        // Assignment Metadata
        "schemaAssignment.assignedDate": new Date(),
        "schemaAssignment.assignedBy": req.user?.employeeId || "system",
        "schemaAssignment.lastModified": new Date(),
        "schemaAssignment.modifiedBy": req.user?.employeeId || "system",
        
        // Scheme Details (cached)
        "schemaAssignment.schemeType.onRequest": scheme.onRequest,
        "schemaAssignment.schemeType.recurring": scheme.recurring,
        "schemaAssignment.schemeType.rotational": scheme.rotational,
        "schemaAssignment.perHeadAllowance": scheme.perHeadAllowance,
        "schemaAssignment.allowanceFrequency": scheme.allowanceFrequency,
        
        // Progress Tracking
        "schemaAssignment.progressPercentage": 0,
        
        // Update main status
        currentStatus: "schema-assigned",
      },
    };

    // Add milestones if provided
    if (milestones && Array.isArray(milestones) && milestones.length > 0) {
      baseUpdateData.$set["schemaAssignment.milestones"] = milestones.map(milestone => ({
        ...milestone,
        status: milestone.status || "pending"
      }));
    }

    // If scheme is rotational, add isRotational to the update
    if (scheme.rotational === "yes") {
      baseUpdateData.$set["rotationalAssignment.isRotational"] = true;
    }

    // Start a transaction for batch update
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update all CVs in batch
      const bulkOps = cvIds.map(cvId => ({
        updateOne: {
          filter: { _id: cvId },
          update: baseUpdateData
        }
      }));

      const bulkResult = await CV.bulkWrite(bulkOps, { session });

      if (bulkResult.modifiedCount !== cvIds.length) {
        throw new Error(`Expected to update ${cvIds.length} CVs, but only updated ${bulkResult.modifiedCount}`);
      }

      // Update scheme allocation counts
      scheme.totalAllocatedCount += cvIds.length;
      scheme.totalEmptyCount = scheme.totalAllocation - scheme.totalAllocatedCount;

      // Update manager's assigned count and available allocation
      scheme[levelKey].assignedCount += cvIds.length;
      scheme[levelKey].availableAllocation = 
        scheme[levelKey].allocationCount - scheme[levelKey].assignedCount;

      // Update assignedBy and assignedDate
      scheme[levelKey].assignedDate = new Date();
      if (req.user && req.user.employeeId) {
        scheme[levelKey].assignedBy = req.user.employeeId;
      }

      await scheme.save({ session });

      // Commit the transaction
      await session.commitTransaction();

      // Get updated CVs for response
      const updatedCVs = await CV.find({ _id: { $in: cvIds } })
        .populate('schemaAssignment.schemeId');

      res.status(200).json({
        success: true,
        message: `Successfully assigned scheme to ${cvIds.length} CVs`,
        data: updatedCVs,
        batchInfo: {
          totalAssigned: cvIds.length,
          schemeInfo: {
            schemeName: scheme.schemeName,
            totalAllocatedCount: scheme.totalAllocatedCount,
            totalEmptyCount: scheme.totalEmptyCount,
            utilizationPercentage: scheme.utilizationPercentage,
            managerInfo: {
              level: managerLevel,
              name: managerDetails.name,
              position: managerDetails.position,
              availableAllocation: scheme[levelKey].availableAllocation,
              assignedCount: scheme[levelKey].assignedCount
            }
          }
        }
      });

    } catch (transactionError) {
      // Rollback the transaction on error
      await session.abortTransaction();
      throw transactionError;
    } finally {
      // End the session
      session.endSession();
    }

  } catch (error) {
    console.error('Error in batch assign scheme:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to batch assign scheme",
      error: error.message 
    });
  }
};

// Function to update assignment progress and milestones
const updateAssignmentProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      progressPercentage, 
      milestoneUpdates, // Array of milestone updates
      remarks 
    } = req.body;

    // Get current CV details
    const cv = await CV.findById(id);
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    if (!cv.schemaAssignment.schemaAssigned) {
      return res.status(400).json({ message: "CV is not assigned to any scheme" });
    }

    const updateData = {
      $set: {
        "schemaAssignment.lastModified": new Date(),
        "schemaAssignment.modifiedBy": req.user?.employeeId || "system"
      }
    };

    // Update progress percentage if provided
    if (progressPercentage !== undefined) {
      if (progressPercentage < 0 || progressPercentage > 100) {
        return res.status(400).json({ message: "Progress percentage must be between 0 and 100" });
      }
      updateData.$set["schemaAssignment.progressPercentage"] = progressPercentage;
    }

    // Update milestones if provided
    if (milestoneUpdates && Array.isArray(milestoneUpdates)) {
      // Get current milestones
      const currentMilestones = cv.schemaAssignment.milestones || [];
      
      // Apply updates
      milestoneUpdates.forEach(update => {
        const milestoneIndex = currentMilestones.findIndex(m => m._id.toString() === update.milestoneId);
        if (milestoneIndex !== -1) {
          Object.assign(currentMilestones[milestoneIndex], {
            ...update,
            completedBy: update.status === 'completed' ? (req.user?.employeeId || "system") : currentMilestones[milestoneIndex].completedBy,
            completedDate: update.status === 'completed' ? new Date() : currentMilestones[milestoneIndex].completedDate
          });
        }
      });
      
      updateData.$set["schemaAssignment.milestones"] = currentMilestones;
    }

    const updatedCV = await CV.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: "Assignment progress updated successfully",
      data: updatedCV.schemaAssignment
    });

  } catch (error) {
    console.error('Error updating assignment progress:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update assignment progress",
      error: error.message 
    });
  }
};



//----------------------------------- Controllers for admin-institute section --------------------------------------------------------------------

// CV bulk upload
const bulkUploadCV = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Verify institute user
    if (!req.user || req.user.userType !== "institute") {
      fs.unlinkSync(req.file.path); // Clean up file
      return res
        .status(403)
        .json({ message: "Only institutes can perform bulk uploads." });
    }

    const instituteId = req.user.id;
    const userType = "institute";

    // Process the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Validate row count
    if (data.length > 50) {
      fs.unlinkSync(req.file.path); // Clean up file
      return res.status(400).json({
        message: "Maximum 50 CVs allowed per bulk upload.",
      });
    }

    // Process each row
    const results = {
      success: 0,
      failures: 0,
      errors: [],
    };

    for (const [index, row] of data.entries()) {
      try {
        // Validate required fields
        const requiredFields = [
          "Full Name",
          "Name with Initials",
          "Gender",
          "Postal Address",
          "District",
          "Birthday",
          "NIC",
          "Mobile Number",
          "Email",
          "Institute",
        ];

        const missingFields = requiredFields.filter((field) => !row[field]);
        if (missingFields.length > 0) {
          throw new Error(
            `Missing required fields: ${missingFields.join(", ")}`
          );
        }

        // Convert Excel date to DD/MM/YYYY format
        if (row["Birthday"] && typeof row["Birthday"] === "number") {
          const date = xlsx.SSF.parse_date_code(row["Birthday"]);
          row["Birthday"] = `${date.d}/${date.m}/${date.y}`;
        }

        // Build CV data
        const cvData = {
          fullName: row["Full Name"],
          nameWithInitials: row["Name with Initials"],
          gender: row["Gender"],
          postalAddress: row["Postal Address"],
          district: row["District"],
          birthday: row["Birthday"],
          nic: row["NIC"],
          mobileNumber: row["Mobile Number"],
          landPhone: row["Land Phone"] || "",
          emailAddress: row["Email"],
          institute: row["Institute"],
          userId: instituteId,
          userType: userType,
          currentStatus: "cv-approved",
          cvApproval: {
            status: "cv-approved",
          },
          // Initialize roleData
          roleData: {
            dataEntry: {},
            internship: {},
          },
        };

        // Set role-specific data
        if (row["O/L Language"]) {
          // Data Entry Operator
          cvData.selectedRole = "dataEntry";
          cvData.roleData.dataEntry = {
            proficiency: {
              msWord: row["MS Word Proficiency"] || 0,
              msExcel: row["MS Excel Proficiency"] || 0,
              msPowerPoint: row["MS PowerPoint Proficiency"] || 0,
            },
            olResults: {
              language: row["O/L Language"],
              mathematics: row["O/L Mathematics"],
              science: row["O/L Science"],
              english: row["O/L English"],
              history: row["O/L History"],
              religion: row["O/L Religion"],
              optional1: row["O/L Optional 1"],
              optional2: row["O/L Optional 2"],
              optional3: row["O/L Optional 3"],
            },
            alResults: {
              aLevelSubject1: row["A/L Subject 1"] || "",
              aLevelSubject2: row["A/L Subject 2"] || "",
              aLevelSubject3: row["A/L Subject 3"] || "",
              git: row["A/L GIT"] || "",
              gk: row["A/L GK"] || "",
            },
            preferredLocation: row["Preferred Location"] || "",
            otherQualifications: row["Other Qualifications"] || "",
          };
        } else {
          // Internship
          cvData.selectedRole = "internship";
          cvData.roleData.internship = {
            categoryOfApply: row["Category of Apply"] || "",
            higherEducation: row["Higher Education"] || "",
            otherQualifications: row["Other Qualifications"] || "",
          };
        }

        // Handle emergency contacts
        if (row["Emergency Contact Name 1"]) {
          cvData.emergencyContactName1 = row["Emergency Contact Name 1"];
          cvData.emergencyContactNumber1 =
            row["Emergency Contact Number 1"] || "";
        }
        if (row["Emergency Contact Name 2"]) {
          cvData.emergencyContactName2 = row["Emergency Contact Name 2"];
          cvData.emergencyContactNumber2 =
            row["Emergency Contact Number 2"] || "";
        }

        // Handle previous training
        if (row["Previous Training"]) {
          cvData.previousTraining = row["Previous Training"];
        }

        // Check for duplicates
        const existingCV = await CV.findOne({
          $or: [{ emailAddress: cvData.emailAddress }, { nic: cvData.nic }],
        });

        if (existingCV) {
          throw new Error(
            `CV with ${
              existingCV.emailAddress === cvData.emailAddress ? "email" : "NIC"
            } already exists`
          );
        }

        // Create CV
        await CV.create(cvData);
        results.success++;
      } catch (error) {
        results.failures++;
        results.errors.push({
          row: index + 1,
          message: error.message,
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Return results
    res.status(200).json({
      message: `Bulk upload processed. Success: ${results.success}, Failures: ${results.failures}`,
      details:
        results.errors.length > 0 ? { errors: results.errors } : undefined,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);

    // Clean up file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Failed to process bulk upload",
      error: error.message,
    });
  }
};

const handleFileUpload = async (e) => {
  e.preventDefault();
  if (!file) {
    setError("Please select a file to upload.");
    return;
  }

  try {
    await validateExcelFile(file);
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not authenticated. Please log in.");
      return;
    }

    const response = await axios.post(
      "http://localhost:5000/api/cvs/bulk-upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.errors?.length > 0) {
      setUploadErrors(response.data.errors);
      setError("Some CVs could not be uploaded. See details below.");
      setSuccess(null);
    } else {
      setSuccess("File uploaded successfully!");
      setError(null);
      setUploadErrors([]);
      
      // Add this to trigger a refresh in the parent component
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cvUploadSuccess'));
      }
    }
  } catch (err) {
    setError(err.message || "Error uploading file.");
    setSuccess(null);
    console.error("Upload error:", err);
  }
};

const getAllCVsForInstitute = async (req, res) => {
  try {
    if (!req.user || req.user.userType !== "institute") {
      return res.status(400).json({ message: "Access denied" });
    }

    const instituteId = req.user.id;
    const cvs = await CV.find({ userId: instituteId })
      .populate('uploadedFiles') // populate file references
      .sort({ createdAt: -1 })
      .lean();

    // Generate missing reference numbers
    const updatedCvs = await Promise.all(
      cvs.map(async (cv) => {
        if (!cv.refNo) {
          const refNo = `REF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          await CV.updateOne({ _id: cv._id }, { $set: { refNo } });
          return { ...cv, refNo };
        }
        return cv;
      })
    );

    res.status(200).json(updatedCvs);
  } catch (error) {
    console.error("Error in getAllCVsForInstitute:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
};
module.exports = {
  createCV,
  getCVById,
  getUserCVs,
  getAllCVsWithFiltering,
  getApprovedCVs,
  approveCV,
  declineCV,
  updateCV,
  softDeleteCV,
  restoreCV,
  getDeletedCVs,
  getCVByUserId,
  getAllCVsByUserId,
  permanentlyDeleteCV,
  getUserDeletedCVs,
  getCVByNIC,
  scheduleInterview,
  assignInduction,
  scheduleInterview,
  getCVsAssignedToInterviews,
  passInterview,
  failInterview,
  passInduction,
  failInduction,
  assignCVToStations,
  getCVsAssignedToInduction,
  bulkUploadCV,
  validateObjectId,
  getAllNotApprovedCVs,
  getApprovedAndNotScheduledCVs,
  scheduleInterview,
  getInterviewPassedCVs,
  getCVsForSchemeAssignment,
  assignSchemeToCV,
  updateAssignmentProgress,
  batchAssignScheme,
  rescheduleInterview,
  rescheduleInduction,
  upload,
  getAllCVsForInstitute,
  handleFileUpload,
};
