// queueworker.js
const { compileAndRun, appendToGradebook } = require("./autograder");
const minioClient = require("./minioClient");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { EventEmitter } = require("events");

// Event emitter for broadcasting job-status updates
const events = new EventEmitter();
const gradingQueue = [];

// Directory for initial file downloads
const TEMP_DIR = path.join(os.tmpdir(), "grading_inputs");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Helper to download an object from MinIO
function downloadFile(bucket, objectName, destPath) {
  return new Promise((resolve, reject) => {
    minioClient.fGetObject(bucket, objectName, destPath, (err) => {
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

      // Notify front-end that grading has started
      events.emit('jobStatus', { file: file_name, status: 'running' });

      let passed = false;
      let actual, expected;

      // Download & grade within try/catch to ensure we always emit completion
      try {
        await downloadFile("submissions", file_name, tempPath);
        passed = await compileAndRun(tempPath);

        // If grading failed, attempt to read outputs (may fail silently)
        if (!passed) {
          try {
            actual = fs.readFileSync(path.join(process.cwd(), 'output.txt'), 'utf8').trim();
          } catch {}
          try {
            expected = fs.readFileSync(path.join(process.cwd(), 'exp_1.txt'), 'utf8').trim();
          } catch {}
        }
      } catch (err) {
        console.error(`[ERROR] Processing ${file_name}:`, err);
      }

      // Always emit a completion event, even on errors
      events.emit('jobStatus', {
        file: file_name,
        status: 'complete',
        passed,
        ...(passed ? {} : { actual, expected })
      });

      // Record in CSV
      appendToGradebook(student_id, passed);
      console.log(`[✓] Graded ${file_name} → Passed: ${passed}`);

      // Clean up downloaded C file
      fs.unlink(tempPath, () => {});
    }
    // Throttle loop
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

module.exports = { gradingQueue, processGradingJobs, events };
