import team from "../../model/team.js";
import TechSecy from "../../model/techSecy.js";
import PS from "../../model/ps.js";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import path from "path";




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { psId } = req.params;
    const uploadDir = path.join("uploads", "team_ids", psId);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // fieldname: teamMembers[0][profilePicture]
    const match = file.fieldname.match(/teamMembers\[(\d+)\]/);
    const index = match ? match[1] : Date.now();

    const email =
      req.body?.teamMembers?.[index]?.email ;

    const ext = path.extname(file.originalname);
    cb(null, `${email}${ext}`);
  },
});



const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type")
    );
  }
  cb(null, true);
};




const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
}).any();




export async function registerTeam(req, res) {
upload(req, res, async(err) => {
    try {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size exceeds 5MB limit",
          });
        }

        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only PNG, JPG, JPEG allowed",
        });
      }
    const teamMembers = req.body.teamMembers;
    const { psId } = req.params;

    // Validate psId format
    if (!mongoose.Types.ObjectId.isValid(psId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid problem statement ID format" 
      });
    }

    // Validate teamMembers input
    if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Team members array is required and cannot be empty" 
      });
    }

    // Find tech secretary
    const techSecy = await TechSecy.findOne({ user: req.user._id });
    if (!techSecy) {
      return res.status(404).json({ 
        success: false, 
        message: "Tech secretary not found" 
      });
    }

    // Find problem statement
    const existingPS = await PS.findById(psId);
    if (!existingPS) {
      return res.status(404).json({ 
        success: false, 
        message: "Problem statement not found" 
      });
    }

    // Check registration deadline
    const now = new Date();
    console.log(now, existingPS.registrationDeadline);
    if (now > existingPS.registrationDeadline) {
      return res.status(400).json({ 
        success: false, 
        message: "Registration deadline has passed for this problem statement" 
      });
    }

    // Validate team size
    if (teamMembers.length > existingPS.teamStrength) {
      return res.status(400).json({
        success: false,
        message: `Team size must not exceed ${existingPS.teamStrength} members`,
      });
    }

    // Check if team already registered
    const existingTeam = await team.findOne({
      ps: psId,
      techSecy: techSecy._id,
    });

    if (existingTeam) {
      return res.status(400).json({ 
        success: false, 
        message: "Team already registered for this problem statement" 
      });
    }

      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          const match = file.fieldname.match(/teamMembers\[(\d+)\]/);
          if (!match) return;

          const index = match[1];
          teamMembers[index].profilePicture = `/uploads/team_ids/${psId}/${file.filename}`;
        });
      }

    // Create new team
    const newTeam = await team.create({
      techSecy: techSecy._id,
      hostelId: techSecy.hostelId,
      ps: psId,
      teamMembers,
    });

    return res.status(201).json({
      success: true,
      message: "Team registered successfully",
      team: newTeam,
    });

  } catch (err) {
    console.error("Error in registerTeam:", err);

    // Handle specific MongoDB errors
    if (err.name === "ValidationError") {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid data provided",
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    if (err.name === "CastError") {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid ID format provided" 
      });
    }

    // Generic server error
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error occurred" 
    });
  }
})
}
