const express = require('express');
const CertificateController = require('../controllers/Certificate');  

const router = express.Router();

router.post('/', CertificateController.createCertificate);
router.get('/', CertificateController.getAllCertificates);
router.get('/:id', CertificateController.getCertificateById);
router.put('/:id', CertificateController.updateCertificate);
router.delete('/:id', CertificateController.deleteCertificate);

module.exports = router;