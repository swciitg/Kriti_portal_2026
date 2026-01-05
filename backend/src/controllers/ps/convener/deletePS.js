import PS from "../../../model/ps.js";
import team from "../../../model/team.js";
import mongoose from "mongoose";

export const deletePS = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid problem statement ID format" 
      });
    }

    // Check if PS exists first
    const ps = await PS.findById(id);
    
    if (!ps) {
      return res.status(404).json({ 
        success: false,
        message: "Problem statement not found" 
      });
    }

    // Delete teams FIRST (important order)
    const teamsDeleteResult = await team.deleteMany({ ps: id });

    // Then delete the problem statement
    await PS.findByIdAndDelete(id);

    // Log for audit trail
    console.log(`PS deleted: ${id} (${ps.title}), Teams deleted: ${teamsDeleteResult.deletedCount}`);

    res.status(200).json({ 
      success: true,
      message: "Problem statement and associated teams deleted successfully",
      data: {
        psId: id,
        psTitle: ps.title,
        teamsDeleted: teamsDeleteResult.deletedCount
      }
    });

  } catch (error) {
    console.error("Error deleting problem statement:", error);
    
    res.status(500).json({ 
      success: false,
      message: "Failed to delete problem statement",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
