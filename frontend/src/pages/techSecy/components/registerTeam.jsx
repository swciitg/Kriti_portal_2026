import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { BACKEND_URL } from "../../../constants";
import { userContext } from "../../../context/userContext";
import TeamRegistrationGuidelines from "../../../components/TeamRegistrationGuidelines";

export default function RegisterTeam() {
  const { psId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [psDetails, setPsDetails] = useState(null);
  const [existingTeam, setExistingTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([
    { name: "", email: "", yearOfStudy: "", phoneNumber: "", department: "" , discordId : "" , discordUsername : "" , profilePicture : null},
  ]);
  const [requestStatus, setRequestStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [requestingEdit, setRequestingEdit] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showEditButton, setShowEditButton] = useState(false); // Secret edit button toggle

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

  // Secret key combination to show edit button (Ctrl + Shift + E)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setShowEditButton(prev => !prev);
        console.log('Edit button visibility toggled');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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
      { name: "", email: "", yearOfStudy: "", phoneNumber: "", department: "" , discordId: "" , discordUsername : "", profilePicture : null },
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
          !member.department ||
          !member.discordId ||
          !member.discordUsername ||
          !member.profilePicture
        ) {
          setError(`Please fill all fields for member ${i + 1}`);
          return;
        }
      }

      const url = isEditing
        ? `${BACKEND_URL}/v1/techsecy/update-registered-team/${psId}`
        : `${BACKEND_URL}/v1/techsecy/register-team/${psId}`;

      const formData = new FormData();

      teamMembers.forEach((member, index) => {
        formData.append(`teamMembers[${index}][name]`, member.name);
        formData.append(`teamMembers[${index}][email]`, member.email);
        formData.append(`teamMembers[${index}][yearOfStudy]`, member.yearOfStudy);
        formData.append(`teamMembers[${index}][phoneNumber]`, member.phoneNumber);
        formData.append(`teamMembers[${index}][department]`, member.department);
        formData.append(`teamMembers[${index}][discordId]`, member.discordId);
        formData.append(`teamMembers[${index}][discordUsername]`, member.discordUsername);
        formData.append(`teamMembers[${index}][profilePicture]`, member.profilePicture);
      });

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        body: formData,
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
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <div className="text-xl font-semibold text-gray-700">Loading team registration...</div>
        </div>
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
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side (2/3) */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <button
                onClick={() => navigate("/techsecy/register-team")}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors group"
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
                Back to PS List
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {psDetails.name}
              </h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-semibold">Team Strength:</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                    {psDetails.teamStrength}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Points:</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                    {psDetails.points}
                  </span>
                </div>
              </div>
            </div>

            {/* Existing team info with SECRET edit button */}
            {existingTeam && !canEdit && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Team Registered
                    </h2>
                    <p className="text-blue-100">
                      Team Size: {existingTeam.teamMembers.length}/{psDetails.teamStrength}
                    </p>
                  </div>
                  {/* SECRET: Only shows when Ctrl+Shift+E is pressed */}
                  {showEditButton && (
                    <button
                      onClick={requestEditAccess}
                      disabled={requestingEdit || requestStatus === "pending"}
                      className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {requestingEdit
                        ? "Requesting..."
                        : requestStatus === "pending"
                        ? "Request Pending"
                        : "Request Edit"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Request status messages */}
            {requestStatus === "pending" && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-yellow-800 font-medium">
                  Edit request is pending approval from convener
                </p>
              </div>
            )}

            {requestStatus === "rejected" && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-red-800 font-medium">
                  Edit request was rejected. You can request again if needed.
                </p>
              </div>
            )}

            {/* Error and success messages */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Max: {psDetails.teamStrength} members
                  </span>
                </div>

                {/* Team members */}
                <div className="space-y-6">
                  {teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          Member {index + 1}
                        </h3>
                        {teamMembers.length > 1 && (
                          <button
                            onClick={() => removeMember(index)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1 hover:bg-red-50 px-3 py-1 rounded transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) =>
                              updateMember(index, "name", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Enter full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={member.email}
                            onChange={(e) =>
                              updateMember(index, "email", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="example@email.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Year of Study <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={member.yearOfStudy}
                            onChange={(e) =>
                              updateMember(index, "yearOfStudy", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="e.g., 2"
                            min="1"
                            max="5"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={member.phoneNumber}
                            onChange={(e) =>
                              updateMember(index, "phoneNumber", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="+91 XXXXXXXXXX"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discord Username <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="type"
                            value={member.discordUsername}
                            onChange={(e) =>
                              updateMember(index, "discordUsername", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="example_username"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discord ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.discordId}
                            onChange={(e) =>
                              updateMember(index, "discordId", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="123456789012345678 (18 digit)"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={member.department}
                            onChange={(e) =>
                              updateMember(index, "department", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="e.g., Computer Science"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profile Picture <span className="text-red-500">*</span>
                          </label>

                          {!member.profilePicture ? (
                            <label className="w-full flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                className="hidden"
                                onChange={(e) =>
                                  updateMember(index, "profilePicture", e.target.files?.[0] || null)
                                }
                              />
                              <span className="text-sm text-gray-500">Click to upload profile picture which <span className="font-semibold text-red-500">MUST BE THE ENTIRE COLLEGE ID CARD.</span> Make sure all the details in the front side of the College ID Card are clearly visible.</span>
                            </label>
                          ) : (
                            <div className="flex flex-col items-center gap-4 p-4 border border-gray-300 rounded-lg">
                              <img
                                  src={URL.createObjectURL(member.profilePicture)}
                                  alt="Profile Preview"
                                  className="w-150 h-50 object-cover border"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateMember(index, "profilePicture", null)
                                  }}
                                  className="cursor-pointer px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition"
                                >
                                  Remove
                                </button>
                              </div>
                              
                            </div>
                          )}

                          <p className="mt-2 text-xs text-gray-500">
                            Max Size : 5MB &nbsp;|&nbsp; Type supported : PNG, JPG, JPEG
                          </p>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                  <button
                    onClick={addMember}
                    disabled={teamMembers.length >= psDetails.teamStrength}
                    className="w-full sm:flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Member ({teamMembers.length}/{psDetails.teamStrength})
                  </button>

                  <button
                    onClick={submitTeam}
                    className="w-full sm:flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {isEditing ? "Update Team" : "Register Team"}
                  </button>
                </div>

                <button
                  onClick={() => navigate("/techsecy/register-team")}
                  className="w-full mt-4 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel & Go Back
                </button>
              </div>
            )}

            {/* View only mode - when team exists but no edit permission */}
            {existingTeam && !canEdit && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Registered Team Members
                </h2>
                <div className="space-y-4">
                  {existingTeam.teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        Member {index + 1}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium text-gray-600">Name:</span>
                          <span className="text-gray-800 font-semibold">{member.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-gray-600">Email:</span>
                          <span className="text-gray-800">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="font-medium text-gray-600">Year:</span>
                          <span className="text-gray-800">{member.yearOfStudy}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="font-medium text-gray-600">Phone:</span>
                          <span className="text-gray-800">{member.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg  className="size-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                          </svg>
                          <span className="font-medium text-gray-600">Discord ID:</span>
                          <span className="text-gray-800">{member.discordId || "--"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="size-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>

                          <span className="font-medium text-gray-600">Discord Username:</span>
                          <span className="text-gray-800">{member.discordUsername || "--"}</span>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-medium text-gray-600">Department:</span>
                          <span className="text-gray-800">{member.department}</span>
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-2">
                          {member.profilePicture !== undefined && member.profilePicture ? 
                          (<img
                            src={BACKEND_URL + member.profilePicture}
                            alt="College ID Card"
                            className="w-150 h-50 object-cover border"
                          /> ): 
                          (<div className="w-[300px] h-[100px] flex items-center justify-center border border-dashed border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                            No ID Card uploaded
                          </div>)
                          }
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

          {/* Guidelines Sidebar - Right Side (1/3) */}
          <div className="lg:col-span-1">
            <TeamRegistrationGuidelines />
          </div>
        </div>
      </div>
    </div>
  );
}
