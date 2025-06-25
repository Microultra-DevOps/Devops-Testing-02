const Email = require('../models/Email');
const sendMail = require('../services/emailService');

exports.registerEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Validate email domain and TLD
    const parts = email.split('@');
    if (parts.length !== 2) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const domainPart = parts[1];
    const tld = domainPart.split('.').pop();
    const allowedTlds = ['com', 'org', 'lk'];
    
    if (!allowedTlds.includes(tld)) {
      return res.status(400).json({ message: 'Only .com, .org, and .lk domains are accepted' });
    }

    const allowedDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'aol.com',
      'protonmail.com',
      'mail.com',
      'icloud.com',
      'zoho.com',
      'yandex.com'
    ];

    if (!allowedDomains.includes(domainPart)) {
      return res.status(400).json({ message: 'Only emails from supported providers are accepted' });
    }

    // Check if email already exists
    const existingEmail = await Email.findOne({ email });
    
    if (existingEmail) {
      return res.status(409).json({ 
        message: 'This email is already registered in our system',
        alreadyRegistered: true
      });
    }

    // Create new email entry
    const newEmail = new Email({ email });
    await newEmail.save();

    // Send email
    sendMail(email);

    res.status(201).json({ message: 'Email registered and welcome email sent' });
  } catch (err) {
    console.error('Email registration error:', err);

    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ 
        message: 'This email is already registered in our system',
        alreadyRegistered: true
      });
    }
    
    res.status(500).json({ message: 'Server error occurred while processing your request' });
  }
};