// queueworker.js
const { compileAndRun, appendToGradebook } = require("./autograder");
const minioClient = require("./minioClient");
const path = require("path");
const os = require("os");
const fs = require("fs");

const gradingQueue = [];
const TEMP_DIR = path.join(os.tmpdir(), "grading_inputs");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Helper to download an object from MinIO
function downloadFile(bucket, objectName, destPath) {
  return new Promise((resolve, reject) => {
    minioClient.fGetObject(bucket, objectName, destPath, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Async loop for processing grading jobs
async function processGradingJobs() {
  while (true) {
    if (gradingQueue.length > 0) {
      const { student_id, file_name } = gradingQueue.shift();
      const tempPath = path.join(TEMP_DIR, file_name);

      try {
        // Download C file from MinIO
        await downloadFile("submissions", file_name, tempPath);

        // Compile, run, and grade
        const passed = await compileAndRun(tempPath);
        appendToGradebook(student_id, passed);
        console.log(`[✓] Graded ${file_name} → Passed: ${passed}`);
      } catch (err) {
        console.error(`[ERROR] Failed to process ${file_name}:`, err);
      } finally {
        // Clean up local temp file
        fs.unlink(tempPath, () => {});
      }
    }
    // Small delay to avoid a tight loop
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

module.exports = { gradingQueue, processGradingJobs };
