const PlacementLetter = require("../models/PlacementLetter");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const crypto = require("crypto");

// Function to generate unique letter ID
const generateUniqueLetterID = async () => {
  let isUnique = false;
  let letterId;
  
  while (!isUnique) {
    const year = new Date().getFullYear();
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase(); 
    letterId = `PL-${year}-${randomPart}`;
    
    // Check if this ID already exists in database
    const existingLetter = await PlacementLetter.findOne({ letterId });
    if (!existingLetter) {
      isUnique = true;
    }
  }
  
  return letterId;
};

// Alternative function for sequential ID generation
const generateSequentialLetterID = async () => {
  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);
  
  // Count letters created this year
  const countThisYear = await PlacementLetter.countDocuments({
    createdAt: {
      $gte: yearStart,
      $lte: yearEnd
    }
  });
  
  // Generate sequential number with leading zeros
  const sequenceNumber = (countThisYear + 1).toString().padStart(4, '0');
  const letterId = `PL-${year}-${sequenceNumber}`;
  
  // Double-check uniqueness
  const existingLetter = await PlacementLetter.findOne({ letterId });
  if (existingLetter) {
    // If somehow exists, fall back to random generation
    return generateUniqueLetterID();
  }
  
  return letterId;
};

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/placement-letters");
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use the original filename from the request
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

// Save PDF to database
const savePDF = async (req, res) => {
  try {
    let { letterId, letterType, nicValue, letterData } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    if (!nicValue) {
      return res.status(400).json({ message: "NIC value is required" });
    }

    // Parse letterData if it's a string
    let parsedLetterData = {};
    if (letterData) {
      try {
        parsedLetterData = typeof letterData === 'string' ? JSON.parse(letterData) : letterData;
      } catch (error) {
        console.error("Error parsing letter data:", error);
        parsedLetterData = {};
      }
    }

    // Generate unique letter ID if not provided or if it's 'preview'
    if (!letterId || letterId === 'preview') {
      letterId = await generateSequentialLetterID(); 
      console.log("Generated new letter ID:", letterId);
    }

    // Check if letter already exists (for updates)
    const existingLetter = await PlacementLetter.findOne({ letterId });
    if (existingLetter) {
      // Update existing letter
      existingLetter.fileName = req.file.filename;
      existingLetter.filePath = req.file.path;
      existingLetter.fileSize = req.file.size;
      existingLetter.letterData = parsedLetterData;
      existingLetter.nicValue = nicValue;
      existingLetter.letterType = letterType || 'placement';
      
      await existingLetter.save();
      
      return res.json({
        message: "Placement letter PDF updated successfully",
        letter: existingLetter
      });
    }

    // Create new placement letter record
    const newPlacementLetter = new PlacementLetter({
      letterId,
      letterType: letterType || 'placement',
      nicValue,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      letterData: parsedLetterData,
      createdBy: req.user ? req.user.id : null
    });

    await newPlacementLetter.save();

    res.status(201).json({
      message: "Placement letter PDF saved successfully",
      letter: newPlacementLetter
    });

  } catch (error) {
    console.error("Error saving placement letter PDF:", error.message);
    
    // Clean up uploaded file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: "Server error while saving PDF" });
  }
};

// New endpoint to generate letter ID without saving
const generateLetterID = async (req, res) => {
  try {
    const letterId = await generateSequentialLetterID(); 
    
    res.json({
      success: true,
      letterId: letterId
    });
  } catch (error) {
    console.error("Error generating letter ID:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to generate letter ID" 
    });
  }
};

// Get all placement letters
const getPlacementLetters = async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'createdBy',
        select: 'username email fullName'
      }
    };

    const query = { status };

    // Check if mongoose-paginate-v2 is available
    if (PlacementLetter.paginate) {
      const letters = await PlacementLetter.paginate(query, options);
      
      if (!letters.docs.length) {
        return res.status(200).json({ 
          docs: [],
          totalDocs: 0,
          limit: parseInt(limit),
          page: parseInt(page),
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }

      res.json(letters);
    } else {
      // Fallback without pagination plugin
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const letters = await PlacementLetter.find(query)
        .populate('createdBy', 'username email fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await PlacementLetter.countDocuments(query);
      const totalPages = Math.ceil(total / parseInt(limit));

      const result = {
        docs: letters,
        totalDocs: total,
        limit: parseInt(limit),
        page: parseInt(page),
        totalPages: totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      };

      res.json(result);
    }
  } catch (error) {
    console.error("Error fetching placement letters:", error.message);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Alternative simple version without pagination
const getPlacementLettersSimple = async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    
    const letters = await PlacementLetter.find({ status })
      .populate('createdBy', 'username email fullName')
      .sort({ createdAt: -1 });
    
    if (!letters.length) {
      return res.status(200).json([]);
    }

    res.json(letters);
  } catch (error) {
    console.error("Error fetching placement letters:", error.message);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get placement letter by ID
const getPlacementLetterById = async (req, res) => {
  const { letterId } = req.params;
  
  try {
    const letter = await PlacementLetter.findOne({ letterId }).populate('createdBy', 'username email fullName');
    
    if (!letter) {
      return res.status(404).json({ message: "Placement letter not found" });
    }

    res.json(letter);
  } catch (error) {
    console.error("Error fetching placement letter:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Download placement letter PDF
const downloadPDF = async (req, res) => {
  const { letterId } = req.params;
  
  try {
    const letter = await PlacementLetter.findOne({ letterId });
    
    if (!letter) {
      return res.status(404).json({ message: "Placement letter not found" });
    }

    const filePath = letter.filePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "PDF file not found on server" });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${letter.fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error("Error downloading placement letter PDF:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete placement letter
const deletePlacementLetter = async (req, res) => {
  const { letterId } = req.params;
  
  try {
    const letter = await PlacementLetter.findOne({ letterId });
    
    if (!letter) {
      return res.status(404).json({ message: "Placement letter not found" });
    }

    // Delete the PDF file from filesystem
    if (fs.existsSync(letter.filePath)) {
      fs.unlinkSync(letter.filePath);
    }

    // Delete the database record
    await PlacementLetter.deleteOne({ letterId });

    res.json({ message: "Placement letter deleted successfully" });
    
  } catch (error) {
    console.error("Error deleting placement letter:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Archive placement letter (soft delete)
const archivePlacementLetter = async (req, res) => {
  const { letterId } = req.params;
  
  try {
    const letter = await PlacementLetter.findOneAndUpdate(
      { letterId },
      { status: 'archived' },
      { new: true }
    );
    
    if (!letter) {
      return res.status(404).json({ message: "Placement letter not found" });
    }

    res.json({ 
      message: "Placement letter archived successfully", 
      letter 
    });
    
  } catch (error) {
    console.error("Error archiving placement letter:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Search placement letters by NIC
const searchByNIC = async (req, res) => {
  const { nic } = req.query;
  
  try {
    if (!nic) {
      return res.status(400).json({ message: "NIC parameter is required" });
    }

    const letters = await PlacementLetter.find({
      nicValue: { $regex: nic, $options: 'i' },
      status: 'active'
    }).populate('createdBy', 'username email fullName').sort({ createdAt: -1 });

    if (!letters.length) {
      return res.status(404).json({ message: "No placement letters found for this NIC" });
    }

    res.json(letters);
    
  } catch (error) {
    console.error("Error searching placement letters:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  upload,
  savePDF,
  generateLetterID,
  getPlacementLetters,
  getPlacementLetterById,
  downloadPDF,
  deletePlacementLetter,
  archivePlacementLetter,
  searchByNIC,
  getPlacementLettersSimple
};