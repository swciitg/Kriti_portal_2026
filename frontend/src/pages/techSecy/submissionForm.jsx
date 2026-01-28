import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";
import SubmissionGuidelines from "../../components/SubmissionGuidelines";
import prependZeroes from "../../utils/prependZeroes";
import TechSecyNavbar from "./components/navbar.jsx";
import full_bg from "../../assets/full_bg.png";

export default function SubmissionForm() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const { psId } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "final";

  const [ps, setPs] = useState(null);
  const [hostelId, setHostelId] = useState(null);
  const [files, setFiles] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [urls, setUrls] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [capturedSubmissionTime, setCapturedSubmissionTime] = useState(null);

  // Storage key for this specific submission
  const storageKey = `submission-draft-${psId}-${type}`;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "TechSecy" && user?.role !== "TechSecy")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  // Restore saved draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      try {
        const {
          uploadedFiles: savedFiles,
          urls: savedUrls,
          timestamp,
        } = JSON.parse(savedDraft);

        // Only restore if saved within last 24 hours (prevent stale data)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (new Date(timestamp) > oneDayAgo) {
          setUploadedFiles(savedFiles || {});
          setUrls(savedUrls || {});
          // console.log("Restored draft from localStorage");
        } else {
          // Remove stale draft
          localStorage.removeItem(storageKey);
        }
      } catch (err) {
        console.error("Failed to restore draft:", err);
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  // Save draft to localStorage whenever uploads or URLs change
  useEffect(() => {
    const hasData =
      Object.keys(uploadedFiles).length > 0 || Object.keys(urls).length > 0;

    if (hasData) {
      const draft = {
        uploadedFiles,
        urls,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
    }
  }, [uploadedFiles, urls, storageKey]);

  // Warn user before leaving page if they have unsaved uploads
  useEffect(() => {
    const hasUnsavedUploads =
      Object.keys(uploadedFiles).length > 0 || Object.keys(urls).length > 0;

    const handleBeforeUnload = (e) => {
      if (hasUnsavedUploads) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires this
        return "You have uploaded files that are not submitted yet. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [uploadedFiles, urls]);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("accessToken");

        // Fetch user hostel info
        const userInfoResponse = await fetch(
          `${BACKEND_URL}/v1/pssubmission/user-info`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );
        const userInfoData = await userInfoResponse.json();
        if (userInfoData.success) {
          setHostelId(userInfoData.hostelId);
        }

        // Fetch PS details
        const response = await fetch(
          `${BACKEND_URL}/v1/pssubmission/ps/${psId}?type=${type}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );

        const data = await response.json();
        if (!data.success) {
          setError(data.message || "Failed to fetch PS details");
          return;
        }

        if (!data.ps) {
          setError("No PS data received");
          return;
        }

        setPs(data.ps);
        setError("");
      } catch (err) {
        setError("Failed to fetch data: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [psId, type]);

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

  const handleFileSelect = async (deliverableName, file, deliverableType) => {
    if (!file) return;

    setUploading((prev) => ({ ...prev, [deliverableName]: true }));
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("fileName", file.name);
        formData.append("chunkIndex", chunkIndex);
        formData.append("totalChunks", totalChunks);

        // keep your metadata
        formData.append("psId", psId);
        formData.append("deliverableName", deliverableName);
        formData.append("midEval", type === "mid" ? "true" : "false");

        const res = await fetch(
          `${BACKEND_URL}/v1/pssubmission/upload-chunk?fileName=${file.name}&chunkIndex=${chunkIndex}&totalChunks=${totalChunks}`,
          {
            method: "POST",
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: formData,
          },
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || `Chunk ${chunkIndex} failed`);
        }

        console.log(`Uploaded chunk ${chunkIndex + 1}/${totalChunks}`);
      }

      // After all chunks uploaded
      setUploadedFiles((prev) => ({
        ...prev,
        [deliverableName]: {
          filename: file.name,
          url: `/uploads/final/${file.name}`, // backend returns better path ideally
          originalName: file.name,
        },
      }));

      setUploading((prev) => ({ ...prev, [deliverableName]: false }));
    } catch (err) {
      console.error("Chunk upload error:", err);
      setError("Upload failed: " + err.message);
      setUploading((prev) => ({ ...prev, [deliverableName]: false }));
    }
  };

  const handleUrlChange = (deliverableName, url) => {
    setUrls((prev) => ({
      ...prev,
      [deliverableName]: url,
    }));
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!ps || !ps.deliverables || ps.deliverables.length === 0) {
      setError("No deliverables configured for this submission");
      return;
    }

    const missingDeliverables = ps.deliverables.filter((d) => {
      if (d.type === "url") {
        return !urls[d.name] || !urls[d.name].trim();
      } else {
        return !uploadedFiles[d.name];
      }
    });

    if (missingDeliverables.length > 0) {
      setError(`Missing: ${missingDeliverables.map((d) => d.name).join(", ")}`);
      return;
    }

    const submissionTime = new Date().toISOString();
    setCapturedSubmissionTime(submissionTime);
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    setSubmitting(true);
    setShowConfirmation(false);

    try {
      const token = localStorage.getItem("accessToken");

      const urlDeliverables = {};
      ps.deliverables.forEach((deliverable) => {
        if (deliverable.type === "url") {
          urlDeliverables[deliverable.name] = urls[deliverable.name];
        }
      });

      const payload = {
        psId,
        midEval: type === "mid" ? "true" : "false",
        submissionTime: capturedSubmissionTime,
        urlDeliverables: JSON.stringify(urlDeliverables),
      };

      const response = await fetch(`${BACKEND_URL}/v1/pssubmission/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || `Submission failed with status ${response.status}`,
        );
        setSubmitting(false);
        return;
      }

      // Clear draft from localStorage on successful submission
      localStorage.removeItem(storageKey);

      alert("Submission successful!");
      navigate("/techsecy/submissions");
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit: " + err.message);
      setSubmitting(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setCapturedSubmissionTime(null);
  };

  const handleReplaceFile = (deliverableName, idx) => {
    setUploadedFiles((prev) => {
      const newState = { ...prev };
      delete newState[deliverableName];
      return newState;
    });
    setFiles((prev) => {
      const newState = { ...prev };
      delete newState[deliverableName];
      return newState;
    });
    const fileInput = document.getElementById(`file-${idx}`);
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const getFilePreview = (deliverable) => {
    const fileInfo = uploadedFiles[deliverable.name];
    if (!fileInfo) return null;

    const fileType = deliverable.type.toLowerCase();

    if (["jpg", "jpeg", "png", "gif"].includes(fileType)) {
      return (
        <div className="mt-2 p-2 bg-black/30 border border-white/10 rounded inline-block">
          <img
            src={`${BACKEND_URL}${fileInfo.url}`}
            alt={deliverable.name}
            className="max-w-full h-auto max-h-40 rounded"
          />
        </div>
      );
    } else if (fileType === "pdf") {
      return (
        <iframe
          src={`${BACKEND_URL}${fileInfo.url}`}
          className="mt-2 w-full h-40 border border-white/20 rounded bg-white"
          title={deliverable.name}
        />
      );
    } else {
      return (
        <div className="mt-2 p-3 bg-[#0f1323] border border-white/20 rounded">
          <p className="text-sm font-medium text-gray-300">File: {fileInfo.originalName}</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-cover bg-no-repeat bg-fixed flex items-center justify-center"
        style={{ backgroundImage: `url(${full_bg})` }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <div className="text-xl text-white">Loading submission form...</div>
        </div>
      </div>
    );
  }

  if (error && !ps) {
    return (
      <div
        className="min-h-screen bg-cover bg-no-repeat bg-fixed flex items-center justify-center p-4"
        style={{ backgroundImage: `url(${full_bg})` }}
      >
        <div className="bg-[#1a1f3a] border border-red-500/50 text-red-300 px-6 py-4 rounded-xl shadow-xl max-w-md w-full text-center">
          <p className="mb-4">{error}</p>
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

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat bg-fixed text-white"
      style={{ backgroundImage: `url(${full_bg})` }}
    >
      <TechSecyNavbar />
      <div className="max-w-7xl mx-auto relative z-20 pt-24 px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - Left Side (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1f3a]/95 backdrop-blur-sm border border-white/20 rounded-xl p-8 shadow-xl">
              {/* Header with Hostel Info */}
              <div className="mb-8 border-b border-white/10 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <div>
                    <button
                      onClick={() => navigate("/techsecy/submissions")}
                      className="flex items-center text-[#6b93d6] hover:text-white transition-colors mb-2 text-sm font-semibold"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
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
                    <h1 className="text-3xl font-bold text-white bebas-neue-regular tracking-wide">
                      {ps?.name || "Submission Form"}
                    </h1>
                  </div>
                  {hostelId && (
                    <div className="flex items-center gap-2 bg-[#0f1323] px-4 py-2 rounded-lg border border-white/20 self-start sm:self-center">
                      <span className="text-sm font-bold text-[#6b93d6]">
                        Hostel {prependZeroes(hostelId, 4)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${type === "mid" ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300"}`}>
                    {type === "mid" ? "Mid Evaluation" : "Final Submission"}
                  </span>
                </p>
              </div>

              {/* Auto-save indicator */}
              {(Object.keys(uploadedFiles).length > 0 ||
                Object.keys(urls).length > 0) && (
                <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-sm text-green-300">
                    Draft auto-saved. You can safely reload this page.
                  </p>
                </div>
              )}

              {/* Deadline Info */}
              <div className="bg-[#0f1323] border border-white/10 rounded-xl p-5 mb-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <svg
                      className="w-6 h-6 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 mb-1">
                      <strong className="text-white">Deadline:</strong>{" "}
                      {ps?.deadline
                        ? new Date(ps.deadline).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Not set"}
                    </p>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">Current Time:</strong>{" "}
                      {new Date().toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    {ps?.deadline && new Date() > new Date(ps.deadline) && (
                      <p className="text-sm text-red-400 mt-2 flex items-center gap-2 font-semibold">
                        <svg
                          className="w-4 h-4"
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
                        Submission is past deadline - penalty will be applied
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleInitialSubmit}>
                <div className="space-y-6">
                  {ps?.deliverables?.map((deliverable, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0f1323] border border-white/10 rounded-xl p-6 transition hover:border-white/20"
                    >
                      <label className="block text-base font-semibold text-white mb-3">
                        {deliverable.name}
                        <span className="text-red-400 ml-1">*</span>
                        <span className="text-xs ml-2 font-normal text-gray-400 uppercase bg-gray-700/50 px-2 py-0.5 rounded">
                          {deliverable.type}
                        </span>
                      </label>

                      {deliverable.type === "url" ? (
                        <input
                          type="url"
                          value={urls[deliverable.name] || ""}
                          onChange={(e) =>
                            handleUrlChange(deliverable.name, e.target.value)
                          }
                          placeholder="https://..."
                          required
                          className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b93d6] bg-black/20 text-white placeholder-gray-500 transition-all"
                        />
                      ) : (
                        <>
                          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
                            <input
                              type="file"
                              accept={`.${deliverable.type}`}
                              id={`file-${idx}`}
                              disabled={uploading[deliverable.name]}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFiles((prev) => ({
                                    ...prev,
                                    [deliverable.name]: file,
                                  }));
                                }
                              }}
                            />
                            <label
                              htmlFor={`file-${idx}`}
                              className={`flex-1 px-4 py-3 border rounded-lg bg-black/20 cursor-pointer flex items-center
                                transition-all hover:bg-black/30
                                ${
                                  uploading[deliverable.name]
                                    ? "opacity-50 cursor-not-allowed border-white/5"
                                    : "border-white/10 hover:border-white/30"
                                }
                              `}
                            >
                              <span className="text-gray-300 text-sm truncate">
                                {files[deliverable.name]
                                  ? files[deliverable.name].name
                                  : "Click to choose file..."}
                              </span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const file = files[deliverable.name];
                                if (file) {
                                  handleFileSelect(
                                    deliverable.name,
                                    file,
                                    deliverable.type,
                                  );
                                }
                              }}
                              disabled={
                                !files[deliverable.name] ||
                                uploading[deliverable.name] ||
                                uploadedFiles[deliverable.name]
                              }
                              className="px-6 py-3 bg-[#6b93d6] text-black font-bold rounded-lg hover:bg-[#5685dc] disabled:bg-gray-600/50 disabled:text-gray-400 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2 transition shadow-lg"
                            >
                              {uploading[deliverable.name] ? (
                                <>
                                  <svg
                                    className="animate-spin h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Uploading...
                                </>
                              ) : uploadedFiles[deliverable.name] ? (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Uploaded
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                  Upload
                                </>
                              )}
                            </button>
                          </div>

                          {uploading[deliverable.name] && (
                            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
                              <svg
                                className="animate-spin h-4 w-4 text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              <p className="text-sm text-blue-300">
                                Uploading file to server...
                              </p>
                            </div>
                          )}

                          {uploadedFiles[deliverable.name] && (
                            <div className="mt-3">
                              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <svg
                                  className="w-4 h-4 text-green-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <p className="text-sm text-green-300 flex-1 truncate">
                                  Uploaded:{" "}
                                  <span className="font-semibold text-white">{uploadedFiles[deliverable.name].originalName}</span>
                                </p>
                              </div>
                              {getFilePreview(deliverable)}

                              <button
                                type="button"
                                onClick={() =>
                                  handleReplaceFile(deliverable.name, idx)
                                }
                                className="mt-3 text-sm text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 transition"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                                Replace file
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex gap-4 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => navigate("/techsecy/submissions")}
                    className="px-6 py-3 rounded-lg border border-white/20 text-gray-300 hover:bg-white/10 font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submitting || Object.values(uploading).some(Boolean)
                    }
                    className="flex-1 text-black py-3 px-6 rounded-lg bg-[#6b93d6] hover:bg-[#5685dc] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-lg transition transform active:scale-95"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Submit Deliverables"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Guidelines - Right Side (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1f3a]/95 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl sticky top-24">
              <SubmissionGuidelines />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f3a] border border-white/20 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">Confirm Submission</h2>

            <div className="mb-4 p-3 bg-[#0f1323] border border-white/10 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Submission Time:</strong>{" "}
                {new Date(capturedSubmissionTime).toLocaleString("en-IN", {
                  dateStyle: "long",
                  timeStyle: "long",
                })}
              </p>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Please review your submission before confirming:
            </p>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {ps?.deliverables?.map((deliverable, idx) => (
                <div key={idx} className="text-sm border-b border-white/10 pb-2">
                  <strong className="text-gray-200">{deliverable.name}:</strong>{" "}
                  {deliverable.type === "url" ? (
                    <span className="text-[#6b93d6] break-all block mt-1">
                      {urls[deliverable.name]}
                    </span>
                  ) : (
                    <span className="text-gray-400 block mt-1">
                      File: {uploadedFiles[deliverable.name]?.originalName}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6 flex gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
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
              <p className="text-sm text-red-300">
                Warning: Once submitted, you cannot change or resubmit this
                submission.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelConfirmation}
                className="flex-1 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 text-gray-300 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedSubmit}
                className="flex-1 px-4 py-2 bg-[#6b93d6] text-black rounded-lg hover:bg-[#5685dc] font-bold transition shadow-lg"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}