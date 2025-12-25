import Request from "../../model/request.js";
import TechSecy from "../../model/techSecy.js";
import PS from "../../model/ps.js";
import User from "../../model/user.js";
import team from "../../model/team.js";
import mongoose from "mongoose";

export async function editRegisteredTeam(req, res) {
  try {
    const { psId } = req.params;

    // Validate psId format
    if (!mongoose.Types.ObjectId.isValid(psId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid problem statement ID format" 
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
    const ps = await PS.findById(psId);
    if (!ps) {
      return res.status(404).json({ 
        success: false, 
        message: "Problem statement not found" 
      });
    }

    // Check registration deadline
    const now = new Date();
    if (now > ps.registrationDeadline) {
      return res.status(400).json({ 
        success: false, 
        message: "Registration deadline has passed, cannot request edit" 
      });
    }

    // Check if team is registered
    const existingTeam = await team.findOne({
      ps: psId,
      techSecy: techSecy._id,
    });

    if (!existingTeam) {
      return res.status(404).json({ 
        success: false, 
        message: "Team not registered for this problem statement" 
      });
    }

    // Find convener
    const convener = await User.findOne({ role: "Convener" });
    if (!convener) {
      return res.status(404).json({ 
        success: false, 
        message: "Convener not found" 
      });
    }

    // Check for existing pending request
    const existingRequest = await Request.findOne({
      from: req.user._id,
      psId,
      requestType: "EDIT_TEAM",
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: "Edit request already sent and pending approval" 
      });
    }

    // Create new edit request
    const newRequest = await Request.create({
      from: req.user._id,
      to: convener._id,
      psId,
      requestType: "EDIT_TEAM",
      hostelId: techSecy.hostelId,
      psName: ps.name,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Edit request sent successfully",
      request: newRequest,
    });

  } catch (err) {
    console.error("Error in editRegisteredTeam:", err);

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
