import { useEffect, useState } from "react"
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import {BACKEND_URL} from "../../../constants.js" 

export default function SubmissionsCard({ id, name, close }) {
  const [selectedHostel, setSelectedHostel] = useState(null)

  const [submissions, setSubmissions] = useState([])


  const [error, setError] = useState("");

  useEffect(() => {
    if(!error || error.trim().length === 0) {
      return;
    }

    const timeoutfn = setTimeout(() => {
      setError("");
    } , 5000)

    return () => clearTimeout(timeoutfn);
  } , [error])


  useEffect(() => {
    async function getSubmission() {
      try {
        setError('');
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${BACKEND_URL}/api/v1/submission/get-all/${id}` , {
          method : "GET" , 
          headers : {
            "Content-Type" : "application/json" , 
            "Authorization" : token ? `Bearer ${token}` : ""
          }
        });
        
        const data = await response.json();
        if(response.status != 200 || !data?.success) {
          setError(data.message);
          return;
        }
  
        setSubmissions([...data.finalSubmissions , ...data.midEvalSubmissions]);
      } catch (error) {
        console.log(error)
        setError("Some Error Occured!");
      }
    }

    getSubmission();
  } , [id]);


  const [uniqueHostels, setUniqueHostels] = useState([]);
  useEffect(() => {
    if(!submissions || submissions.length === 0) {
      return;
    }

    setUniqueHostels([...new Set(submissions.map((s) => s.hostelId))]);
  } , [submissions])


  const hostelSubmissions = submissions.filter((s) => s.hostelId === selectedHostel)

  const midEval = hostelSubmissions.find((s) => s.midEval === true)
  const finalEval = hostelSubmissions.find((s) => s.midEval === false)

  // Collapsible state
  const [openMid, setOpenMid] = useState(true)
  const [openFinal, setOpenFinal] = useState(true)

  const renderSubmissionBlock = (submission, title) => (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-700 text-sm">
          Submitted At: {new Date(submission.submissionTime).toLocaleString()}
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h4 className="text-lg font-semibold text-blue-700 mb-3">Deliverables</h4>

        <div className="space-y-3">
          {submission.deliverables.map((d, i) => (
            <div key={i} className="p-3 bg-blue-50 rounded-md shadow-sm">
              <p className="font-semibold">{d.name}</p>
              <a
                href={d.url}
                target="_blank"
                className="text-blue-600 underline text-sm break-all"
              >
                {d.url}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h4 className="text-lg font-semibold text-blue-700 mb-3">Penalties</h4>

        {submission.penalty.length === 0 && (
          <p className="text-gray-600">No penalties.</p>
        )}

        <div className="space-y-3">
          {submission.penalty.map((p, i) => (
            <div key={i} className="p-3 bg-red-50 rounded-md shadow-sm">
              <p className="font-semibold text-red-700">{p.category}</p>
              <p className="text-sm text-gray-700">
                Weightage: {p.weightage}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed flex justify-center items-center w-[100vw] h-[100vh] top-0 left-0 bg-black/50">

      <div className="flex w-[70vw] pr-4 h-[80vh] bg-gray-100 rounded-xl shadow-sm overflow-hidden relative">

        <button
          onClick={close}
          className="absolute top-2 right-2 text-black font-bold text-xl cursor-pointer"
        >
          ✕
        </button>

        <div className="w-48 bg-white shadow-md p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">Hostels</h2>

          <div className="space-y-2">
            {uniqueHostels.map((hostelId) => (
              <button
                key={hostelId}
                onClick={() => setSelectedHostel(hostelId)}
                className={`w-full px-3 py-2 flex items-center gap-2 rounded-lg transition 
                ${
                  selectedHostel === hostelId
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <ChevronRight size={18} />
                Hostel {hostelId}
              </button>
            ))}

            {
              uniqueHostels.length === 0 &&
              <div className="text-gray-500 text-lg">
                No Hostels have Submitted yet!
              </div>
            }
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{name}</h2>
            <p className="text-red-600 text-lg">{error}</p>
          </div>

          {!selectedHostel && (
            <div className="text-gray-500 text-lg">
              Select a hostel to view submissions.
            </div>
          )}

          {selectedHostel && (
            <div className="space-y-7">

              {midEval && (
                <div>
                  <button
                    className="w-full flex justify-between items-center bg-white shadow-sm p-4 rounded-lg"
                    onClick={() => setOpenMid(!openMid)}
                  >
                    <span className="font-semibold text-lg">Mid Evaluation</span>
                    {openMid ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {openMid && (
                    <div className="mt-4">
                      {renderSubmissionBlock(midEval, "Mid Evaluation Submission")}
                    </div>
                  )}
                </div>
              )}

              {finalEval && (
                <div>
                  <button
                    className="w-full flex justify-between items-center bg-white shadow-sm p-4 rounded-lg"
                    onClick={() => setOpenFinal(!openFinal)}
                  >
                    <span className="font-semibold text-lg">Final Submission</span>
                    {openFinal ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {openFinal && (
                    <div className="mt-4">
                      {renderSubmissionBlock(finalEval, "Final Submission")}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
