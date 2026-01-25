// src/routes/pssubmissionRoutes.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import {
  getUserSubmissionInfo,
  listOpenPSForSubmission,
  getPSForSubmission,
  createSubmission,
  uploadTempFile,
} from "../controllers/techSecy/submissions.js";
import { getSubmission } from "../controllers/techSecy/submissions.js";
import { uploadChunk } from "../controllers/techSecy/chunkController.js";

const router = Router();

// Max temp upload size (bytes). Can be set via env `MAX_TEMP_UPLOAD_SIZE`.
const MAX_FILE_SIZE = 500 * 1024 * 1024;

// Create temp upload directory
// const tempDir = path.join(process.cwd(), "uploads", "temp");
// if (!fs.existsSync(tempDir)) {
//   fs.mkdirSync(tempDir, { recursive: true });
// }

// Multer config for temp uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, tempDir);
//   },
//   filename: (req, file, cb) => {
//     const userId = req.user?._id || "unknown";
//     const timestamp = Date.now();
//     const random = Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, `${userId}_${timestamp}_${random}${ext}`);
//   },
// });

const CHUNKS_DIR = path.join(process.cwd(), "uploads", "chunks");
if (!fs.existsSync(CHUNKS_DIR)) fs.mkdirSync(CHUNKS_DIR, { recursive: true });

const chunkStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CHUNKS_DIR),
  filename: (req, file, cb) => {
    const { fileName, chunkIndex } = req.query;
    const safeFileName = `${req.user._id}_${fileName}`;
    cb(null, `${safeFileName}.part_${chunkIndex}`);
  },
});

const chunkUpload = multer({ storage: chunkStorage });

// const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE } });

router
  .route("/user-info")
  .get(verifyJWT, handleRouteAccess, getUserSubmissionInfo);
router
  .route("/ps/open")
  .get(verifyJWT, handleRouteAccess, listOpenPSForSubmission);
router.route("/ps/:psId").get(verifyJWT, handleRouteAccess, getPSForSubmission);

// NEW: Upload individual file to temp
// router
//   .route("/upload-temp")
//   .post(verifyJWT, handleRouteAccess, upload.single("file"), uploadTempFile);

router.post(
  "/upload-chunk",
  verifyJWT,
  handleRouteAccess,
  chunkUpload.single("chunk"),
  uploadChunk,
);

// UPDATED: Submit form (moves temp files to permanent)
router.route("/submit").post(verifyJWT, handleRouteAccess, createSubmission);

router
  .route("/view/:submissionId")
  .get(verifyJWT, handleRouteAccess, getSubmission);

export default router;
