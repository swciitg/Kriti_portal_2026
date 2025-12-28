import team from "../../model/team.js";
import PS from "../../model/ps.js";

export async function getAllTeams(req, res) {
  try {
    // Fetch all teams with populated references
    const allTeams = await team
      .find()
      .populate("techSecy", "hostelId")
      .populate("ps", "name prep teamStrength points registrationDeadline")
      .select("hostelId teamMembers submitted createdAt")
      .sort({ createdAt: -1 })
      .lean();

    if (!allTeams || allTeams.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No teams registered yet",
        teams: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: `Found ${allTeams.length} team(s)`,
      teams: allTeams,
    });
  } catch (error) {
    console.error("Error in getAllTeams:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
}
