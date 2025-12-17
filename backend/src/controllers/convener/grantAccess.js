import Judge from "../../model/judge.js";

export async function grantAccess(req, res) {
  try {
    const { judgeId } = req.params;

    const judgeDoc = await Judge.findById(judgeId);

    if (!judgeDoc) {
      return res.status(404).json({
        success: false,
        message: "Judge not found",
      });
    }

    if (!judgeDoc.verified) {
      return res.status(400).json({
        success: false,
        message: "Judge is not verified yet.",
      });
    }

    if (!judgeDoc.accessRequestPending) {
      return res.status(400).json({
        success: false,
        message: "No pending access request for this judge.",
      });
    }

    judgeDoc.verified = false;
    judgeDoc.accessRequestPending = false;
    await judgeDoc.save();

    return res.status(200).json({
      success: true,
      message: "Access granted successfully. Judge can now login and edit marks.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}