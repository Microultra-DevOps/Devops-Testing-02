const nodemailer = require('nodemailer');

const sendMail = (recipientEmail, username, duration) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: {
        name: 'Mobitel Intern Management System',
        address: process.env.EMAIL_USER
      },
    to: recipientEmail,
    subject: 'Welcome to Mobitel Internship Program - Important Information Guide',
    html: `
      <p>Dear ${username},</p>
      <p>Thank you for your interest in the Sri Lanka Telecom Mobitel Internship Program. This email contains comprehensive information about our program and what you can expect.</p>
      <h3>About Mobitel Internship Program:</h3>
      <ul>
        <li>Duration: ${duration} months</li>
        <li>Location: Mobitel Head Office and Regional Centers</li>
        <li>Schedule: Monday to Friday, 8:30 AM - 5:00 PM</li>
        <li>Stipend: As per company policy</li>
        <li>Available Departments: Technical, Marketing, Finance, HR, Customer Service, and IT</li>
      </ul>
      <h3>Program Benefits:</h3>
      <ol>
        <li>Hands-on industry experience</li>
        <li>Mentorship from experienced professionals</li>
        <li>Technical and soft skills development</li>
        <li>Networking opportunities</li>
        <li>Certificate upon successful completion</li>
        <li>Potential for future employment opportunities</li>
      </ol>
      <h3>Required Documents:</h3>
      <ul>
        <li>Updated CV</li>
        <li>Academic transcripts</li>
        <li>Letter of recommendation</li>
        <li>Copy of NIC/Passport</li>
        <li>Passport size photograph</li>
        <li>University/Institute certification letter</li>
        <li>Insurance documents (if applicable)</li>
      </ul>
      <h3>Training Areas:</h3>
      <ul>
        <li>Technical Skills Development</li>
        <li>Professional Communication</li>
        <li>Project Management</li>
        <li>Team Collaboration</li>
        <li>Industry Best Practices</li>
        <li>Leadership Development</li>
      </ul>
      <h3>Selection Process:</h3>
      <ol>
        <li>Initial Application Review</li>
        <li>Online Assessment (if applicable)</li>
        <li>Technical Interview</li>
        <li>HR Interview</li>
        <li>Final Selection</li>
        <li>Document Verification</li>
        <li>Onboarding</li>
      </ol>
      <h3>Program Rules & Guidelines:</h3>
      <ul>
        <li>Regular attendance is mandatory</li>
        <li>Professional dress code must be followed</li>
        <li>Confidentiality agreement must be signed</li>
        <li>Monthly progress reports are required</li>
        <li>Participation in team meetings and projects</li>
        <li>Compliance with company policies</li>
      </ul>
      <h3>Available Resources:</h3>
      <ul>
        <li>Learning Management System</li>
        <li>Technical Libraries</li>
        <li>Training Materials</li>
        <li>Mentorship Program</li>
        <li>Online Courses</li>
        <li>Company Resources</li>
      </ul>
      <h3>Contact Information:</h3>
      <ul>
        <li>HR Department: [Email/Phone]</li>
        <li>Technical Support: [Email/Phone]</li>
        <li>Program Coordinator: [Email/Phone]</li>
        <li>Emergency Contact: [Phone]</li>
      </ul>
      <h3>Useful Links:</h3>
      <ul>
        <li>Intern Portal: [URL]</li>
        <li>Company Website: [URL]</li>
        <li>Learning Resources: [URL]</li>
        <li>Company Policies: [URL]</li>
      </ul>
      <h3>Additional Information:</h3>
      <ul>
        <li>Transportation facilities available from major locations</li>
        <li>Cafeteria facilities at subsidized rates</li>
        <li>Access to company recreational facilities</li>
        <li>Opportunity to participate in company events</li>
        <li>Healthcare facilities as per company policy</li>
      </ul>
      <p>We encourage you to carefully review all the information provided above. If you have any questions or need clarification, please don't hesitate to contact our HR department.</p>
      <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
      <hr>
      <p>This is an official communication from Sri Lanka Telecom Mobitel. Please save this email for future reference.</p>
      <p>---<br>This is an automated message. Please do not reply directly to this email.</p> 
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = sendMail;
