import TechSecy from "../../model/techSecy.js";
import Team from "../../model/team.js";
import PS from "../../model/ps.js";

export const registerTeam = async (req, res) => {
  try {
    const { techSecyId, teamMembers } = req.body;
    const { psId } = req.params;

    const techSecy = await TechSecy.findById(techSecyId);
    if (!techSecy) {
      return res.status(404).json({ message: "tech secy not found" });
    }
    const ps = await PS.findById(psId);
    if (!ps) {
      return res.status(404).json({ message: "ps not found" });
    }
    const existingTeam = await Team.findOne({
      techSecy: techSecyId,
      ps: psId,
    });
    if (existingTeam) {
      return res.status(400).json({ message: "team already registered" });
    }
    if (teamMembers.length > ps.teamStrength) {
      return res.status(400).json({
        message: `this ps allows maximum of ${ps.teamStrength} people`,
      });
    }
    const emailRegex = /.+\@.+\..+/;
    for (let i = 0; i < teamMembers.lenth; i++) {
      const m = teamMembers[i];
      if (!m.name || !m.email || !m.rollNumber) {
        return res
          .status(400)
          .json({ message: "required fields for team members are missing" });
      }
      if (!emailRegex.test(m.email)) {
        return res
          .status(400)
          .json({ message: `invalid email format for team member ${m.name}` });
      }
    }
    const team = new Team({
      techSecy: techSecy._id,
      hostelId: techSecy.hostelId,
      ps: ps._id,
      teamMembers,
    });
    await team.save();
    return res
      .status(201)
      .json({ message: "Team registered successfully", team });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "internal sever error" });
  }
};
