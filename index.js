const express = require("express");
const cors = require("cors");
// const fetch = require("node-fetch");
const crypto = require("crypto");
const youtubedl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3050", "http://localhost:3000"],
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

// app.post("/downloadVideo", async (req, res) => {
//   const { videoUrl } = req.body;
//   console.log(videoUrl);
//   if (!videoUrl) {
//     res.status(400).send("Missing video URL.");
//   }
//   // Generate an 8-digit random ID
//   const id = Math.floor(10000000 + Math.random() * 90000000);
//   console.log(id);

//   const videoOutputDir = path.resolve(__dirname, "audioFiles");
//   const thumbnailOutputDir = path.resolve(__dirname, "thumbnails");

//   const videoFilename = `${id}_%(title)s.%(ext)s`;
//   const thumbnailFilename = `${id}_%(title)s.jpg`;

//   const videoOptions = {
//     output: path.join(videoOutputDir, videoFilename), // Specify video output directory with ID in filename
//     format: "bestvideo+bestaudio",
//   };

//   const thumbnailOptions = {
//     output: path.join(thumbnailOutputDir, thumbnailFilename), // Specify thumbnail output directory with ID in filename
//     writeThumbnail: true,
//     skipDownload: true, // Skip downloading the video itself
//   };

//   try {
//     await youtubedl(videoUrl, videoOptions); // Download the video
//     await youtubedl(videoUrl, thumbnailOptions); // Download the thumbnail
//     console.log("Video and thumbnail downloaded successfully.");
//     res.status(200).json({ message: "success" }); // Send success status code
//   } catch (error) {
//     console.error("Error downloading video:", error);
//     res.status(500).send("Error downloading video.");
//   }
// });

function getYouTubeThumbnailUrl(videoUrl) {
  const videoId = videoUrl.match(/(youtu\.be\/|v=)([\w-]+)/)[2];
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  return thumbnailUrl;
}

// Create "audioFiles" directory if it doesn't exist
const audioFilesDir = path.resolve(__dirname, "audioFiles");
if (!fs.existsSync(audioFilesDir)) {
  fs.mkdirSync(audioFilesDir);
}

// Start the server
const port = 3050; // Replace with the desired port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
