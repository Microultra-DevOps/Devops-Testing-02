const express = require("express");
const router = express.Router();
const placementReportController = require("../controllers/placementReportController");

// Create Placement Report (POST)
router.post("/report", placementReportController.createPlacementReport);

module.exports = router;
