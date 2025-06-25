const express = require('express');
const schemeController = require('../controllers/schemeController');

const router = express.Router();

// Basic CRUD operations
router.post('/', schemeController.createScheme);
router.get('/', schemeController.getAllSchemes);
router.get('/:id', schemeController.getSchemeById);
router.put('/:id', schemeController.updateScheme);
router.delete('/:id', schemeController.deleteScheme);

// Manager assignment operations
router.put('/:id/assign-managers', schemeController.assignManagers);
router.get('/:id/managers', schemeController.getSchemeManagers);
router.put('/:id/remove-manager', schemeController.removeManager);

// Allocation and statistics
router.post('/:id/recalculate', schemeController.recalculateAllocation);
router.get('/:id/stats', schemeController.getSchemeStats);

module.exports = router;