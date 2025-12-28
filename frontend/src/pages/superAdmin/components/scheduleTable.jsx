import { useEffect } from "react";
import { useState } from "react"
import { BACKEND_URL } from "../../../constants.js";

export default function ScehduleTable({problemStatements , setError}) {

    const [selectedId ,  setselectedId] = useState(null); // refers to the id of the ps
    const [pptSchedule , setpptSchedule] = useState(null);

    useEffect(() => {
        async function getSchedule() {
            try {
                setError('');
                const token = localStorage.getItem("accessToken");
                const response = await fetch(`${BACKEND_URL}/v1/superadmin/get-schedule` , {
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
                
            } catch (error) {
                setError("Some Internal Error Occured");
                setpptSchedule(null);
            }
        }

        getSchedule();

    } , []);
    

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
        </div>

        {
            !selectedId ? 
            <div className="p-8 bg-white rounded-lg shadow-sm font-semibold text-gray-500">
                Select a Problem Statement
            </div>
            :
            !pptSchedule || !pptSchedule[selectedId] ?
            <div className="p-8 bg-white rounded-lg shadow-sm font-semibold text-gray-500">
                No Schedule for presentation to show
            </div>
            :
            <div className="w-full">
                <div className="max-w-full bg-gray-50 rounded-lg">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                                <div className="grid" style={{ gridTemplateColumns: `160px 160px 160px` }}>
                                    
                                    <div className="sticky left-0 z-10 bg-white px-4 py-3 flex flex-col justify-center items-center">
                                        <div className="font-semibold text-gray-700 text-center">Hostel</div>
                                        <div className="text-sm font-semibold text-gray-500">Marked as ID</div>
                                    </div>

                                    <div className="px-4 py-3  flex flex-col justify-center items-center">
                                        <div className="font-semibold text-gray-700  text-center">Date</div>
                                    </div>

                                    <div className="px-4 py-3  flex flex-col justify-center items-center">
                                        <div className="font-semibold text-gray-700  text-center">Time</div>
                                    </div>  
                                    
                                </div>
                        </div>
                    </div>
                </div>
            </div>

        }

        </>
    )
}