import fs from "fs";
import path from "path";
import multer from "multer";
import PS from "../models/PS.js";
import PptSchedule from "../../model/pptSchedule.js";
import { parseCSV } from "../../utils/parseCSV.js";

const uploadDir = path.join(process.cwd(), "uploads/csv");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadCsv = multer({ storage }).single("csv");

export const createPptSchedule = async (req, res) => {
  try {
    const { psName } = req.body;

    if (!psName) {
      return res
        .status(400)
        .json({ success: false, message: "PS name is required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "CSV file is required" });
    }

    const ps = await PS.findOne({ name: psName });
    if (!ps) {
      return res
        .status(404)
        .json({ success: false, message: "PS not found" });
    }

    let scheduleArray;
    try {
      scheduleArray = parseCSV(req.file.filename);
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to parse CSV" });
    }

    if (!Array.isArray(scheduleArray) || scheduleArray.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Empty or invalid CSV data" });
    }

    const formattedSchedule = scheduleArray.map(row => ({
      hostelId: row.hostelCode,
      date: row.date,
      time: row.time,
    }));

    const pptSchedule = await PptSchedule.create({
      psId: ps._id,
      schedule: formattedSchedule,
    });

    return res.status(201).json({
      success: true,
      message: "PPT schedule created successfully",
      pptSchedule,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
