const express = require('express');
const router = express.Router();
const inductionController = require('../controllers/inductionController');

router.post('/', inductionController.addInduction);
router.get('/', inductionController.getAllInductions);
router.get('/:id', inductionController.getInductionById);
router.put('/:id', inductionController.updateInduction);
router.delete('/:id', inductionController.deleteInduction);

module.exports = router;
