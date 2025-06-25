const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  upload, 
  getInstitutes,
  changePassword,
  requestPasswordResetOTP,
  verifyOTPAndResetPassword,
  getUserProfileByNic,
  verifyEmail,
  getGoogleProfile
} = require("../controllers/authController");
const { passport, generateTokenAndRedirect } = require('../config/oauthStrategies');
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, upload.single("profileImage"), updateUserProfile);
router.get("/institutes", authMiddleware, getInstitutes);
router.put("/change-password", authMiddleware, changePassword);
router.get("/profile/:nic", authMiddleware, getUserProfileByNic);
router.post("/verify-email", verifyEmail);

// OTP-based password reset routes
router.post("/request-password-reset-otp", requestPasswordResetOTP);
router.post("/verify-otp-reset-password", verifyOTPAndResetPassword);

router.get("/google-profile", authMiddleware, getGoogleProfile);

// OAuth routes - Google only
router.get('/google', 
  (req, res, next) => {
    req.session = req.session || {};
    req.session.userType = 'individual';
    next();
  },
  passport.authenticate('google', { session: false })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
  }), 
  generateTokenAndRedirect
);


module.exports = router;