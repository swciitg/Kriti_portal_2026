import Judge from "../../model/judge.js";
import PS from "../../model/ps.js";

export const getJudgePS = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the judge document for this user
    const judgeDoc = await Judge.findOne({ user: userId });

    if (!judgeDoc) {
      return res.status(404).json({
        success: false,
        message: "Judge assignment not found"
      });
    }

    // Get the PS details with pptPointsDistribution
    const ps = await PS.findById(judgeDoc.ps).select(
      "name pptPointsDistribution pptSchedule registrationDeadline submissionDeadline"
    );

    if (!ps) {
      return res.status(404).json({
        success: false,
        message: "Problem Statement not found"
      });
    }

    res.status(200).json({
      success: true,
      ps: {
        _id: ps._id,
        name: ps.name,
        pptPointsDistribution: ps.pptPointsDistribution,
        pptSchedule: ps.pptSchedule,
        registrationDeadline: ps.registrationDeadline,
        submissionDeadline: ps.submissionDeadline
      }
    });
  } catch (error) {
    console.error("Error in getJudgePS:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};