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
    { name: "", email: "", rollNumber: "", discordId: "" },
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
        `${BACKEND_URL}/api/v1/techsecy/get-requests/${psId}`,
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
        const psRes = await fetch(`${BACKEND_URL}/api/v1/ps/${psId}`, {
          credentials: "include",
        });
        if (psRes.ok) {
          const psData = await psRes.json();
          setPsDetails(psData.ps);
        }
        const teamRes = await fetch(
          `${BACKEND_URL}/api/v1/techsecy/get-team/${psId}`,
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
    localStorage.setItem(`teamMembers-${psId}`, JSON.stringify(teamMembers));
  }, [teamMembers, psId]);

  useEffect(() => {
    const saved = localStorage.getItem(`teamMembers-${psId}`);
    if (saved) setTeamMembers(JSON.parse(saved));
  }, [psId]);

  useEffect(() => {
    localStorage.setItem(`requestStatus-${psId}`, requestStatus);
  }, [requestStatus, psId]);

  useEffect(() => {
    const saved = localStorage.getItem(`requestStatus-${psId}`);
    if (saved) setRequestStatus(saved);
  }, [psId]);

  async function requestEditAccess() {
    try {
      setError("");
      setMessage("");
      setRequestingEdit(true);
      const res = await fetch(
        `${BACKEND_URL}/api/v1/techsecy/edit-registered-team/${psId}`,
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
      { name: "", email: "", rollNumber: "", discordId: "" },
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

      const url = isEditing
        ? `${BACKEND_URL}/api/v1/techsecy/update-registered-team/${psId}`
        : `${BACKEND_URL}/api/v1/techsecy/register-team/${psId}`;

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

      setTimeout(() => navigate(0), 800);
    } catch {
      setError("Server error");
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  if (existingTeam && !canEdit) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold">Your Team</h1>

        {existingTeam.teamMembers.map((m, i) => (
          <div key={i} className="border p-4 rounded mt-3">
            <p>Name: {m.name}</p>
            <p>Email: {m.email}</p>
            <p>Roll: {m.rollNumber}</p>
            <p>Discord: {m.discordId}</p>
          </div>
        ))}

        <div className="mt-6">
          {requestStatus === "pending" && (
            <p className="text-yellow-600">Requested for approval</p>
          )}

          {(requestStatus === "none" || requestStatus === "rejected") && (
            <button
              onClick={requestEditAccess}
              disabled={requestingEdit}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              {requestingEdit ? "Requesting..." : "Request Edit Access"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold">
        {isEditing ? "Edit Team" : "Register Team"}
      </h1>
      {teamMembers.map((m, i) => (
        <div key={i} className="border p-4 rounded mt-3">
          <input
            className="border p-2 w-full mt-2"
            placeholder="Name"
            value={m.name}
            onChange={(e) => updateMember(i, "name", e.target.value)}
          />
          <input
            className="border p-2 w-full mt-2"
            placeholder="Email"
            value={m.email}
            onChange={(e) => updateMember(i, "email", e.target.value)}
          />
          <input
            className="border p-2 w-full mt-2"
            placeholder="Roll Number"
            value={m.rollNumber}
            onChange={(e) => updateMember(i, "rollNumber", e.target.value)}
          />
          <input
            className="border p-2 w-full mt-2"
            placeholder="Discord ID"
            value={m.discordId}
            onChange={(e) => updateMember(i, "discordId", e.target.value)}
          />
          {i > 0 && (
            <button
              className="text-red-500 mt-2"
              onClick={() => removeMember(i)}
            >
              Remove Member
            </button>
          )}
        </div>
      ))}
      <button
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
        onClick={addMember}
      >
        Add Member
      </button>
      <button
        className="bg-green-600 text-white px-4 py-2 mt-4 ml-3 rounded"
        onClick={submitTeam}
      >
        Save Team
      </button>
    </div>
  );
}
