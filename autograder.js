const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = "Assignments";
const EXPECTED_OUTPUT = "exp_1.txt";
const GRADEBOOK_PATH = "gradebook.csv";

function compileAndRun(cFile) {
  return new Promise((resolve, reject) => {
    const studentId = path.basename(cFile, ".c").replace("assignment", "");

    // Compile
    exec(`gcc ${cFile} -o assignment`, (err, stdout, stderr) => {
      if (err) {
        console.error(`[COMPILATION ERROR] ${stderr}`);
        return resolve(false); // Failed compile = fail
      }

      // Run program and write to output.txt
      const outStream = fs.createWriteStream("output.txt");
      const runProc = spawn("./assignment");

      runProc.stdout.pipe(outStream);

      runProc.on("close", (code) => {
        if (code !== 0) {
          console.error(`[RUNTIME ERROR] exit code ${code}`);
          return resolve(false); // Program crashed
        }

        // Compare output.txt and exp_1.txt
        try {
          const actual = fs.readFileSync("output.txt", "utf8");
          const expected = fs.readFileSync(EXPECTED_OUTPUT, "utf8");
          const passed = actual.trim() === expected.trim();
          resolve(passed);
        } catch (compareErr) {
          console.error(`[COMPARE ERROR] ${compareErr}`);
          resolve(false);
        }
      });
    });
  });
}

function appendToGradebook(studentId, passed, gradebookPath = GRADEBOOK_PATH) {
    const header = "Student ID,Passed\n";
    const row = `${studentId},${passed}\n`;
  
    // Check if the file exists and has content
    const fileExists = fs.existsSync(gradebookPath);
    const isEmpty = fileExists ? fs.readFileSync(gradebookPath, "utf8").trim().length === 0 : true;
  
    // Write header + row synchronously
    const content = (isEmpty ? header : "") + row;
    fs.appendFileSync(gradebookPath, content);
}
    
module.exports = {
  compileAndRun,
  appendToGradebook
};
