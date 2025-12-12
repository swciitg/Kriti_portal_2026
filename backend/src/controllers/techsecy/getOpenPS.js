import PS from "../../model/ps.js";
import Team from "../../model/team.js";

export async function getOpenPS(req, res) {
  try {
    const techSecyId = req.user.techSecyId; 
    const hostelId = req.user.hostelId;

    const now = new Date();

    const psList = await PS.find({
      registrationDeadline: { $gt: now },
    }).select("name registrationDeadline submissionDeadline midEvalExist");

    const psIds = psList.map(p => p._id);
    const teams = await Team.find({
      techSecy: techSecyId,
      ps: { $in: psIds },
    }).select("ps");

    const registeredPS = new Set(teams.map(t => t.ps.toString()));

    const result = psList.map(p => ({
      _id: p._id,
      name: p.name,
      registrationDeadline: p.registrationDeadline,
      submissionDeadline: p.submissionDeadline,
      midEvalExist: p.midEvalExist,
      alreadyRegistered: registeredPS.has(p._id.toString()),
    }));

    return res.status(200).json({ success: true, ps: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
