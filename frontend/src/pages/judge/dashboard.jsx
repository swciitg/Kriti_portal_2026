import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";

function JudgeDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [psInfo, setPsInfo] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Judge" && user?.role !== "Judge")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  // Fetch PS and submissions from backend
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const stored = localStorage.getItem("accessToken");
        const token = stored || user?.accessToken;

        if (!token) {
          navigate("/sign-in");
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/judge/get-ps`, {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            "Authorization": localStorage.getItem("accessToken")
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch submissions");
        }

        const data = await response.json();

        if (data.success && data.ps) {
          setPsInfo(data.ps);
          setSubmissions(data.ps.submissions || []);
        } else {
          setError("No submissions found");
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setError("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user, navigate]);

  // Extract unique hostel IDs from submissions
  const getUniqueHostelIds = () => {
    const hostelIds = submissions.map((submission) => submission.hostelId);
    return [...new Set(hostelIds)].sort((a, b) => a - b);
  };

  const handleHostelClick = (hostelId) => {
    navigate(`/judge/hostel/${hostelId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {error}
            </h2>
            <p className="text-gray-600 mb-6">
              Please try again later or contact the administrator.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const uniqueHostelIds = getUniqueHostelIds();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Judge Dashboard - Hostel Presentations
      </h1>

      <div className="max-w-3xl mx-auto">
        {/* PS Info Section */}
        {psInfo && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{psInfo.name}</h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-semibold">Total Submissions:</span>{" "}
                {submissions.length}
              </div>
              <div>
                <span className="font-semibold">Hostels:</span>{" "}
                {uniqueHostelIds.length}
              </div>
            </div>
          </div>
        )}

        {/* Hostel List Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
            Select Hostel to Judge
          </h2>

          {uniqueHostelIds.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600
 text-lg">No submissions available yet</p>
            </div>
          ) : (
            <ul className="space-y-3">

              {uniqueHostelIds.map((hostelId) => {
                const hostelSubmissions = submissions.filter(
                  (sub) => sub.hostelId === hostelId
                );
                return (
                  <li key={hostelId}>
                    <button
                      onClick={() => handleHostelClick(hostelId)}
                      className="w-full text-left px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-200 hover:shadow-md border border-blue-200 hover:border-blue-300"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-medium text-gray-800">
                            Hostel {hostelId}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {hostelSubmissions.length} submission
                            {hostelSubmissions.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default JudgeDashboard;