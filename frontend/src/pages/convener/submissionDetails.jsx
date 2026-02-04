import { useEffect, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { userContext } from "../../context/userContext"
import { BACKEND_URL } from "../../constants"
import DownloadSubmissionsButton from "./components/exportSubmissionsBtn";

function SubmissionCard({ submission }) {
    const isLate = new Date(submission.submissionTime) > new Date(submission.ps.submissionDeadline);

    return (
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-1">
        <p className="text-sm text-slate-700">
            <span className="font-semibold">Hostel:</span> {submission.hostelId}
        </p>
        <p className={`text-sm text-slate-700`}>
            <span
                className={`font-semibold`}
            >
                Submitted At:
            </span>{" "}
            <span className={`font-semibold ${
                isLate ? "text-red-600" : "text-slate-700"
                }`}>

                {new Date(submission.submissionTime).toLocaleString()}
            </span>
        </p>
        {/* {submission.penalty?.length > 0 && (
            <div className="text-sm text-red-600 font-medium">
            Penalty:
            <ul className="list-disc list-inside">
                {submission.penalty.map((p, idx) => (
                <li key={idx}>
                    {p.category} (weight: {p.weightage})
                </li>
                ))}
            </ul>
            </div>
        )} */}
        </div>
    )
}

function PSSection({ title, data , isMidEval }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>

      {Object.keys(data).length === 0 && (
        <p className="text-slate-600 text-sm">No submissions found.</p>
      )}

      {Object.entries(data).map(([psName, submissions]) => (
        <div
          key={psName}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-800">{psName}</h3>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-slate-600">
                Total: {submissions.length}
              </span>
              <DownloadSubmissionsButton psId={submissions[0].ps._id} psName={psName} isMidEval={isMidEval}/>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {submissions.map(sub => (
            <>
              <SubmissionCard key={sub._id} submission={sub} />
            </>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SubmissionDetailsPage() {
  const navigate = useNavigate()
  const { user } = useContext(userContext)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [midEval, setMidEval] = useState({})
  const [finalEval, setFinalEval] = useState({})

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"))
    if (
      (!user && !stored) ||
      (stored?.role !== "Convener" && user?.role !== "Convener")
    ) {
      navigate("/sign-in")
    }
  }, [user])

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        setError("")
        const token = localStorage.getItem("accessToken")
        const res = await fetch(
          `${BACKEND_URL}/v1/convener/submission-details`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        )

        const data = await res.json()
        if (!res.ok || !data.success) {
          setError(data.message || "Failed to fetch submissions")
          setLoading(false)
          return
        }

        setMidEval(data.midEvalSubmissions || {})
        setFinalEval(data.finalSubmissions || {})
        setLoading(false)
      } catch {
        setError("Something went wrong while fetching submissions")
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [])

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/convener")}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          Submission Details
        </h1>

        {loading && (
          <p className="text-slate-600 font-medium">Loading submissions…</p>
        )}

        {error && (
          <p className="text-red-600 font-medium text-sm">{error}</p>
        )}

        {!loading && !error && (
          <div className="space-y-14">
            <PSSection title="Mid Evaluation Submissions" data={midEval} isMidEval={true}/>
            <PSSection title="Final Submissions" data={finalEval} isMidEval={false}/>
          </div>
        )}
      </div>
    </div>
  )
}
