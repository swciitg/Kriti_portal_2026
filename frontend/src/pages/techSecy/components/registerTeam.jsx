import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { BACKEND_URL } from "../../../constants";
import { userContext } from "../../../context/userContext";

export default function RegisterTeam() {
  const { psId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const [psDetails, setPsDetails] = useState(null);
  const [existingTeam, setExistingTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([
    { name: "", email: "", rollNumber: "", discordId: "" },
  ]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
    async function fetchAll() {
      try {
        const teamRes = await fetch(
        `${BACKEND_URL}/api/v1/techsecy/get-team/${psId}`,
        { credentials: "include" }
      );
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setExistingTeam(teamData.team);
      } else {
        setExistingTeam(null);
      }
      setLoading(true);
      setTimeout(() => setLoading(false), 200);
      } catch(err){
        console.error(err);
        setError("Failed to fetch details");
        setLoading(false);
      }
    }
    fetchAll();
  }, [psId]);
  
  if(loading || !psDetails) {
    return <div className="p-4">Loading ...</div>
  }

  if(existingTeam){
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold">Your Team</h1>
        <p className="text-gray-700 mt-2">PS: {psDetails.title}</p>

        <div className="mt-6 space-y-4">
          {existingTeam.teamMembers.map((m, i) => (
            <div key={i} className="border p-4 rounded">
              <h2 className="font-semibold">Member {i + 1}</h2>
              <p>Name: {m.name}</p>
              <p>Email: {m.email}</p>
              <p>Roll Number: {m.rollNumber}</p>
              <p>Discord ID: {m.discordId}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-green-600 font-medium">
          Team already registered 
        </p>
      </div>
    );
  }

  function addMember() {
    if (teamMembers.length >= psDetails.teamStrength) {
      return setError(`Maximum ${psDetails.teamStrength} members allowed`);
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
      const res = await fetch(`${BACKEND_URL}/api/v1/techsecy/register-team`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ psId, teamMembers }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }
      setMessage("Team registered successfully!");
      setTimeout(() => navigate(0), 700); 
    } catch (err) {
      setError("Server error");
    }
  }
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold">Register Team</h1>

      <p className="mt-2 text-gray-700">PS: {psDetails.title}</p>
      <p className="text-gray-600 mb-4">
        Max Team Size: {psDetails.teamStrength}
      </p>

      {error && <p className="text-red-500 mb-3">{error}</p>}
      {message && <p className="text-green-600 mb-3">{message}</p>}

      {teamMembers.map((m, i) => (
        <div key={i} className="border p-4 rounded mb-3">
          <h2 className="font-semibold">Member {i + 1}</h2>

          <input
            type="text"
            placeholder="Name"
            className="border p-2 w-full mt-2"
            value={m.name}
            onChange={(e) => updateMember(i, "name", e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full mt-2"
            value={m.email}
            onChange={(e) => updateMember(i, "email", e.target.value)}
          />

          <input
            type="number"
            placeholder="Roll Number"
            className="border p-2 w-full mt-2"
            value={m.rollNumber}
            onChange={(e) => updateMember(i, "rollNumber", e.target.value)}
          />

          <input
            type="text"
            placeholder="Discord ID"
            className="border p-2 w-full mt-2"
            value={m.discordId}
            onChange={(e) => updateMember(i, "discordId", e.target.value)}
          />

          {i > 0 && (
            <button
              onClick={() => removeMember(i)}
              className="text-red-500 mt-2"
            >
              Remove Member
            </button>
          )}
        </div>
      ))}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={addMember}
      >
        Add Member
      </button>

      <button
        className="bg-green-600 text-white px-4 py-2 rounded ml-3"
        onClick={submitTeam}
      >
        Submit Team
      </button>
    </div>
  );
};

