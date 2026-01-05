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
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch(`${BACKEND_URL}/v1/techsecy/getps`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch PS");

      const filtered = data.ps.map((item) => ({
        id: item._id,
        name: item.name,
        prep: item.prep,
        teamStrength: item.teamStrength,
        points: item.points,
        registrationDeadline: item.registrationDeadline,
        teamRegistered: item.teamRegistered || false  // This is the key field
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


  const handleRegister = (id) => navigate(`/techsecy/register-team/${id}`);
  const handleViewTeam = (id) => navigate(`/techsecy/register-team/${id}`);

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
    // Compare using user's local timezone
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return deadlineDate < now;
  };

  const formatDeadline = (deadline) => {
    // Format deadline with date and time in local timezone
    const deadlineDate = new Date(deadline);
    
    const dateOptions = { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    
    const timeOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    
    const formattedDate = deadlineDate.toLocaleDateString('en-IN', dateOptions);
    const formattedTime = deadlineDate.toLocaleTimeString('en-IN', timeOptions);
    
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

          <nav className="w-full bg-white shadow-lg border-b border-gray-200 sticky top-0 z-100">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <button
                onClick={() => navigate("/techsecy")}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors font-medium group"
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
                Back to Dashboard
              </button>
               <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Team Registrations
              </h1>
              <p className="text-gray-600">
                Choose a problem statement to register your team or view your existing team
              </p>
            </div>
          </nav>

      <div className = "max-w-7xl mx-auto px-6 py-4">
        <div className="">
          <div className="container mx-auto px-4 py-8">

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
                              {formatDeadline(ps.registrationDeadline)}
                            </span>
                          </div>

                          {/* Team Status Badge */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            {ps.teamRegistered ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                <p className="text-green-700 text-xs font-medium text-center flex items-center justify-center gap-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Team Registered
                                </p>
                              </div>
                            ) : (
                              <div className={`border rounded-lg p-2 ${deadlinePassed ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                                <p className={`text-xs font-medium text-center ${deadlinePassed ? 'text-red-700' : 'text-blue-700'}`}>
                                  {deadlinePassed ? "Registration Closed" : "Registration Open"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-6 pt-0">
                        {ps.teamRegistered ? (
                          <button
                            onClick={() => handleViewTeam(ps.id)}
                            className="w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg"
                          >
                            View Team
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegister(ps.id)}
                            className="w-full py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
                          >
                            Register Team
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
