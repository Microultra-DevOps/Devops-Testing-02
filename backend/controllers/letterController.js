const Letter = require('../models/Letter');

exports.createLetter = async (req, res) => {
  try {
    const letterData = req.body;
    const newLetter = new Letter(letterData);
    await newLetter.save();
    res.status(201).json({ message: 'Placement Letter created successfully!', letter: newLetter });
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred while creating the placement letter.' });
  }
};

// Get all placement letters
exports.getAllLetters = async (req, res) => {
  try {
    const letters = await Letter.find();
    res.status(200).json(letters);
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred while fetching letters.' });
  }
};

exports.getLetterById = async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) {
      return res.status(404).json({ error: 'Placement Letter not found' });
    }
    res.status(200).json(letter);
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred while fetching the placement letter.' });
  }
};

// Update letter by ID
exports.updateLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const letter = await Letter.findById(id);
    if (!letter) {
      return res.status(404).json({ error: 'Placement Letter not found' });
    }
    
    const updatedLetter = await Letter.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ 
      message: 'Placement Letter updated successfully!', 
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
    
    const letter = await Letter.findById(id);
    if (!letter) {
      return res.status(404).json({ error: 'Placement Letter not found' });
    }
    
    await Letter.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: 'Placement Letter deleted successfully!' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'An error occurred while deleting the letter.' 
    });
  }
};

