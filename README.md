# Automated Grading System for C Files

A Node.js-based backend system designed to automatically grade C programming assignments submitted by students. It supports file upload, compilation, execution, and result logging — all within an isolated, concurrent, and testable environment.

## ✨ Features

- 🔼 Upload endpoint to submit `.c` files via web or `curl`
- 🧠 Intelligent queue worker that:
  - Compiles C code using `gcc`
  - Runs test cases against expected output
  - Detects crashes, infinite loops, and compile-time warnings
- 📦 MinIO integration for object storage
- 📊 Auto-updated `gradebook.csv` with grading results
- ✅ Robust test coverage for edge cases (malicious files, duplicates, missing metadata, etc.)

## 🛠️ Tech Stack

- **Node.js**, **Express** – API and job coordination  
- **MinIO** – S3-compatible file storage  
- **Docker** – Sandboxed compilation & execution  
- **Bash**, **GCC** – System-level grading logic  
- **CSV** – Simple and readable results persistence

## 📁 Project Structure

