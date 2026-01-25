import team from "../../model/team.js";
import TechSecy from "../../model/techSecy.js";
import PS from "../../model/ps.js";
import Request from "../../model/request.js";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import path from "path";




/**
 * bug in edit request - request is made correctly, 
 * but previous request(the very first one) is being fetched to the techSecy so it causes problem in frontend related to access. 
 * No mmater what the convener chooses - approve or reject, for techsecy the verdict is always the very first request's status
 * 
 * fix idea for above by srinjoy on 04-01-2026 from tb_needs :
 * 
 * MAIN IDEA -> Do not keep any request object in DB with status == rejected.
 * when techSecy makes a request - first check if any pending request exist or not(already happening)
 * when convener rejects a request - clear that object from DB entirely - if accepted update the object to approved(done in /convener/requests/statusUpdate.js)
 * when techSecy makes a edit - delete the approved request object from database as well.(happening already)
 * 
 * DOWNSIDE - the UX of rejected request is no longer possible. Tried to compensate it in the teamMmebrs page in 
 */



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
    const match = file.fieldname.match(/teamMembers\[(\d+)\]/);
    const index = match ? match[1] : Date.now();

    const email = req.body?.teamMembers?.[index]?.email;
    const ext = path.extname(file.originalname);
    const fileName = `${email}${ext}`;

    const { psId } = req.params;
    const filePath = path.join("uploads", "team_ids", psId, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    cb(null, fileName);
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
  limits: { fileSize: 500 * 1024 * 1024 }, // 5MB
  fileFilter,
}).any();





export async function updateRegisterTeam(req, res) {
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
    const { teamMembers } = req.body;
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
    if (now > existingPS.registrationDeadline) {
      return res.status(400).json({ 
        success: false, 
        message: "Registration deadline has passed, cannot update team" 
      });
    }

    // Validate team size
    if (teamMembers.length > existingPS.teamStrength) {
      return res.status(400).json({
        success: false,
        message: `Team size must not exceed ${existingPS.teamStrength} members`,
      });
    }

    // Check if team exists
    const existingTeam = await team.findOne({
      ps: psId,
      techSecy: techSecy._id,
    });

    if (!existingTeam) {
      return res.status(404).json({ 
        success: false, 
        message: "Team not registered yet" 
      });
    }

    // Check for approved edit request BEFORE updating
    const editRequest = await Request.findOne({
      from: req.user._id,
      psId,
      requestType: "EDIT_TEAM",
    });

    if (!editRequest) {
      return res.status(404).json({ 
        success: false, 
        message: "No edit request found for this team" 
      });
    }

    if (editRequest.status !== "approved") {
      return res.status(403).json({ 
        success: false, 
        message: "Edit request is not approved yet" 
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


    // Update team members
    existingTeam.teamMembers = teamMembers;
    const updatedTeam = await existingTeam.save();

    // Delete the edit request after successful update
    await Request.findByIdAndDelete(editRequest._id);

    return res.status(200).json({
      success: true,
      message: "Team updated successfully",
      team: updatedTeam,
    });

  } catch (err) {
    console.error("Error in updateRegisterTeam:", err);

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
