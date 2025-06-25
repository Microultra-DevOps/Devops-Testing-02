const Staff = require("../models/Staff");

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.addStaff = async (req, res) => {
  const { name, staffId, jobPosition, userId } = req.body;
  
  // Validate required fields
  if (!name || !staffId || !jobPosition) {
    return res.status(400).json({ message: "Name, Staff ID, and Job Position are required" });
  }

  try {
    // Check if staff ID already exists
    const existingStaff = await Staff.findOne({ staffId });
    if (existingStaff) {
      return res.status(400).json({ message: "Staff ID already exists" });
    }

    // Create new staff with optional userId
    const newStaff = new Staff({ 
      name, 
      staffId, 
      jobPosition,
      userId: userId || null // Add userId if provided
    });
    
    await newStaff.save();
    res.status(201).json({ 
      message: "Staff added successfully", 
      staff: newStaff 
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding staff", error: error.message });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getStaffByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const staff = await Staff.find({ userId });
    
    if (!staff || staff.length === 0) {
      return res.status(404).json({ message: "No staff found for this user" });
    }
    
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { name, staffId, jobPosition } = req.body;
    
    // If updating staffId, check if it already exists for another staff
    if (staffId) {
      const existingStaff = await Staff.findOne({ 
        staffId, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingStaff) {
        return res.status(400).json({ message: "Staff ID already exists" });
      }
    }
    
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    
    res.status(200).json(updatedStaff);
  } catch (error) {
    res.status(500).json({ message: "Error updating staff", error: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting staff", error: error.message });
  }
};