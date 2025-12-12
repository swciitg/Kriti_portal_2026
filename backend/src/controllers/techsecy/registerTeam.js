import PS from "../../model/ps.js";
import Team from "../../model/team.js";

export async function registerTeam(req, res) {
  try {
    const techSecyId = req.user.techSecyId;
    const hostelId = req.user.hostelId;
    const { psId, teamMembers } = req.body;

    if (!psId || !teamMembers || !Array.isArray(teamMembers)) {
      return res.status(400).json({ success: false, message: "Invalid body" });
    }

    const ps = await PS.findById(psId);
    if (!ps) {
      return res.status(404).json({ success: false, message: "PS not found" });
    }

    const now = new Date();
    if (ps.registrationDeadline < now) {
      return res.status(400).json({ success: false, message: "Registration closed" });
    }

    const existing = await Team.findOne({ techSecy: techSecyId, ps: psId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Team already registered" });
    }

    const team = await Team.create({
      techSecy: techSecyId,
      hostelId,
      ps: psId,
      teamMembers,
      submitted: false,
    });

    return res.status(201).json({ success: true, team });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
