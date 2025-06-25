const express = require('express');
const { createRecommendation, getUserRecommendations } = require('../controllers/recommendationController');

const router = express.Router();

// Create a recommendation
router.post('/', createRecommendation);

// Get recommendations for the currently authenticated user
router.get('/', getUserRecommendations); 

module.exports = router;
