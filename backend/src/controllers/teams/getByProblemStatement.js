import ps from "../../model/ps.js";
import team from "../../model/team.js";
import mongoose from "mongoose";

export async function GetTeamsForProblemStatement(req, res) {
    try {
        const {psId} = req.params;
        if(!psId) {
            return res.status(400).json({
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
    
        const psExistenceCheck = await ps.findById(psId);
        if(!psExistenceCheck) {
            return res.status(404).json({
                "success" : false ,
                "message" : "Problem Statement not found!"
            });
        }
    
        const allTeams = await team.find({ps : psId}).select("hostelId teamMembers submitted");
        if(!allTeams || allTeams.length === 0) {
            return res.status(200).json({
                "success" : true,
                "message" : "No Teams registered for this Problem Statement yet!"
            });
        }
    
        return res.status(200).json({
            "success" : true ,
            "teams" : allTeams
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            "success" : false, 
            "messaga" : "Internal Server Error Occured"
        });
    }

}