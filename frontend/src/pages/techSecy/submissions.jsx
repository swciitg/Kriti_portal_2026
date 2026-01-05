// src/pages/techSecy/submissions.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";

export default function SubmissionsPage() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const [psList, setPsList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [prepFilter, setPrepFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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

        

        /**
         * by srinjoy on 04-01-2026 from tb_needs
         * This below check is reduntant and might be risky as this now will in local time ps.startDate 
         * is in UTC
         */

        // Filter out PS where startDate is in the future
        // const now = new Date();
        // const availablePsList = data.psList.filter((ps) => {
        //   if (!ps.startDate) return true; // If no startDate, show it
        //   return new Date(ps.startDate) <= now;
        // });

        const availablePsList = data.psList

        setPsList(availablePsList);
        
        if (availablePsList.length === 0) {
          setError("Comming Soon!");
        } else {
          setError("");
        }
      } catch (err) {
        setError("Failed to fetch PS: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPS();
  }, []);

  // Filter and search logic with useMemo for performance
  const filteredPsList = useMemo(() => {
    const now = new Date();
    
    return psList.filter((ps) => {
      // Additional check: ensure startDate has passed
      // if (ps.startDate && new Date(ps.startDate) > now) {
      //   return false;
      // }

      // Search filter
      const matchesSearch = ps.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Prep level filter
      const matchesPrep = prepFilter === "all" || ps.prep === prepFilter;

      // Status filter
      let matchesStatus = true;
      if (statusFilter === "submitted") {
        matchesStatus = ps.finalSubmitted || ps.midSubmitted;
      } else if (statusFilter === "pending") {
        matchesStatus = !ps.finalSubmitted || (ps.midEvalExist && !ps.midSubmitted);
      } else if (statusFilter === "open") {
        matchesStatus = ps.finalSubmissionOpen || ps.midEvalSubmissionOpen;
      }

      return matchesSearch && matchesPrep && matchesStatus;
    });
  }, [psList, searchQuery, prepFilter, statusFilter]);

  // Get unique prep levels
  const prepLevels = useMemo(() => {
    return [...new Set(psList.map(ps => ps.prep))];
  }, [psList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="text-gray-600 text-lg font-medium">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
                className="w-12 h-12 text-gray-400"
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
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error.includes("currently available") ? "No Problem Statements for Submission yet!" : "No Problem Statements yet!"}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (psList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white shadow-2xl rounded-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h2>
          <p className="text-gray-600 mb-2">Problem statements haven't started yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <nav className="w-full bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/techsecy")}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors font-medium group"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Problem Statement Submissions</h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredPsList.length} of {psList.length} submissions
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          {/* Search Bar */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Problem Statements
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by PS name..."
                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Prep Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep Level
              </label>
              <select
                value={prepFilter}
                onChange={(e) => setPrepFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
              >
                <option value="all">All Levels</option>
                {prepLevels.map((prep) => (
                  <option key={prep} value={prep}>
                    {prep.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="pending">Pending</option>
                <option value="open">Open for Submission</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPrepFilter("all");
                  setStatusFilter("all");
                }}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium border border-gray-300"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {filteredPsList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPsList.map((ps) => (
              <div
                key={ps._id}
                className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
              >
                {/* PS Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{ps.name}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        {ps.prep.toUpperCase()}
                      </span>
                      {/* {ps.startDate && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Started: {new Date(ps.startDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </span>
                      )} */}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Final Submission */}
                  <div
                    className={`border-2 rounded-xl p-5 transition-all ${
                      ps.finalSubmitted
                        ? "border-gray-300 bg-gray-50"
                        : ps.finalSubmissionOpen
                        ? "border-blue-400 bg-blue-50 shadow-sm"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Final Submission
                      </h3>
                      {ps.finalSubmitted && (
                        <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-semibold shadow-sm">
                          ✓ Submitted
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Deadline:</span>
                        <span className="ml-2">
                          {new Date(ps.submissionDeadline).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>

                      {ps.finalSubmitted && (
                        <>
                          <div className="flex items-center text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-medium">Submitted:</span>
                            <span className="ml-2">
                              {new Date(ps.finalSubmissionTime).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                          {ps.finalPenalty.length > 0 && (
                            <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Late Submission Penalty
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {ps.finalSubmitted ? (
                      <button
                        onClick={() => navigate(`/techsecy/submissions/view/${ps.finalSubmissionId}`)}
                        className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium shadow-sm"
                      >
                        View Submission
                      </button>
                    ) : ps.finalSubmissionOpen ? (
                      <button
                        onClick={() => navigate(`/techsecy/submissions/submit/${ps._id}?type=final`)}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg"
                      >
                        Submit Now
                      </button>
                    ) : (
                      // <div className="w-full px-4 py-2.5 bg-gray-200 text-gray-600 rounded-lg text-center font-medium">
                      //   Submission Closed
                      // </div>
                      <button
                        onClick={() => navigate(`/techsecy/submissions/submit/${ps._id}?type=final`)}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg"
                      >
                        Submit Now
                      </button>
                    )}
                  </div>

                  {/* Mid Evaluation */}
                  {ps.midEvalExist && (
                    <div
                      className={`border-2 rounded-xl p-5 transition-all ${
                        ps.midSubmitted
                          ? "border-gray-300 bg-gray-50"
                          : ps.midEvalSubmissionOpen
                          ? "border-green-400 bg-green-50 shadow-sm"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          Mid Evaluation
                        </h3>
                        {ps.midSubmitted && (
                          <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-semibold shadow-sm">
                            ✓ Submitted
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Deadline:</span>
                          <span className="ml-2">
                            {new Date(ps.midEvalSubmissionDeadline).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>

                        {ps.midSubmitted && (
                          <>
                            <div className="flex items-center text-gray-700">
                              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="font-medium">Submitted:</span>
                              <span className="ml-2">
                                {new Date(ps.midSubmissionTime).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </span>
                            </div>
                            {ps.midPenalty.length > 0 && (
                              <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Late Submission Penalty
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {ps.midSubmitted ? (
                        <button
                          onClick={() => navigate(`/techsecy/submissions/view/${ps.midSubmissionId}`)}
                          className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium shadow-sm"
                        >
                          View Submission
                        </button>
                      ) : ps.midEvalSubmissionOpen ? (
                        <button
                          onClick={() => navigate(`/techsecy/submissions/submit/${ps._id}?type=mid`)}
                          className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md hover:shadow-lg"
                        >
                          Submit Now
                        </button>
                      ) : (
                        // <div className="w-full px-4 py-2.5 bg-gray-200 text-gray-600 rounded-lg text-center font-medium">
                        //   Submission Closed
                        // </div>
                        <button
                          onClick={() => navigate(`/techsecy/submissions/submit/${ps._id}?type=mid`)}
                          className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md hover:shadow-lg"
                        >
                          Submit Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
