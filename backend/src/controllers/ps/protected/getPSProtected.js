import PS from "../../../model/ps.js";

export async function getPSProtected(req, res) {
    try {
        let psList = [];
        const role = req.user?.role
    
        if(role && role === "TechSecy") {
            psList = await PS.find({
                                startDate : {
                                    $lte :  new Date()
                                            .toLocaleString("en-IN", {
                                                timeZone: "Asia/Kolkata"
                                            })
                                }
                            }).select("name startDate prep midEvalExist pdf points teamStrength ")
            
        }
    
        return res.status(200).json({
            success : true ,
            ps : psList
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success : false ,
            message : "Internal Error Occured"
        })
    }
}