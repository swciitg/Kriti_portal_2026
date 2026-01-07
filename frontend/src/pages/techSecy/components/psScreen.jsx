import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../../context/userContext.jsx";
import { BACKEND_URL } from "../../../constants.js";
import TechSecyNavbar from "../components/navbar.jsx";
import full_bg from "../../../assets/full_bg.png";

export default function PSScreen() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch PS");
        setProblemStatements(
          data.ps.map((item) => ({
            id: item._id,
            name: item.name,
            prep: item.prep,
            teamStrength: item.teamStrength,
            points: item.points,
            registrationDeadline: item.registrationDeadline,
            teamRegistered: item.teamRegistered || false,
          }))
        );
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPS();
  }, []);

  const isDeadlinePassed = (deadline) => new Date(deadline) < new Date();

  const formatDeadline = (deadline) =>
    new Date(deadline).toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${full_bg})` }}
    >
      {/* Dark overlay */}
      <div className="min-h-screen">
        <TechSecyNavbar />

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl pt-16 md:text-5xl font-semibold text-white bebas-neue-regular">
              TEAM REGISTRATIONS
            </h1>
            <p className="text-gray-300 mt-3">
              Choose a problem statement to register your team or view your
              existing team
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500 text-red-300 px-6 py-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-20 text-white">
              <div className="animate-spin h-12 w-12 border-b-2 border-white mx-auto mb-4" />
              Loading problem statements...
            </div>
          )}

          {/* Cards */}
          {!loading && problemStatements.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {problemStatements.map((ps) => {
    const closed = isDeadlinePassed(ps.registrationDeadline);

    return (
      <div
        key={ps.id}
        className="bg-[#1a1f3a] border border-white/20 rounded-xl shadow-xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 bg-[#0f1323] border-b border-white/10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-white leading-tight">
              {ps.name}
            </h3>
            <span className="text-xl font-bold text-white">
              {ps.points} pts
            </span>
          </div>

          <span className="inline-block text-xs px-2.5 py-1 rounded-md bg-slate-700/80 text-gray-300 border border-white/20 font-medium">
            {ps.prep.toUpperCase()} Prep
          </span>
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex-grow">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400 text-sm">Team Size</span>
            <span className="text-white font-semibold text-sm">
              {ps.teamStrength}
            </span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-sm">Deadline</span>
            <span
              className={`font-semibold text-sm ${
                closed ? "text-red-400" : "text-red-400"
              }`}
            >
              {formatDeadline(ps.registrationDeadline)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3">
          {ps.teamRegistered ? (
            <button
              onClick={() =>
                navigate(`/techsecy/register-team/${ps.id}`)
              }
              className="w-full py-2.5 rounded-lg bg-[#6b93d6] hover:bg-[#5685dc] text-black font-bold transition text-sm"
            >
              View Team
            </button>
          ) : (
            <button
              disabled={closed}
              onClick={() => {
                if (!closed) {
                  navigate(`/techsecy/register-team/${ps.id}`);
                }
              }}
              className={`w-full py-2.5 rounded-lg font-bold transition text-sm
                ${
                  closed
                    ? "bg-gray-600/40 text-gray-400 cursor-not-allowed"
                    : "bg-[#6b93d6] hover:bg-[#5685dc] text-black"
                }
              `}
            >
              {closed ? "Registration Closed" : "Register Team"}
            </button>
          )}
        </div>
        <div className="text-center pb-3">
          {ps.teamRegistered ? (
            <span className="text-white text-xs font-semibold">Team Registered</span>
          ) : closed ? (
            <span className="text-red-400 text-xs font-semibold">
              Registrations closed
            </span>
          ) : (
            <span className="text-blue-400 text-xs font-semibold">Registration Open</span>
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
  );
}
