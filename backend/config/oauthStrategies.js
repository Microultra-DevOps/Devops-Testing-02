const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateToken } = require('./jwt');
const crypto = require('crypto'); 

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email'],
  passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    let profilePicture = null;
    if (profile.photos && profile.photos.length > 0) {
      profilePicture = profile.photos[0].value;
      
      if (!profilePicture.includes('=s') && !profilePicture.endsWith('.jpg') && !profilePicture.endsWith('.png')) {
        profilePicture = `${profilePicture}=s400-c`;
      } else if (profilePicture.includes('=s')) {
        profilePicture = profilePicture.replace(/=s\d+-c/, '=s400-c');
      }
    }

    if (user) {
      if (user.userType !== 'individual') {
        return done(new Error("OAuth login is only available for individual users"), null);
      }

      user.googleId = profile.id;
      if (profilePicture) {
        user.profileImage = profilePicture;
      }
      await user.save();
      
      return done(null, user);
    }

    const randomPassword = crypto.randomBytes(16).toString('hex');

    user = new User({
      username: profile.emails[0].value.split('@')[0],
      email: profile.emails[0].value,
      fullName: profile.displayName,
      googleId: profile.id,
      profileImage: profilePicture, 
      userType: 'individual', 
      isEmailVerified: true,
      currentStatus: 'pending',
      password: randomPassword 
    });

    await user.save();
    return done(null, user);
  } catch (err) {
    console.error("Google OAuth user creation error:", err);
    return done(err, null);
  }
}));

const generateTokenAndRedirect = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    if (req.user.userType !== 'individual') {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_individual_only`);
    }

    const token = generateToken(
      req.user._id, 
      req.user.username, 
      req.user.email, 
      req.user.userType, 
      req.user.currentStatus
    );

    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}&userType=individual`);
  } catch (err) {
    console.error('Token generation error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
  }
};

module.exports = {
  passport,
  generateTokenAndRedirect
}; 