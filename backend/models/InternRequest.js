const mongoose = require('mongoose');

const internRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internType: { type: String, required: true },
  district: { type: String, required: true },
  scheme: { type: String, required: true },
  requiredInterns: { type: Number, required: true },
  justification: { type: String, required: true },
  periodFrom: { type: Date, required: true },
  periodTo: { type: Date, required: true },
  workScope: { type: String, required: true },
  proposedInternNIC: { type: String, default: '' },
  note: { type: String, default: '' }, 
  category: { type: String, required: true },
  adminApproved: { type: String, enum: ['Pending', 'Yes', 'No'], default: 'Pending' }, 
  internAssignedCount: { type: Number, default: 0 }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InternRequest', internRequestSchema);
