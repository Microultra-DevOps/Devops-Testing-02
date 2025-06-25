const express = require("express");
const { 
    createCertificateRequest, 
    getUserCertificates, 
    getAllCertificateRequests, 
    updateCertificateStatus, 
    getCertificateById, 
    deleteCertificateRequest,
    getStaffCertificates
} = require("../controllers/certificateController");
const upload = require("../middleware/fileUpload");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

router.post("/create", verifyToken, upload.single("traineeSignature"), createCertificateRequest);
router.get("/user-certificates", verifyToken, getUserCertificates);
router.get("/staff-certificates", verifyToken, getStaffCertificates); 
router.get("/all-requests", verifyToken, getAllCertificateRequests);
router.get("/:id", verifyToken, getCertificateById);
router.put("/update-status/:id", verifyToken, updateCertificateStatus);
router.delete("/:id", verifyToken, deleteCertificateRequest);

module.exports = router;