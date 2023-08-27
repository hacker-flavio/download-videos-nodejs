const express = require("express");
const cors = require("cors");
const port = 3050; // Replace with the desired port number
const youtubedl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware to reject requests from unauthorized origins
app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:3050", "http://localhost:3000"];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    // Allow the request to proceed
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
  } else {
    // Reject the request
    res.status(403).send("Forbidden");
  }
});

// CORS middleware
app.use(
  cors({
    methods: ["GET", "POST"],
    credentials: true,
    maxAge: 86400, // cache for one day
  })
);

app.post("/downloadVideo", async (req, res) => {
  const { videoUrl } = req.body;
  console.log(videoUrl);
  if (!videoUrl) {
    res.status(400).send("Missing video URL.");
  }
  // Generate an 8-digit random ID
  const id = Math.floor(10000000 + Math.random() * 90000000);
  console.log(id);

  const videoOutputDir = path.resolve(__dirname, "videoFiles");
  const thumbnailOutputDir = path.resolve(__dirname, "thumbnails");

  const videoFilename = `${id}_%(title)s.%(ext)s`;
  const thumbnailFilename = `${id}_%(title)s.jpg`;

  const videoOptions = {
    output: path.join(videoOutputDir, videoFilename), // Specify video output directory with ID in filename
    format: "best", // Get the best available quality
  };

  const thumbnailOptions = {
    output: path.join(thumbnailOutputDir, thumbnailFilename), // Specify thumbnail output directory with ID in filename
    writeThumbnail: true,
    skipDownload: true, // Skip downloading the video itself
  };

  try {
    await youtubedl(videoUrl, videoOptions); // Download the video
    await youtubedl(videoUrl, thumbnailOptions); // Download the thumbnail
    console.log("Video and thumbnail downloaded successfully.");
    res.status(200).json({ message: "success" }); // Send success status code
  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).send("Error downloading video.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
