const Institute = require('../models/Institute');

// Add a new institute
exports.addInstitute = async (req, res) => {
  try {
    const { name, type } = req.body;
    const newInstitute = new Institute({
      name,
      type,
    });

    await newInstitute.save();
    res.status(201).json({ message: 'Institute added successfully', institute: newInstitute });
  } catch (error) {
    res.status(500).json({ message: 'Error adding institute', error: error.message });
  }
};

// Get all institutes
exports.getAllInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find({}, 'name type'); // Only fetch name and type fields
    res.status(200).json({ institutes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching institutes', error: error.message });
  }
};

// Get institute by ID
exports.getInstituteById = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id, 'name type'); // Only fetch name and type fields
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }
    res.status(200).json({ institute });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching institute', error: error.message });
  }
};
