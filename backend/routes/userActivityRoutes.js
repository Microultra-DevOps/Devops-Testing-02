/* const express = require("express");
const router = express.Router();
const {
  getLoginHistory,
  getLoginDevices,
  getPasswordHistory,
  revokeDeviceAccess
} = require("../controllers/userActivityController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

router.get("/login-history", getLoginHistory);
router.get("/login-devices", getLoginDevices);
router.get("/password-history", getPasswordHistory);
router.post("/revoke-device/:deviceId", revokeDeviceAccess);

module.exports = router; */