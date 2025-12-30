import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";

export default function ViewSubmission() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const { submissionId } = useParams();

  const [submission, setSubmission] = useState(null);
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
    async function fetchSubmission() {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${BACKEND_URL}/v1/pssubmission/view/${submissionId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        const data = await response.json();

        if (!data.success) {
          setError(data.message || "Failed to fetch submission");
          return;
        }

        if (!data.submission) {
          setError("No submission data received");
          return;
        }

        setSubmission(data.submission);
        setError("");
      } catch (err) {
        setError("Failed to fetch submission: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmission();
  }, [submissionId]);

  const isLateSubmission = () => {
    if (!submission) return false;
    const deadline = submission.midEval
      ? submission.ps.midEvalSubmissionDeadline
      : submission.ps.submissionDeadline;
    return new Date(submission.submissionTime) > new Date(deadline);
  };

  const getDeliverableIcon = (url) => {
    const ext = url.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "🖼️";
    if (ext === "pdf") return "📄";
    if (ext === "zip") return "📦";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["ppt", "pptx"].includes(ext)) return "📊";
    if (url.startsWith("http")) return "🔗";
    return "📁";
  };

  const getFileName = (url) => {
    // Extract filename from URL path
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  const isImageFile = (url) => {
    const ext = url.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif"].includes(ext);
  };

  const isPDFFile = (url) => {
    return url.toLowerCase().endsWith(".pdf");
  };

  const isExternalURL = (url) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const handleDownload = (url, name) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = `${BACKEND_URL}${url}`;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            onClick={() => navigate("/techsecy/submissions")}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-600 text-lg">No submission found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="w-full bg-white shadow-md py-4 px-6">
        <button
          onClick={() => navigate("/techsecy/submissions")}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
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
          Back to Submissions
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">View Submission</h1>
        </div>
      </nav>

      <div className="flex flex-col flex-1 items-center px-4 py-8">
        <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold text-gray-800">
                {submission.ps.name}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  submission.midEval
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {submission.midEval ? "Mid Evaluation" : "Final Submission"}
              </span>
            </div>
            <p className="text-gray-600">
              <span className="font-semibold">Prep Level:</span>{" "}
              <span className="uppercase">{submission.ps.prep}</span>
            </p>
          </div>

          {/* Submission Info */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-gray-600 mb-1">Submission Time</p>
              <p className="font-semibold text-gray-800">
                {new Date(submission.submissionTime).toLocaleString("en-IN", {
                  dateStyle: "long",
                  timeStyle: "long",
                })}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-sm text-gray-600 mb-1">Deadline</p>
              <p className="font-semibold text-gray-800">
                {new Date(
                  submission.midEval
                    ? submission.ps.midEvalSubmissionDeadline
                    : submission.ps.submissionDeadline
                ).toLocaleString("en-IN", {
                  dateStyle: "long",
                  timeStyle: "long",
                })}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            {isLateSubmission() ? (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-red-800 font-semibold">
                  ⚠️ Late Submission - Penalty Applied
                </p>
                {submission.penalty && submission.penalty.length > 0 && (
                  <ul className="mt-2 text-sm text-red-700">
                    {submission.penalty.map((p, idx) => (
                      <li key={idx}>
                        • {p.category}: {p.weightage}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-green-800 font-semibold">
                  ✓ Submitted On Time
                </p>
              </div>
            )}
          </div>

          {/* Hostel Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded border">
            <p className="text-gray-700">
              <span className="font-semibold">Hostel ID:</span>{" "}
              {submission.hostelId}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Submission ID: {submission._id}
            </p>
          </div>

          {/* Deliverables */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Submitted Deliverables
            </h3>

            {submission.deliverables && submission.deliverables.length > 0 ? (
              <div className="space-y-4">
                {submission.deliverables.map((deliverable, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {getDeliverableIcon(deliverable.url)}
                          </span>
                          <h4 className="font-semibold text-gray-800">
                            {deliverable.name}
                          </h4>
                        </div>
                        {!isExternalURL(deliverable.url) && (
                          <p className="text-sm text-gray-500">
                            📁 {getFileName(deliverable.url)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Preview or Link */}
                    {isExternalURL(deliverable.url) ? (
                      <a
                        href={deliverable.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                      >
                        Open Link ↗
                      </a>
                    ) : (
                      <div>
                        {isImageFile(deliverable.url) && (
                          <img
                            src={`${BACKEND_URL}${deliverable.url}`}
                            alt={deliverable.name}
                            className="max-w-full h-auto max-h-60 rounded border mt-2 mb-3"
                            onError={(e) => {
                              console.error("Image load error:", e);
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        {isPDFFile(deliverable.url) && (
                          <iframe
                            src={`${BACKEND_URL}${deliverable.url}`}
                            className="w-full h-96 border rounded mt-2 mb-3"
                            title={deliverable.name}
                          />
                        )}
                        <button
                          onClick={() => handleDownload(deliverable.url, getFileName(deliverable.url))}
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                        >
                          Download File
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No deliverables found
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={() => navigate("/techsecy/submissions")}
              className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Back to Submissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
