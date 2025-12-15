import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";

function CompanyRequests() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Fetch pending requests from backend
  useEffect(() => {
    fetchPendingRequests();
  }, [user, navigate]);

  const fetchPendingRequests = async () => {
    try {
      const stored = localStorage.getItem("accessToken");
      const token = stored || user?.accessToken;

      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/api/v1/convener/get-company-pending-requests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pending requests");
      }

      const data = await response.json();

      if (data.success) {
        setRequests(data.requests || []);
      } else {
        setError(data.message || "No pending requests found");
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      setError("Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCompany = async (companyId, companyName) => {
    if (
      !window.confirm(
        `Are you sure you want to verify ${companyName}? After verification, this company POC will no longer be able to login.`
      )
    ) {
      return;
    }

    setProcessingId(companyId);

    try {
      const stored = localStorage.getItem("accessToken");
      const token = stored || user?.accessToken;

      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/api/v1/convener/verify-company/${companyId}`,
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
          `Company POC ${companyName} verified successfully! They can no longer login.`
        );
        // Remove the verified request from the list
        setRequests((prev) => prev.filter((req) => req.companyId !== companyId));
      } else {
        alert(data.message || "Failed to verify company POC");
      }
    } catch (error) {
      console.error("Error verifying company POC:", error);
      alert("Failed to verify company POC. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading pending requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/convener/dashboard")}
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
            Company POC Mark Submission Requests
          </h1>
          <p className="text-gray-600">
            Review and verify company POC mark submissions. Once verified, company POCs will
            no longer be able to access the system.
          </p>
        </div>

        {error && !requests.length ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
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
            <p className="text-gray-600 mb-6">
              There are currently no pending company POC verification requests.
            </p>
            <button
              onClick={fetchPendingRequests}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h2 className="text-2xl font-bold">Pending Requests</h2>
                  <p className="text-purple-100 text-sm mt-1">
                    {requests.length} request{requests.length !== 1 ? "s" : ""}{" "}
                    awaiting verification
                  </p>
                </div>
                <button
                  onClick={fetchPendingRequests}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
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

            {requests.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No pending requests at the moment</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Company POC Name
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
                    {requests.map((request) => (
                      <tr
                        key={request.companyId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-semibold text-sm">
                                {request.companyName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.companyName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {request.companyEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {request.psName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() =>
                              handleVerifyCompany(
                                request.companyId,
                                request.companyName
                              )
                            }
                            disabled={processingId === request.companyId}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            {processingId === request.companyId ? (
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Information Box */}
        <div className="mt-6 bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0"
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
              <h3 className="text-sm font-semibold text-purple-800 mb-1">
                Important Information
              </h3>
              <p className="text-sm text-purple-700">
                When you verify a company POC's submission request, their account will
                be marked as verified and they will be blocked from logging in.
                This action ensures that marks are finalized and cannot be
                modified after verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyRequests;