const express = require("express");
const router = express.Router();
const { 
  getUniversities, 
  getUniversityById, 
  updateUniversity, 
  approveUniversity, 
  deleteUniversity 
} = require("../controllers/UniversityController");

const authMiddleware = require("../middleware/authMiddleware");

// Get universities - Protected Route
router.get("/", authMiddleware, getUniversities);

// Get university by ID - Protected Route
router.get("/:universityId", authMiddleware, getUniversityById);

// Update (Edit) university details - Protected Route
router.put("/:universityId", authMiddleware, updateUniversity);

// Approve university - Protected Route
router.put("/:universityId/approve", authMiddleware, approveUniversity);

// Delete university - Protected Route
router.delete("/:universityId", authMiddleware, deleteUniversity);

module.exports = router;
