import Judge from "../../model/judge.js";

export async function getJudgeStatus(req, res) {
  try {
    const userId = req.user._id;

    const judgeDoc = await Judge.findOne({ user: userId });

    if (!judgeDoc) {
      return res.status(404).json({
        success: false,
        message: "Judge profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      verified: judgeDoc.verified,
      submitMarkRequestPending: judgeDoc.submitMarkRequestPending,
      accessRequestPending: judgeDoc.accessRequestPending,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}