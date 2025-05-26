// main.js
const fs = require("fs");
const path = require("path");
const os = require("os");
const express = require("express");
const multer = require("multer");
const minioClient = require("./minioClient");
const { gradingQueue, processGradingJobs } = require("./queueworker");

// Directly use fPutObject (already returns a Promise)
const fPutObject = minioClient.fPutObject.bind(minioClient);

const app = express();
const PORT = 3000;
const TEMP_DIR = path.join(os.tmpdir(), "minio_uploads");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Start background grading loop once on startup
processGradingJobs();

// POST /enqueue: upload files to MinIO and enqueue grading jobs
app.post("/enqueue", upload.array("files"), async (req, res) => {
  const enqueued = [];

  for (const file of req.files) {
    const objectName = file.originalname;
    const localPath = file.path;

    try {
      await fPutObject("submissions", objectName, localPath);
      console.log(`Uploaded ${objectName} to MinIO`);
    } catch (err) {
      console.error(`Failed to upload ${objectName}:`, err);
      // skip this file on error
      continue;
    }

    const studentId = path.basename(objectName, ".c").replace("assignment", "");
    gradingQueue.push({ student_id: studentId, file_name: objectName });
    enqueued.push(studentId);
    console.log(`[→] Job enqueued: ${objectName}`);

    // Clean up local temp file
    fs.unlinkSync(localPath);
  }

  res.json({ queued: enqueued });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
