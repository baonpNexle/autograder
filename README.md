# Automated Grading System for C Files

A Node.js-based backend that automates grading of C programming assignments. It handles file uploads, compilation, execution, and result logging, with MinIO object storage for submitted files.

---

## 🔧 Features
- **Upload API** for `.c` files (single or multiple)
- **MinIO** object storage integration
- **GCC** compilation and execution against predefined test cases
- **gradebook.csv** for persistent result logging
- **Queue worker** for asynchronous, concurrent grading jobs

---

## 🛠 Tech Stack
| Layer        | Technology |
|--------------|------------|
| Backend      | Node.js, Express |
| Storage      | MinIO (S3-compatible) |
| Compilation  | GCC, Bash scripts |
| Execution    | Future Docker isolation (road-mapped) |
| Results      | CSV (gradebook.csv) |

---

## 📂 Project Structure
├── main.js # API server & file upload logic
├── queueworker.js # Processes grading queue
├── autograder.js # Compiles, runs, and grades submissions
├── gradebook.csv # Stores grading results
├── testcases/ # Expected input/output files
└── uploads/ # Temporary file storage


