const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  staffId: { type: String, required: true, unique: true },
  jobPosition: {
    type: String,
    enum: ["General Manager", "Deputy General Manager", "Supervisor", "Staff"],
    required: true,
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Staff = mongoose.model("Staff", staffSchema);
module.exports = Staff;