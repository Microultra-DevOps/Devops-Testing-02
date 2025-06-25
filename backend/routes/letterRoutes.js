// routes/letterRoutes.js
const express = require('express');
const router = express.Router();
const acceptanceLetterController = require('../controllers/acceptanceLetterController');

router.post('/generate-acceptance', acceptanceLetterController.generateAcceptanceLetter);
router.get('/download/:nic', acceptanceLetterController.downloadAcceptanceLetter);

module.exports = router;