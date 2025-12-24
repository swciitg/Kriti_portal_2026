// routes/submissionSubmission.js
import { Router } from "express";
import multer from "multer";
import { handleRouteAccess, verifyJWT } from "../middlewares/auth.js";
import {
  getUserSubmissionInfo,
  listOpenPSForSubmission,
  getPSForSubmission,
  createSubmission,
} from "../controllers/techSecy/submissions.js";
import { getSubmission } from "../controllers/techSecy/submissions.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/submissions");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.route("/user-info").get(verifyJWT, handleRouteAccess, getUserSubmissionInfo);

router.route("/ps/open").get(verifyJWT, handleRouteAccess, listOpenPSForSubmission);

router.route("/ps/:psId").get(verifyJWT, handleRouteAccess, getPSForSubmission);

router.route("/submit").post(verifyJWT, handleRouteAccess, upload.array("files"), createSubmission);

router.route("/view/:submissionId").get(verifyJWT, handleRouteAccess, getSubmission);

export default router;
