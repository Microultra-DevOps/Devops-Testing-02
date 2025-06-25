const mongoose = require("mongoose");
const Intern = require("../models/Intern"); 
const Scheme = require("../models/Scheme"); 
const User = require("../models/User");

// Get all interns
const getAllInterns = async (req, res) => {
  try {
    const interns = await Intern.find();
    res.status(200).json(interns);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interns", error: error.message });
  }
};

// Get intern by ID
const getInternById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid intern ID format" });
    }

    const intern = await Intern.findById(id);
    if (!intern) {
      return res.status(404).json({ message: "Intern not found" });
    }

    res.status(200).json(intern);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch intern", error: error.message });
  }
};

// Update intern by ID
const updateIntern = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid intern ID format" });
    }

    // Get the current intern data before update
    const currentIntern = await Intern.findById(id).session(session);
    if (!currentIntern) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Intern not found" });
    }

    // Check if the scheme is being changed
    if (updates.schemeId && updates.schemeId !== currentIntern.schemeId?.toString()) {
      // Decrement count from old scheme if it exists
      if (currentIntern.schemeId && mongoose.Types.ObjectId.isValid(currentIntern.schemeId)) {
        const oldScheme = await Scheme.findById(currentIntern.schemeId).session(session);
        if (oldScheme) {
          oldScheme.totalAllocatedCount = Math.max(0, oldScheme.totalAllocatedCount - 1);
          await oldScheme.save({ session });
        }
      }

      // Increment count for new scheme if valid
      if (mongoose.Types.ObjectId.isValid(updates.schemeId)) {
        const newScheme = await Scheme.findById(updates.schemeId).session(session);
        if (!newScheme) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ message: "New scheme not found" });
        }

        // Check if the scheme has space available
        if (newScheme.totalAllocatedCount >= newScheme.totalAllocation) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: "New scheme has reached its maximum allocation" });
        }

        newScheme.totalAllocatedCount += 1;
        await newScheme.save({ session });
      }
    }

    // Update the intern document
    const updatedIntern = await Intern.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      session
    });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Intern updated successfully", intern: updatedIntern });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(500).json({ message: "Failed to update intern", error: error.message });
  }
};

// Delete intern by ID
const deleteIntern = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid intern ID format" });
    }

    const intern = await Intern.findById(id).session(session);
    if (!intern) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Intern not found" });
    }

    // If intern is assigned to a scheme, decrement the scheme's allocated count
    if (intern.schemeId && mongoose.Types.ObjectId.isValid(intern.schemeId)) {
      const scheme = await Scheme.findById(intern.schemeId).session(session);
      if (scheme) {
        scheme.totalAllocatedCount = Math.max(0, scheme.totalAllocatedCount - 1);
        await scheme.save({ session });
      }
    }

    // Delete the intern
    const deletedIntern = await Intern.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Intern deleted successfully", intern: deletedIntern });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(500).json({ message: "Failed to delete intern", error: error.message });
  }
};

const assignScheme = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { schemeId, managerId, internshipPeriod, startDate, forRequest } = req.body;

    // Validate the intern ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid intern ID format" });
    }

    // Validate required fields
    if (!schemeId || !managerId || !internshipPeriod || !startDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if intern is already assigned to a scheme
    const existingIntern = await Intern.findById(id).session(session);
    if (!existingIntern) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Intern not found" });
    }

    // If already assigned to a scheme, decrement the count from previous scheme
    if (existingIntern.schemeId && mongoose.Types.ObjectId.isValid(existingIntern.schemeId)) {
      const prevScheme = await Scheme.findById(existingIntern.schemeId).session(session);
      if (prevScheme) {
        prevScheme.totalAllocatedCount = Math.max(0, prevScheme.totalAllocatedCount - 1);
        await prevScheme.save({ session });
      }
    }

    // Find the new scheme and check if there's space available
    const scheme = await Scheme.findById(schemeId).session(session);
    if (!scheme) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Scheme not found" });
    }

    // Check if the scheme has space available
    if (scheme.totalAllocatedCount >= scheme.totalAllocation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Scheme has reached its maximum allocation" });
    }

    // Update the scheme's allocated count
    scheme.totalAllocatedCount += 1;
    await scheme.save({ session });

    // Update the intern document
    const updatedIntern = await Intern.findByIdAndUpdate(
      id,
      {
        schemeId,
        managerId,
        internshipPeriod,
        schemeStartDate: new Date(startDate),
        forRequest,
        cvStatus: "assigned",
        schemeApproved: true,
        schemeAssignedDate: new Date(),
      },
      { new: true, runValidators: true, session }
    );

    // Also update the corresponding user document
    await User.findOneAndUpdate(
      { _id: updatedIntern.userId },
      { cvStatus: "assigned" },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Scheme assigned successfully",
      intern: updatedIntern,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(500).json({
      message: "Failed to assign scheme",
      error: error.message,
    });
  }
};

const getInternByNic = async (req, res) => {
  try {
    const { nic } = req.params;

    if (!nic) {
      return res.status(400).json({ message: "NIC parameter is required" });
    }

    const intern = await Intern.findOne({ nic: nic });
    if (!intern) {
      return res.status(404).json({ message: "Intern not found with the provided NIC" });
    }

    // Get additional information if scheme and manager IDs are available
    let schemeName = null;
    let managerName = null;

    if (intern.schemeId && mongoose.Types.ObjectId.isValid(intern.schemeId)) {
      const scheme = await Scheme.findById(intern.schemeId);
      if (scheme) {
        schemeName = scheme.name;
      }
    }

    if (intern.managerId && mongoose.Types.ObjectId.isValid(intern.managerId)) {
      const manager = await Manager.findById(intern.managerId);
      if (manager) {
        managerName = manager.fullName;
      }
    }

    // Create a response object with all the intern data plus the additional info
    const internData = {
      ...intern.toObject(),
      schemeName,
      managerName
    };

    res.status(200).json(internData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch intern", error: error.message });
  }
};

module.exports = {
  getAllInterns,
  getInternById,
  updateIntern,
  deleteIntern,
  assignScheme,
  getInternByNic
};