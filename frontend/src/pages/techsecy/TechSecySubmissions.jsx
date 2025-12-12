// src/pages/techsecy/TechSecySubmissions.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TECHSECY_ROUTES, SUBMISSION_ROUTES } from "../../constants";
import { apiRequest } from "../../utils/api";

export default function TechSecySubmissions() {
  const { psId } = useParams();
  const [psInfo, setPsInfo] = useState(null);
  const [teamConfig, setTeamConfig] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // team + config for this PS
        const teamData = await apiRequest(TECHSECY_ROUTES.TEAM_AND_CONFIG(psId));
        setPsInfo(teamData.ps || teamData.data?.ps || null);
        setTeamConfig(teamData); // keep whatever structure you returned

        // all submissions for this PS
        const subsData = await apiRequest(SUBMISSION_ROUTES.BY_PS(psId));
        setSubmissions(subsData.submissions || subsData.data || []);
      } catch (err) {
        setMessage(err.message);
      }
    }
    load();
  }, [psId]);

  return (
    <div className="p-6">
      {psInfo ? (
        <>
          <h1 className="text-xl font-bold mb-2">{psInfo.title}</h1>
          <p className="text-xs text-gray-500 mb-4">Code: {psInfo.code}</p>
        </>
      ) : (
        <p className="text-sm text-gray-500 mb-4">Loading PS details...</p>
      )}

      <h2 className="font-semibold mb-2">Submissions</h2>
      {submissions.length === 0 ? (
        <p className="text-sm text-gray-500">No submissions yet.</p>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">Team</th>
              <th className="border px-2 py-1 text-left">Status</th>
              <th className="border px-2 py-1 text-left">Submitted at</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s._id}>
                <td className="border px-2 py-1">{s.teamName || s.teamId}</td>
                <td className="border px-2 py-1">{s.status}</td>
                <td className="border px-2 py-1">
                  {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </div>
  );
}
