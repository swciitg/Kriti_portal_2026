import team from "../../model/team.js";
import TechSecy from "../../model/techSecy.js";
import PS from "../../model/ps.js";
import mongoose from "mongoose";

export async function registerTeam(req, res) {
  try {
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
}
