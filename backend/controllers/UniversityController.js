const University = require("../models/University");
const User = require("../models/User");

// Get all Universities
const getUniversities = async (req, res) => {
  try {
    const universities = await University.find();
    if (!universities.length) {
      return res.status(404).json({ message: "No universities found" });
    }
    res.json(universities);
  } catch (error) {
    console.error("Error fetching universities:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get University by ID
const getUniversityById = async (req, res) => {
  const { universityId } = req.params;
  try {
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    res.json(university);
  } catch (error) {
    console.error("Error fetching university:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update (Edit) University Details
const updateUniversity = async (req, res) => {
  const { universityId } = req.params;
  const updates = req.body; // Contains updated fields

  try {
    const university = await University.findByIdAndUpdate(
      universityId,
      updates,
      { new: true, runValidators: true } // Return updated doc & validate inputs
    );

    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    res.json({ message: "University updated successfully", university });
  } catch (error) {
    console.error("Error updating university:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve a University
const approveUniversity = async (req, res) => {
  const { universityId } = req.params;
  try {
    const university = await University.findByIdAndUpdate(
      universityId,
      { approveRequest: true },
      { new: true }
    );
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    
    const user = await User.findOneAndUpdate(
      { email: university.email },
      { approveRequest: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "University and associated user approved", university, user });
  } catch (error) {
    console.error("Error approving university:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a University
const deleteUniversity = async (req, res) => {
  const { universityId } = req.params;
  try {
    const university = await University.findByIdAndDelete(universityId);
    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }
    res.json({ message: "University deleted" });
  } catch (error) {
    console.error("Error deleting university:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUniversities, getUniversityById, updateUniversity, approveUniversity, deleteUniversity };
