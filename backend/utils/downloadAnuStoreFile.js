// utils/fileStorage.js
/*const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Function to download and store a file
const downloadAndStoreFile = async (fileUrl) => {
  try {
    // Extract the file name from the URL
    const fileName = path.basename(fileUrl); // e.g., "cv.pdf"
    const filePath = path.join(__dirname, "../uploads", fileName); // Save in the "uploads" folder

    // Ensure the "uploads" directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // Download the file
    const response = await axios({
      method: "get",
      url: fileUrl,
      responseType: "stream", // Stream the file
    });

    // Save the file to the server
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // Return the file path or URL
    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(filePath)); // Resolve with the file path
      writer.on("error", reject); // Handle errors
    });
  } catch (error) {
    console.error("Error downloading and storing file:", error);
    throw new Error("Failed to download and store file.");
  }
};

module.exports = { downloadAndStoreFile };*/

const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const uploadDir = path.join(__dirname, "../uploads");

const storeFile = (file, subFolder = "") => {
  // Ensure uploads directory exists
  const fullUploadPath = path.join(uploadDir, subFolder);
  if (!fs.existsSync(fullUploadPath)) {
    fs.mkdirSync(fullUploadPath, { recursive: true });
  }

  // Generate unique filename
  const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
  const filePath = path.join(fullUploadPath, uniqueFileName);

  // Move file
  fs.writeFileSync(filePath, file.buffer);

  // Return relative path for database storage
  return path.join(subFolder, uniqueFileName);
};

const deleteFile = (filePath) => {
  const fullPath = path.join(uploadDir, filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  storeFile,
  deleteFile,
  UPLOAD_DIR: uploadDir,
};
