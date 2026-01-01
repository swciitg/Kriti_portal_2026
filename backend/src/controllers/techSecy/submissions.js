// src/controllers/techSecy/submissions.js
import PS from "../../model/ps.js";
import Submission from "../../model/submission.js";
import TechSecy from "../../model/techSecy.js";
import Team from "../../model/team.js";
import TempFileUpload from "../../model/tempFileUpload.js";
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 0. Get user's hostel and team info
 */
export const getUserSubmissionInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const techSecy = await TechSecy.findOne({ user: userId }).select("hostelId");
    if (!techSecy) {
      return res.status(404).json({ success: false, message: "TechSecy record not found for this user" });
    }

    const team = await Team.findOne({
      techSecy: techSecy._id
    }).select("_id hostelId ps");

    if (!team) {
      return res.status(404).json({ success: false, message: "No team found for this TechSecy" });
    }

    res.json({
      success: true,
      hostelId: team.hostelId,
      teamId: team._id,
      psId: team.ps,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 1. List ALL PS for all teams this TechSecy is part of
 */
export const listOpenPSForSubmission = async (req, res) => {
  try {
    const now = new Date();
    const userId = req.user._id;
    const techSecy = await TechSecy.findOne({ user: userId });
    if (!techSecy) {
      return res.status(404).json({ success: false, message: "TechSecy not found" });
    }

    // Find ALL teams this TechSecy is part of
    const teams = await Team.find({ techSecy: techSecy._id }).select("_id ps");
    if (!teams || teams.length === 0) {
      return res.status(404).json({ success: false, message: "No teams found for this TechSecy" });
    }

    // Get all PS IDs
    const psIds = teams.map(team => team.ps);

    // Find all PSs where startDate is before or equal to current date
    const psList = await PS.find({ 
      _id: { $in: psIds },
      startDate: { $lte: now }  // Only PS that have started
    }).select(
      "name prep startDate submissionDeadline midEvalExist midEvalSubmissionDeadline"
    );

    // If no PS have started yet
    if (!psList || psList.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No problem statements have started yet. Please check back after the start date." 
      });
    }

    // For each PS, check submission status
    const results = await Promise.all(psList.map(async (ps) => {
      // Find the team for this PS
      const team = teams.find(t => t.ps.toString() === ps._id.toString());

      // Check if submissions already exist
      const finalSubmission = await Submission.findOne({
        ps: ps._id,
        team: team._id,
        midEval: false
      });

      const midSubmission = await Submission.findOne({
        ps: ps._id,
        team: team._id,
        midEval: true
      });

      const isFinalOpen = ps.submissionDeadline >= now && !finalSubmission;
      const isMidOpen = ps.midEvalExist && ps.midEvalSubmissionDeadline >= now && !midSubmission;

      return {
        _id: ps._id,
        name: ps.name,
        prep: ps.prep,
        startDate: ps.startDate, // Include startDate in response
        submissionDeadline: ps.submissionDeadline,
        midEvalExist: ps.midEvalExist,
        midEvalSubmissionDeadline: ps.midEvalSubmissionDeadline,
        finalSubmissionOpen: isFinalOpen,
        midEvalSubmissionOpen: isMidOpen,
        // Submission status
        finalSubmitted: !!finalSubmission,
        midSubmitted: !!midSubmission,
        finalSubmissionId: finalSubmission?._id,
        midSubmissionId: midSubmission?._id,
        finalSubmissionTime: finalSubmission?.submissionTime,
        midSubmissionTime: midSubmission?.submissionTime,
        finalPenalty: finalSubmission?.penalty || [],
        midPenalty: midSubmission?.penalty || [],
      };
    }));

    res.json({ success: true, psList: results });
  } catch (err) {
    console.error("Error in listOpenPSForSubmission:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


/**
 * 2. Get PS details including deliverables (mid or final)
 */
export const getPSForSubmission = async (req, res) => {
  try {
    const { psId } = req.params;
    const { type = "final" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(psId)) {
      return res.status(400).json({ success: false, message: "Invalid PS id" });
    }

    const ps = await PS.findById(psId).select(
      "name prep submissionDeadline midEvalExist midEvalSubmissionDeadline submissionDeliverables midEvalSubmissionDeliverables"
    );

    if (!ps) {
      return res.status(404).json({ success: false, message: "PS not found" });
    }

    const isMid = type === "mid";
    const deliverables = isMid
      ? ps.midEvalSubmissionDeliverables
      : ps.submissionDeliverables;
    const deadline = isMid
      ? ps.midEvalSubmissionDeadline
      : ps.submissionDeadline;

    res.json({
      success: true,
      ps: {
        _id: ps._id,
        name: ps.name,
        prep: ps.prep,
        type: isMid ? "mid" : "final",
        deadline,
        deliverables,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 2.5. Upload individual file to temp storage (NEW)
 */
export const uploadTempFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { psId, deliverableName, midEval } = req.body;
    const userId = req.user._id;

    if (!psId || !deliverableName || midEval === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'psId, deliverableName, and midEval are required' 
      });
    }

    const isMid = midEval === true || midEval === 'true';

    // Delete old temp file for this specific deliverable (auto-replace)
    const oldFile = await TempFileUpload.findOne({
      userId,
      psId,
      midEval: isMid,
      deliverableName,
      isUsed: false,
    });

    if (oldFile) {
      // Delete old physical file
      if (fs.existsSync(oldFile.filePath)) {
        fs.unlinkSync(oldFile.filePath);
      }
      // Delete old DB record
      await TempFileUpload.deleteOne({ _id: oldFile._id });
    }

    // Save new temp file metadata
    const tempFileRecord = await TempFileUpload.create({
      psId,
      userId,
      midEval: isMid,
      deliverableName,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
      isUsed: false,
    });

    const fileUrl = `/uploads/temp/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

/**
 * 3. Create a submission (mid or final) - UPDATED
 */
export const createSubmission = async (req, res) => {
  try {
    const {
      psId,
      midEval = false,
      submissionTime,
      urlDeliverables,
    } = req.body;

    const userId = req.user._id;
    const techSecy = await TechSecy.findOne({ user: userId }).select("hostelId");
    if (!techSecy) {
      return res.status(404).json({ success: false, message: "TechSecy not found" });
    }

    const team = await Team.findOne({ techSecy: techSecy._id, ps: psId }).select("_id hostelId ps");
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found for this PS" });
    }

    if (!mongoose.Types.ObjectId.isValid(psId)) {
      return res.status(400).json({ success: false, message: "Invalid PS id" });
    }

    const isMid = midEval === true || midEval === "true";

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      ps: psId,
      team: team._id,
      midEval: isMid
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: `${isMid ? 'Mid evaluation' : 'Final'} submission already exists for this PS`
      });
    }

    const parsedSubmissionTime = submissionTime
      ? new Date(submissionTime)
      : new Date();

    if (Number.isNaN(parsedSubmissionTime.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid submissionTime" });
    }

    const ps = await PS.findById(psId).select(
      "submissionDeadline midEvalExist midEvalSubmissionDeadline submissionDeliverables midEvalSubmissionDeliverables"
    );

    if (!ps) {
      return res.status(404).json({ success: false, message: "PS not found" });
    }

    if (isMid && !ps.midEvalExist) {
      return res.status(400).json({ success: false, message: "Mid evaluation does not exist for this PS" });
    }

    const deadline = isMid
      ? ps.midEvalSubmissionDeadline
      : ps.submissionDeadline;

    if (!deadline) {
      return res.status(400).json({ success: false, message: "Deadline not configured for this PS" });
    }

    const isLate = parsedSubmissionTime > deadline;

    // Get expected deliverables from PS
    const expectedDeliverables = isMid 
      ? ps.midEvalSubmissionDeliverables 
      : ps.submissionDeliverables;

    // Parse URL deliverables
    let urlDeliverablesObj = {};
    if (urlDeliverables) {
      try {
        urlDeliverablesObj = JSON.parse(urlDeliverables);
      } catch {
        return res.status(400).json({ success: false, message: "Invalid urlDeliverables JSON" });
      }
    }

    // Create permanent directory
    const permanentDir = path.join(process.cwd(), 'uploads', 'submissions', psId.toString());
    if (!fs.existsSync(permanentDir)) {
      fs.mkdirSync(permanentDir, { recursive: true });
    }

    // Build deliverables array
    const deliverablesDocs = [];

    for (const deliverable of expectedDeliverables) {
      if (deliverable.type === 'url') {
        // URL deliverable - get from urlDeliverables
        const url = urlDeliverablesObj[deliverable.name];
        if (!url) {
          return res.status(400).json({ 
            success: false, 
            message: `Missing URL for deliverable: ${deliverable.name}` 
          });
        }
        deliverablesDocs.push({
          name: deliverable.name,
          url,
        });
      } else {
        // File deliverable - find in temp uploads
        const tempFile = await TempFileUpload.findOne({
          userId,
          psId,
          midEval: isMid,
          deliverableName: deliverable.name,
          isUsed: false,
        });

        if (!tempFile) {
          return res.status(400).json({ 
            success: false, 
            message: `Missing file for deliverable: ${deliverable.name}` 
          });
        }

        // Move file from temp to permanent
        const tempPath = tempFile.filePath;
        const permanentPath = path.join(permanentDir, tempFile.filename);

        if (fs.existsSync(tempPath)) {
          fs.renameSync(tempPath, permanentPath);
        } else {
          return res.status(400).json({ 
            success: false, 
            message: `Temp file not found for: ${deliverable.name}` 
          });
        }

        // Mark as used
        await TempFileUpload.updateOne(
          { _id: tempFile._id },
          { isUsed: true }
        );

        deliverablesDocs.push({
          name: deliverable.name,
          url: `/uploads/submissions/${psId}/${tempFile.filename}`,
        });
      }
    }

    const penalty = [];
    if (isLate) {
      penalty.push({
        category: "late_submission",
        weightage: 1,
      });
    }

    const submission = await Submission.create({
      ps: ps._id,
      hostelId: team.hostelId,
      team: team._id,
      midEval: isMid,
      submissionTime: parsedSubmissionTime,
      penalty,
      deliverables: deliverablesDocs,
      pptPointsDistribution: [],
      submissionPointsDistribution: [],
    });

    res.status(201).json({ success: true, submission });
  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 4. Get submission details
 */
export const getSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ success: false, message: "Invalid submission id" });
    }

    const submission = await Submission.findById(submissionId)
      .populate('ps', 'name prep submissionDeadline midEvalSubmissionDeadline')
      .populate('team', 'hostelId');

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Verify this user's team owns this submission
    const techSecy = await TechSecy.findOne({ user: userId });
    if (!techSecy) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const team = await Team.findOne({ techSecy: techSecy._id, _id: submission.team });
    if (!team) {
      return res.status(403).json({ success: false, message: "Unauthorized - Not your team's submission" });
    }

    res.json({ success: true, submission });
  } catch (err) {
    console.error("Error in getSubmission:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
