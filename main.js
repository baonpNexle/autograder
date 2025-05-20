const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { gradingQueue, processGradingJobs } = require("./queueworker");

const app = express();
const PORT = 3000;

const UPLOAD_DIR = "Assignments";

// Setup upload middleware
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Startup logic
(async () => {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  processGradingJobs(); // Background task
})();

// Route to enqueue uploaded files
app.post("/enqueue", upload.array("files"), async (req, res) => {
  const enqueued = [];

  for (const file of req.files) {
    const studentId = path.basename(file.originalname, ".c").replace("assignment", "");
    const job = {
      student_id: studentId,
      file_path: file.path
    };
    gradingQueue.push(job); // enqueue job
    enqueued.push(studentId);
  }

  res.json({ queued: enqueued });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
