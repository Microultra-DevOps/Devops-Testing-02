const express = require("express");
const router = express.Router();
const {
  getAllRotationalCVs,
  getPendingRotationalCVs,
  getAssignedCVs,
  assignCVsToStation,
  getUnassignedRotationalCVs,
  checkAssignedCVs,
  getStationAnalytics,
  getCVAssignmentHistory,
  reassignCVToNewStation,
  removeFromStation,
  getCVsForStation,
  assignCVsToMultipleStations,
  getAllStations
} = require("../controllers/rotationalController");

// Rotational CVs
router.post("/assign-to-multiple-stations", assignCVsToMultipleStations);
router.get("/all-rotational", getAllRotationalCVs);
router.get("/pending-rotational", getPendingRotationalCVs);
router.get("/assigned-rotational", getAssignedCVs);
router.post("/assign-to-station", assignCVsToStation);
router.get("/unassigned-rotational", getUnassignedRotationalCVs);
router.get("/check-assigned", checkAssignedCVs);
router.get("/analytics", getStationAnalytics);
// In your routes file
router.get("/get-cvs/:stationId", getCVsForStation);
router.get("/assignment-history/:cvId", getCVAssignmentHistory);
router.post("/reassign-cv", reassignCVToNewStation);
router.delete("/remove-from-station/:cvId", removeFromStation);
router.get("/stations", getAllStations);

module.exports = router;
