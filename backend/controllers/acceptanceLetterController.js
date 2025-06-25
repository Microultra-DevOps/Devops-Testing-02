// controllers/acceptanceLetterController.js
const AcceptanceLetter = require('../models/AcceptanceLetter');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Utility function to generate reference number
const generateReferenceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `REF-${year}${month}${day}-${randomNum}`;
};

// Format date consistently
const formatDate = (dateObj) => {
  return dateObj.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Generate PDF
const generatePDF = (letterData) => {
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const path = require('path');

  // Ensure the directory exists
  const dirPath = path.join(__dirname, '../../public/letters');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, `${letterData.nic}-acceptance-letter.pdf`);
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  // Write to file
  doc.pipe(fs.createWriteStream(filePath));

  // Letter Header with Line Gap
  const headerOptions = { align: 'center', lineGap: 6 };
  doc.fontSize(10).text('INTERNAL USE ONLY', headerOptions);
  doc.moveDown(0.5);
  doc.fontSize(16).text('Memo', headerOptions);
  doc.fontSize(10).text('Talent Development Section', headerOptions);
  doc.fontSize(10).text('7th Floor, Head Office, Lotus Road, Colombo 01', headerOptions);
  doc.moveDown(2);

  // Letter Reference and Contact Info with line gap
  const paragraphOptions = { align: 'justify', lineGap: 6 };

  doc.fontSize(10).text(`Our/My Ref: ${letterData.letterRef}`, paragraphOptions);
  doc.text('Your Ref:', paragraphOptions);
  doc.text(`To: DGM/${letterData.department}`, paragraphOptions);
  doc.text('From: Engineer/Talent Development', paragraphOptions);

  // Right-Aligned Contact Information (with line gap)
  doc.moveUp(4);
  doc.text('Telephone: 011-2021359, 2021263', { align: 'right', lineGap: 6 });
  doc.text('Email: shrivi@slt.com.lk', { align: 'right', lineGap: 6 });

  // Ensure valid date
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0]; 
  doc.text(`Date: ${formattedDate}`, { align: 'right' });

  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  doc.moveDown(1);

  // Letter Subject
  doc.fontSize(11).text(`Subject: Assignment of ${letterData.internPosition}`, { bold: true });
  doc.moveDown(1);

  // Letter Body with Increased Line Space and Justification
  doc.text(`Following student/ Students from ${letterData.institute} has/have been assigned to you for the Intern Programme under your supervision from ${formatDate(letterData.startDate)} to ${formatDate(letterData.endDate)}.`, paragraphOptions);
  doc.moveDown(1);

  doc.text('Please arrange to accommodate the Intern(s). Kindly note that the induction program is mandatory for all interns, and ensure they are released for the next induction training.', paragraphOptions);
  doc.moveDown(1);

  doc.text('Please do not expose any confidential information to the Intern and strictly follow the prevailing Information Security guidelines at SLT when assigning duties to the Intern.', paragraphOptions);
  doc.moveDown(2);

  // Student Details Table
  doc.fontSize(10).text('Details of the Interns are as follows:', { bold: true });
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const tableLeft = 50;
  const colWidth = 230;

  // Table Headers
  doc.rect(tableLeft, tableTop, colWidth * 2, 20).stroke();
  doc.fontSize(10).text('Name', tableLeft + 5, tableTop + 5);
  doc.text('NIC No', tableLeft + colWidth + 5, tableTop + 5);

  // Table Row
  doc.rect(tableLeft, tableTop + 20, colWidth * 2, 20).stroke();
  doc.fontSize(10).text(`1. ${letterData.fullName}`, tableLeft + 5, tableTop + 25);
  doc.text(letterData.nic, tableLeft + colWidth + 5, tableTop + 25);

  doc.y = tableTop + 50;
  doc.moveDown(2);

  // Engineer Signature Section (Aligned Left)
  doc.text('...................................................', 50);
  doc.text('Engineer/ Talent Development', 50);
  doc.moveDown(3);

  // Horizontal Line
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  doc.moveDown(1);

  // Document Checklist (Aligned Left)
  doc.fontSize(10).text('Intern has signed the following documents:', { bold: true });
  doc.moveDown(0.5);

  // Properly Aligned Checklist with Unicode Checkboxes
  const checklistY = doc.y;
  doc.text(' Police Report', 50, checklistY);
  doc.text(' Agreement', 50, checklistY + 15);
  doc.text(' Duration Checked', 250, checklistY);
  doc.text(' NDA', 250, checklistY + 15);

  // Signature Area
  doc.text('...........................', 400, checklistY + 30);
  doc.text('Signature', 420, checklistY + 45);

  doc.end();

  return filePath;
};



// Generate Acceptance Letter
exports.generateAcceptanceLetter = async (req, res) => {
  try {
    const letterData = req.body;

    // Log the request payload for debugging
    console.log('Request Payload:', letterData);

    // Validate required fields
    const requiredFields = [
      'fullName', 
      'institute', 
      'programName', 
      'duration', 
      'startDate', 
      'managerName', 
      'managerPosition', 
      'department', 
      'internPosition', 
      'nic'
    ];
    
    for (const field of requiredFields) {
      if (!letterData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Generate reference number only if not provided
    if (!letterData.letterRef) {
      letterData.letterRef = generateReferenceNumber();
    }

    // Parse startDate to ensure it's a Date object
    const startDate = new Date(letterData.startDate);
    
    // Calculate end date based on start date and duration
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(letterData.duration));
    letterData.startDate = startDate;
    letterData.endDate = endDate;

    // Save to database
    const newLetter = new AcceptanceLetter(letterData);
    await newLetter.save();

    // Generate PDF
    const filePath = generatePDF(letterData);

    // Send response
    res.status(200).json({ 
      message: 'Acceptance letter generated successfully', 
      letterData: newLetter,
      filePath: `/letters/${letterData.nic}-acceptance-letter.pdf`
    });
  } catch (error) {
    console.error('Error generating acceptance letter:', error);
    res.status(500).json({ message: 'Error generating acceptance letter', error: error.message });
  }
};

// Download Acceptance Letter
exports.downloadAcceptanceLetter = async (req, res) => {
  try {
    const { nic } = req.params;
    const filePath = path.join(__dirname, `../../public/letters/${nic}-acceptance-letter.pdf`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'PDF file not found' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nic}-acceptance-letter.pdf`);
    
    // Stream the file to the response
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Error downloading acceptance letter:', error);
    res.status(500).json({ message: 'Error downloading acceptance letter', error: error.message });
  }
};