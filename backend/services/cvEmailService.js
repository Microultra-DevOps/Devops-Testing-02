require("dotenv").config();
const nodemailer = require("nodemailer");

// Create reusable transporter with error handling
const createTransporter = () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(
        "Email credentials are not properly configured in environment variables"
      );
    }

    return nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add timeout and retry options
      pool: true, // Use pooled connections
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5, // Limit to 5 emails per second
    });
  } catch (error) {
    console.error("Error creating email transporter:", error);
    throw error;
  }
};

const sendSuccessEmail = async (internName, emailAddress, referenceNumber) => {
  if (!internName || !emailAddress || !referenceNumber) {
    throw new Error("Missing required parameters for sending email");
  }

  let transporter;
  try {
    transporter = createTransporter();

    // Verify transporter connection
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject: "CV Successfully Submitted - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        <p>Thank you for submitting your CV to the Sri Lanka Telecom Mobitel Intern Management System. We confirm that your CV has been successfully received and uploaded to our system.</p>
        <p><strong>Submission Details:</strong></p>
        <ul>
          <li>Submission Date: ${new Date().toLocaleDateString()}</li>
          <li>Submission Time: ${new Date().toLocaleTimeString()}</li>
          <li>Reference Number: ${referenceNumber}</li>
        </ul>
        <p><strong>What Happens Next:</strong></p>
        <ol>
          <li>Our HR team will review your CV within 5-7 working days</li>
          <li>You will receive an email notification about the status of your application</li>
          <li>If shortlisted, you will be contacted for the next steps in the selection process</li>
        </ol>
        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>Please ensure all information provided in your CV is accurate and up-to-date</li>
          <li>You can update your CV at any time by logging into your account</li>
          <li>Keep your reference number for future correspondence</li>
        </ul>
        <p>If you need to make any changes to your submission or have any questions, please log in to your account or contact our HR support team.</p>
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      // Add text version for better deliverability
      text: `
        Dear ${internName},

        Thank you for submitting your CV to the Sri Lanka Telecom Mobitel Intern Management System. We confirm that your CV has been successfully received and uploaded to our system.

        Submission Details:
        - Submission Date: ${new Date().toLocaleDateString()}
        - Submission Time: ${new Date().toLocaleTimeString()}
        - Reference Number: ${referenceNumber}

        What Happens Next:
        1. Our HR team will review your CV within 5-7 working days
        2. You will receive an email notification about the status of your application
        3. If shortlisted, you will be contacted for the next steps in the selection process

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Success email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

const sendAdminCreatedEmail = async (
  internName,
  emailAddress,
  referenceNumber,
  { username, password, status }
) => {
  if (
    !internName ||
    !emailAddress ||
    !referenceNumber ||
    !username ||
    !password
  ) {
    throw new Error(
      "Missing required parameters for sending admin created email"
    );
  }

  let transporter;
  try {
    transporter = createTransporter();

    // Verify transporter connection
    await transporter.verify();

    const statusText = status === "cv-approved" ? "Approved" : "Pending Review";
    const loginUrl = process.env.FRONTEND_URL || "https://intern.mobitel.lk";

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject:
        "Your Internship Account Has Been Created - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        
        <p>Welcome to the Sri Lanka Telecom Mobitel Intern Management System! Your account has been successfully created by our HR team.</p>
        
        <p><strong>Your Account Credentials:</strong></p>
        <ul>
          <li>Username: <strong>${username}</strong></li>
          <li>Password: <strong>${password}</strong></li>
        </ul>
        
        <p><strong>Application Details:</strong></p>
        <ul>
          <li>Reference Number: ${referenceNumber}</li>
          <li>Status: ${statusText}</li>
          <li>Account Created: ${new Date().toLocaleDateString()}</li>
        </ul>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Log in to the system at: <a href="${loginUrl}">${loginUrl}</a></li>
          <li>Change your password immediately after first login</li>
          <li>${
            status === "cv-approved"
              ? "Your CV has been approved - no further action needed"
              : "Your CV is pending review by the HR team"
          }</li>
        </ol>
        
        <p><strong>Important Security Notes:</strong></p>
        <ul>
          <li>This is a system-generated password - please change it after your first login</li>
          <li>Never share your login credentials with anyone</li>
          <li>Mobitel staff will never ask for your password</li>
        </ul>
        
        <p>If you have any questions or need assistance, please contact our HR support team.</p>
        
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      text: `
        Dear ${internName},

        Welcome to the Sri Lanka Telecom Mobitel Intern Management System! Your account has been successfully created by our HR team.

        Your Account Credentials:
        - Username: ${username}
        - Password: ${password}

        Application Details:
        - Reference Number: ${referenceNumber}
        - Status: ${statusText}
        - Account Created: ${new Date().toLocaleDateString()}

        Next Steps:
        1. Log in to the system at: ${loginUrl}
        2. Change your password immediately after first login
        3. ${
          status === "cv-approved"
            ? "Your CV has been approved - no further action needed"
            : "Your CV is pending review by the HR team"
        }

        Important Security Notes:
        - This is a system-generated password - please change it after your first login
        - Never share your login credentials with anyone
        - Mobitel staff will never ask for your password

        If you have any questions or need assistance, please contact our HR support team.

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Admin created email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending admin created email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

// Send approval email
const sendApproveEmail = async (internName, emailAddress, referenceNumber) => {
  if (!internName || !emailAddress || !referenceNumber) {
    throw new Error("Missing required parameters for sending approval email");
  }

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject: "CV Approved - Mobitel Intern Management System",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .approval-badge { background-color: #28a745; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .details-box { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #28a745; }
            .next-steps { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <h2>Your CV has been Approved</h2>
            </div>
            
            <div class="content">
              <p>Dear <strong>${internName}</strong>,</p>
              
              <p>We are delighted to inform you that your CV has been reviewed and approved by our HR team at Sri Lanka Telecom Mobitel.</p>
              
              <div class="details-box">
                <h3>📋 Application Details</h3>
                <ul>
                  <li><strong>Reference Number:</strong> ${referenceNumber}</li>
                  <li><strong>Status:</strong> <span class="approval-badge">APPROVED ✅</span></li>
                  <li><strong>Review Date:</strong> ${new Date().toLocaleDateString()}</li>
                </ul>
              </div>
              
              <div class="next-steps">
                <h3>🚀 What Happens Next</h3>
                <ol>
                  <li>Your profile has been added to our Intern Database</li>
                  <li>Based on departmental needs, you may be contacted for further steps</li>
                  <li>Your application will remain active in our system for 6 months</li>
                  <li>You will receive updates via email</li>
                </ol>
              </div>
              
              <div class="details-box">
                <h3>📞 Important Contact Information</h3>
                <ul>
                  <li>Update your profile through our portal if contact details change</li>
                  <li>Check application status by logging into your account</li>
                  <li>For queries: <a href="mailto:hr.interns@mobitel.lk">hr.interns@mobitel.lk</a></li>
                </ul>
              </div>
              
              <p>Thank you for your interest in joining Sri Lanka Telecom Mobitel. We appreciate your patience and look forward to potentially working with you.</p>
            </div>
            
            <div class="footer">
              <p><strong>HR Department</strong><br>
              Sri Lanka Telecom Mobitel<br>
              This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Dear ${internName},

        🎉 CONGRATULATIONS! Your CV has been APPROVED!

        We are pleased to inform you that your CV has been reviewed and approved by our HR team at Sri Lanka Telecom Mobitel.

        Application Details:
        - Reference Number: ${referenceNumber}
        - Application Status: APPROVED ✅
        - Review Date: ${new Date().toLocaleDateString()}

        What Happens Next:
        1. Your profile has been added to our Intern Database
        2. Based on departmental needs, you may be contacted for further steps
        3. Your application will remain active in our system for 6 months
        4. You will receive updates via email and WhatsApp

        Important Notes:
        - Update your profile through our portal if contact details change
        - Check application status by logging into your account
        - For queries: hr.interns@mobitel.lk

        Thank you for your interest in joining Sri Lanka Telecom Mobitel!

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Approval email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending approval email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

// Send decline email
const sendDeclineEmail = async (internName, emailAddress, referenceNumber, declineReason) => {
  if (!internName || !emailAddress || !referenceNumber) {
    throw new Error("Missing required parameters for sending decline email");
  }

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    // Prepare the decline reason section for the email
    const reasonSection = declineReason ? 
      `<p><strong>Reason for Decline:</strong> ${declineReason}</p>` : 
      '';
    
    const plainTextReasonSection = declineReason ? 
      `\nReason for Decline: ${declineReason}\n` : 
      '';

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject: "Application Status Update - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        <p>Thank you for your interest in the internship opportunity at Sri Lanka Telecom Mobitel and for taking the time to submit your CV.</p>
        <p><strong>Application Details:</strong></p>
        <ul>
          <li>Reference Number: ${referenceNumber}</li>
          <li>Application Status: <span style="color: #d14836; font-weight: bold;">NOT SELECTED</span></li>
          <li>Review Date: ${new Date().toLocaleDateString()}</li>
        </ul>
        ${reasonSection}
        <p>After careful consideration of your application, we regret to inform you that we are unable to proceed with your candidacy at this time. This decision does not necessarily reflect on your qualifications or abilities, but rather is the result of the competitive nature of our selection process and specific requirements for our current internship positions.</p>
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Your information will be kept in our database for 6 months</li>
          <li>You are welcome to apply for future internship opportunities</li>
          <li>We encourage you to continue developing your skills and experience</li>
        </ul>
        <p><strong>Additional Information:</strong></p>
        <ul>
          <li>You can check our careers page for future opportunities: <a href="https://careers.mobitel.lk">careers.mobitel.lk</a></li>
          <li>Follow our social media channels for announcements about upcoming internship programs</li>
          <li>If you have any questions, please contact our HR support team at hr.interns@mobitel.lk</li>
        </ul>
        <p>We appreciate your understanding and wish you success in your future endeavors.</p>
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      text: `
        Dear ${internName},

        Thank you for your interest in the internship opportunity at Sri Lanka Telecom Mobitel and for taking the time to submit your CV.

        Application Details:
        - Reference Number: ${referenceNumber}
        - Application Status: NOT SELECTED
        - Review Date: ${new Date().toLocaleDateString()}
        ${plainTextReasonSection}
        After careful consideration of your application, we regret to inform you that we are unable to proceed with your candidacy at this time. This decision does not necessarily reflect on your qualifications or abilities, but rather is the result of the competitive nature of our selection process and specific requirements for our current internship positions.

        Next Steps:
        - Your information will be kept in our database for 6 months
        - You are welcome to apply for future internship opportunities
        - We encourage you to continue developing your skills and experience

        Additional Information:
        - You can check our careers page for future opportunities: careers.mobitel.lk
        - Follow our social media channels for announcements about upcoming internship programs
        - If you have any questions, please contact our HR support team at hr.interns@mobitel.lk

        We appreciate your understanding and wish you success in your future endeavors.

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Decline email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending decline email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

const sendInterviewScheduleEmail = async (
  internName,
  emailAddress,
  referenceNumber,
  interviewName,
  interviewDate,
  interviewTime,
  interviewLocation
) => {
  if (
    !internName ||
    !emailAddress ||
    !referenceNumber ||
    !interviewName ||
    !interviewDate ||
    !interviewLocation // Added check for location
  ) {
    throw new Error(
      "Missing required parameters for sending interview schedule email"
    );
  }

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    // Format interview date nicely if it's a valid date
    let formattedDate = interviewDate;
    try {
      const dateObj = new Date(interviewDate);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (e) {
      console.log("Date formatting error, using original string:", e);
    }

    // Add time to the display if available
    const timeDisplay = interviewTime ? `at ${interviewTime}` : "";

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject: "Interview Scheduled - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        <p>We are pleased to inform you that you have been shortlisted for an interview for the internship position at Sri Lanka Telecom Mobitel.</p>
        <p><strong>Interview Details:</strong></p>
        <ul>
          <li>Reference Number: ${referenceNumber}</li>
          <li>Interview: <strong>${interviewName}</strong></li>
          <li>Date and Time: <strong>${formattedDate}</strong> ${timeDisplay}</li>
          <li>Location: <strong>${interviewLocation}</strong></li>
        </ul>
        <p><strong>What to Bring:</strong></p>
        <ol>
          <li>National Identity Card or valid photo identification</li>
          <li>A printed copy of your CV</li>
          <li>Original educational certificates for verification</li>
          <li>Any portfolio or work samples (if applicable)</li>
        </ol>
        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>Please arrive 15 minutes before your scheduled interview time</li>
          <li>Dress professionally for the interview</li>
          <li>Be prepared to discuss your educational background, skills, and career goals</li>
          <li>The interview will last approximately 45-60 minutes</li>
        </ul>
        <p>If you need to reschedule your interview or have any questions, please contact our HR team at hr.interns@mobitel.lk at least 24 hours before your scheduled interview time.</p>
        <p>We look forward to meeting you!</p>
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      text: `
        Dear ${internName},

        We are pleased to inform you that you have been shortlisted for an interview for the internship position at Sri Lanka Telecom Mobitel.

        Interview Details:
        - Reference Number: ${referenceNumber}
        - Interview: ${interviewName}
        - Date and Time: ${formattedDate} ${timeDisplay}
        - Location: ${interviewLocation}

        What to Bring:
        1. National Identity Card or valid photo identification
        2. A printed copy of your CV
        3. Original educational certificates for verification
        4. Any portfolio or work samples (if applicable)

        Important Notes:
        - Please arrive 15 minutes before your scheduled interview time
        - Dress professionally for the interview
        - Be prepared to discuss your educational background, skills, and career goals
        - The interview will last approximately 45-60 minutes

        If you need to reschedule your interview or have any questions, please contact our HR team at hr.interns@mobitel.lk at least 24 hours before your scheduled interview time.

        We look forward to meeting you!

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Interview schedule email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending interview schedule email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

const sendInterviewRescheduleEmail = async (
  internName,
  emailAddress,
  referenceNumber,
  interviewName,
  interviewDate,
  interviewTime,
  interviewLocation,
  rescheduleReason
) => {
  if (
    !internName ||
    !emailAddress ||
    !referenceNumber ||
    !interviewName ||
    !interviewDate ||
    !interviewLocation // Added check for location
  ) {
    throw new Error(
      "Missing required parameters for sending interview reschedule email"
    );
  }

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    // Format interview date nicely if it's a valid date
    let formattedDate = interviewDate;
    try {
      const dateObj = new Date(interviewDate);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (e) {
      console.log("Date formatting error, using original string:", e);
    }

    // Format time if provided
    const timeDisplay = interviewTime ? `at ${interviewTime}` : "";

    // Use a clean and professional reason display
    const reasonDisplay = rescheduleReason || "Due to scheduling changes";

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject: "Interview Rescheduled - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        <p><strong>Important Notice:</strong> Your previously scheduled interview has been rescheduled.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0;">
          <p><strong>Reason for Rescheduling:</strong> ${reasonDisplay}</p>
        </div>
        
        <p><strong>New Interview Details:</strong></p>
        <ul>
          <li>Reference Number: ${referenceNumber}</li>
          <li>Interview: <strong>${interviewName}</strong></li>
          <li>New Date: <strong>${formattedDate}</strong> ${timeDisplay}</li>
          <li>Location: <strong>${interviewLocation}</strong></li>
        </ul>
        
        <p><strong>What to Bring:</strong></p>
        <ol>
          <li>National Identity Card or valid photo identification</li>
          <li>A printed copy of your CV</li>
          <li>Original educational certificates for verification</li>
          <li>Any portfolio or work samples (if applicable)</li>
        </ol>
        
        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>Please arrive 15 minutes before your scheduled interview time</li>
          <li>Dress professionally for the interview</li>
          <li>Be prepared to discuss your educational background, skills, and career goals</li>
          <li>The interview will last approximately 45-60 minutes</li>
        </ul>
        
        <p>We apologize for any inconvenience this change may cause. If you are unable to attend the interview at the new scheduled time, please contact our HR team at hr.interns@mobitel.lk as soon as possible.</p>
        
        <p>We look forward to meeting you!</p>
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      text: `
        Dear ${internName},

        IMPORTANT NOTICE: Your previously scheduled interview has been rescheduled.

        Reason for Rescheduling: ${reasonDisplay}

        New Interview Details:
        - Reference Number: ${referenceNumber}
        - Interview: ${interviewName}
        - New Date: ${formattedDate} ${timeDisplay}
        - Location: ${interviewLocation}

        What to Bring:
        1. National Identity Card or valid photo identification
        2. A printed copy of your CV
        3. Original educational certificates for verification
        4. Any portfolio or work samples (if applicable)

        Important Notes:
        - Please arrive 15 minutes before your scheduled interview time
        - Dress professionally for the interview
        - Be prepared to discuss your educational background, skills, and career goals
        - The interview will last approximately 45-60 minutes

        We apologize for any inconvenience this change may cause. If you are unable to attend the interview at the new scheduled time, please contact our HR team at hr.interns@mobitel.lk as soon as possible.

        We look forward to meeting you!

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Interview reschedule email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
      reason: rescheduleReason
    });

    return info;
  } catch (error) {
    console.error("Error sending interview reschedule email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

const sendInterviewPassEmail = async (
  internName,
  emailAddress,
  referenceNumber,
  interviewName,
  nextSteps = "HR will contact you shortly with details regarding your internship offer."
) => {
  if (
    !internName ||
    !emailAddress ||
    !referenceNumber ||
    !interviewName
  ) {
    throw new Error(
      "Missing required parameters for sending interview pass email"
    );
  }

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject: "Interview Results - Congratulations! - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        <p>We are pleased to inform you that you have <strong>successfully passed</strong> your interview for the internship position at Sri Lanka Telecom Mobitel.</p>
        
        <div style="background-color: #e7f7e7; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0;">
          <p><strong>Congratulations!</strong> Your performance during the ${interviewName} interview process demonstrated the skills and qualities we value at Mobitel.</p>
        </div>
        
        <p><strong>Application Details:</strong></p>
        <ul>
          <li>Reference Number: ${referenceNumber}</li>
          <li>Interview: ${interviewName}</li>
        </ul>
        
        <p><strong>Next Steps:</strong></p>
        <p>${nextSteps}</p>
        
        <p>In the meantime, please ensure your contact information is up-to-date in our system. If you have any immediate questions, please contact our HR team at hr.interns@mobitel.lk.</p>
        
        <p>We look forward to your contributions to our team!</p>
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      text: `
        Dear ${internName},

        We are pleased to inform you that you have successfully passed your interview for the internship position at Sri Lanka Telecom Mobitel.

        Congratulations! Your performance during the ${interviewName} interview process demonstrated the skills and qualities we value at Mobitel.

        Application Details:
        - Reference Number: ${referenceNumber}
        - Interview: ${interviewName}

        Next Steps:
        ${nextSteps}

        In the meantime, please ensure your contact information is up-to-date in our system. If you have any immediate questions, please contact our HR team at hr.interns@mobitel.lk.

        We look forward to your contributions to our team!

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Interview pass email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending interview pass email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

const sendInterviewFailEmail = async (
  internName,
  emailAddress,
  referenceNumber,
  interviewName,
  feedbackMessage = "We received many qualified applications, and while your profile shows potential, we have decided to proceed with other candidates whose qualifications better match our current requirements."
) => {
  if (
    !internName ||
    !emailAddress ||
    !referenceNumber ||
    !interviewName
  ) {
    throw new Error(
      "Missing required parameters for sending interview fail email"
    );
  }

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject: "Interview Results - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        <p>Thank you for attending the recent interview for the internship position at Sri Lanka Telecom Mobitel.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6c757d; margin: 15px 0;">
          <p>After careful consideration of all candidates, we regret to inform you that we will not be moving forward with your application at this time.</p>
        </div>
        
        <p><strong>Application Details:</strong></p>
        <ul>
          <li>Reference Number: ${referenceNumber}</li>
          <li>Interview: ${interviewName}</li>
        </ul>
        
        <p><strong>Feedback:</strong></p>
        <p>${feedbackMessage}</p>
        
        <p>We encourage you to apply for future opportunities at Mobitel that align with your skills and career objectives. Your profile will remain in our database, and we may contact you if a suitable position becomes available.</p>
        
        <p>We appreciate your interest in Sri Lanka Telecom Mobitel and wish you success in your future endeavors.</p>
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      text: `
        Dear ${internName},

        Thank you for attending the recent interview for the internship position at Sri Lanka Telecom Mobitel.

        After careful consideration of all candidates, we regret to inform you that we will not be moving forward with your application at this time.

        Application Details:
        - Reference Number: ${referenceNumber}
        - Interview: ${interviewName}

        Feedback:
        ${feedbackMessage}

        We encourage you to apply for future opportunities at Mobitel that align with your skills and career objectives. Your profile will remain in our database, and we may contact you if a suitable position becomes available.

        We appreciate your interest in Sri Lanka Telecom Mobitel and wish you success in your future endeavors.

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Interview fail email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending interview fail email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

const sendInductionAssignmentEmail = async ({
  recipientName = "Intern",
  recipientEmail,
  refNo = "N/A",
  inductionName,
  startDate,
  endDate,
  location = "Sri Lanka Telecom Mobitel Training Center, Colombo",
}) => {
  // Validate required fields
  if (!recipientEmail) throw new Error("Recipient email is required");
  if (!inductionName) throw new Error("Induction name is required");
  if (!startDate) throw new Error("Start date is required");
  if (!endDate) throw new Error("End date is required");

  // Import required modules if not already imported at the top level
  const nodemailer = require('nodemailer');
  
  let transporter;
  try {
    // Create transporter directly if createTransporter function is unavailable
    transporter = typeof createTransporter === 'function' 
      ? createTransporter() 
      : nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
    
    // Verify transporter configuration
    await transporter.verify();
    console.log("Email transporter verified successfully");

    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return isNaN(date.getTime())
          ? dateString
          : date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
      } catch (e) {
        console.error("Date formatting error:", e);
        return dateString;
      }
    };

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: recipientEmail,
      subject: `Induction Assignment - ${inductionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear ${recipientName},</p>
          
          <p>You have been assigned to the following induction program:</p>
          
          <h3>Program Details</h3>
          <ul>
            <li><strong>Reference No:</strong> ${refNo}</li>
            <li><strong>Program:</strong> ${inductionName}</li>
            <li><strong>Dates:</strong> ${formatDate(
              startDate
            )} to ${formatDate(endDate)}</li>
            <li><strong>Location:</strong> ${location}</li>
          </ul>
          
          <p>Best regards,<br>HR Department</p>
        </div>
      `,
    };

    console.log(`Attempting to send email to: ${recipientEmail}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", {
      recipient: recipientEmail,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    if (transporter && typeof transporter.close === 'function') {
      transporter.close();
    }
  }
};


const sendInductionRescheduleEmail = async ({
  recipientName = "Intern",
  recipientEmail,
  refNo = "N/A",
  inductionName,
  startDate,
  endDate,
  location = "Sri Lanka Telecom Mobitel Training Center, Colombo",
  notes = "No additional information provided."
}) => {
  // Validate required fields
  if (!recipientEmail) throw new Error("Recipient email is required");
  if (!inductionName) throw new Error("Induction name is required");
  if (!startDate) throw new Error("Start date is required");
  if (!endDate) throw new Error("End date is required");

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return isNaN(date.getTime())
          ? dateString
          : date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
      } catch (e) {
        console.error("Date formatting error:", e);
        return dateString;
      }
    };

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: recipientEmail,
      subject: `Induction Rescheduled - ${inductionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear ${recipientName},</p>
          
          <p><strong>Important Notice:</strong> Your induction program has been rescheduled.</p>
          
          <h3>Updated Program Details</h3>
          <ul>
            <li><strong>Reference No:</strong> ${refNo}</li>
            <li><strong>Program:</strong> ${inductionName}</li>
            <li><strong>New Dates:</strong> ${formatDate(startDate)} to ${formatDate(endDate)}</li>
            <li><strong>Location:</strong> ${location}</li>
          </ul>
          
          <p><strong>Additional Information:</strong> ${notes}</p>
          
          <p>If you have any questions about this change, please contact the HR department as soon as possible.</p>
          
          <p>Best regards,<br>HR Department</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reschedule email sent to:", recipientEmail);
    return info;
  } catch (error) {
    console.error("Email sending failed:", {
      recipient: recipientEmail,
      error: error.message,
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

// Function to send induction pass email
const sendInductionPassEmail = async ({
  recipientName = "Intern",
  recipientEmail,
  refNo = "N/A",
  inductionName,
  nextSteps = "HR will contact you shortly with details regarding your internship placement."
}) => {
  // Validate required fields
  if (!recipientEmail) throw new Error("Recipient email is required");
  if (!inductionName) throw new Error("Induction name is required");

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: recipientEmail,
      subject: `Congratulations! Induction Successfully Completed - ${inductionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear ${recipientName},</p>
          
          <p>Congratulations! We are pleased to inform you that you have successfully completed the induction program: <strong>${inductionName}</strong>.</p>
          
          <h3>What's Next?</h3>
          <p>${nextSteps}</p>
          
          <p>Reference No: ${refNo}</p>
          
          <p>We look forward to your contributions during your internship at Sri Lanka Telecom Mobitel.</p>
          
          <p>Best regards,<br>HR Department</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Induction pass email sent to:", recipientEmail);
    return info;
  } catch (error) {
    console.error("Email sending failed:", {
      recipient: recipientEmail,
      error: error.message,
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

// Function to send induction fail email
const sendInductionFailEmail = async ({
  recipientName = "Intern",
  recipientEmail,
  refNo = "N/A",
  inductionName,
  feedback = "Thank you for your participation in our induction program."
}) => {
  // Validate required fields
  if (!recipientEmail) throw new Error("Recipient email is required");
  if (!inductionName) throw new Error("Induction name is required");

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: recipientEmail,
      subject: `Induction Program Update - ${inductionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear ${recipientName},</p>
          
          <p>Thank you for participating in our induction program: <strong>${inductionName}</strong>.</p>
          
          <p>After careful consideration, we regret to inform you that you have not met the requirements to proceed further in the internship program.</p>
          
          <h3>Feedback</h3>
          <p>${feedback}</p>
          
          <p>Reference No: ${refNo}</p>
          
          <p>We appreciate your interest in Sri Lanka Telecom Mobitel and wish you success in your future endeavors.</p>
          
          <p>Best regards,<br>HR Department</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Induction fail email sent to:", recipientEmail);
    return info;
  } catch (error) {
    console.error("Email sending failed:", {
      recipient: recipientEmail,
      error: error.message,
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

module.exports = {
  sendSuccessEmail,
  sendAdminCreatedEmail,
  sendDeclineEmail,
  sendApproveEmail,
  sendInductionAssignmentEmail,
  sendInterviewScheduleEmail,
  sendInterviewRescheduleEmail,
  createTransporter,
  sendInterviewFailEmail,
  sendInterviewPassEmail,
  sendInductionFailEmail,
  sendInductionPassEmail,
  sendInductionRescheduleEmail,
};
