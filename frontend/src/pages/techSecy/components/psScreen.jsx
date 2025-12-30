import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../../context/userContext.jsx";
import { BACKEND_URL } from "../../../constants.js";

export default function PSScreen() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
    const fetchPS = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/v1/ps`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch PS");

        const filtered = data.ps.map((item) => ({
          id: item._id,
          name: item.name,
          prep: item.prep,
          teamStrength: item.teamStrength,
          points: item.points,
          registrationDeadline: item.registrationDeadline,
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

  const handleView = (id) => navigate(`/techsecy/register-team/${id}`);

  const filteredPS = problemStatements.filter((ps) =>
    ps.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrepColor = (prep) => {
    const colors = {
      high: "bg-red-100 text-red-700 border-red-200",
      mid: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-green-100 text-green-700 border-green-200",
      no: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[prep] || colors.no;
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/techsecy")}
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Problem Statements
          </h1>
          <p className="text-gray-600">
            Choose a problem statement to register your team
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search problem statements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading problem statements...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPS.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-600 font-medium">
              {searchTerm
                ? "No problem statements found matching your search"
                : "No problem statements available"}
            </p>
          </div>
        )}

        {/* Problem Statements Grid */}
        {!loading && filteredPS.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPS.map((ps) => {
              const deadlinePassed = isDeadlinePassed(ps.registrationDeadline);

              return (
                <div
                  key={ps.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">
                      {ps.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPrepColor(
                          ps.prep
                        )} bg-white`}
                      >
                        {ps.prep.toUpperCase()} Prep
                      </span>
                      <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                        {ps.points} pts
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Team Size:</span>
                        <span className="text-gray-800 font-semibold">
                          {ps.teamStrength} members
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Deadline:</span>
                        <span className={`font-semibold ${deadlinePassed ? 'text-red-600' : 'text-gray-800'}`}>
                          {new Date(ps.registrationDeadline).toLocaleDateString()}
                        </span>
                      </div>

                      {deadlinePassed && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                          <p className="text-red-700 text-xs font-medium text-center">
                            Registration Closed
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleView(ps.id)}
                      disabled={deadlinePassed}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        deadlinePassed
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
                      }`}
                    >
                      {deadlinePassed ? "Registration Closed" : "Register Team"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
