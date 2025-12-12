// src/pages/techsecy/TechSecyPanel.jsx
import { useEffect, useState } from "react";
import { TECHSECY_ROUTES } from "../../constants";
import { apiRequest } from "../../utils/api";

function PSList({ title, psList, onSelect }) {
  return (
    <div className="ps-list">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {psList.length === 0 && <p className="text-sm text-gray-500">Nothing here yet.</p>}
      <ul className="space-y-2">
        {psList.map((ps) => (
          <li
            key={ps._id}
            className="border rounded px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">{ps.title}</p>
              <p className="text-xs text-gray-500">Code: {ps.code}</p>
            </div>
            <button
              onClick={() => onSelect(ps)}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
            >
              Open
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TechSecyPanel() {
  const [openPS, setOpenPS] = useState([]);
  const [myPS, setMyPS] = useState([]);
  const [selectedPS, setSelectedPS] = useState(null);
  const [teamMembers, setTeamMembers] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // initial load
  useEffect(() => {
    async function load() {
      try {
        const [openData, myData] = await Promise.all([
          apiRequest(TECHSECY_ROUTES.OPEN_PS),
          apiRequest(TECHSECY_ROUTES.MY_PS),
        ]);
        setOpenPS(openData.ps || openData.data || []);
        setMyPS(myData.ps || myData.data || []);
      } catch (err) {
        setMessage(err.message);
      }
    }
    load();
  }, []);

  const handleMemberChange = (idx, value) => {
    setTeamMembers((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const addMemberField = () => setTeamMembers((prev) => [...prev, ""]);
  const removeMemberField = (idx) =>
    setTeamMembers((prev) => prev.filter((_, i) => i !== idx));

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    if (!selectedPS) return;
    const members = teamMembers.map((m) => m.trim()).filter(Boolean);
    if (members.length === 0) {
      setMessage("Add at least one team member.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const body = { psId: selectedPS._id, teamMembers: members };
      const data = await apiRequest(TECHSECY_ROUTES.REGISTER_TEAM, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setMessage("Team registered successfully.");
      // push PS into myPS list if not already there
      if (!myPS.find((p) => p._id === selectedPS._id)) {
        setMyPS((prev) => [...prev, selectedPS]);
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* left side: lists */}
      <aside className="w-1/3 border-r p-4 space-y-6">
        <PSList
          title="Open PS for Registration"
          psList={openPS}
          onSelect={setSelectedPS}
        />
        <PSList
          title="PS with My Teams"
          psList={myPS}
          onSelect={setSelectedPS}
        />
      </aside>

      {/* right side: details + register form */}
      <main className="flex-1 p-6">
        {selectedPS ? (
          <>
            <h1 className="text-xl font-bold mb-2">{selectedPS.title}</h1>
            <p className="text-sm text-gray-600 mb-4">Code: {selectedPS.code}</p>

            <form onSubmit={handleRegisterTeam} className="space-y-3 max-w-md">
              <h2 className="font-semibold">Register Team</h2>
              {teamMembers.map((member, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    placeholder={`Member ${idx + 1} email / roll / name`}
                    className="flex-1 border rounded px-2 py-1 text-sm"
                  />
                  {teamMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMemberField(idx)}
                      className="text-xs text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMemberField}
                className="text-xs text-blue-600"
              >
                + Add member
              </button>

              <div className="flex gap-3 mt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-60"
                >
                  {loading ? "Registering..." : "Register Team"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = `/techsecy/submissions/${selectedPS._id}`)
                  }
                  className="px-4 py-1 bg-gray-800 text-white rounded text-sm"
                >
                  View submissions
                </button>
              </div>
            </form>
          </>
        ) : (
          <p className="text-gray-500">Select a problem statement to manage.</p>
        )}

        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
      </main>
    </div>
  );
}
