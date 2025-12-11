import Submission from "../../model/submission.js";
import Judge from "../../model/judge.js";

export const savePPTScores = async (req, res) => {
  try {
    const userId = req.user._id;
    const { submissionId, pptPointsDistribution } = req.body;

    // Validate input
    if (!submissionId || !pptPointsDistribution) {
      return res.status(400).json({
        success: false,
        message: "Submission ID and PPT points distribution are required"
      });
    }

    // Validate that pptPointsDistribution is an array
    if (!Array.isArray(pptPointsDistribution)) {
      return res.status(400).json({
        success: false,
        message: "PPT points distribution must be an array"
      });
    }

    // Validate that all values are numbers
    const allNumbers = pptPointsDistribution.every(val => typeof val === 'number' && !isNaN(val));
    if (!allNumbers) {
      return res.status(400).json({
        success: false,
        message: "All scores must be valid numbers"
      });
    }

    // Find the judge document for this user
    const judgeDoc = await Judge.findOne({ user: userId });

    if (!judgeDoc) {
      return res.status(404).json({
        success: false,
        message: "Judge assignment not found"
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

    // Verify that the submission belongs to the judge's assigned PS
    if (submission.ps.toString() !== judgeDoc.ps.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to score this submission"
      });
    }

    // Update only the pptPointsDistribution field using findByIdAndUpdate
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { $set: { pptPointsDistribution: pptPointsDistribution } },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: "PPT scores saved successfully",
      submission: {
        _id: updatedSubmission._id,
        hostelId: updatedSubmission.hostelId,
        pptPointsDistribution: updatedSubmission.pptPointsDistribution
      }
    });
  } catch (error) {
    console.error("Error in savePPTScores:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};