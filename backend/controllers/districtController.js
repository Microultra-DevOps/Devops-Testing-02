const District = require('../models/District');

// Get all districts
exports.getAllDistricts = async (req, res) => {
  try {
    const districts = await District.find();
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a district by ID
exports.getDistrictById = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.json(district);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new district
exports.addDistrict = async (req, res) => {
  const { district_name, province, population, area_km2, major_cities, postal_code } = req.body;

  if (!district_name || !province || !population || !area_km2 || !major_cities || !postal_code) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const district = new District({ district_name, province, population, area_km2, major_cities, postal_code });

  try {
    const newDistrict = await district.save();
    res.status(201).json(newDistrict);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a district by ID
exports.updateDistrictById = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }

    district.district_name = req.body.district_name || district.district_name;
    district.province = req.body.province || district.province;
    district.population = req.body.population || district.population;
    district.area_km2 = req.body.area_km2 || district.area_km2;
    district.major_cities = req.body.major_cities || district.major_cities;
    district.postal_code = req.body.postal_code || district.postal_code;

    const updatedDistrict = await district.save();
    res.json(updatedDistrict);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a district by ID
exports.deleteDistrictById = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }

    await district.remove();
    res.json({ message: 'District deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
