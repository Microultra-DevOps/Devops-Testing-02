const InternRequest = require('../models/InternRequest');

// Create a new intern request
exports.createInternRequest = async (req, res) => {
  try {
    const { userId } = req;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing in token.' });
    }

    const internRequestData = { ...req.body, userId };
    const newInternRequest = new InternRequest(internRequestData);

    await newInternRequest.save();

    res.status(201).json({
      message: 'Intern Request Created Successfully!',
      data: newInternRequest
    });
  } catch (error) {
    console.error('Error creating intern request:', error);
    res.status(500).json({
      message: 'Error creating intern request',
      error: error.message
    });
  }
};


exports.getUserInternRequests = async (req, res) => {
    try {
      const { userId } = req;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is missing in token.' });
      }
  
      const internRequests = await InternRequest.find({ userId });
  
      res.status(200).json(internRequests);
    } catch (error) {
      console.error('Error fetching user intern requests:', error);
      res.status(500).json({
        message: 'Error fetching user intern requests',
        error: error.message
      });
    }
  };

  exports.deleteInternRequest = async (req, res) => {
    try {
      const { userId } = req;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is missing in token.' });
      }
  
      // Find the intern request and ensure it belongs to the current user
      const internRequest = await InternRequest.findOne({ _id: id, userId });
      
      if (!internRequest) {
        return res.status(404).json({ message: 'Intern request not found or you do not have permission to delete it.' });
      }
  
      await InternRequest.findByIdAndDelete(id);
  
      res.status(200).json({ message: 'Intern request deleted successfully' });
    } catch (error) {
      console.error('Error deleting intern request:', error);
      res.status(500).json({
        message: 'Error deleting intern request',
        error: error.message
      });
    }
  };


  exports.getInternRequestById = async (req, res) => {
    try {
      const { userId } = req;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is missing in token.' });
      }
  
      // Find the intern request and ensure it belongs to the current user
      const internRequest = await InternRequest.findOne({ _id: id, userId });
      
      if (!internRequest) {
        return res.status(404).json({ message: 'Intern request not found or you do not have permission to view it.' });
      }
  
      res.status(200).json(internRequest);
    } catch (error) {
      console.error('Error fetching intern request:', error);
      res.status(500).json({
        message: 'Error fetching intern request',
        error: error.message
      });
    }
  };


  exports.updateInternRequest = async (req, res) => {
    try {
      const { userId } = req;
      const { id } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is missing in token.' });
      }
  
      // Find the intern request and ensure it belongs to the current user
      const internRequest = await InternRequest.findOne({ _id: id, userId });
      
      if (!internRequest) {
        return res.status(404).json({ message: 'Intern request not found or you do not have permission to update it.' });
      }
  
      // Check if the request is already approved or rejected
      if (internRequest.adminApproved !== 'Pending') {
        return res.status(400).json({ 
          message: 'Cannot update intern request that has already been approved or rejected.' 
        });
      }
  
      // Update the intern request with the new data
      const updatedData = {
        internType: req.body.internType,
        district: req.body.district,
        scheme: req.body.scheme,
        requiredInterns: req.body.requiredInterns,
        justification: req.body.justification,
        periodFrom: req.body.periodFrom,
        periodTo: req.body.periodTo,
        workScope: req.body.workScope,
        proposedInternNIC: req.body.proposedInternNIC,
        category: req.body.category,
        note: req.body.note
      };
  
      const updatedInternRequest = await InternRequest.findByIdAndUpdate(
        id,
        updatedData,
        { new: true, runValidators: true }
      );
  
      res.status(200).json({
        message: 'Intern request updated successfully',
        data: updatedInternRequest
      });
    } catch (error) {
      console.error('Error updating intern request:', error);
      res.status(500).json({
        message: 'Error updating intern request',
        error: error.message
      });
    }
  };

  // Approve an intern request
exports.approveInternRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the intern request by ID
    const internRequest = await InternRequest.findById(id);

    if (!internRequest) {
      return res.status(404).json({ message: 'Intern request not found.' });
    }

    // Check if the request is already approved or declined
    if (internRequest.adminApproved !== 'Pending') {
      return res.status(400).json({ 
        message: 'This request has already been approved or declined.' 
      });
    }

    // Update the adminApproved field to 'Yes'
    internRequest.adminApproved = 'Yes';
    await internRequest.save();

    res.status(200).json({ 
      message: 'Intern request approved successfully', 
      data: internRequest 
    });
  } catch (error) {
    console.error('Error approving intern request:', error);
    res.status(500).json({ 
      message: 'Error approving intern request', 
      error: error.message 
    });
  }
};

// Decline an intern request
exports.declineInternRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the intern request by ID
    const internRequest = await InternRequest.findById(id);

    if (!internRequest) {
      return res.status(404).json({ message: 'Intern request not found.' });
    }

    // Check if the request is already approved or declined
    if (internRequest.adminApproved !== 'Pending') {
      return res.status(400).json({ 
        message: 'This request has already been approved or declined.' 
      });
    }

    // Update the adminApproved field to 'No'
    internRequest.adminApproved = 'No';
    await internRequest.save();

    res.status(200).json({ 
      message: 'Intern request declined successfully', 
      data: internRequest 
    });
  } catch (error) {
    console.error('Error declining intern request:', error);
    res.status(500).json({ 
      message: 'Error declining intern request', 
      error: error.message 
    });
  }
};


// Get all intern requests (for admin/staff)
exports.getAllInternRequests = async (req, res) => {
  try {
    // Fetch all intern requests from the database
    const internRequests = await InternRequest.find();

    res.status(200).json(internRequests);
  } catch (error) {
    console.error('Error fetching all intern requests:', error);
    res.status(500).json({
      message: 'Error fetching all intern requests',
      error: error.message
    });
  }
};