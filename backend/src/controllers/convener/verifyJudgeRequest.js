import Judge from "../../model/judge.js";

export const verifyJudgeRequest = async (req, res) => {
  try {
    const { judgeId } = req.params;

    if (!judgeId) {
      return res.status(400).json({
        success: false,
        message: "Judge ID is required"
      });
    }

    // Find the judge document
    const judgeDoc = await Judge.findById(judgeId);

    if (!judgeDoc) {
      return res.status(404).json({
        success: false,
        message: "Judge not found"
      });
    }

    // Check if there's a pending request
    if (!judgeDoc.submitMarkRequestPending) {
      return res.status(400).json({
        success: false,
        message: "No pending request found for this judge"
      });
    }

    // Check if already verified
    if (judgeDoc.verified) {
      return res.status(400).json({
        success: false,
        message: "Judge is already verified"
      });
    }

    // Update the judge: set verified to true and clear pending request
    judgeDoc.verified = true;
    judgeDoc.submitMarkRequestPending = false;
    await judgeDoc.save();

    res.status(200).json({
      success: true,
      message: "Judge verified successfully. They will no longer be able to login."
    });
  } catch (error) {
    console.error("Error in verifyJudgeRequest:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};