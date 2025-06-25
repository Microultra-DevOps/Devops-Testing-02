const express = require("express");
const stationController = require("../controllers/stationController");

const router = express.Router();

router.post("/create-station", stationController.createStation);
router.get("/all-stations", stationController.getStations);
router.put("/edit-station/:id", stationController.updateStation);
router.delete("/delete/:id", stationController.deleteStation);
router.get("/get-station/:id", stationController.getStationById);
router.get("/:id/cvs", stationController.getCVsByStation);

module.exports = router;
 