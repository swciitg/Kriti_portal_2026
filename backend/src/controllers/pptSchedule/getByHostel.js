import mongoose from "mongoose";
import techSecy from  "../../model/techSecy.js";
import pptSchedule from "../../model/pptSchedule.js";

// TO BE USED BY JUDGE AND COMPANY POC's

export const getAllPptSchedules = async (req, res) => {
  try {
    const hostelId = req.params.hostelId;
    const user = req.user;

    if(!hostelId) {
        return res.status(200).json({
            "success" : false ,
            "message" : "Required params missing"
        });
    }

    if(!mongoose.Types.ObjectId.isValid(hostelId)) {
        return res.status(400).json({
            "success" : false ,
            "message" : "Invalid params sent"
        });
    }


    if(!user || hostelId !== user.ps) {
      return res.status(401).json({
        success : false ,
        message : "Access not allowed"
      });
    }


  } catch (error) {
    res.status(500).json({ 
        success : false ,
        message: "Internal Server Error Occured"
    });
  }
};
