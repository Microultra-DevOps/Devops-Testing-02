const Induction = require('../models/Induction');

exports.addInduction = async (req, res) => {
  try {
    const { induction, startDate, endDate, location, note } = req.body;

    if (!induction || !startDate || !endDate || !location) {
      return res.status(400).json({ message: 'Induction, Start Date, End Date, and Location are required fields' });
    }

    const newInduction = new Induction({ induction, startDate, endDate, location, note });
    const savedInduction = await newInduction.save();
    res.status(201).json(savedInduction);
  } catch (error) {
    res.status(500).json({ message: 'Error adding induction', error: error.message });
  }
};

exports.getAllInductions = async (req, res) => {
  try {
    const inductions = await Induction.find();
    res.status(200).json(inductions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inductions', details: error.message });
  }
};

exports.getInductionById = async (req, res) => {
  try {
    const induction = await Induction.findById(req.params.id);
    if (!induction) return res.status(404).json({ error: 'Induction not found' });
    res.status(200).json(induction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch induction', details: error.message });
  }
};

exports.updateInduction = async (req, res) => {
  try {
    const induction = await Induction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!induction) return res.status(404).json({ error: 'Induction not found' });
    res.status(200).json({ message: 'Induction updated successfully', induction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update induction', details: error.message });
  }
};

exports.deleteInduction = async (req, res) => {
  try {
    const induction = await Induction.findByIdAndDelete(req.params.id);
    if (!induction) return res.status(404).json({ error: 'Induction not found' });
    res.status(200).json({ message: 'Induction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete induction', details: error.message });
  }
};
