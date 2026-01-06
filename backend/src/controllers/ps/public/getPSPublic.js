import PS from "../../../model/ps.js";

export const getPSPublic = async (req, res) => {
  try {
    // Fetch all problem statements that have already started
    const startedPS = await PS.find({
      startDate: { $lte: new Date() }
    }).select("_id name prep pdf points teamStrength");

    res.status(200).json({ 
      success: true,
      message: "PS fetched successfully", 
      ps: startedPS 
    });

  } catch (error) {
    console.error("Error in getPSPublic:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};