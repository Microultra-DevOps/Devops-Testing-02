const User = require("../models/User");
const University = require("../models/University");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwt");
const EmailService = require('../services/registerEmailService');
const { updateStats } = require("../controllers/statsController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Temporary storage for pending registrations (use Redis in production)
const pendingRegistrations = new Map();

// Register a new user (Step 1: Initiate registration)
const registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      fullName,
      nameWithInitials,
      password,
      userType,
      postalAddress,
      contactNumber,
      nic,
      district,
      preferredLanguage,
      instituteContactNumber,
      instituteContactEmail,
      instituteName,
      department,
      instituteType,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ 
        message: "User with this email or username already exists" 
      });
    }

    // Generate verification code instead of token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store registration data temporarily
    pendingRegistrations.set(verificationCode, {
      userData: {
        username,
        email,
        fullName,
        nameWithInitials,
        password: hashedPassword,
        userType,
        postalAddress,
        contactNumber,
        nic,
        district,
        preferredLanguage,
        instituteContactNumber,
        instituteContactEmail,
        instituteName,
        department,
        instituteType
      },
      expiresAt
    });

    // Send verification email
    await EmailService.sendVerificationEmail(
      email, 
      username, 
      verificationCode
    );

    res.status(200).json({ 
      message: "Verification code sent. Please check your email to complete registration.",
      requiresVerification: true 
    });
  } catch (error) {
    console.error("Registration initiation error:", error);
    res.status(500).json({ message: "Registration initiation failed" });
  }
};

