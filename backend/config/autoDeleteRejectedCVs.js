const cron = require("node-cron");
const mongoose = require("mongoose");
const CV = require("../models/CV");
const moment = require("moment"); 

// Function to delete rejected CVs older than 7 days
const autoDeleteRejectedCVs = async () => {
  try {
    const sevenDaysAgo = moment().subtract(7, 'days').toDate(); 

    // Find CVs that are rejected and older than 7 days
    const rejectedCVs = await CV.find({
      cvStatus: "rejected",
      applicationDate: { $lt: sevenDaysAgo }
    });

    // Delete those rejected CVs
    if (rejectedCVs.length > 0) {
      for (let cv of rejectedCVs) {
        // You may want to delete associated files too
        if (cv.updatedCv) {
          const fs = require('fs');
          const path = require('path');
          const oldFilePath = path.join(__dirname, "../", cv.updatedCv);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        // Repeat for other files (nicFile, policeClearanceReport, internshipRequestLetter)

        // Delete the CV document from the database
        await CV.findByIdAndDelete(cv._id);
      }
      console.log("Rejected CVs older than 7 days have been deleted.");
    } else {
      console.log("No rejected CVs older than 7 days found.");
    }
  } catch (error) {
    console.error("Error in auto-delete rejected CVs:", error.message);
  }
};

// Schedule this task to run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task to delete rejected CVs older than 7 days...');
  autoDeleteRejectedCVs();
});

module.exports = autoDeleteRejectedCVs;
