import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";

function JudgeRequests() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [activeTab, setActiveTab] = useState("verification"); // "verification" or "access"
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Convener" && user?.role !== "Convener")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  // Fetch both types of requests
  useEffect(() => {
    fetchAllRequests();
  }, [user, navigate]);

  const fetchAllRequests = async () => {
    await Promise.all([fetchVerificationRequests(), fetchAccessRequests()]);
    setLoading(false);
  };

  const fetchVerificationRequests = async () => {
    try {
      const stored = localStorage.getItem("accessToken");
      const token = stored || user?.accessToken;

      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/v1/convener/get-pending-requests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch verification requests");
      }

      const data = await response.json();

      if (data.success) {
        setVerificationRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching verification requests:", error);
    }
  };

  const fetchAccessRequests = async () => {
    try {
      const stored = localStorage.getItem("accessToken");
      const token = stored || user?.accessToken;

      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/v1/convener/get-access-requests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch access requests");
      }

      const data = await response.json();

      if (data.success) {
        setAccessRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching access requests:", error);
    }
  };

  const handleVerifyJudge = async (judgeId, judgeName) => {
    if (
      !window.confirm(
        `Are you sure you want to verify ${judgeName}? After verification, this judge will no longer be able to login.`
      )
    ) {
      return;
    }

    setProcessingId(judgeId);

    try {
      const stored = localStorage.getItem("accessToken");
      const token = stored || user?.accessToken;

      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/v1/convener/verify-judge/${judgeId}`,
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
          `Judge ${judgeName} verified successfully! They can no longer login.`
        );
        setVerificationRequests((prev) =>
          prev.filter((req) => req.judgeId !== judgeId)
        );
      } else {
        alert(data.message || "Failed to verify judge");
      }
    } catch (error) {
      console.error("Error verifying judge:", error);
      alert("Failed to verify judge. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleGrantAccess = async (judgeId, judgeName) => {
    if (
      !window.confirm(
        `Are you sure you want to grant access to ${judgeName}? They will be able to login and modify marks again.`
      )
    ) {
      return;
    }

    setProcessingId(judgeId);

    try {
      const stored = localStorage.getItem("accessToken");
      const token = stored || user?.accessToken;

      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/v1/convener/grant-access/${judgeId}`,
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
          `Access granted to ${judgeName} successfully! They can now login and modify marks.`
        );
        setAccessRequests((prev) => prev.filter((req) => req._id !== judgeId));
      } else {
        alert(data.message || "Failed to grant access");
      }
    } catch (error) {
      console.error("Error granting access:", error);
      alert("Failed to grant access. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading judge requests...</p>
        </div>
      </div>
    );
  }

  const currentRequests =
    activeTab === "verification" ? verificationRequests : accessRequests;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/convener")}
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
            Back to Dashboard
          </button>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Judge Requests Management
          </h1>
          <p className="text-gray-600">
            Review and manage judge verification and access requests.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("verification")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === "verification"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0
 0118 0z"
                  />
                </svg>
                Verification Requests
                {verificationRequests.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                    {verificationRequests.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("access")}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === "access"
                  ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                Access Requests
                {accessRequests.length > 0 && (
                  <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                    {accessRequests.length}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Header with count and refresh */}
          <div
            className={`p-6 ${
              activeTab === "verification"
                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                : "bg-gradient-to-r from-orange-500 to-orange-600"
            }`}
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-2xl font-bold">
                  {activeTab === "verification"
                    ? "Pending Verification"
                    : "Pending Access Approval"}
                </h2>
                <p
                  className={`text-sm mt-1 ${
                    activeTab === "verification"
                      ? "text-blue-100"
                      : "text-orange-100"
                  }`}
                >
                  {currentRequests.length} request
                  {currentRequests.length !== 1 ? "s" : ""}{" "}
                  {activeTab === "verification"
                    ? "awaiting verification"
                    : "awaiting approval"}
                </p>
              </div>
              <button
                onClick={fetchAllRequests}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
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
                Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          {currentRequests.length === 0 ? (
            <div className="p-12 text-center">
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                No Pending Requests
              </h2>
              <p className="text-gray-600">
                There are currently no{" "}
                {activeTab === "verification" ? "verification" : "access"}{" "}
                requests.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Judge Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Problem Statement
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTab === "verification"
                    ? verificationRequests.map((request) => (
                        <tr
                          key={request.judgeId}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {request.judgeName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.judgeName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {request.judgeEmail}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {request.psName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending Verification
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() =>
                                handleVerifyJudge(
                                  request.judgeId,
                                  request.judgeName
                                )
                              }
                              disabled={processingId === request.judgeId}
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            >
                              {processingId === request.judgeId ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Verifying...
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
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Verify
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    : accessRequests.map((request) => (
                        <tr
                          key={request._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-semibold text-sm">
                                  {request.user?.username
                                    ?.charAt(0)
                                    .toUpperCase() || "?"}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.user?.username || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {request.user?.email || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {request.ps?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                              Access Requested
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() =>
                                handleGrantAccess(
                                  request._id,
                                  request.user?.username || "Judge"
                                )
                              }
                              disabled={processingId === request._id}
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            >
                              {processingId === request._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Granting...
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
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Grant Access
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Information Box */}
        <div
          className={`mt-6 ${
            activeTab === "verification"
              ? "bg-blue-50 border-l-4 border-blue-400"
              : "bg-orange-50 border-l-4 border-orange-400"
          } p-4 rounded-r-lg`}
        >
          <div className="flex items-start">
            <svg
              className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                activeTab === "verification"
                  ? "text-blue-600"
                  : "text-orange-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3
                className={`text-sm font-semibold mb-1 ${
                  activeTab === "verification"
                    ? "text-blue-800"
                    : "text-orange-800"
                }`}
              >
                Important Information
              </h3>
              {activeTab === "verification" ? (
                <p
                  className={`text-sm ${
                    activeTab === "verification"
                      ? "text-blue-700"
                      : "text-orange-700"
                  }`}
                >
                  When you verify a judge's submission request, their account
                  will be marked as verified and they will be blocked from
                  logging in. This action ensures that marks are finalized and
                  cannot be modified after verification.
                </p>
              ) : (
                <p className="text-sm text-orange-700">
                  When you grant access to a judge, their verification status
                  will be revoked and they will be able to login and modify
                  their marks again. They will need to resubmit for verification
                  after making changes.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JudgeRequests;
