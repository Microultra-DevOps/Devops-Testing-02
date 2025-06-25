const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema({
  letterName: { type: String, required: true },
  label1: { type: String, required: true },
  label2: { type: String, required: true },
  label3: { type: String, required: true },
  label4: { type: String, required: true },
  label5: { type: String, required: true },
  label6: { type: String, required: true },
  label7: { type: String, required: true },
  label8: { type: String, required: true },
  label9: { type: String, required: true },
  label10: { type: String, required: true },
  label11: { type: String, required: true },
  label12: { type: String, required: true },
  label13: { type: String, required: true },
  label14: { type: String},
  label15: { type: String, required: true },
  label16: { type: String, required: true },
  label17: { type: String, required: true },
  label18: { type: String, required: true },
  label19: { type: String, required: true },
  label20: { type: String, required: true },
  label21: { type: String, required: true },
  label22: { type: String, required: true },
  label23: { type: String, required: true },
  label24: { type: String, required: true },
  label25: { type: String, required: true },
  label26: { type: String, required: true },
  label27: { type: String, required: true },
  label28: { type: String, required: true },
}, { timestamps: true });

const Letter = mongoose.model('Letter', letterSchema);

module.exports = Letter;