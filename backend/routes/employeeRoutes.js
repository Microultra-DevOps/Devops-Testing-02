const express = require("express");
const multer = require('multer');
const {
  getAllEmployees,
  getEmployeeById,
  getOrganizationHierarchy,
  updateEmployee
} = require("../controllers/employeeController");
const employeeController = require('../controllers/employeeController');

const router = express.Router();


const upload = multer({ dest: 'uploads/' });


// Organization hierarchy route (most specific first)
router.get("/hierarchy", getOrganizationHierarchy);

// ID-based routes - handles both numeric IDs and ObjectIds
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);

// Main listing route (least specific, should be last)
router.get("/", getAllEmployees);





router.post('/add', employeeController.addEmployee);
router.post('/upload', upload.single('file'), employeeController.uploadEmployees);
router.get('/', employeeController.getAllEmployees);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;