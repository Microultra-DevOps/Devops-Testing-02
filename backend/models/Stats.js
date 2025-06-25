const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
  visitorCount: { type: Number, default: 0 },
  registeredUsers: { type: Number, default: 0 },
  recommendationPercentage: { type: Number, default: 0 },
}, { timestamps: true });

const Stats = mongoose.model("Stats", statsSchema);
module.exports = Stats;
