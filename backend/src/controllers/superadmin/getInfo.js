import ps from "../../model/ps.js";
import techSecy from "../../model/techSecy.js";

export async function GetInfo(req, res) {
    try {
        const allPS = await ps.find({}).select("name registrationDeadline registrationDeadline pdf prep points");
        const allHostelId = await techSecy.find({}).select("hostelId");
        
        res.status(200).json({
            success : true , 
            ps : allPS ,
            hostelId : allHostelId
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false , 
            message : "Internal Server Error Occured"
        })
    }
}