// Verify email and create account (Step 2)
const verifyEmail = async (req, res) => {
  try {
    const { verificationCode } = req.body;

    // Find pending registration
    const pendingRegistration = pendingRegistrations.get(verificationCode);
    if (!pendingRegistration) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Check if expired
    if (new Date() > pendingRegistration.expiresAt) {
      pendingRegistrations.delete(verificationCode);
      return res.status(400).json({ message: "Verification code has expired" });
    }

    const { userData } = pendingRegistration;

    // Create user object
    const user = new User({
      ...userData,
      isEmailVerified: true,
      approveRequest: userData.userType === "institute" ? false : undefined,
      cvStatus: "pending"
    });

    // Save user
    await user.save();

    // For institutes, save to University collection
    if (userData.userType === "institute") {
      const university = new University({
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        nameWithInitials: userData.nameWithInitials,
        password: userData.password,
        contactNumber: userData.contactNumber,
        nic: userData.nic,
        instituteName: userData.instituteName,
        instituteType: userData.instituteType,
        department: userData.department,
        instituteContactNumber: userData.instituteContactNumber,
        instituteContactEmail: userData.instituteContactEmail,
        district: userData.district,
        approveRequest: false,
      });
      await university.save();
    }

    // Send welcome email based on user type
    try {
      if (userData.userType === "individual") {
        await EmailService.sendIndividualRegistrationEmail(userData.email, userData.username);
      } else if (userData.userType === "institute") {
        await EmailService.sendInstituteRegistrationEmail(
          userData.email, 
          userData.username, 
          userData.instituteName
        );
      }
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    // Clean up
    pendingRegistrations.delete(verificationCode);

    // Update registered users count
    await updateStats({ registeredUsers: 1 });

    res.status(201).json({ 
      message: "Account created successfully!",
      userType: userData.userType
    });
  } catch (error) {
    console.error("Account creation error:", error);
    res.status(500).json({ message: "Account creation failed" });
  }
};

// Middleware to check if account is locked
const checkAccountLock = async (req, res, next) => {
  try {
    const { username, userType } = req.body;
    
    const user = await User.findOne({ 
      $and: [
        { username },
        { userType }
      ]
    });

    if (user && user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.accountLockedUntil - new Date()) / 1000);
      return res.status(403).json({ 
        message: `Account locked. Please try again in ${remainingTime} seconds.`,
        accountLocked: true,
        remainingTime
      });
    }
    
    next();
  } catch (error) {
    console.error("Account lock check error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const loginUser = async (req, res) => {
  try {
    const { username, password, userType } = req.body;

    // Find user by username and user type
    let user = await User.findOne({ 
      $and: [
        { username },
        { userType }
      ]
    });

    // Check if account is locked
    if (user && user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.accountLockedUntil - new Date()) / 1000);
      return res.status(403).json({ 
        message: `Account locked. Please try again in ${remainingTime} seconds.`,
        accountLocked: true,
        remainingTime
      });
    }

    // Validate credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Increment failed attempts if user exists
      if (user) {
        user.failedLoginAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (user.failedLoginAttempts >= 5) {
          user.accountLockedUntil = new Date(Date.now() + 60 * 1000); // 1 minute lock
          await user.save();
          
          return res.status(403).json({ 
            message: "Too many failed attempts. Account locked for 1 minute.",
            accountLocked: true,
            remainingTime: 60
          });
        }
        
        await user.save();
        return res.status(400).json({ 
          message: "Invalid credentials or user type",
          remainingAttempts: 5 - user.failedLoginAttempts
        });
      }
      
      return res.status(400).json({ 
        message: "Invalid credentials or user type"
      });
    }

    // Check if user is an institute and if their request is approved
    if (user.userType === "institute" && !user.approveRequest) {
      return res.status(403).json({ message: "Your account has not been approved yet." });
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    await user.save();

    const token = generateToken(user._id, user.username, user.email, user.userType, user.currentStatus);

    res.json({ message: "Login successful", token, userType: user.userType });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user details
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.contactNumber) user.contactNumber = req.body.contactNumber;
    if (req.body.postalAddress) user.postalAddress = req.body.postalAddress;

    // Handle profile image upload
    if (req.file) {
      const imagePath = `/uploads/profile_pics/${req.file.filename}`;

      // Delete old profile image if it exists
      if (user.profileImage && fs.existsSync(`.${user.profileImage}`)) {
        fs.unlinkSync(`.${user.profileImage}`);
      }

      // Set new profile image path in the database
      user.profileImage = imagePath;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        fullName: user.fullName,
        contactNumber: user.contactNumber,
        postalAddress: user.postalAddress,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Institutes
const getInstitutes = async (req, res) => {
  try {
    const instituteUsers = await User.find({ userType: "institute" }).select("-password");

    if (instituteUsers.length === 0) {
      return res.status(404).json({ message: "No institutes found" });
    }

    res.json(instituteUsers);
  } catch (error) {
    console.error("Error fetching institutes:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Multer Storage Configuration for Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/profile_pics";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, req.user.id + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only images are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Change user password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Request password reset with OTP
const requestPasswordResetOTP = async (req, res) => {
  try {
    console.log('Request body:', req.body); 
    
    const { email } = req.body;

    // Validate email format
    if (!email || !email.includes('@')) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ message: "Valid email is required" });
    }

    // Check if User model exists
    if (!User) {
      console.error('User model not found');
      return res.status(500).json({ message: "Server configuration error" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 3); 

    // Clear any existing OTP data
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = otpExpiry;
    
    try {
      await user.save();
      console.log(`OTP generated for ${email}: ${otp} (expires at ${otpExpiry})`);
    } catch (saveError) {
      console.error("Error saving OTP to database:", saveError);
      return res.status(500).json({ message: "Database error occurred" });
    }

    // Send OTP email
    try {
      if (EmailService && EmailService.sendPasswordResetOTP) {
        await EmailService.sendPasswordResetOTP(email, user.username, otp);
        console.log(`OTP email sent successfully to ${email}`);
        
        res.status(200).json({ 
          message: "OTP has been sent to your email",
          ...(process.env.NODE_ENV === 'development' && { debug: { otp, expiresAt: otpExpiry } })
        });
      } else {
        console.log('Email service not available, OTP will be logged only');
        res.status(200).json({ 
          message: "OTP generated successfully. Email service temporarily unavailable.",
          ...(process.env.NODE_ENV === 'development' && { debug: { otp, expiresAt: otpExpiry } })
        });
      }
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      
      res.status(200).json({ 
        message: "OTP generated successfully, but email delivery failed. Please contact support if you don't receive the email.",
        ...(process.env.NODE_ENV === 'development' && { 
          debug: { otp, expiresAt: otpExpiry, emailError: emailError.message } 
        })
      });
    }
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

const verifyOTPAndResetPassword = async (req, res) => {
  try {
    console.log('Verify OTP request body:', req.body); 
    
    const { email, otp, newPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    // Validate OTP format (should be 6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be 6 digits" });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({ 
        message: "Password must contain at least one lowercase letter, one uppercase letter, and one number" 
      });
    }

    console.log(`Verifying OTP for email: ${email}, OTP: ${otp}`);

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpiry: { $gt: new Date() }
    });

    if (!user) {
      console.log(`OTP verification failed for ${email}. User not found or OTP expired/invalid.`);
      
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        if (userExists.resetPasswordOTP !== otp) {
          return res.status(400).json({ message: "Invalid OTP code" });
        } else if (userExists.resetPasswordOTPExpiry && userExists.resetPasswordOTPExpiry <= new Date()) {
          return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }
      }
      
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    console.log(`OTP verified successfully for ${email}`);

    try {
      if (!bcrypt) {
        console.error('bcrypt not available');
        return res.status(500).json({ message: "Server configuration error" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpiry = undefined;
      
      await user.save();
      console.log(`Password reset successfully for ${email}`);

    } catch (hashError) {
      console.error("Error hashing password:", hashError);
      return res.status(500).json({ message: "Error updating password" });
    }
    try {
      if (EmailService && EmailService.sendPasswordResetConfirmation) {
        await EmailService.sendPasswordResetConfirmation(email, user.username);
      }
    } catch (emailError) {
      console.error("Failed to send password reset confirmation email:", emailError);
    }

    res.status(200).json({ 
      message: "Password reset successful",
      success: true 
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ 
      message: "Server error occurred while resetting password",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getUserProfileByNic = async (req, res) => {
  try {
    const { nic } = req.params;

    const user = await User.findOne({ nic }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile by NIC:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


const getGoogleProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(req.user.id).select("googleId profileImage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.googleId) {
      return res.status(404).json({ message: "Not a Google user" });
    }

    if (user.profileImage) {
      let profilePicture = user.profileImage;
      if (!profilePicture.includes('=s') && !profilePicture.endsWith('.jpg') && !profilePicture.endsWith('.png')) {
        profilePicture = `${profilePicture}=s400-c`;
      }
      return res.json({ picture: profilePicture });
    }
    
    res.status(404).json({ message: "Profile picture not found" });
  } catch (error) {
    console.error("Error fetching Google profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  changePassword,
  getInstitutes,
  requestPasswordResetOTP,
  verifyOTPAndResetPassword,
  getUserProfileByNic,
  verifyEmail,
  getGoogleProfile,
  upload 
};