import Judge from "../../model/judge.js";

export const submitMarksRequest = async (req, res) => {
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

    // Check if judge is already verified (shouldn't be able to submit if verified)
    if (judgeDoc.verified) {
      return res.status(400).json({
        success: false,
        message: "You have already been verified and cannot submit new requests"
      });
    }

    // Check if there's already a pending request
    if (judgeDoc.submitMarkRequestPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request. Please wait for convener approval."
      });
    }

    // Update the judge document to mark request as pending
    judgeDoc.submitMarkRequestPending = true;
    await judgeDoc.save();

    res.status(200).json({
      success: true,
      message: "Marks submission request sent to convener successfully"
    });
  } catch (error) {
    console.error("Error in submitMarksRequest:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};