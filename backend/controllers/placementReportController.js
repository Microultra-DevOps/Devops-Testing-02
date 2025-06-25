const PlacementReport = require("../models/PlacementReport");

// Create a new placement report
const createPlacementReport = async (req, res) => {
  try {
    const {
      internId,
      fullName,
      nic,
      startDate,
      endDate,
      supervisorName,
      status,
      reportCategory,
      note,
    } = req.body;

    if (!internId || !fullName || !nic || !startDate || !endDate || !supervisorName || !status || !reportCategory) {
      return res.status(400).json({ message: "All required fields must be filled!" });
    }

    const newReport = new PlacementReport({
      internId,
      fullName,
      nic,
      startDate,
      endDate,
      supervisorName,
      status,
      reportCategory,
      note,
    });

    await newReport.save();

    return res.status(201).json({
      message: "Internship placement report created successfully!",
      report: newReport,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createPlacementReport,
};
