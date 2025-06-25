const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2'); 

const PlacementLetterSchema = new mongoose.Schema(
  {
    letterId: {
      type: String,
      required: true,
      unique: true
    },
    letterType: {
      type: String,
      default: 'placement'
    },
    nicValue: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    letterData: {
      letterName: String,
      label1: String,
      label2: String,
      label3: String,
      label4: String,
      label5: String,
      label6: String,
      label7: String,
      label8: String,
      label9: String,
      label10: String,
      label11: String,
      label12: String,
      label13: String,
      label14: String,
      label15: String,
      label16: String,
      label17: String,
      label18: String,
      label19: String,
      label20: String,
      label21: String,
      label22: String,
      label23: String,
      label24: String,
      label26: String,
      label28: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active'
    }
  },
  { timestamps: true }
);

PlacementLetterSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("PlacementLetter", PlacementLetterSchema);