const express = require("express");
const {
  getAllInterns,
  getInternById,
  getInternByNic,
  updateIntern,
  deleteIntern,
  assignScheme,
} = require("../controllers/internController");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

// Apply middleware to all routes that need authentication
router.get("/", verifyToken, getAllInterns);
router.get("/:id", verifyToken, getInternById);
router.get("/details/:nic", verifyToken, getInternByNic); 
router.put("/:id", verifyToken, updateIntern);
router.delete("/:id", verifyToken, deleteIntern);
router.post("/:id/assign-scheme", verifyToken, assignScheme);

module.exports = router;