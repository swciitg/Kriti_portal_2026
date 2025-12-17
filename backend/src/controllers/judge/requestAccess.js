import Judge from "../../model/judge.js";

export async function requestAccess(req, res) {
  try {
    const userId = req.user._id;

    const judgeDoc = await Judge.findOne({ user: userId });

    if (!judgeDoc) {
      return res.status(404).json({
        success: false,
        message: "Judge profile not found",
      });
    }

    if (!judgeDoc.verified) {
      return res.status(400).json({
        success: false,
        message: "You are not verified yet. No need to request access.",
      });
    }

    if (judgeDoc.accessRequestPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending access request.",
      });
    }

    judgeDoc.accessRequestPending = true;
    await judgeDoc.save();

    return res.status(200).json({
      success: true,
      message: "Access request submitted successfully. Please wait for convener approval.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}