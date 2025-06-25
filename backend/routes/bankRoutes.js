const express = require("express");
const router = express.Router();
const {
  addBankDetails,
  getAllBankDetails,
  getBankDetailsByNIC,
  updateBankDetails,
  deleteBankDetails,
  updateBankDetailsById,
  getBankDetailsById,
  deleteBankDetailsById
} = require("../controllers/bankController");

// Routes
router.post("/", addBankDetails);
router.get("/", getAllBankDetails);
router.get("/:nic", getBankDetailsByNIC);
router.put("/:nic", updateBankDetails);
router.delete("/:nic", deleteBankDetails);
router.get("/id/:id", getBankDetailsById);
router.put("/id/:id", updateBankDetailsById);
router.delete("/id/:id", deleteBankDetailsById);

module.exports = router;
