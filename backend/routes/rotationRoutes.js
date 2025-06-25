const express = require("express");
const router = express.Router();
const {
  fetchStudentAndSetDates,
  createStation,
  assignRotation,
  updateCurrentStation,
  fetchRotationProgress,
  fetchStations,
  fetchStudents, // Add this import
} = require("../controllers/RotationalStationController");

// Fetch all stations
router.get("/stations", fetchStations);

// Fetch student and set start/end dates
router.put("/student/:studentId/dates", async (req, res) => {
  const { startDate, endDate } = req.body;
  const { studentId } = req.params;

  try {
    const result = await fetchStudentAndSetDates(studentId, startDate, endDate);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new station
router.post("/stations", async (req, res) => {
  const { stationName, maxCapacity, duration } = req.body;

  try {
    const result = await createStation(stationName, maxCapacity, duration);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign rotation plan
router.post("/assign-rotation/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await assignRotation(studentId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update current station
router.put("/update-current-station/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await updateCurrentStation(studentId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch rotation progress
router.get("/progress/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await fetchRotationProgress(studentId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all students (names and IDs)
router.get("/students", fetchStudents);

module.exports = router;