import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { BACKEND_URL } from "../../../constants";
import { userContext } from "../../../context/userContext";

export default function RegisterTeam() {
  const { psId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [psDetails, setPsDetails] = useState(null);
  const [existingTeam, setExistingTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([
    { name: "", email: "", yearOfStudy: "", phoneNumber: "", department: "" },
  ]);
  const [requestStatus, setRequestStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [requestingEdit, setRequestingEdit] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canEdit = requestStatus === "approved";
  const isEditing = Boolean(existingTeam);

  // Auth check
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "TechSecy" && user?.role !== "TechSecy")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  // Fetch request status
  const fetchRequestStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/v1/techsecy/get-requests/${psId}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setRequestStatus(data.data.status);
      } else if (res.status === 404) {
        setRequestStatus("none");
      }
    } catch (err) {
      console.error("Failed to fetch request status:", err);
    }
  }, [psId]);

  // Fetch all data on mount
  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        setError("");

        // Fetch PS details
        const psRes = await fetch(`${BACKEND_URL}/v1/ps/${psId}`, {
          credentials: "include",
        });
        if (psRes.ok) {
          const psData = await psRes.json();
          setPsDetails(psData.ps);
        }

        // Fetch team data
        const teamRes = await fetch(
          `${BACKEND_URL}/v1/techsecy/get-team/${psId}`,
          { credentials: "include" }
        );

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          const team = teamData.teams?.[0] || null;
          setExistingTeam(team);

          // If team exists, populate the form with existing members
          if (team && team.teamMembers && team.teamMembers.length > 0) {
            setTeamMembers(team.teamMembers);
          }
        } else if (teamRes.status === 404) {
          // No team found, start fresh
          setExistingTeam(null);
        }

        await fetchRequestStatus();
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch details");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [psId, fetchRequestStatus]);

  // Poll request status every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchRequestStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchRequestStatus]);

  // Load team members when edit is approved
  useEffect(() => {
    if (existingTeam && canEdit && existingTeam.teamMembers) {
      setTeamMembers(existingTeam.teamMembers);
    }
  }, [existingTeam, canEdit]);

  // Save to localStorage if not editing
  useEffect(() => {
    if (!existingTeam) {
      localStorage.setItem(`teamMembers-${psId}`, JSON.stringify(teamMembers));
    }
  }, [teamMembers, psId, existingTeam]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`teamMembers-${psId}`);
    if (saved && !existingTeam) {
      try {
        const parsedData = JSON.parse(saved);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setTeamMembers(parsedData);
        }
      } catch (err) {
        console.error("Failed to parse saved team members:", err);
      }
    }
  }, [psId, existingTeam]);

  // Request edit access
  async function requestEditAccess() {
    try {
      setError("");
      setMessage("");
      setRequestingEdit(true);

      const res = await fetch(
        `${BACKEND_URL}/v1/techsecy/edit-registered-team/${psId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to request edit access");
        return;
      }

      setMessage("Edit request sent for approval");
      setRequestStatus("pending");
    } catch (err) {
      console.error("Request edit error:", err);
      setError("Server error");
    } finally {
      setRequestingEdit(false);
    }
  }

  // Add a new team member
  function addMember() {
    if (teamMembers.length >= psDetails.teamStrength) {
      setError(`Maximum ${psDetails.teamStrength} members allowed`);
      return;
    }
    setTeamMembers([
      ...teamMembers,
      { name: "", email: "", yearOfStudy: "", phoneNumber: "", department: "" },
    ]);
  }

  // Update a team member field
  function updateMember(index, key, value) {
    const updated = [...teamMembers];
    updated[index][key] = value;
    setTeamMembers(updated);
  }

  // Remove a team member
  function removeMember(index) {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  }

  // Submit team registration or update
  async function submitTeam() {
    try {
      setError("");
      setMessage("");

      // Validate all fields
      for (let i = 0; i < teamMembers.length; i++) {
        const member = teamMembers[i];
        if (
          !member.name ||
          !member.email ||
          !member.yearOfStudy ||
          !member.phoneNumber ||
          !member.department
        ) {
          setError(`Please fill all fields for member ${i + 1}`);
          return;
        }
      }

      const url = isEditing
        ? `${BACKEND_URL}/v1/techsecy/update-registered-team/${psId}`
        : `${BACKEND_URL}/v1/techsecy/register-team/${psId}`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamMembers }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save team");
        return;
      }

      localStorage.removeItem(`teamMembers-${psId}`);
      localStorage.removeItem(`requestStatus-${psId}`);

      setMessage(
        isEditing ? "Team updated successfully!" : "Team registered successfully!"
      );

      setTimeout(() => navigate(0), 1000);
    } catch (err) {
      console.error("Submit team error:", err);
      setError("Server error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!psDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-semibold text-red-600">
          Problem statement not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <button
            onClick={() => navigate("/techsecy/register-team")}
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
            Back to PS
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {psDetails.name}
          </h1>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Team Strength:</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {psDetails.teamStrength}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Points:</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {psDetails.points}
              </span>
            </div>
          </div>
        </div>

        {/* Existing team info */}
        {existingTeam && !canEdit && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Team Registered</h2>
                <p className="text-blue-100">
                  Team Size: {existingTeam.teamMembers.length}/
                  {psDetails.teamStrength}
                </p>
              </div>
              <button
                onClick={requestEditAccess}
                disabled={requestingEdit || requestStatus === "pending"}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestingEdit
                  ? "Requesting..."
                  : requestStatus === "pending"
                  ? "Request Pending"
                  : "Request Edit"}
              </button>
            </div>
          </div>
        )}

        {/* Request status messages */}
        {requestStatus === "pending" && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <p className="text-yellow-800 font-medium">
              ⏳ Edit request is pending approval
            </p>
          </div>
        )}

        {requestStatus === "rejected" && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
            <p className="text-red-800 font-medium">
              ❌ Edit request was rejected. You can request again.
            </p>
          </div>
        )}

        {/* Error and success messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg">
            <p className="text-green-700 font-medium">{message}</p>
          </div>
        )}

        {/* Team form - only show if no existing team or edit is approved */}
        {(!existingTeam || canEdit) && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Team Members" : "Register Team"}
              </h2>
              <span className="text-sm text-gray-500">
                Max Team Size: {psDetails.teamStrength} members
              </span>
            </div>

            {/* Team members */}
            <div className="space-y-6">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-6 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Member {index + 1}
                    </h3>
                    {teamMembers.length > 1 && (
                      <button
                        onClick={() => removeMember(index)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) =>
                          updateMember(index, "name", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) =>
                          updateMember(index, "email", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="example@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year of Study *
                      </label>
                      <input
                        type="number"
                        value={member.yearOfStudy}
                        onChange={(e) =>
                          updateMember(index, "yearOfStudy", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 2"
                        min="1"
                        max="5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={member.phoneNumber}
                        onChange={(e) =>
                          updateMember(index, "phoneNumber", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 XXXXXXXXXX"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <input
                        type="text"
                        value={member.department}
                        onChange={(e) =>
                          updateMember(index, "department", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={addMember}
                disabled={teamMembers.length >= psDetails.teamStrength}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Member
              </button>

              <button
                onClick={submitTeam}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition"
              >
                {isEditing ? "Update Team" : "Register Team"}
              </button>
            </div>

            <button
              onClick={() => navigate("/techsecy/ps")}
              className="w-full mt-4 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Problem Statements
            </button>
          </div>
        )}

        {/* View only mode - when team exists but no edit permission */}
        {existingTeam && !canEdit && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Registered Team Members
            </h2>
            <div className="space-y-4">
              {existingTeam.teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-6 bg-gray-50"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Member {index + 1}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="ml-2 text-gray-800">{member.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-800">{member.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Year:</span>
                      <span className="ml-2 text-gray-800">
                        {member.yearOfStudy}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <span className="ml-2 text-gray-800">
                        {member.phoneNumber}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-600">
                        Department:
                      </span>
                      <span className="ml-2 text-gray-800">
                        {member.department}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/techsecy/register-team")}
              className="w-full mt-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Problem Statements
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
