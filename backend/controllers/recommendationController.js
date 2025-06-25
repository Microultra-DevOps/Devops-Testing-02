const Recommendation = require('../models/Recommendation');
const { updateStats } = require("../controllers/statsController");

// Create a new recommendation
const createRecommendation = async (req, res) => {
  const { userId, rating } = req.body;

  // Validate that the rating is a percentage between 0 and 100
  if (rating < 0 || rating > 100) {
    return res.status(400).json({ message: 'Rating must be a percentage between 0 and 100.' });
  }

  try {
    const recommendation = new Recommendation({ userId, rating });
    await recommendation.save();
    
    // Update stats after creating a recommendation
    await updateStats({ registeredUsers: 0 }); // Adjust registered users if needed

    res.status(201).json({ message: 'Recommendation created successfully!', recommendation });
  } catch (error) {
    res.status(400).json({ message: 'Error creating recommendation', error: error.message });
  }
};

// Get all recommendations for a user
const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user.id; 
    const recommendations = await Recommendation.find({ userId }); 

    if (!recommendations.length) {
      return res.status(404).json({ message: 'No recommendations found for this user.' });
    }

    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  createRecommendation,
  getUserRecommendations,
};
