const Certificate = require('../models/Certificate');

exports.createCertificate = async (req, res) => {
  try {
    const certificateData = req.body;
    const newCertificate = new Certificate(certificateData);
    await newCertificate.save();
    res.status(201).json({ message: 'Certificate created successfully!', certificate: newCertificate });
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred while creating the certificate.' });
  }
};

// Get all certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred while fetching certificates.' });
  }
};

exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.status(200).json(certificate);
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred while fetching the certificate.' });
  }
};

// Update certificate by ID
exports.updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    const updatedCertificate = await Certificate.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      message: 'Certificate updated successfully!', 
      certificate: updatedCertificate 
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'An error occurred while updating the certificate.' 
    });
  }
};

// Delete certificate by ID
exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    await Certificate.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: 'Certificate deleted successfully!' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'An error occurred while deleting the certificate.' 
    });
  }
};

