const express = require('express');
const router = express.Router();
const { registerEmail } = require('../controllers/emailController');

router.post('/register', registerEmail);

module.exports = router;
