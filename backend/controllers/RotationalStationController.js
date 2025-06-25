const University = require("../models/University");
const RotationalStation = require("../models/rotationRoutesStations");

// Assign rotation plan
const assignRotation = async (studentId) => {
  try {
    const student = await University.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    const internshipDurationWeeks = Math.ceil(
      (new Date(student.endDate) - new Date(student.startDate)) / (1000 * 60 * 60 * 24 * 7)
    );

    const stations = await RotationalStation.find();

    const assignments = [];
    for (const station of stations) {
      const duration = Math.floor(internshipDurationWeeks / stations.length); // Divide total weeks equally among stations
      if (station.currentCapacity < station.maxCapacity) {
        assignments.push({
          stationId: station._id,
          stationName: station.stationName,
          duration,
        });

        station.currentCapacity += 1;
        await station.save();
      }
    }

    student.rotationPlan = assignments;
    await student.save();

    return { message: "Rotation plan assigned successfully", rotationPlan: assignments };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to assign rotation plan");
  }
};

// Fetch intern progress
const fetchInternProgress = async (studentId) => {
  try {
    const student = await University.findById(studentId).populate("currentStation completedStations");
    if (!student) {
      throw new Error("Student not found");
    }

    return {
      startDate: student.startDate,
      endDate: student.endDate,
      currentStation: student.currentStation,
      completedStations: student.completedStations,
      rotationPlan: student.rotationPlan,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch intern progress");
  }
};

// Update internship duration (startDate and endDate)
const updateInternshipPeriod = async (studentId, startDate, endDate) => {
  try {
    const student = await University.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    student.startDate = new Date(startDate);
    student.endDate = new Date(endDate);
    await student.save();

    return { message: "Internship period updated successfully", startDate, endDate };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update internship period");
  }
};

// Update current station
const updateCurrentStation = async (studentId) => {
  try {
    const student = await University.findById(studentId).populate("rotationPlan.stationId");
    if (!student) {
      throw new Error("Student not found");
    }

    const nextStation = student.rotationPlan.find((station) => station.status === "assigned");

    if (!nextStation) {
      throw new Error("No more stations to assign");
    }

    student.currentStation = nextStation.stationId;
    nextStation.status = "completed";
    await student.save();

    return { message: "Current station updated successfully", currentStation: student.currentStation };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update current station");
  }
};

const fetchStudentAndSetDates = async (studentId, startDate, endDate) => {
  try {
    const student = await University.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    student.startDate = new Date(startDate);
    student.endDate = new Date(endDate);
    await student.save();

    return { message: "Student updated with start and end dates", student };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update student with start and end dates");
  }
};

const createStation = async (stationName, maxCapacity, duration) => {
  try {
    const newStation = new RotationalStation({
      stationName,
      maxCapacity,
      duration,
    });

    await newStation.save();

    return { message: "Station created successfully", station: newStation };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create station");
  }
};

const fetchRotationProgress = async (studentId) => {
  try {
    const student = await University.findById(studentId).populate("currentStation completedStations");
    if (!student) {
      throw new Error("Student not found");
    }

    const totalStations = student.rotationPlan.length;
    const completedStations = student.rotationPlan.filter((station) => station.status === "completed").length;

    return {
      message: "Rotation progress fetched successfully",
      progress: {
        totalStations,
        completedStations,
        remainingStations: totalStations - completedStations,
        currentStation: student.currentStation,
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch rotation progress");
  }
};

// Fetch all stations
const fetchStations = async (req, res) => {
  try {
    const stations = await RotationalStation.find();
    res.status(200).json(stations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stations" });
  }
};

// Fetch all students (names and IDs)
const fetchStudents = async (req, res) => {
  try {
    const students = await University.find({}, 'fullName _id');
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

module.exports = { 
  assignRotation, 
  fetchInternProgress, 
  updateInternshipPeriod, 
  updateCurrentStation, 
  fetchStudentAndSetDates, 
  createStation,
  fetchRotationProgress,
  fetchStations,
  fetchStudents
};