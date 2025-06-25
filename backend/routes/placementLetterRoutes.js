const express = require("express");
const router = express.Router();
const {
  upload,
  savePDF,
  generateLetterID,
  getPlacementLetters,
  getPlacementLetterById,
  downloadPDF,
  deletePlacementLetter,
  archivePlacementLetter,
  searchByNIC
} = require("../controllers/PlacementLetterController");

const authMiddleware = require("../middleware/authMiddleware");

// Generate unique letter ID
router.get("/generate-id", authMiddleware, generateLetterID);

// Save PDF with auto-generated ID if needed
router.post("/save-pdf", authMiddleware, upload.single('pdf'), savePDF);

// Get all placement letters
router.get("/", authMiddleware, getPlacementLetters);

// Search placement letters by NIC
router.get("/search", authMiddleware, searchByNIC);

// Get placement letter by ID
router.get("/:letterId", authMiddleware, getPlacementLetterById);

// Download placement letter PDF
router.get("/:letterId/download", authMiddleware, downloadPDF);

// Archive placement letter
router.put("/:letterId/archive", authMiddleware, archivePlacementLetter);

// Delete placement letter
router.delete("/:letterId", authMiddleware, deletePlacementLetter);

module.exports = router;