const CertificateLetter = require('../models/CertificateLetter');

exports.createLetter = async (req, res) => {
  try {
    const letterData = req.body;
    const newLetter = new CertificateLetter(letterData);
    await newLetter.save();
    res.status(201).json({ message: 'Certificate Letter created successfully!', letter: newLetter });
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred while creating the certificate letter.' });
  }
};

// Get all letters
exports.getAllLetters = async (req, res) => {
  try {
    const letters = await CertificateLetter.find();
    res.status(200).json(letters);
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred while fetching letters.' });
  }
};

exports.getLetterById = async (req, res) => {
  try {
    const letter = await CertificateLetter.findById(req.params.id);
    if (!letter) {
      return res.status(404).json({ error: 'Certificate Letter not found' });
    }
    res.status(200).json(letter);
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred while fetching the certificate letter.' });
  }
};

// Update letter by ID
exports.updateLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const letter = await CertificateLetter.findById(id);
    if (!letter) {
      return res.status(404).json({ error: 'Certificate Letter not found' });
    }
    
    const updatedLetter = await CertificateLetter.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      message: 'Certificate Letter updated successfully!', 
      letter: updatedLetter
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'An error occurred while updating the letter.' 
    });
  }
};

// Delete letter by ID
exports.deleteLetter = async (req, res) => {
  try {
    const { id } = req.params;
    
    const letter = await CertificateLetter.findById(id);
    if (!letter) {
      return res.status(404).json({ error: 'Certificate Letter not found' });
    }
    
    await CertificateLetter.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: 'Certificate Letter deleted successfully!' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'An error occurred while deleting the letter.' 
    });
  }
};