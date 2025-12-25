import ps from "../../model/ps.js";
import team from "../../model/team.js";
import mongoose from "mongoose";

export async function GetTeamsForProblemStatement(req, res) {
  try {
    const { psId } = req.params;

    // Validate required parameter
    if (!psId) {
      return res.status(400).json({
        success: false,
        message: "Problem statement ID is required"
      });
    }

    // Validate psId format
    if (!mongoose.Types.ObjectId.isValid(psId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem statement ID format"
      });
    }

    // Check if problem statement exists
    const psExistenceCheck = await ps.findById(psId);
    if (!psExistenceCheck) {
      return res.status(404).json({
        success: false,
        message: "Problem statement not found"
      });
    }

    // Find all teams for this PS
    const allTeams = await team.find({ ps: psId })
      .select("hostelId teamMembers submitted")
      .populate("techSecy", "hostelId")
      .lean();

    if (!allTeams || allTeams.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No teams registered for this problem statement yet",
        teams: []
      });
    }

    return res.status(200).json({
      success: true,
      message: `Found ${allTeams.length} team(s)`,
      teams: allTeams
    });

  } catch (error) {
    console.error("Error in GetTeamsForProblemStatement:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
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
