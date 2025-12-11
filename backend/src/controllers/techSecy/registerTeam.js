import team from "../../model/team.js";
import TechSecy from "../../model/techSecy.js";
import PS from "../../model/ps.js";

export async function registerTeam(req, res) {
  try {
    const { psId, teamMembers } = req.body;
    const techSecy = await TechSecy.findOne({ user: req.user._id });
    if (!techSecy) {
      return res.status(404).json({ message: "Tech secy not found" });
    }
    const existingPS = await PS.findById(psId);
    if (!existingPS) {
      return res.status(404).json({ message: "Problem statement not found" });
    }
    const existingTeam = await team.findOne({
      ps: psId,
      techSecy: techSecy._id,
    });
    if (existingTeam) {
      return res.status(400).json({ message: "Team already registered" });
    }
    const newTeam = await team.create({
      techSecy: techSecy._id,
      hostelId: techSecy.hostelId,
      ps: psId,
      teamMembers,
    });
    return res
      .status(201)
      .json({ message: "Team registered successfully", team: newTeam });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", err });
  }
}
