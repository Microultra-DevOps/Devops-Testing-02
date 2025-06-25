const Stats = require("../models/Stats");
const Recommendation = require('../models/Recommendation'); // Import Recommendation model

// Get stats
const getStats = async (req, res) => {
  try {
    let stats = await Stats.findOne();
    if (!stats) {
      stats = new Stats();
      await stats.save();
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// Increase visitor count when someone visits the page
const incrementVisitorCount = async (req, res) => {
  try {
    let stats = await Stats.findOne();
    if (!stats) {
      stats = new Stats();
    }
    stats.visitorCount += 1;
    await stats.save();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error updating visitor count" });
  }
};

// Update registered users or recommendation percentage
const updateStats = async (data) => {
  try {
    let stats = await Stats.findOne();
    if (!stats) {
      stats = new Stats();
    }

    // Increment registered users by the provided value
    if (data.registeredUsers) {
      stats.registeredUsers += data.registeredUsers; 
    }

    // Calculate average recommendation percentage
    const recommendations = await Recommendation.find(); // Fetch all recommendations
    if (recommendations.length > 0) {
      const totalRating = recommendations.reduce((sum, rec) => sum + rec.rating, 0);
      stats.recommendationPercentage = Math.round(totalRating / recommendations.length); // Calculate and round average
    } else {
      stats.recommendationPercentage = 0; // Set to 0 if no recommendations
    }

    await stats.save();
  } catch (error) {
    console.error("Error updating stats:", error.message);
  }
};

module.exports = { getStats, incrementVisitorCount, updateStats };
