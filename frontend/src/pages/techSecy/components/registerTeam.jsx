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

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "TechSecy" && user?.role !== "TechSecy")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

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
    } catch {
      console.error("Failed to fetch request status");
    }
  }, [psId]);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const psRes = await fetch(`${BACKEND_URL}/v1/ps/${psId}`, {
          credentials: "include",
        });
        if (psRes.ok) {
          const psData = await psRes.json();
          setPsDetails(psData.ps);
        }

        const teamRes = await fetch(
          `${BACKEND_URL}/v1/techsecy/get-team/${psId}`,
          { credentials: "include" }
        );
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setExistingTeam(teamData.teams?.[0] || null);
        }

        await fetchRequestStatus();
      } catch {
        setError("Failed to fetch details");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [psId, fetchRequestStatus]);

  useEffect(() => {
    const interval = setInterval(fetchRequestStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchRequestStatus]);

  useEffect(() => {
    if (existingTeam && canEdit) {
      setTeamMembers(existingTeam.teamMembers);
    }
  }, [existingTeam, canEdit]);

  useEffect(() => {
    if (!existingTeam) {
      localStorage.setItem(`teamMembers-${psId}`, JSON.stringify(teamMembers));
    }
  }, [teamMembers, psId, existingTeam]);

  useEffect(() => {
    const saved = localStorage.getItem(`teamMembers-${psId}`);
    if (saved && !existingTeam) {
      setTeamMembers(JSON.parse(saved));
    }
  }, [psId]);

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
    } catch {
      setError("Server error");
    } finally {
      setRequestingEdit(false);
    }
  }

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

  function updateMember(index, key, value) {
    const updated = [...teamMembers];
    updated[index][key] = value;
    setTeamMembers(updated);
  }

  function removeMember(index) {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  }

  async function submitTeam() {
    try {
      setError("");
      setMessage("");

      // Validate all fields
      for (let i = 0; i < teamMembers.length; i++) {
        const member = teamMembers[i];
        if (!member.name || !member.email || !member.yearOfStudy || 
            !member.phoneNumber || !member.department) {
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
        isEditing
          ? "Team updated successfully!"
          : "Team registered successfully!"
      );

      setTimeout(() => navigate(0), 1000);
    } catch {
      setError("Server error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (existingTeam && !canEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Your Registered Team</h1>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Registered
              </span>
            </div>

            {psDetails && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{psDetails.name}</h2>
                <p className="text-sm text-gray-600">Team Size: {existingTeam.teamMembers.length}/{psDetails.teamStrength}</p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              {existingTeam.teamMembers.map((m, i) => (
                <div key={i} className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {i + 1}
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-gray-800">{m.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-500 font-medium w-28">Email:</span>
                      <span className="text-gray-700">{m.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 font-medium w-28">Year:</span>
                      <span className="text-gray-700">{m.yearOfStudy}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 font-medium w-28">Phone:</span>
                      <span className="text-gray-700">{m.phoneNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 font-medium w-28">Department:</span>
                      <span className="text-gray-700">{m.department}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              {requestStatus === "pending" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 font-medium">⏳ Edit request is pending approval</p>
                </div>
              )}

              {requestStatus === "rejected" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium">❌ Edit request was rejected. You can request again.</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800">{message}</p>
                </div>
              )}

              {(requestStatus === "none" || requestStatus === "rejected") && (
                <button
                  onClick={requestEditAccess}
                  disabled={requestingEdit}
                  className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50"
                >
                  {requestingEdit ? "Requesting..." : "Request Edit Access"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isEditing ? "Edit Your Team" : "Register Your Team"}
          </h1>

          {psDetails && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{psDetails.name}</h2>
              <p className="text-sm text-gray-600">Max Team Size: {psDetails.teamStrength} members</p>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          <div className="space-y-6">
            {teamMembers.map((m, i) => (
              <div key={i} className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {i + 1}
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-gray-700">Member {i + 1}</h3>
                  </div>
                  {i > 0 && (
                    <button
                      onClick={() => removeMember(i)}
                      className="text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                      value={m.name}
                      onChange={(e) => updateMember(i, "name", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institute Email *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="john@institute.edu"
                      value={m.email}
                      onChange={(e) => updateMember(i, "email", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year of Study *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="3"
                      value={m.yearOfStudy}
                      onChange={(e) => updateMember(i, "yearOfStudy", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="9876543210"
                      value={m.phoneNumber}
                      onChange={(e) => updateMember(i, "phoneNumber", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <input
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Computer Science"
                      value={m.department}
                      onChange={(e) => updateMember(i, "department", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={addMember}
              disabled={psDetails && teamMembers.length >= psDetails.teamStrength}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Member
            </button>
            <button
              onClick={submitTeam}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            >
              {isEditing ? "Update Team" : "Register Team"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
