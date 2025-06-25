const multer = require("multer");
const express = require("express");
const {
  approveCV,
  declineCV,
  createCV,
  getUserCVs,
  getCVById,
  getAllCVsWithFiltering,
  getApprovedCVs,
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
  getCVsAssignedToInterviews,
  assignInduction,
  passInterview,
  failInterview,
  getCVsAssignedToInduction,
  passInduction,
  failInduction,
  bulkPassInduction,
  bulkFailInduction,
  bulkUploadCV,
  validateObjectId,
  getAllNotApprovedCVs,
  getApprovedAndNotScheduledCVs,
  getInterviewPassedCVs,
  getCVsForSchemeAssignment,
  assignSchemeToCV,
  batchAssignScheme,
  rescheduleInterview,
  rescheduleInduction,
  
} = require("../controllers/cvController");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const { cvFileUpload, bulkUpload } = require("../config/CVmulterConfig");

// CV Creation with File Uploads
router.post("/addcv", verifyToken, cvFileUpload, createCV);


// Get CVs
router.get("/mycvs", verifyToken, getUserCVs);
router.get("/get-all-with-filtering", getAllCVsWithFiltering);
router.get("/current/approved", getApprovedCVs);
router.get("/not-approved-cvs", verifyToken, getAllNotApprovedCVs);
router.get("/user/:userId", getCVByUserId);
router.get("/user/:userId/all", getAllCVsByUserId);
router.get(
  "/approved-not-scheduled-cvs",
  verifyToken,
  getApprovedAndNotScheduledCVs
);

// CV Approval/Rejection
router.post("/:id/approve", verifyToken, approveCV);
router.post("/:id/decline", verifyToken, declineCV);

// Interview Routes
router.patch("/:id/schedule-interview", verifyToken, scheduleInterview);
router.post("/:id/pass-interview", verifyToken, passInterview);
router.post("/:id/fail-interview", verifyToken, failInterview);
router.get("/scheduled-interviews", verifyToken, getCVsAssignedToInterviews);
router.patch("/:id/reschedule-interview", verifyToken, rescheduleInterview);

// Induction Routes
router.patch("/:id/assign-induction", verifyToken, assignInduction);
router.get("/assign-cvs-for-induction", getInterviewPassedCVs);
router.get("/assigned-to-induction", getCVsAssignedToInduction);
router.patch("/:id/pass-induction", verifyToken, passInduction);
router.patch("/:id/fail-induction", verifyToken, failInduction);
router.patch("/:id/reschedule-induction", verifyToken, rescheduleInduction);


// CV routes for scheme assignment
router.get("/get-cvs-for-scheme-assignment", getCVsForSchemeAssignment);
router.post("/:id/assign-scheme", assignSchemeToCV);
router.post("/batch-assign-scheme", batchAssignScheme);

// Single CV Operations
router.get("/:id", getCVById);
router.put("/:id", verifyToken, cvFileUpload, updateCV);
router.delete("/:id", verifyToken, validateObjectId, softDeleteCV);

// Deleted CV Operations - FIXED ROUTES
router.get("/deleted/mycvs", verifyToken, getUserDeletedCVs);
router.get("/deleted/all", verifyToken, getDeletedCVs);
router.post("/deleted/:id/restore", verifyToken, restoreCV);
router.delete("/deleted/:id/permanent", verifyToken, permanentlyDeleteCV);

// NIC-based Lookup
router.get("/nic/:nic", getCVByNIC);

// Bulk CV Upload Route
router.post(
  "/bulk-upload",
  verifyToken,
  (req, res, next) => {
    if (req.user.userType !== "institute") {
      return res.status(403).json({
        message: "Only institutes are allowed to perform bulk uploads.",
      });
    }
    next();
  },
  bulkUpload,
  (err, req, res, next) => {
    // Error handling middleware for bulk upload
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum 10MB allowed.",
      });
    }
    if (err.code === "LIMIT_FILE_TYPE") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error",
        code: err.code,
      });
    }
    next(err);
  },
  bulkUploadCV
);

// Error Handling Middleware
router.use((err, req, res, next) => {
  console.error("Error handler:", err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
      code: err.code,
    });
  }

  // Handle other specific errors
  if (err.code === "LIMIT_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      message: err.message || "Invalid file type",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum 5MB allowed.",
    });
  }

  // Generic error handler
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
  
  router.get(
  '/user/:userId/all',
  authMiddleware,
  cvController.getAllCVsForInstitute
);

});



module.exports = router;