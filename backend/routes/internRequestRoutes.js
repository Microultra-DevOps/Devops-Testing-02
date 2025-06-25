const express = require('express');
const router = express.Router();
const internRequestController = require('../controllers/internRequestController');
const { verifyToken } = require('../middleware/verifyToken'); 

router.post('/intern-requests', verifyToken, internRequestController.createInternRequest);
router.get('/user-intern-requests', verifyToken, internRequestController.getUserInternRequests);
router.delete('/intern-requests/:id', verifyToken, internRequestController.deleteInternRequest);
router.get('/intern-requests/:id', verifyToken, internRequestController.getInternRequestById);
router.put('/intern-requests/:id', verifyToken, internRequestController.updateInternRequest);
router.put('/intern-requests/:id/approve', verifyToken, internRequestController.approveInternRequest);
router.put('/intern-requests/:id/decline', verifyToken, internRequestController.declineInternRequest);
router.get('/all-intern-requests', verifyToken, internRequestController.getAllInternRequests);

module.exports = router;
