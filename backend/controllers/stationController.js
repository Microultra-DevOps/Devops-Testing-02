const Station = require("../models/Station");

// Create a new station
exports.createStation = async (req, res) => {
  try {
    const {
      stationName,
      displayName,
      priority,
      maxStudents,
      timePeriod,
      activeStatus,
    } = req.body;

    const newStation = new Station({
      stationName,
      displayName,
      priority,
      maxStudents,
      timePeriod, // Include timePeriod
      activeStatus,
    });

    await newStation.save();
    res.status(201).json({ message: "Station created successfully!" });
  } catch (error) {
    console.error("Error creating station:", error);
    res.status(500).json({ error: "Failed to create station" });
  }
};

// Get all stations
exports.getStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.status(200).json(stations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Get station by Id
exports.getStationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch only the required fields using projection
    const station = await Station.findById(id, {
      stationName: 1,
      displayName: 1,
      priority: 1,
      maxStudents: 1,
      activeStatus: 1,
      _id: 0, // Exclude the _id field from the response
    });

    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    res.status(200).json(station);
  } catch (error) {
    console.error("Error fetching station:", error);
    res.status(400).json({ error: error.message });
  }
};

// Update a station by ID
exports.updateStation = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedStation = await Station.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!updatedStation) {
      return res.status(404).json({ error: "Station not found" });
    }
    res.status(200).json(updatedStation);
  } catch (error) {
    console.error("Error updating station:", error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a station
exports.deleteStation = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStation = await Station.findByIdAndDelete(id);
    if (!deletedStation) {
      return res.status(404).json({ error: "Station not found" });
    }

    res.status(200).json({ message: "Station deleted successfully" });
  } catch (error) {
    console.error("Error deleting station:", error); // Debugging: Log the error
    res.status(400).json({ error: error.message });
  }
};

// Get CVs assigned to a station
exports.getCVsByStation = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await Station.findById(id).populate("currentStudents");
    res.status(200).json(station.currentStudents);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
