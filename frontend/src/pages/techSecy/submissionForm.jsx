import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";

export default function SubmissionForm() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const { psId } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "final";

  const [ps, setPs] = useState(null);
  const [files, setFiles] = useState({});
  const [urls, setUrls] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    async function fetchPSDetails() {
      try {
        const token = localStorage.getItem("accessToken");
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
        setError("Failed to fetch PS details: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPSDetails();
  }, [psId, type]);

  const handleFileChange = (deliverableName, file) => {
    setFiles((prev) => ({
      ...prev,
      [deliverableName]: file,
    }));
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

    // Check if all deliverables are filled
    const missingDeliverables = ps.deliverables.filter((d) => {
      if (d.type === "url") {
        return !urls[d.name] || !urls[d.name].trim();
      } else {
        return !files[d.name];
      }
    });

    if (missingDeliverables.length > 0) {
      setError(
        `Missing: ${missingDeliverables.map((d) => d.name).join(", ")}`
      );
      return;
    }

    // Capture submission time IMMEDIATELY when user clicks submit
    const submissionTime = new Date().toISOString();
    setCapturedSubmissionTime(submissionTime);

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    setSubmitting(true);
    setShowConfirmation(false);

    try {
      const formData = new FormData();
      formData.append("psId", psId);
      formData.append("midEval", type === "mid" ? "true" : "false");
      
      // Use the CAPTURED submission time (not current time)
      formData.append("submissionTime", capturedSubmissionTime);

      const mapping = {};
      const urlDeliverables = {};

      ps.deliverables.forEach((deliverable) => {
        if (deliverable.type === "url") {
          urlDeliverables[deliverable.name] = urls[deliverable.name];
        } else {
          const file = files[deliverable.name];
          if (file) {
            formData.append("files", file);
            mapping[file.name] = deliverable.name;
          }
        }
      });

      formData.append("deliverablesMeta", JSON.stringify(mapping));
      formData.append("urlDeliverables", JSON.stringify(urlDeliverables));

      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${BACKEND_URL}/v1/pssubmission/submit`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
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

  const getFilePreview = (deliverable) => {
    const file = files[deliverable.name];
    if (!file) return null;

    const fileURL = URL.createObjectURL(file);
    const fileType = deliverable.type.toLowerCase();

    if (["jpg", "jpeg", "png", "gif"].includes(fileType)) {
      return (
        <img
          src={fileURL}
          alt={deliverable.name}
          className="max-w-full h-auto max-h-40 rounded border"
        />
      );
    } else if (fileType === "pdf") {
      return (
        <iframe
          src={fileURL}
          className="w-full h-40 border rounded"
          title={deliverable.name}
        />
      );
    } else {
      return (
        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
          <p>📄 {file.name}</p>
          <p className="text-xs text-gray-500">
            Size: {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (error && !ps) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="w-full bg-white shadow-md py-4 px-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Submit {type === "mid" ? "Mid Evaluation" : "Final Submission"}
        </h1>
      </nav>

      <div className="flex flex-col flex-1 items-center px-4 py-8">
        <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{ps?.name}</h2>

          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <p className="font-semibold text-yellow-800">
              Deadline:{" "}
              {ps?.deadline
                ? new Date(ps.deadline).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Not set"}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              Current Time:{" "}
              {new Date().toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            {ps?.deadline && new Date() > new Date(ps.deadline) && (
              <p className="text-red-600 font-semibold mt-2">
                ⚠️ Submission is past deadline - penalty will be applied
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleInitialSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Upload Deliverables
            </h3>

            {ps?.deliverables && ps.deliverables.length > 0 ? (
              ps.deliverables.map((deliverable, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    {deliverable.name}
                    <span className="text-sm text-gray-500 ml-2">
                      ({deliverable.type === "url" ? "Link" : `.${deliverable.type}`})
                    </span>
                  </label>

                  {deliverable.type === "url" ? (
                    // URL Input
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... or https://github.com/..."
                      value={urls[deliverable.name] || ""}
                      onChange={(e) =>
                        handleUrlChange(deliverable.name, e.target.value)
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    // File Input
                    <input
                      type="file"
                      accept={`.${deliverable.type}`}
                      onChange={(e) =>
                        handleFileChange(deliverable.name, e.target.files[0])
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  )}

                  {/* Show confirmation */}
                  {deliverable.type === "url" && urls[deliverable.name] && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 mb-1">✓ URL entered</p>
                      <a
                        href={urls[deliverable.name]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Open link ↗
                      </a>
                    </div>
                  )}
                  {deliverable.type !== "url" && files[deliverable.name] && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 mb-2">
                        ✓ {files[deliverable.name].name}
                      </p>
                      {/* File Preview */}
                      <div className="mt-2">
                        {getFilePreview(deliverable)}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded">
                <p className="text-gray-500 text-lg">No deliverables configured</p>
                <p className="text-sm text-gray-400 mt-2">
                  Contact the convener to add deliverables for this PS
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/techsecy/submissions")}
                className="flex-1 py-3 rounded-lg bg-gray-300 text-gray-700 font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !ps?.deliverables || ps.deliverables.length === 0}
                className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Confirm Submission
              </h2>

              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Submission Time:</span>{" "}
                  {new Date(capturedSubmissionTime).toLocaleString("en-IN", {
                    dateStyle: "long",
                    timeStyle: "long",
                  })}
                </p>
              </div>

              <p className="text-gray-700 mb-4">
                Please review your submission before confirming:
              </p>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {ps?.deliverables.map((deliverable, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <p className="font-semibold text-gray-800 mb-2">
                      {deliverable.name}
                    </p>

                    {deliverable.type === "url" ? (
                      <div>
                        <a
                          href={urls[deliverable.name]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all"
                        >
                          {urls[deliverable.name]} ↗
                        </a>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          📄 {files[deliverable.name]?.name}
                        </p>
                        {getFilePreview(deliverable)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ <span className="font-semibold">Warning:</span> Once submitted, you cannot change or resubmit this submission.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCancelConfirmation}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-lg bg-gray-300 text-gray-700 font-medium hover:bg-gray-400 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmedSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Confirm & Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
