// src/pages/techSecy/submissions.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";

export default function SubmissionsPage() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const [psList, setPsList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "TechSecy" && user?.role !== "TechSecy")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  useEffect(() => {
    async function fetchPS() {
      try {
        const token = localStorage.getItem("accessToken");
        
        const response = await fetch(`${BACKEND_URL}/v1/pssubmission/ps/open`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await response.json();

        if (!data.success) {
          setError(data.message || "Failed to fetch PS");
          return;
        }

        if (!data.psList || data.psList.length === 0) {
          setError("No PS found for your teams");
          return;
        }

        setPsList(data.psList);
        setError("");
      } catch (err) {
        setError("Failed to fetch PS: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPS();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (psList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-600 text-lg">No PS found for your teams</p>
          <p className="text-sm text-gray-400 mt-2">Register for a PS to start submitting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="w-full bg-white shadow-md py-4 px-6">
        <h1 className="text-xl font-semibold text-gray-800">PS Submissions</h1>
      </nav>

      <div className="flex flex-col flex-1 items-center px-4 py-8 space-y-6">
        {psList.map((ps) => (
          <div key={ps._id} className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{ps.name}</h2>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Prep Level:</span>{" "}
              <span className="uppercase">{ps.prep}</span>
            </p>

            <div className="space-y-4">
              {/* Final Submission */}
              <div className={`border-l-4 ${ps.finalSubmitted ? 'border-gray-400 bg-gray-50' : 'border-blue-500 bg-blue-50'} p-4 rounded`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-semibold text-lg ${ps.finalSubmitted ? 'text-gray-700' : 'text-blue-800'}`}>
                    Final Submission
                  </p>
                  {ps.finalSubmitted && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      ✓ Submitted
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  Deadline: {new Date(ps.submissionDeadline).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                
                {ps.finalSubmitted ? (
                  <>
                    <p className="text-sm text-gray-600 mt-2">
                      Submitted: {new Date(ps.finalSubmissionTime).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    {ps.finalPenalty.length > 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        ⚠️ Penalty: Late submission
                      </p>
                    )}
                    <button
                      onClick={() => navigate(`/techsecy/submissions/view/${ps.finalSubmissionId}`)}
                      className="mt-3 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                    >
                      View Submission
                    </button>
                  </>
                ) : ps.finalSubmissionOpen ? (
                  <button
                    onClick={() => navigate(`/techsecy/submissions/submit/${ps._id}?type=final`)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Submit Final
                  </button>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    Submission closed
                  </p>
                )}
              </div>

              {/* Mid Evaluation */}
              {ps.midEvalExist && (
                <div className={`border-l-4 ${ps.midSubmitted ? 'border-gray-400 bg-gray-50' : 'border-green-500 bg-green-50'} p-4 rounded`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-semibold text-lg ${ps.midSubmitted ? 'text-gray-700' : 'text-green-800'}`}>
                      Mid Evaluation
                    </p>
                    {ps.midSubmitted && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        ✓ Submitted
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    Deadline: {new Date(ps.midEvalSubmissionDeadline).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  
                  {ps.midSubmitted ? (
                    <>
                      <p className="text-sm text-gray-600 mt-2">
                        Submitted: {new Date(ps.midSubmissionTime).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      {ps.midPenalty.length > 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          ⚠️ Penalty: Late submission
                        </p>
                      )}
                      <button
                        onClick={() => navigate(`/techsecy/submissions/view/${ps.midSubmissionId}`)}
                        className="mt-3 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                      >
                        View Submission
                      </button>
                    </>
                  ) : ps.midEvalSubmissionOpen ? (
                    <button
                      onClick={() => navigate(`/techsecy/submissions/submit/${ps._id}?type=mid`)}
                      className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Submit Mid Eval
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">
                      Submission closed
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => navigate("/techsecy")}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
