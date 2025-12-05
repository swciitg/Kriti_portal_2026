export async function LogOut(req, res) {
    try {
        if(!(req.cookies?.accessToken)) {
            return res.status(200).json({
                "success" : true , 
                "message" : "Already Logged out"
            })
        } 

        res.clearCookie("accessToken" , {
            httpOnly : true ,
            secure : process.env.PRODUCTION_MODE === "prod", 
            sameSite : "none"
        });
    
        return res.status(200).json({
            "success" : true
        });
    } catch (error) {
        return res.status(500).json({
            "success" : false , 
            "message" : "Internal Server Error Occured"
        });
    }
}