const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  district_name: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  population: {
    type: Number,
    required: true,
  },
  area_km2: {
    type: Number,
    required: true,
  },
  major_cities: {
    type: [String],
    required: true,
  },
  postal_code: {
    type: String,
    required: true,
  }
});

const District = mongoose.model('District', districtSchema);
module.exports = District;
