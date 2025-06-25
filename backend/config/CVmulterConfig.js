const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure upload directories
const uploadsDir = path.join(__dirname, "../uploads");
const cvUploadsDir = path.join(uploadsDir, "cvs");
const bulkUploadsDir = path.join(uploadsDir, "bulk-uploads");

// Create directories if they don't exist
[uploadsDir, cvUploadsDir, bulkUploadsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File type configurations
const ALLOWED_CV_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_BULK_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
];

const MAX_CV_FILE_SIZE = 5 * 1024 * 1024; // 5MB for individual CV files
const MAX_BULK_FILE_SIZE = 10 * 1024 * 1024; // 10MB for bulk uploads

// CV File Upload Configuration
const cvFileFilter = (req, file, cb) => {
  if (!ALLOWED_CV_FILE_TYPES.includes(file.mimetype)) {
    const error = new Error(
      "Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed."
    );
    error.code = "LIMIT_FILE_TYPE";
    return cb(error, false);
  }
  cb(null, true);
};

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cvUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

// Bulk Upload Configuration
const bulkFileFilter = (req, file, cb) => {
  if (!ALLOWED_BULK_FILE_TYPES.includes(file.mimetype)) {
    const error = new Error(
      "Invalid file type. Only Excel files (.xlsx, .xls) are allowed."
    );
    error.code = "LIMIT_FILE_TYPE";
    return cb(error, false);
  }
  cb(null, true);
};

const bulkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bulkUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = `bulk-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

// Create Multer instances
const upload = multer({
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: {
    fileSize: MAX_CV_FILE_SIZE,
    files: 4, // Maximum number of files for CV upload
  },
});

const cvFileUpload = upload.fields([
  { name: "updatedCv", maxCount: 1 },
  { name: "nicFile", maxCount: 1 },
  { name: "policeClearanceReport", maxCount: 1 },
  { name: "internshipRequestLetter", maxCount: 1 },
]);

const bulkUpload = multer({
  storage: bulkStorage,
  fileFilter: bulkFileFilter,
  limits: {
    fileSize: MAX_BULK_FILE_SIZE,
  },
}).single("file"); // 'file' is the field name expected in the form

module.exports = {
  upload,
  cvFileUpload,
  bulkUpload,
};
