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
    
        const allSubmission = await submission.find({ps : psId});
    
        if(!!allSubmission || allSubmission.length === 0) {
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
        
    }

}