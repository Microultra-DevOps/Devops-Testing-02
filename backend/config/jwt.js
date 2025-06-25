const jwt = require("jsonwebtoken");

// Generate Token
const generateToken = (id, username, email, userType, currentStatus) => { 
  return jwt.sign( 
    { id, username, email, userType, currentStatus },   
    process.env.JWT_SECRET, 
    { expiresIn: "7d" }  
  ); 
};

// Verify Token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
