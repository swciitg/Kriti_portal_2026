import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";

export default function PSManager() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Convener" && user?.role !== "Convener")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPS = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/v1/ps`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch PS");

        const filtered = data.ps.map((item) => ({
          id: item._id,
          name: item.name,
          prep: item.prep,
        }));

        setProblemStatements(filtered);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPS();
  }, []);

  const handleView = (id) => navigate(`/convener/ps/${id}`);

  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white shadow rounded-xl p-8 flex flex-col h-[calc(100vh-5rem)]">
        <div className="overflow-y-auto space-y-6 pr-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Problem Statements
          </h1>
          <button
            onClick={() => navigate("/convener/ps/create")}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Create New Problem Statement
          </button>
          {error && <p className="text-red-600 text-center">{error}</p>}
          {loading && <p className="text-center text-gray-600">Loading...</p>}
          {!loading && problemStatements.length === 0 && (
            <p className="text-center text-gray-600">
              No Problem statements Found
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {problemStatements.map((ps) => (
              <div
                key={ps.id}
                className="border rounded-xl p-5 shadow-sm bg-gray-50 hover:shadow transition"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {ps.name}
                </h3>
                <p className="mt-1 text-gray-600">
                  <b>Prep:</b> {ps.prep}
                </p>
                <button
                  onClick={() => handleView(ps.id)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
