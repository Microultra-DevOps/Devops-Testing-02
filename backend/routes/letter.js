const express = require('express');
const LetterController = require('../controllers/letterController');  

const router = express.Router();

router.post('/', LetterController.createLetter);
router.get('/', LetterController.getAllLetters);
router.get('/:id', LetterController.getLetterById);
router.put('/:id', LetterController.updateLetter);
router.delete('/:id', LetterController.deleteLetter);

module.exports = router;