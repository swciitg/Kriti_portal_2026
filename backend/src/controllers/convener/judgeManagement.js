import Judge from "../../model/judge.js";
import User from "../../model/user.js";
import PS from "../../model/ps.js";

// Get pending verification requests from judges
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

// Get access requests from verified judges
export const getAccessRequests = async (req, res) => {
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
};

// Verify a judge's mark submission request
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

// Grant access to a verified judge
export const grantAccess = async (req, res) => {
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
};