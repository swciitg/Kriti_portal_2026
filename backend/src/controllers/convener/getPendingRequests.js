import Judge from "../../model/judge.js";
import User from "../../model/user.js";
import PS from "../../model/ps.js";

export const getPendingRequests = async (req, res) => {
  try {
    // Find all judges with pending requests
    const pendingJudges = await Judge.find({ 
      submitMarkRequestPending: true 
    })
    .populate('user', 'username email')
    .populate('ps', 'name');

    if (!pendingJudges || pendingJudges.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending requests",
        requests: []
      });
    }

    // Format the response data
    const formattedRequests = pendingJudges.map(judge => ({
      judgeId: judge._id,
      judgeName: judge.user?.username || "Unknown",
      judgeEmail: judge.user?.email || "Unknown",
      psName: judge.ps?.name || "Unknown",
      psId: judge.ps?._id || null,
      verified: judge.verified
    }));

    res.status(200).json({
      success: true,
      requests: formattedRequests
    });
  } catch (error) {
    console.error("Error in getPendingRequests:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};