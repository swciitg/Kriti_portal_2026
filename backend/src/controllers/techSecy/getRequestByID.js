import Request from "../../model/request.js";
import mongoose from "mongoose";

export async function GetRequestById(req, res) {
  try {
    const { psId } = req.params;

    // Validate psId format
    if (!mongoose.Types.ObjectId.isValid(psId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid problem statement ID format" 
      });
    }

    // Find edit request
    const reqData = await Request.findOne({
      psId: psId,
      from: req.user._id,
      requestType: "EDIT_TEAM",
    });

    if (!reqData) {
      return res.status(404).json({ 
        success: false, 
        message: "No edit request found for this problem statement" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: reqData 
    });

  } catch (err) {
    console.error("Error in GetRequestById:", err);

    // Handle specific MongoDB errors
    if (err.name === "CastError") {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid ID format provided" 
      });
    }

    // Generic server error
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error occurred" 
    });
  }
}
