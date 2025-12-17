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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [judgeStatus, setJudgeStatus] = useState(null);
  const [requestingAccess, setRequestingAccess] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Judge" && user?.role !== "Judge")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  // Fetch judge status first
  useEffect(() => {
    const fetchJudgeStatus = async () => {
      try {
        const stored = localStorage.getItem("accessToken");
        const token = stored || user?.accessToken;

        if (!token) {
          navigate("/sign-in");
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/v1/judge/status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          }
        });

        const data = await response.json();

        if (data.success) {
          setJudgeStatus(data);
        }
      } catch (error) {
        console.error("Error fetching judge status:", error);
      }
    };

    fetchJudgeStatus();
  }, [user, navigate]);

  // Fetch PS and submissions from backend (only if not verified)
  useEffect(() => {
    // Wait for status to be fetched first
    if (judgeStatus === null) {
      return;
    }

    // If verified, don't fetch submissions
    if (judgeStatus && judgeStatus.verified) {
      setLoading(false);
      return;
    }

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
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
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
  }, [user, navigate, judgeStatus]);


  // Extract unique hostel IDs from submissions
  const getUniqueHostelIds = () => {
    const hostelIds = submissions.map((submission) => submission.hostelId);
    return [...new Set(hostelIds)].sort((a, b) => a - b);
  };

  const handleHostelClick = (hostelId) => {
    navigate(`/judge/hostel/${hostelId}`);
  };

  const handleRequestAccess = async () => {
    setRequestingAccess(true);
    try {
      const stored = localStorage.getItem("accessToken");
      const token = stored || user?.accessToken;

      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/api/v1/judge/request-access`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(data.message || "Access request submitted successfully!");
        // Refresh status
        const statusResponse = await fetch(`${BACKEND_URL}/api/v1/judge/status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          }
        });
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setJudgeStatus(statusData);
        }
      } else {
        alert(data.message || "Failed to submit access request");
      }
    } catch (error) {
      console.error("Error requesting access:", error);
      alert("Failed to submit access request. Please try again.");
    } finally {
      setRequestingAccess(false);
    }
  };

  const handleSubmitMarksRequest = async () => {
    if (!confirmChecked) {
      alert("Please check the confirmation box");
      return;
    }

    setSubmitting(true);
    try {
      const stored = localStorage.getItem("accessToken");
      const token = stored || user?.accessToken;

      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/api/v1/judge/submit-marks-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(
          "Marks submission request sent successfully! Please wait for convener approval."
        );
        setShowConfirmModal(false);
        setConfirmChecked(false);
        // Optionally redirect or disable further actions
      } else {
        alert(data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting marks request:", error);
      alert("Failed to submit marks request. Please try again.");
    } finally {
      setSubmitting(false);
    }
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

  // If judge is verified, show the "already submitted" message
  if (judgeStatus && judgeStatus.verified) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="bg-green-100 rounded-full p-4 inline-block mb-6">
              <svg
                className="w-16 h-16 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Marks Already Submitted
            </h2>

            <p className="text-gray-600 mb-6 text-lg">
              You have already submitted all your results and they have been verified by the convener.
            </p>

            {judgeStatus.accessRequestPending ? (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800 font-semibold">
                  ⏳ Your access request is pending. Please wait for the convener to approve it.
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  If you need to make changes to your marks, you can request access from the convener.
                </p>
                <button
                  onClick={handleRequestAccess}
                  disabled={requestingAccess}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestingAccess ? "Requesting..." : "Ask for Access"}
                </button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                For any urgent issues, please contact the Kriti Convener directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Submit All Marks Button */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Finalize Judging
              </h3>
              <p className="text-gray-600 text-sm">
                Once you submit all marks, the convener will review and verify
                your judgement. After verification, you will no longer be able
                to login.
              </p>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg whitespace-nowrap ml-4"
            >
              Submit All Marks
            </button>
          </div>
        </div>

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

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-yellow-100 rounded-full p-3">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                Confirm Submission
              </h2>

              <p className="text-gray-600 mb-4 text-center">
                Are you sure you want to submit all marks? This action will send
                a request to the convener for verification.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm text-yellow-800 font-semibold">
                  ⚠️ Warning: After the convener verifies your submission, you
                  will no longer be able to login or make changes.
                </p>
              </div>

              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  id="confirm-checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="confirm-checkbox"
                  className="ml-3 text-sm text-gray-700 cursor-pointer"
                >
                  I confirm that I have completed all judgements and understand
                  that I will lose access after convener verification.
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmChecked(false);
                  }}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitMarksRequest}
                  disabled={!confirmChecked || submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Confirm Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JudgeDashboard;