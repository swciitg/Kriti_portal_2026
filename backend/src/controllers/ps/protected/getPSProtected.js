import PS from "../../../model/ps.js";

export async function getPSProtected(req, res) {
    try {
        let psList = [];
        const role = req.user?.role
    
        if(role && role === "TechSecy") {
            psList = await PS.find().
                            select("name startDate prep midEvalExist pdf points teamStrength ")
            
        }

        psList = psList.filter(ps => {
            const curr_date = new Date()
            const ps_start_date = new Date(ps.startDate)
            // console.log(curr_date , ps_start_date)
            return curr_date > ps_start_date;
        })

        psList = psList.map(item => {
            const obj = item.toObject();
            delete obj.startDate;
            return obj;
        });

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