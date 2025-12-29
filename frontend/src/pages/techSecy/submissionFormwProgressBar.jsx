import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";
import SubmissionGuidelines from "../../components/SubmissionGuidelines";

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
  const [uploadProgress, setUploadProgress] = useState({}); // NEW: Track upload progress
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [capturedSubmissionTime, setCapturedSubmissionTime] = useState(null);

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
          }
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
          }
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

  const handleFileSelect = async (deliverableName, file, deliverableType) => {
    if (!file) return;

    setUploading((prev) => ({ ...prev, [deliverableName]: true }));
    setUploadProgress((prev) => ({ ...prev, [deliverableName]: 0 })); // Initialize progress
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("psId", psId);
      formData.append("deliverableName", deliverableName);
      formData.append("midEval", type === "mid" ? "true" : "false");

      const token = localStorage.getItem("accessToken");
      
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress((prev) => ({ ...prev, [deliverableName]: percentComplete }));
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          
          if (data.success) {
            setUploadedFiles((prev) => ({
              ...prev,
              [deliverableName]: {
                filename: data.filename,
                url: data.fileUrl,
                originalName: data.originalName,
              },
            }));
            setUploadProgress((prev) => ({ ...prev, [deliverableName]: 100 }));
          } else {
            setError(data.message || `Upload failed for ${deliverableName}`);
          }
        } else {
          setError(`Upload failed for ${deliverableName}`);
        }
        
        setUploading((prev) => ({ ...prev, [deliverableName]: false }));
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        setError(`Upload failed for ${deliverableName}`);
        setUploading((prev) => ({ ...prev, [deliverableName]: false }));
        setUploadProgress((prev) => ({ ...prev, [deliverableName]: 0 }));
      });

      xhr.open("POST", `${BACKEND_URL}/v1/pssubmission/upload-temp`);
      xhr.setRequestHeader("Authorization", token ? `Bearer ${token}` : "");
      xhr.send(formData);

    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed: " + err.message);
      setUploading((prev) => ({ ...prev, [deliverableName]: false }));
      setUploadProgress((prev) => ({ ...prev, [deliverableName]: 0 }));
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
      setError(
        `Missing: ${missingDeliverables.map((d) => d.name).join(", ")}`
      );
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
        setError(data.message || `Submission failed with status ${response.status}`);
        setSubmitting(false);
        return;
      }

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
    setUploadProgress((prev) => {
      const newState = { ...prev };
      delete newState[deliverableName];
      return newState;
    });
    const fileInput = document.getElementById(`file-${idx}`);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const getFilePreview = (deliverable) => {
    const fileInfo = uploadedFiles[deliverable.name];
    if (!fileInfo) return null;

    const fileType = deliverable.type.toLowerCase();

    if (["jpg", "jpeg", "png", "gif"].includes(fileType)) {
      return (
        <img
          src={`${BACKEND_URL}${fileInfo.url}`}
          alt={deliverable.name}
          className="mt-2 max-w-full h-auto max-h-40 rounded border"
        />
      );
    } else if (fileType === "pdf") {
      return (
        <iframe
          src={`${BACKEND_URL}${fileInfo.url}`}
          className="mt-2 w-full h-40 border rounded"
          title={deliverable.name}
        />
      );
    } else {
      return (
        <div className="mt-2 p-3 bg-gray-50 rounded border">
          <p className="text-sm font-medium">File: {fileInfo.originalName}</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-xl text-gray-600">Loading submission form...</div>
        </div>
      </div>
    );
  }

  if (error && !ps) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Left Side (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              {/* Header with Hostel Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {ps?.name || "Submission Form"}
                  </h1>
                  {hostelId && (
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm font-semibold text-blue-900">Hostel {hostelId}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {type === "mid" ? "Mid Evaluation" : "Final"} Submission
                </p>
              </div>

              {/* Deadline Info */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm">
                      <strong>Deadline:</strong>{" "}
                      {ps?.deadline
                        ? new Date(ps.deadline).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Not set"}
                    </p>
                    <p className="text-sm mt-1">
                      <strong>Current Time:</strong>{" "}
                      {new Date().toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    {ps?.deadline && new Date() > new Date(ps.deadline) && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Submission is past deadline - penalty will be applied
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleInitialSubmit}>
                <div className="space-y-6">
                  {ps?.deliverables?.map((deliverable, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {deliverable.name}
                        <span className="text-red-500 ml-1">*</span>
                        <span className="text-xs text-gray-500 ml-2 font-normal">
                          (Type: {deliverable.type.toUpperCase()})
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept={`.${deliverable.type}`}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setFiles((prev) => ({
                                    ...prev,
                                    [deliverable.name]: file,
                                  }));
                                }
                              }}
                              disabled={uploading[deliverable.name]}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              id={`file-${idx}`}
                            />
                            
                            <button
                              type="button"
                              onClick={() => {
                                const file = files[deliverable.name];
                                if (file) {
                                  handleFileSelect(deliverable.name, file, deliverable.type);
                                }
                              }}
                              disabled={!files[deliverable.name] || uploading[deliverable.name] || uploadedFiles[deliverable.name]}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                            >
                              {uploading[deliverable.name] ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Uploading
                                </>
                              ) : uploadedFiles[deliverable.name] ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Uploaded
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  Upload
                                </>
                              )}
                            </button>
                          </div>
                          
                          {/* Progress Bar */}
                          {uploading[deliverable.name] && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <p className="text-sm text-blue-600">
                                    Uploading file to server...
                                  </p>
                                </div>
                                <span className="text-sm font-semibold text-blue-700">
                                  {uploadProgress[deliverable.name] || 0}%
                                </span>
                              </div>
                              {/* Progress Bar */}
                              <div className="w-full bg-blue-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress[deliverable.name] || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {uploadedFiles[deliverable.name] && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-sm text-green-600 flex-1">
                                  Uploaded: {uploadedFiles[deliverable.name].originalName}
                                </p>
                              </div>
                              {getFilePreview(deliverable)}
                              
                              <button
                                type="button"
                                onClick={() => handleReplaceFile(deliverable.name, idx)}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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

                <div className="mt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/techsecy/submissions")}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || Object.values(uploading).some(Boolean)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Guidelines - Right Side (1/3) */}
          <div className="lg:col-span-1">
            <SubmissionGuidelines />
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm">
                <strong>Submission Time:</strong>{" "}
                {new Date(capturedSubmissionTime).toLocaleString("en-IN", {
                  dateStyle: "long",
                  timeStyle: "long",
                })}
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Please review your submission before confirming:
            </p>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {ps?.deliverables?.map((deliverable, idx) => (
                <div key={idx} className="text-sm border-b pb-2">
                  <strong>{deliverable.name}:</strong>{" "}
                  {deliverable.type === "url" ? (
                    <span className="text-blue-600 break-all">{urls[deliverable.name]}</span>
                  ) : (
                    <span>File: {uploadedFiles[deliverable.name]?.originalName}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded mb-6 flex gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-800">
                Warning: Once submitted, you cannot change or resubmit this submission.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelConfirmation}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
