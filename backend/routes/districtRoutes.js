const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');


router.get('/', districtController.getAllDistricts);
router.get('/:id', districtController.getDistrictById);
router.post('/', districtController.addDistrict);
router.put('/:id', districtController.updateDistrictById);
router.delete('/:id', districtController.deleteDistrictById);

module.exports = router;
