import mongoose from "mongoose";
import submission from "../../model/submission.js";

export async function GetSubmissionsForProblemStatement(req, res) {
    try {
        const {psId} = req.params;
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
    
        const psExistenceCheck = await ps.findById(psId);
        
        if(!psExistenceCheck) {
            return res.status(404).json({
                "success" : false ,
                "message" : "Problem Statement not found!"
            });
        }

        const allSubmission = await submission.find({ps : psId});
    
        if(!allSubmission || allSubmission.length === 0) {
            return res.status(200).json({
                "success" : true,
                "message" : "No Submissions for this Problem Statement yet!"
            });
        }
    
        const finalSubmissions = allSubmission.filter(_submission => !(_submission.midEval));
        const midEvalSubmissions = allSubmission.filter(_submission => _submission.midEval);
    
        return res.status(200).json({
            "success" : true ,
            finalSubmissions ,
            midEvalSubmissions
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            "success" : false, 
            "messaga" : "Internal Server Error Occured"
        });
    }

}