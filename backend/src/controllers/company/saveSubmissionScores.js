import Submission from "../../model/submission.js";
import Company from "../../model/company.js";

export const saveSubmissionScores = async (req, res) => {
  try {
    const userId = req.user._id;
    const { submissionId, submissionPointsDistribution } = req.body;

    // Validate input
    if (!submissionId || !submissionPointsDistribution) {
      return res.status(400).json({
        success: false,
        message: "Submission ID and submission points distribution are required"
      });
    }

    // Validate that submissionPointsDistribution is an array
    if (!Array.isArray(submissionPointsDistribution)) {
      return res.status(400).json({
        success: false,
        message: "Submission points distribution must be an array"
      });
    }

    // Validate that all values are numbers
    const allNumbers = submissionPointsDistribution.every(val => typeof val === 'number' && !isNaN(val));
    if (!allNumbers) {
      return res.status(400).json({
        success: false,
        message: "All scores must be valid numbers"
      });
    }

    // Find the company document for this user
    const companyDoc = await Company.findOne({ user: userId });

    if (!companyDoc) {
      return res.status(404).json({
        success: false,
        message: "Company assignment not found"
      });
    }

    // Find the submission first to verify PS ownership
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    // Verify that the submission belongs to the company's assigned PS
    if (submission.ps.toString() !== companyDoc.ps.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to score this submission"
      });
    }

    // Update only the submissionPointsDistribution field using findByIdAndUpdate
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { $set: { submissionPointsDistribution: submissionPointsDistribution } },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: "Submission scores saved successfully",
      submission: {
        _id: updatedSubmission._id,
        hostelId: updatedSubmission.hostelId,
        submissionPointsDistribution: updatedSubmission.submissionPointsDistribution
      }
    });
  } catch (error) {
    console.error("Error in saveSubmissionScores:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};