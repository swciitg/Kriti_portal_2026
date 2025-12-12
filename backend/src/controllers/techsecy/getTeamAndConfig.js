import Team from "../../model/team.js";
import PS from "../../model/ps.js";

export async function getTeamAndConfig(req, res) {
  try {
    const techSecyId = req.user.techSecyId;
    const { psId } = req.params;

    const team = await Team.findOne({ techSecy: techSecyId, ps: psId });
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not registered" });
    }

    const ps = await PS.findById(psId).select(
      "submissionDeadline midEvalExist midEvalSubmissionDeadline midEvalSubmissionDeliverables submissionDeliverables"
    );

    return res.status(200).json({
      success: true,
      team,
      config: {
        submissionDeadline: ps.submissionDeadline,
        midEvalExist: ps.midEvalExist,
        midEvalSubmissionDeadline: ps.midEvalSubmissionDeadline,
        midEvalSubmissionDeliverables: ps.midEvalSubmissionDeliverables,
        submissionDeliverables: ps.submissionDeliverables,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
