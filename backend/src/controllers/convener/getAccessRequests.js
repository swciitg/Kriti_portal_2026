import Judge from "../../model/judge.js";
import User from "../../model/user.js";
import PS from "../../model/ps.js";

export async function getAccessRequests(req, res) {
  try {
    const accessRequests = await Judge.find({
      verified: true,
      accessRequestPending: true,
    })
      .populate("user", "username email")
      .populate("ps", "name");

    return res.status(200).json({
      success: true,
      requests: accessRequests,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}