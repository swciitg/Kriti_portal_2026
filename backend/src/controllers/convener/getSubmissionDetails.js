import submission from "../../model/submission.js"
import ExcelJS from "exceljs";

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


function prependZeroes(item , req_len) {
    if(item === undefined || item === null) {
        return null;
      }
    let res = item.toString()
    if(res.length >= req_len) {
        return item;
    }

    let zeroes_neeeded = req_len - res.length
    while(zeroes_neeeded) {
        zeroes_neeeded--;
        res = "0" + res;
      }

    return res
  }


export async function GetSubmissionsDetails(req, res) {
    try {
        const submissionDetails = await submission
                                        .find()
                                        .select("ps hostelId midEval submissionTime penalty")
                                        .populate({
                                            path : "ps" ,
                                            select : "submissionDeadline name prep"
                                        });
    
        const midEvalSubmissions = groupByPS(submissionDetails.filter(detail => detail.midEval));
        const finalSubmissions = groupByPS(submissionDetails.filter(detail => !detail.midEval));
    
        return res.status(200).json({
            success : true ,
            midEvalSubmissions ,
            finalSubmissions
        });
    } catch (error) {
        return res.status(500).json({
            success : false ,
            message : "Failed to fetch the details"
        });
    }
}

export async function ExportSubmissionsExcel(req, res) {
    try {
        const { psId } = req.params;
        const midEval = req.query.midEval === "true";
        const submissions = await submission
                                    .find({
                                        ps : psId ,
                                        midEval
                                    })
                                    .select("-team -pptPointsDistribution -submissionPointsDistribution")
                                    .populate({
                                        path : "ps" , 
                                        select : "submissionDeadline name prep submissionPointsDistribution midEvalPointsDistribution"
                                    });
        
        if(submissions?.length === 0) {
            return res.status(200).json({
                success: true ,
                message : "No Submissions for this Problem statement"
            });
        }                            
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${submissions[0].ps.name} ${midEval ? "Mid-Eval" : "Final"}`);
    
        let columns = [
            { header: "Hostel ID", key: "hostelId", width: 15 }
        ]
    
        submissions[0].deliverables.forEach(item => {
            columns.push({
                header: item.name , key: item.name , width: 60
            });
        })
    
        const pointsDistribution = midEval ? submissions[0].ps.submissionPointsDistribution : submissions[0].ps.midEvalPointsDistribution;
        pointsDistribution.forEach(item => {
            columns.push({
                header : item.field , key : item.field , width : 15
            });
        })
    
        worksheet.columns = columns;

        worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4472C4" },
        };
        worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

        submissions.forEach(sub => {
            const row = {
                hostelId: prependZeroes(sub.hostelId , 4)
            };

            sub.deliverables.forEach(item => {
                row[item.name] = (item.url.startsWith("http://") ||  item.url.startsWith("https://"))? item.url : process.env.BACKEND_URL + item.url;
            });

            pointsDistribution.forEach(item => {
                row[item.field] = item.weightage; // marks can be filled later
            });

            worksheet.addRow(row);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${submissions[0].ps.name}.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        return res.status(500).json({
            success : false ,
            message : "Failed to export the submissions"
        })
    }                              
}