import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";
import prependZeroes from "../../utils/prependZeroes";
import TechSecyNavbar from "./components/navbar";
import full_bg from "../../assets/full_bg.png";

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
      <div
        className="min-h-screen bg-cover bg-no-repeat bg-fixed flex items-center justify-center"
        style={{ backgroundImage: `url(${full_bg})` }}
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-white mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-cover bg-no-repeat bg-fixed flex flex-col items-center justify-center p-4"
        style={{ backgroundImage: `url(${full_bg})` }}
      >
        <div className="bg-[#1a1f3a] border border-white/20 shadow-xl rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-red-400 mb-4 text-lg">{error}</p>
          <button
            onClick={() => navigate("/techsecy/submissions")}
            className="px-6 py-2 bg-[#6b93d6] text-black font-bold rounded hover:bg-[#5685dc] transition"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div
        className="min-h-screen bg-cover bg-no-repeat bg-fixed flex items-center justify-center"
        style={{ backgroundImage: `url(${full_bg})` }}
      >
        <div className="bg-[#1a1f3a] border border-white/20 shadow-xl rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-300 text-lg">No submission found</p>
          <button
            onClick={() => navigate("/techsecy/submissions")}
            className="mt-4 px-6 py-2 bg-[#6b93d6] text-black font-bold rounded hover:bg-[#5685dc] transition"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat bg-fixed text-white"
      style={{ backgroundImage: `url(${full_bg})` }}
    >
      <TechSecyNavbar />

      <div className="flex flex-col flex-1 items-center px-4 py-8 pt-24">
        {/* Navigation / Header */}
        <div className="w-full max-w-4xl mb-6">
          <button
            onClick={() => navigate("/techsecy/submissions")}
            className="flex items-center text-[#6b93d6] hover:text-white mb-2 transition-colors font-semibold"
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
        </div>

        <div className="w-full max-w-4xl bg-[#1a1f3a]/95 border border-white/20 shadow-xl rounded-xl p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-8 border-b border-white/10 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <h2 className="text-3xl font-bold text-white bebas-neue-regular tracking-wide">
                {submission.ps.name}
              </h2>
              <span
                className={`px-4 py-1.5 rounded-md text-sm font-bold border self-start md:self-auto ${
                  submission.midEval
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                }`}
              >
                {submission.midEval ? "MID EVALUATION" : "FINAL SUBMISSION"}
              </span>
            </div>
            <p className="text-gray-300">
              <span className="font-semibold text-gray-400">Prep Level:</span>{" "}
              <span className="uppercase font-bold text-[#6b93d6]">{submission.ps.prep}</span>
            </p>
          </div>

          {/* Submission Info */}
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg">
              <p className="text-sm text-gray-400 mb-1">Submission Time</p>
              <p className="font-semibold text-gray-100">
                {new Date(submission.submissionTime).toLocaleString("en-IN", {
                  dateStyle: "long",
                  timeStyle: "long",
                })}
              </p>
            </div>

            <div className="p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-lg">
              <p className="text-sm text-gray-400 mb-1">Deadline</p>
              <p className="font-semibold text-gray-100">
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
          <div className="mb-8">
            {isLateSubmission() ? (
              <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg">
                <p className="text-red-300 font-bold flex items-center">
                  <span className="mr-2">⚠️</span> Late Submission - Penalty Applied
                </p>
                {submission.penalty && submission.penalty.length > 0 && (
                  <ul className="mt-2 text-sm text-red-200 pl-6">
                    {submission.penalty.map((p, idx) => (
                      <li key={idx}>
                        • {p.category}: {p.weightage}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="p-4 bg-green-500/10 border-l-4 border-green-500 rounded-r-lg">
                <p className="text-green-300 font-bold flex items-center">
                  <span className="mr-2">✓</span> Submitted On Time
                </p>
              </div>
            )}
          </div>

          {/* Hostel Info */}
          <div className="mb-8 p-4 bg-[#0f1323] rounded-lg border border-white/10">
            <p className="text-gray-200">
              <span className="font-semibold text-gray-400">Hostel ID:</span>{" "}
              <span className="text-xl font-mono">{prependZeroes(submission.hostelId , 4)}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Submission ID: {submission._id}
            </p>
          </div>

          {/* Deliverables */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-6 border-l-4 border-[#6b93d6] pl-3">
              Submitted Deliverables
            </h3>

            {submission.deliverables && submission.deliverables.length > 0 ? (
              <div className="space-y-4">
                {submission.deliverables.map((deliverable, index) => (
                  <div
                    key={index}
                    className="border border-white/10 rounded-lg p-5 bg-[#0f1323] hover:border-white/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {getDeliverableIcon(deliverable.url)}
                          </span>
                          <h4 className="font-bold text-gray-100 text-lg">
                            {deliverable.name}
                          </h4>
                        </div>
                        {!isExternalURL(deliverable.url) && (
                          <p className="text-sm text-gray-400 pl-1">
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
                        className="inline-block px-5 py-2.5 bg-[#6b93d6] text-black font-bold rounded-lg hover:bg-[#5685dc] transition text-sm shadow-lg"
                      >
                        Open Link ↗
                      </a>
                    ) : (
                      <div>
                        {isImageFile(deliverable.url) && (
                          <div className="bg-black/30 p-2 rounded border border-white/10 mt-2 mb-4 inline-block">
                            <img
                              src={`${BACKEND_URL}${deliverable.url}`}
                              alt={deliverable.name}
                              className="max-w-full h-auto max-h-60 rounded"
                              onError={(e) => {
                                console.error("Image load error:", e);
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        {isPDFFile(deliverable.url) && (
                          <iframe
                            src={`${BACKEND_URL}${deliverable.url}`}
                            className="w-full h-96 border border-white/20 rounded bg-white mt-2 mb-4"
                            title={deliverable.name}
                          />
                        )}
                        <div>
                        <button
                          onClick={() => handleDownload(deliverable.url, getFileName(deliverable.url))}
                          className="inline-block px-5 py-2.5 bg-[#6b93d6] text-black font-bold rounded-lg hover:bg-[#5685dc] transition text-sm shadow-lg"
                        >
                          Download File
                        </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8 bg-[#0f1323] rounded-lg border border-white/10 border-dashed">
                No deliverables found
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-10 pt-6 border-t border-white/10">
            <button
              onClick={() => navigate("/techsecy/submissions")}
              className="w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition shadow-lg border border-white/5"
            >
              Back to Submissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
