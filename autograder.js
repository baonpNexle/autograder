// autograder.js
const { execFile, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const e = require("express");

// Expected output file relative to this script
const EXPECTED_OUTPUT = path.join(__dirname, "exp_1.txt");
const GRADEBOOK_PATH = "gradebook.csv";

function compileAndRun(cFilePath) {
  return new Promise((resolve) => {
    const studentId = path.basename(cFilePath, ".c").replace("assignment", "");
    // Create an isolated temp directory for this run
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `grade-${studentId}-`));
    const binaryPath = path.join(tempDir, "assignment");
    const tempOutputPath = path.join(tempDir, "output.txt");

    // Compile the C file
    execFile("gcc", [cFilePath, "-o", binaryPath], (compErr, _stdout, compStderr) => {
      if (compErr) {
        console.error(`[COMPILATION ERROR][${studentId}] ${compStderr.trim()}`);
        fs.rm(tempDir, { recursive: true, force: true }, () => {});
        return resolve(false);
      }

      // Run the binary in its temp directory so it writes output.txt there
      const runProc = spawn(binaryPath, { cwd: tempDir });
      runProc.stderr.on("data", (data) => {
        console.error(`[RUNTIME STDERR][${studentId}] ${data.toString().trim()}`);
      });
      runProc.on("error", (err) => {
        console.error(`[PROCESS SPAWN ERROR][${studentId}] ${err.message}`);
        fs.rm(tempDir, { recursive: true, force: true }, () => {});
        return resolve(false);
      });

      runProc.on("close", (code) => {
        if (code !== 0) {
          console.error(`[RUNTIME ERROR][${studentId}] exit code ${code}`);
          fs.rm(tempDir, { recursive: true, force: true }, () => {});
          return resolve(false);
        }
        // After successful run, read the generated output.txt
        try {
          const normalize = s => s.replace(/\r\n/g, "\n").trim();
          const actual = normalize(fs.readFileSync(tempOutputPath, "utf8"));
          const expected = normalize(fs.readFileSync(EXPECTED_OUTPUT, "utf8"));
          const passed = actual === expected;
          if (!passed) {
            console.log(`[MISMATCH][${studentId}]\n actual="${actual}"\n expected="${expected}"`);
          }
          resolve(passed);
        } catch (err) {
          console.error(`[COMPARE ERROR][${studentId}] ${err.message}`);
          resolve(false);
        } finally {
          fs.rm(tempDir, { recursive: true, force: true }, () => {});
        }
      });
    });
  });
}


function appendToGradebook(studentId, passed, gradebookPath = GRADEBOOK_PATH) {
  const header = "Student ID,Passed\n";
  const row = `${studentId},${passed}\n`;
  const fileExists = fs.existsSync(gradebookPath);
  const isEmpty = fileExists ? fs.readFileSync(gradebookPath, "utf8").trim().length === 0 : true;
  const content = (isEmpty ? header : "") + row;
  fs.appendFileSync(gradebookPath, content);
}

module.exports = { compileAndRun, appendToGradebook };
