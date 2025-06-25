require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");


const authRoutes = require("./routes/authRoutes");
const emailRoutes = require("./routes/emailRoutes");
const bankRoutes = require("./routes/bankRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const certificateRoutes = require("./routes/certificateRoutes");
const placementReportRoutes = require("./routes/placementReportRoutes");
const cvRoutes = require("./routes/cvRoutes");
const districtsRoutes = require("./routes/districtRoutes");
const instituteRoutes = require("./routes/instituteRoutes");
const statsRoutes = require("./routes/statsRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const universityRoutes = require("./routes/UniversityRoutes");
const autoDeleteRejectedCVs = require("./config/autoDeleteRejectedCVs");
const interviewRoutes = require("./routes/interviewRoutes");
const inductionRoutes = require("./routes/inductionRoutes");
const schemeRoute = require("./routes/schemeRoute");
const staffRoutes = require("./routes/staffRoutes");
const internRoutes = require("./routes/internRoutes");
const letterRoutes = require("./routes/letterRoutes");
const internRequestRoutes = require("./routes/internRequestRoutes");
const certificate = require("./routes/Certificate");
const letter = require("./routes/letter");
const stationRoutes = require("./routes/stationRoutes");
const rotationalRoutes = require("./routes/rotationalRoutes");
// const userActivityRoutes = require("./routes/userActivityRoutes");
const certificateLetterRoutes = require("./routes/certificateLetterRoutes");
const { passport } = require('./config/oauthStrategies');
const employeeRoutes = require("./routes/employeeRoutes");
const placementLetterRoutes = require("./routes/placementLetterRoutes");
const rotationRoutes = require("./routes/rotationRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Initialize passport
app.use(passport.initialize());

// Middleware
app.use(cors());
app.use(express.json());
app.use(errorHandler);
app.use(express.urlencoded({ extended: true }));
autoDeleteRejectedCVs();

// Serve static files (for image uploads, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/bankDetails", bankRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/placement", placementReportRoutes);
app.use("/api/cvs", cvRoutes);
app.use("/api/districts", districtsRoutes);
app.use("/api/institutes", instituteRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/inductions", inductionRoutes);
app.use("/api/schemes", schemeRoute);
app.use("/api/staff", staffRoutes);
app.use("/api/interns", internRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/internRequest", internRequestRoutes);
app.use("/api/interncertificates", certificate);
app.use("/api/letters", letter);
app.use("/api/stations", stationRoutes);
app.use("/api/rotational", rotationalRoutes);
// app.use("/api/user-activity", userActivityRoutes);
app.use("/api/certificate-letters", certificateLetterRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/placementletters", placementLetterRoutes);
app.use("/api/rotation", rotationRoutes);



// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI); 

    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};


// Real-time updates for stats
io.on("connection", (socket) => {
  console.log("Client connected to WebSocket");

  socket.on("disconnect", () => {
    console.log("Client disconnected from WebSocket");
  });
});

// Connect to MongoDB and Start Server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

