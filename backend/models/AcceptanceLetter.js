// models/AcceptanceLetter.js
const mongoose = require('mongoose');

const AcceptanceLetterSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    institute: { type: String, required: true },
    programName: { type: String, required: true },
    duration: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    managerName: { type: String }, 
    managerPosition: { type: String, required: true },
    department: { type: String, required: true },
    letterRef: { type: String, required: true },
    internPosition: { type: String, required: true },
    nic: { type: String, required: true }
  });
  

module.exports = mongoose.model('AcceptanceLetter', AcceptanceLetterSchema);