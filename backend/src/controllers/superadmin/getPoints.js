import submission from "../../model/submission.js";

export async function GetPoints(req, res) {
    try {
        const points = await submission.find({
            submissionPointsDistribution : {
                $exists: true, 
                $ne: []
            }
        })
        .select("-team -submissionTime -deliverables")
        .populate({
            path : "ps" , 
            select : "name prep points midEvalExist midEvalPointsDistribution submissionPointsDistribution pptPointsDistribution"
        })

        if(points?.length === 0) {
            return res.status(200).json({
                "success" : true,
                pointsTable : null
            })
        }

        const groupByPS = points?.reduce((acc , item) => {
            const psId = item.ps._id.toString();
            if(!acc[psId] || acc[psId] === undefined) {
                acc[psId] = {...item.ps.toObject() , submissions : []};
            }
            let _submission = item.toObject();
            delete _submission.ps;
            acc[psId].submissions.push(_submission);
            return acc;
        } , {});

        /**
         * pointsTable = {
         *      psId : {
         *          _id , name , prep, points, midEvalExist, midEvalPointsDistribution, submissionPointsDistribution, pptPointsDistribution ,
         *          submission : [
         *              {
         *                 _id , hostelId , midEval, 
         *                  penalty : [
         *                      {
         *                          category , weightage
         *                      }
         *                  ] , 
         *                   pptPointsDistribution : [Number] , 
         *                   submissionPointsDistribution : [Number]
         *              } , ...more submission for this PS
         *          ]
         *      } 
         * }
         * 
         */
    
        return res.status(200).json({
            "success" : true , 
            pointsTable : groupByPS
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            "success" : true ,
            "message" : "Some Internal Error Occured"
        })
    }
}