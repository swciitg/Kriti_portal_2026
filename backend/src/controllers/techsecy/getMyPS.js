// backend/src/controllers/techsecy/getMyPS.js
import PS from "../../model/ps.js";
import Team from "../../model/team.js";

// PS where this hostel already has a team registered
export async function getMyPS(req, res) {
  try {
    const techSecyId = req.user.techSecyId;

    // all teams for this tech secy
    const teams = await Team.find({ techSecy: techSecyId }).select("ps");
    const psIds = teams.map((t) => t.ps);

    if (psIds.length === 0) {
      return res.status(200).json({ success: true, ps: [] });
    }

    const psList = await PS.find({ _id: { $in: psIds } }).select(
      "name registrationDeadline submissionDeadline midEvalExist"
    );

    return res.status(200).json({ success: true, ps: psList });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
}
