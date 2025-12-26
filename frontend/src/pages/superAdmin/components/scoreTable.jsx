import { useEffect } from "react";
import { useState } from "react"
import { BACKEND_URL } from "../../../constants.js";

export default function ScoreTable({problemStatements , hostelIds , setError}) {

    const [selectedId ,  setselectedId] = useState(null); // refers to the id of the ps
    const [pointsTable , setPointsTable] = useState(null);

    useEffect(() => {
        async function getPoints() {
            try {
                setError('');
                const token = localStorage.getItem("accessToken");
                const response = await fetch(`${BACKEND_URL}/v1/superadmin/get-points` , {
                    method : 'GET' , 
                    headers : {
                        "Content-Type" : "application/json" , 
                        "Authorization" : token ? `Bearer ${token}` : ""
                    }
                })
    
                const data = await response.json();
                if(response.status !== 200 || !data.success) {
                    setError(data.message);
                    return;
                }
                if(data.pointsTable) {
                    setPointsTable(data.pointsTable)
                } else {
                    // remove this before commit
                    // setPointsTable(fakeData)
                }
            } catch (error) {
                setError("Some Internal Error Occured");
                setPointsTable(null);
            }
        }

        getPoints();

    } , []);
    

    const [columns , setColumns] = useState([]);
    const [fieldWeightage , setFieldWeightage] = useState([]);

    useEffect(() =>{
        if(!selectedId || !pointsTable || 
            !pointsTable[selectedId]
        ) {
            setColumns([]);
            setFieldWeightage([])
            return;
        }
    
        const ps = pointsTable[selectedId];
        
        let _columns = [];
        let _weightage = [];

        ps.submissionPointsDistribution.forEach(item => {
            _columns.push(item.field);
            _weightage.push(item.weightage);
        })
        
        if(ps.midEvalExist) {
            ps.midEvalPointsDistribution.forEach(item => {
                _columns.push(item.field);
                _weightage.push(item.weightage);
            })
        }

        ps.pptPointsDistribution.forEach(item => {
            _columns.push(item.field);
            _weightage.push(item.weightage);
        })



        setColumns(_columns);
        setFieldWeightage(_weightage);
    } , [selectedId , pointsTable])


    return  (
        <>
        <div className="flex justify-between items-center">
            <select
                value={selectedId || ""}
                onChange={(e) => setselectedId(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 bg-white shadow text-gray-700 mb-8 cursor-pointer font-semibold"
            >
                <option value="">-- Select Problem Statement --</option>
                {problemStatements.map((ps) => (
                <option key = {ps._id} value = {ps._id}>
                    {ps.name}
                </option>
                ))}
            </select>

            {
                selectedId && pointsTable && pointsTable[selectedId] && 
                <div className="text-red-500 font-bold text-xl">
                    {(pointsTable[selectedId].prep).toUpperCase()}{"-PREP ("}{pointsTable[selectedId].points} Points{")"}          
                </div>
            }
        </div>

        {
            !selectedId ? 
            <div className="p-8 bg-white rounded-lg shadow-sm font-semibold text-gray-500">
                Select a Problem Statement
            </div>
            :
            !pointsTable || !pointsTable[selectedId] ?
            <div className="p-8 bg-white rounded-lg shadow-sm font-semibold text-gray-500">
                No Scores to show yet
            </div>
            :
            <div className="w-full">
                <div className="max-w-full bg-gray-50 rounded-lg">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                                <div className="grid" style={{ gridTemplateColumns: `160px repeat(${columns.length}, minmax(160px, 1fr)) 160px 160px 160px` }}>
                                    
                                    <div className="sticky left-0 z-10 bg-white px-4 py-3 flex flex-col justify-center items-center">
                                        <div className="font-semibold text-gray-700 text-center">Hostel</div>
                                        <div className="text-sm font-semibold text-gray-500">Marked as ID</div>
                                    </div>

                                    {columns.map((col, idx) => (
                                        <div key={col + "_" + idx} className="px-4 py-3 flex flex-col justify-center items-center">
                                            <div className="font-semibold text-gray-700 text-center">{col}</div>
                                            <div className="text-sm font-semibold text-gray-500">({fieldWeightage[idx] ?? "-"}%)</div>
                                        </div>
                                    ))}

                                    <div className="px-4 py-3  flex flex-col justify-center items-center">
                                        <div className="font-semibold text-gray-700  text-center">Penalty </div>
                                        <div className="text-sm font-semibold text-gray-500">% of Maximum</div>
                                    </div>

                                    <div className="px-4 py-3  flex flex-col justify-center items-center">
                                        <div className="font-semibold text-gray-700  text-center">Base Score (pts)</div>
                                        <div className="text-sm font-semibold text-gray-500">Before penalty</div>
                                    </div>
                                    
                                    <div className="px-4 py-3  flex flex-col justify-center items-center">
                                        <div className="font-semibold text-gray-700  text-center">Total (pts)</div>
                                        <div className="text-sm font-semibold text-gray-500">After penalty</div>
                                    </div>


                                    {
                                    
                                    (hostelIds || []).map(hostelId => {
                                        const ps = pointsTable[selectedId];
                                        let _submissions = {};
                                        let _penalty = [];

                                        
                                        ps.submissions.forEach((submission) => {
                                            if(submission.hostelId === hostelId) {
                                                if(submission.penalty !== undefined && submission.penalty?.length > 0) {
                                                    _penalty = [
                                                        ..._penalty , 
                                                        ...submission.penalty
                                                    ];
                                                }
                                                if(submission.midEval) {
                                                    _submissions.midEval = submission.submissionPointsDistribution;
                                                } else {
                                                    _submissions.final = submission.submissionPointsDistribution;
                                                    _submissions.ppt = submission.pptPointsDistribution;
                                                }
                                            }
                                        })

                                        
                                        let _scores = [];
                                        if(_submissions.final !== undefined && _submissions.final?.length > 0) {
                                            _scores = [..._scores  , ..._submissions.final];
                                        } else {
                                            // add '-' for ps.submissionPointsDistribution.length times to _scores
                                            const count = ps.submissionPointsDistribution?.length;
                                            for (let i = 0; i < count; i++) {
                                                _scores.push(null);
                                            }
                                        }
                                        if(_submissions.midEval !== undefined && _submissions.midEval?.length > 0) {
                                            _scores = [..._scores  , ..._submissions.midEval];
                                        } else if(ps.midEvalExist) {
                                            // add '-' for ps.midEvalPointsDistribution.length times 
                                            const count = ps.midEvalPointsDistribution?.length;
                                            for (let i = 0; i < count; i++) {
                                                _scores.push(null);
                                            }
                                        }
                                        if(_submissions.ppt !== undefined && _submissions.ppt?.length > 0) {
                                            _scores = [..._scores  , ..._submissions.ppt];
                                        } else {
                                            // add '-' for ps.pptPointsDistribution.length times 
                                            const count = ps.pptPointsDistribution?.length;
                                            for (let i = 0; i < count; i++) {
                                                _scores.push(null);
                                            }
                                        }

                                        
                                        let _totalScore = _scores.reduce((acc , item , idx) => {
                                            if(item && fieldWeightage?.length > 0) {
                                                if(!isNaN(Number(item))) {
                                                    acc += Number(item);
                                                }
                                            }
                                            return acc;
                                        } , 0);
                                        let _totalPenaltyPercent = _penalty.reduce((acc , item) => acc + item.weightage , 0);
                                        _totalPenaltyPercent = Math.min(100 , _totalPenaltyPercent);
                                        
                                        let _finalScore = Math.max( 0 , _totalScore - _totalPenaltyPercent*0.01*ps.points);
                                        // if(hostelId === 204) {
                                        //     console.log(_scores)
                                        // console.log(_totalScore)
                                        // console.log(_totalPenaltyPercent)
                                        // console.log(_finalScore)
                                        //     console.log(_penalty)
                                        // }
                                

                                        return(
                                            
                                            <>
                                            <div className="sticky left-0 z-10 bg-white px-4 py-1 flex-col justify-center items-center">
                                                <div className="font-semibold text-gray-700 text-center">Hostel {hostelId}</div>
                                            </div>
                                            {
                                                _scores.map((score , idx) => {
                                                    return(
                                                        <div key={idx} className="px-4 py-1 flex-col justify-center items-center">
                                                            <div className="text-gray-700 text-center">{score === null ? "-" : score}</div>
                                                        </div>
                                                    )
                                                })
                                            }

                                            <div className="px-4 py-1 flex-col justify-center items-center">
                                                <div className="text-gray-700 text-center">{_totalPenaltyPercent} </div>
                                            </div>

                                            <div className="px-4 py-1 flex-col justify-center items-center">
                                                <div className="text-gray-700 text-center">{_totalScore}</div>
                                            </div>
                                            
                                            <div className="px-4 py-1 flex-col justify-center items-center">
                                                <div className="text-gray-700 text-center">{_finalScore}</div>
                                            </div>
                                            </>
                                        )
                                    }) 

                                    }

                                </div>
                        </div>
                    </div>
                </div>
            </div>

        }

        </>
    )
}