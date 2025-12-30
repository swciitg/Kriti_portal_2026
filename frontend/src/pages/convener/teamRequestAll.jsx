import React, { useState } from "react";
import { userContext } from "../../context/userContext";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../constants";

export default function TeamRequestAll() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [editRequest, setEditRequest] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("requests"); // "requests" or "teams"
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPS, setFilterPS] = useState("all");
  const [filterHostel, setFilterHostel] = useState("all");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Convener" && user?.role !== "Convener")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  // Fetch edit requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/v1/convener/get-requests/`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.status !== 200) {
          setError(data.message || "Failed to fetch requests");
        } else {
          const editTeamRequests = data.data.filter(
            (req) => req.requestType === "EDIT_TEAM" && req.status === "pending"
          );
          setEditRequest(editTeamRequests);
        }
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Fetch all teams
  const fetchAllTeams = async () => {
    try {
      setTeamsLoading(true);
      setError("");
      const res = await fetch(`${BACKEND_URL}/v1/convener/get-all-teams`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.status !== 200) {
        setError(data.message || "Failed to fetch teams");
      } else {
        setAllTeams(data.teams);
      }
      setTeamsLoading(false);
    } catch (e) {
      setError(e.message);
      setTeamsLoading(false);
    }
  };

  // Fetch teams when switching to teams tab
  useEffect(() => {
    if (activeTab === "teams" && allTeams.length === 0) {
      fetchAllTeams();
    }
  }, [activeTab]);

  const handleRequest = async (id, status) => {
    try {
      setLoading(true);
      setSuccess("");
      const res = await fetch(
        `${BACKEND_URL}/v1/convener/update-status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (res.status !== 200) {
        setError(data.message || "Failed to update status");
      } else {
        setSuccess(
          status === "approved"
            ? "Request approved successfully"
            : "Request rejected successfully"
        );
      }
      setEditRequest((prev) => prev.filter((req) => req._id !== id));
      setLoading(false);
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
      setLoading(false);
    }
  };

  // Export to Excel
  const handleExportToExcel = async () => {
    try {
      setExportLoading(true);
      setError("");

      const res = await fetch(`${BACKEND_URL}/v1/convener/export-teams`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to export teams");
        setExportLoading(false);
        return;
      }

      // Create a blob from the response
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teams_export_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Teams exported successfully!");
      setExportLoading(false);
    } catch (err) {
      setError(`Failed to export: ${err.message}`);
      setExportLoading(false);
    }
  };

  // Get unique PS names and hostel IDs for filtering
  const uniquePS = [...new Set(allTeams.map((team) => team.ps?.name).filter(Boolean))];
  const uniqueHostels = [...new Set(allTeams.map((team) => team.hostelId))];

  // Filter teams based on search and filters
  const filteredTeams = allTeams.filter((team) => {
    const matchesSearch =
      searchTerm === "" ||
      team.hostelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.ps?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPS = filterPS === "all" || team.ps?.name === filterPS;
    const matchesHostel = filterHostel === "all" || team.hostelId === filterHostel;

    return matchesSearch && matchesPS && matchesHostel;
  });

  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-7xl bg-white shadow rounded-xl p-8">
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
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === "requests"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Edit Requests
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === "teams"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            All Teams
          </button>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Edit Requests Tab */}
        {activeTab === "requests" && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
              Edit Team Requests
            </h1>

            {loading && (
              <p className="text-center text-gray-600">Loading...</p>
            )}

            {!loading && editRequest.length === 0 && (
              <p className="text-center text-gray-600 py-8">
                No pending edit requests
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {editRequest.map((req) => (
                <div
                  key={req._id}
                  className="border rounded-xl p-5 shadow-sm bg-gray-50 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Hostel ID: {req.hostelId}
                    </h3>
                    <p className="mt-1 text-gray-600">
                      <b>PS Name:</b> {req.psName}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleRequest(req._id, "approved")}
                      disabled={loading}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleRequest(req._id, "rejected")}
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Teams Tab */}
        {activeTab === "teams" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h1 className="text-2xl font-semibold text-gray-800">
                All Registered Teams
              </h1>
              <button
                onClick={handleExportToExcel}
                disabled={exportLoading || allTeams.length === 0}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {exportLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <span>📊</span>
                    Export to Excel
                  </>
                )}
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Search by hostel or PS name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <select
                value={filterPS}
                onChange={(e) => setFilterPS(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Problem Statements</option>
                {uniquePS.map((ps) => (
                  <option key={ps} value={ps}>
                    {ps}
                  </option>
                ))}
              </select>

              <select
                value={filterHostel}
                onChange={(e) => setFilterHostel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Hostels</option>
                {uniqueHostels.map((hostel) => (
                  <option key={hostel} value={hostel}>
                    {hostel}
                  </option>
                ))}
              </select>
            </div>

            {teamsLoading && (
              <p className="text-center text-gray-600">Loading teams...</p>
            )}

            {!teamsLoading && filteredTeams.length === 0 && (
              <p className="text-center text-gray-600 py-8">
                {searchTerm || filterPS !== "all" || filterHostel !== "all"
                  ? "No teams found matching your filters"
                  : "No teams registered yet"}
              </p>
            )}

            {/* Teams Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTeams.map((team) => (
                <div
                  key={team._id}
                  className="border rounded-xl p-6 shadow-sm bg-gray-50 hover:shadow-md transition"
                >
                  {/* Team Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {team.hostelId}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {team.ps?.name || "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          team.submitted
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {team.submitted ? "Submitted" : "Not Submitted"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {team.ps?.prep ? `Prep: ${team.ps.prep}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-gray-600">Team Size</p>
                      <p className="font-bold text-lg text-blue-600">
                        {team.teamMembers.length}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-gray-600">Max Size</p>
                      <p className="font-bold text-lg text-gray-800">
                        {team.ps?.teamStrength || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-gray-600">Points</p>
                      <p className="font-bold text-lg text-green-600">
                        {team.ps?.points || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Team Members:
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {team.teamMembers.map((member, index) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded-lg text-sm"
                        >
                          <p className="font-medium text-gray-800">
                            {member.name}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            {member.email} • Year {member.yearOfStudy}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {member.department} • {member.phoneNumber}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Registration Date */}
                  <div className="mt-4 pt-4 border-t text-xs text-gray-500 text-center">
                    Registered on:{" "}
                    {new Date(team.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
