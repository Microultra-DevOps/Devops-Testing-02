const express = require('express');
const interviewController = require('../controllers/interviewController');

const router = express.Router();

router.post('/', interviewController.createInterview);
router.get('/', interviewController.getAllInterviews);
router.get('/:id', interviewController.getInterviewById);
router.put('/:id', interviewController.updateInterview);
router.delete('/:id', interviewController.deleteInterview);

module.exports = router;
