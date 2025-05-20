const { compileAndRun, appendToGradebook } = require("./autograder");

const gradingQueue = [];

// Continuously process grading jobs
function processGradingJobs() {
  setInterval(async () => {
    if (gradingQueue.length === 0) return;

    const job = gradingQueue.shift(); // dequeue

    try {
      const { student_id, file_path } = job;
      const passed = await compileAndRun(file_path);
      await appendToGradebook(student_id, passed);
    } catch (err) {
      console.error(`[ERROR] Failed to process job ${JSON.stringify(job)}: ${err}`);
    }
  }, 500); // checks every 500ms
}

module.exports = {
  gradingQueue,
  processGradingJobs
};
