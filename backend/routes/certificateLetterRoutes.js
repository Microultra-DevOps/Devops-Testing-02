const express = require('express');
const CertificateLetterController = require('../controllers/CertificateLetterController');  

const router = express.Router();

router.post('/', CertificateLetterController.createLetter);
router.get('/', CertificateLetterController.getAllLetters);
router.get('/:id', CertificateLetterController.getLetterById);
router.put('/:id', CertificateLetterController.updateLetter);
router.delete('/:id', CertificateLetterController.deleteLetter);

module.exports = router; 