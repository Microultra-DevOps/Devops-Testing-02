const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
   certificateName: { type: String, required: true },
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
  label14: { type: String, required: true },
  label15: { type: String, required: true },
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;