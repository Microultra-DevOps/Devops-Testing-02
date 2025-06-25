const express = require("express");
const router = express.Router();
const instituteController = require("../controllers/instituteController");

// Add a new institute
router.post("/add", instituteController.addInstitute);

// Get all institutes
router.get("/", instituteController.getAllInstitutes);

// Get institute by ID
router.get("/:id", instituteController.getInstituteById);

module.exports = router;
