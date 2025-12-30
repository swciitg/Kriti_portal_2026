import mongoose from "mongoose";
import ps from "../../model/ps.js";
import pptSchedule from "../../model/pptSchedule.js";

// TO BE USED BY JUDGE AND COMPANY POC's

export const getAllPptSchedules = async (req, res) => {
  try {
    const psId = req.params.psId;
    const user = req.user;

    if(!psId) {
        return res.status(200).json({
            "success" : false ,
            "message" : "Required params missing"
        });
    }

    if(!mongoose.Types.ObjectId.isValid(psId)) {
        return res.status(400).json({
            "success" : false ,
            "message" : "Invalid params sent"
        });
    }

    if(!user || psId !== user.ps) {
      return res.status(401).json({
        success : false ,
        message : "Access not allowed"
      });
    }

    const psExistenceCheck = await ps.findById(psId);
        
    if(!psExistenceCheck) {
        return res.status(404).json({
            "success" : false ,
            "message" : "Problem Statement not found!"
        });
    }

    const schedules = await pptSchedule
                            .find({ps : psId})
                            .populate({
                              path : "ps" , 
                              select : "name prep"
                            });

    res.status(200).json({
        success : true ,
        schedules
    });
  } catch (error) {
    res.status(500).json({ 
        success : false ,
        message: "Internal Server Error Occured"
    });
  }
};
