const express = require("express");
const { getStats, incrementVisitorCount, updateStats } = require("../controllers/statsController");
const router = express.Router();

router.get("/", getStats); 
router.put("/", updateStats); 
router.post("/visit", incrementVisitorCount);

module.exports = router;
