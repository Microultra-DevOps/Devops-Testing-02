const express = require("express");
const { 
  getAllStaff, 
  addStaff, 
  getStaffById, 
  getStaffByUserId,
  updateStaff, 
  deleteStaff 
} = require("../controllers/staffController");
const router = express.Router();

router.get("/", getAllStaff);
router.post("/", addStaff);
router.get("/:id", getStaffById);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);
router.get("/user/:userId", getStaffByUserId);

module.exports = router;