import Company from "../../model/company.js"
import PS from "../../model/ps.js";
import Submission from "../../model/submission.js";

export const getCompanyPS = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the judge document for this user
    const companyDoc = await Company.findOne({ user: userId });

    if (!companyDoc) {
      return res.status(404).json({
        success: false,
        message: "Company POC assignment not found"
      });
    }

    // Get the PS details with pptPointsDistribution
    const ps = await PS.findById(companyDoc.ps).select(
      "name pptPointsDistribution pptSchedule registrationDeadline submissionPointsDistribution submissionDeadline overallPointsDistribution"
    );

    if (!ps) {
      return res.status(404).json({
        success: false,
        message: "Problem Statement not found"
      });
    }

    // Get all submissions for this problem statement
    const allSubmissions = await Submission.find({ ps: ps._id });

    res.status(200).json({
      success: true,
      ps: {
        _id: ps._id,
        name: ps.name,
        pptPointsDistribution: ps.pptPointsDistribution,
        submissionPointsDistribution: ps.submissionPointsDistribution,
        pptSchedule: ps.pptSchedule,
        registrationDeadline: ps.registrationDeadline,
        submissionDeadline: ps.submissionDeadline,
        submissions: allSubmissions,
        overallPointsDistribution: ps.overallPointsDistribution
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
