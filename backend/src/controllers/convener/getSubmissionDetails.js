import submission from "../../model/submission.js"

function groupByPS(submissions) {
    let groupedSubmissions = {};

    submissions.forEach(submission => {
        if(submission.ps) {
            let currPS = submission.ps.name;
            if(groupedSubmissions[currPS] === undefined) {
                groupedSubmissions[currPS] = [];
            }
            groupedSubmissions[currPS].push(submission);
        }
    });

    return groupedSubmissions;
}

export async function GetSubmissionsDetails(req, res) {
    const submissionDetails = await submission
                                    .find()
                                    .select("ps hostelId midEval submissionTime penalty")
                                    .populate({
                                        path : "ps" ,
                                        select : "submissionDeadline name prep"
                                    });

    const midEvalSubmissions = groupByPS(submissionDetails.filter(detail => detail.midEval));
    const finalSubmissions = groupByPS(submissionDetails.filter(detail => !detail.midEval));

    return res.json({
        success : true ,
        midEvalSubmissions ,
        finalSubmissions
    });
}