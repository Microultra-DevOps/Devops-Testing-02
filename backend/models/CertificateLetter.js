const mongoose = require('mongoose');

const CertificateLetterSchema = new mongoose.Schema({
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
}, { timestamps: true });

// Change the model name from 'Letter' to 'CertificateLetter'
const CertificateLetter = mongoose.model('CertificateLetter', CertificateLetterSchema);

module.exports = CertificateLetter;