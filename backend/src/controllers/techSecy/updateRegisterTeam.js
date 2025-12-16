import team from "../../model/team.js";
import TechSecy from "../../model/techSecy.js";
import PS from "../../model/ps.js";

export async function updateRegisterTeam(req, res) {
  try {
    const { teamMembers } = req.body;
    const { psId } = req.params;
    const techSecy = await TechSecy.findOne({ user: req.user._id });
    if (!techSecy) {
      return res
        .status(404)
        .json({ success: "false", message: "Tech secy not found" });
    }
    const existingPS = await PS.findById(psId);
    if (!existingPS) {
      return res
        .status(404)
        .json({ success: "false", message: "Problem statement not found" });
    }
    if (teamMembers.length > existingPS.teamStrength) {
      return res
        .status(400)
        .json({
          success: "false",
          message: `Team size exceeds the limit of ${existingPS.teamStrength}`,
        });
    }
    const existingTeam = await team.findOne({
      ps: psId,
      techSecy: techSecy._id,
    });
    if (!existingTeam) {
      return res
        .status(400)
        .json({ success: "false", message: "Team not registered yet" });
    }
    existingTeam.teamMembers = teamMembers;
    const updatedTeam = await existingTeam.save();
    return res
      .status(201)
      .json({
        success: "true",
        message: "Team registered successfully",
        team: updatedTeam,
      });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: "false", message: "Server error", err });
  }
}