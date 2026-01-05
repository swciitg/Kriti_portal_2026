import PS from "../../../model/ps.js";
import team from "../../../model/team.js";
import mongoose from "mongoose";

export const deletePS = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid problem statement ID format" 
      });
    }

    // Start transaction
    session.startTransaction();

    // Find the problem statement first
    const ps = await PS.findById(id).session(session);
    
    if (!ps) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: "Problem statement not found" 
      });
    }

    // Delete all teams registered for this PS
    const teamsDeleteResult = await team.deleteMany({ 
      ps: id 
    }).session(session);

    // Delete the problem statement
    await PS.findByIdAndDelete(id).session(session);

    // Commit transaction - both operations succeed together
    await session.commitTransaction();

    console.log(`PS deleted: ${id}, Teams deleted: ${teamsDeleteResult.deletedCount}`);

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
    // Rollback transaction on error - nothing gets deleted
    await session.abortTransaction();
    console.error("Error deleting problem statement:", error);
    
    res.status(500).json({ 
      success: false,
      message: "Failed to delete problem statement",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    // Always end session
    session.endSession();
  }
};
