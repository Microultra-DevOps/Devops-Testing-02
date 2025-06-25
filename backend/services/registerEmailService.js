const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  // Update the verifyEmail template
  verifyEmail: (username, verificationCode) => ({
    subject: 'Complete Your Registration - Mobitel Intern Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Complete Your Registration</h2>
        <p>Dear ${username},</p>
        
        <p>Thank you for starting your registration with the Mobitel Intern Management System. 
        Please use the verification code below to complete your account setup:</p>
        
        <div style="background-color: #f0f7ff; padding: 20px; text-align: center; font-size: 28px; 
             font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 5px; 
             border-left: 4px solid #0066cc;">
          ${verificationCode}
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Important:</strong></p>
          <ul>
            <li>This code will expire in 24 hours</li>
            <li>If you didn't request this registration, please ignore this email</li>
            <li>For security reasons, do not share this code with anyone</li>
          </ul>
        </div>
        
        <p>Best regards,<br>
        Mobitel Intern Management System Team</p>
      </div>
    `
  }),

  // Account Activation Confirmation (New)
  accountActivated: (username, userType) => ({
    subject: 'Account Activated - Mobitel Intern Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Account Successfully Activated</h2>
        <p>Dear ${username},</p>
        
        <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #0066cc;">
          <p>Your ${userType} account has been successfully activated!</p>
          <p>Activation Time: ${new Date().toLocaleString()}</p>
        </div>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>Log in to your account</li>
          <li>Complete your profile information</li>
          ${userType === 'institute' ? 
            '<li>Wait for account approval (you will receive a separate email)</li>' : 
            '<li>Upload any required documents</li>'
          }
        </ol>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <p>Best regards,<br>
        Mobitel Intern Management System Team</p>
      </div>
    `
  }),

  // Individual User Registration (Updated)
  individualRegistration: (username) => ({
    subject: 'Welcome to Mobitel Intern Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Welcome ${username}!</h2>
        <p>Your individual intern account is now active in the Mobitel Intern Management System.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Getting Started:</h3>
          <ol>
            <li>Review the intern handbook and guidelines</li>
            <li>Complete your profile information</li>
            <li>Upload required documents (if any)</li>
            <li>Check for available internship opportunities</li>
          </ol>
        </div>
        
        <p><strong>Account Security:</strong></p>
        <ul>
          <li>Keep your login credentials secure</li>
          <li>Enable two-factor authentication if available</li>
          <li>Change your password periodically</li>
        </ul>
        
        <p>We're excited to have you on board!</p>
        
        <p>Best regards,<br>
        HR Department<br>
        Sri Lanka Telecom Mobitel</p>
      </div>
    `
  }),

  // Institute Registration (Updated)
  instituteRegistration: (username, instituteName) => ({
    subject: 'Institute Registration Received - Mobitel Intern Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Registration Received</h2>
        <p>Dear ${username},</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Registration Details:</h3>
          <p><strong>Institute:</strong> ${instituteName}</p>
          <p><strong>Status:</strong> Pending Approval</p>
        </div>
        
        <h3>What Happens Next?</h3>
        <ol>
          <li>Our team will review your registration within 3-5 business days</li>
          <li>You may be contacted for additional information</li>
          <li>You'll receive an approval notification email</li>
          <li>Upon approval, you'll gain full system access</li>
        </ol>
        
        <div style="background-color: #fffaf0; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffa500;">
          <p><strong>Note:</strong> Your account is currently in pending status. 
          You will not be able to log in until approval is complete.</p>
        </div>
        
        <p>We appreciate your interest in partnering with us.</p>
        
        <p>Best regards,<br>
        Partnership Team<br>
        Sri Lanka Telecom Mobitel</p>
      </div>
    `
  }),

  // Password Reset OTP (Updated)
     passwordResetOTP: (username, otp) => ({
    subject: 'Password Reset Code - Mobitel Intern Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Dear ${username},</p>
        
        <p>We received a request to reset your password. Here's your verification code:</p>
        
        <div style="background-color: #f0f7ff; padding: 20px; text-align: center; font-size: 28px; 
             font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 5px; 
             border-left: 4px solid #0066cc;">
          ${otp}
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Security Information:</strong></p>
          <ul>
            <li>This code expires in 3 minutes</li>
            <li>Do not share this code with anyone</li>
            <li>If you didn't request this, contact support immediately</li>
          </ul>
        </div>
        
        <p>Enter this code in the password reset form to continue.</p>
        
        <p>Best regards,<br>
        Security Team<br>
        Mobitel Intern Management System</p>
      </div>
    `
  }),

  // Password Reset Confirmation Template
  passwordResetConfirmation: (username) => ({
    subject: 'Password Changed Successfully - Mobitel Intern Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Password Update Confirmation</h2>
        <p>Dear ${username},</p>
        
        <div style="background-color: #f0fff0; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #008000;">
          <p>Your password was successfully changed on ${new Date().toLocaleString()}.</p>
        </div>
        
        <h3>Security Recommendations:</h3>
        <ul>
          <li>Use a unique password that you don't use elsewhere</li>
          <li>Consider enabling two-factor authentication</li>
          <li>Be cautious of phishing attempts</li>
        </ul>
        
        <div style="background-color: #fff0f0; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ff0000;">
          <p><strong>Important:</strong> If you didn't make this change, contact our security team immediately.</p>
        </div>
        
        <p>Best regards,<br>
        Security Team<br>
        Mobitel Intern Management System</p>
      </div>
    `
  })
};

// Email Service
const EmailService = {
  createTransporter,

  async sendEmail(to, template, options = {}) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Email configuration is missing");
      }

      const transporter = createTransporter();
      
      const mailOptions = {
        from: {
          name: 'Mobitel Intern Management System',
          address: process.env.EMAIL_USER
        },
        to,
        ...template,
        ...options
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  async sendVerificationEmail(email, username, verificationCode) {
    return this.sendEmail(
      email, 
      emailTemplates.verifyEmail(username, verificationCode)
    );
  },

  async sendAccountActivatedEmail(email, username, userType) {
    return this.sendEmail(
      email,
      emailTemplates.accountActivated(username, userType)
    );
  },

  async sendIndividualRegistrationEmail(email, username) {
    return this.sendEmail(
      email,
      emailTemplates.individualRegistration(username)
    );
  },

  async sendInstituteRegistrationEmail(email, username, instituteName) {
    return this.sendEmail(
      email,
      emailTemplates.instituteRegistration(username, instituteName)
    );
  },

  async sendPasswordResetOTP(email, username, otp) {
    try {
      const template = emailTemplates.passwordResetOTP(username, otp);
      const result = await this.sendEmail(email, template);
      
      console.log(`OTP email sent successfully to ${email}:`, result.messageId);
      
      return { 
        success: true, 
        messageId: result.messageId 
      };

    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  },

  async sendPasswordResetConfirmation(email, username) {
    try {
      const template = emailTemplates.passwordResetConfirmation(username);
      const result = await this.sendEmail(email, template);
      
      console.log(`Password reset confirmation email sent to ${email}:`, result.messageId);
      
      return { 
        success: true, 
        messageId: result.messageId 
      };
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw new Error(`Failed to send confirmation email: ${error.message}`);
    }
  }
};

module.exports = EmailService;