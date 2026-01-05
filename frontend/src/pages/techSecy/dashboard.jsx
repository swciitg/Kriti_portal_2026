// src/pages/techSecy/dashboard.jsx
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";
import kriti_logo from "../../assets/tech.png";

export default function TechSecyDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "TechSecy" && user?.role !== "TechSecy")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  function prependZeroes(item, req_len) {
    if (item === undefined || item === null) {
      return null;
    }
    let res = item.toString();
    if (res.length >= req_len) {
      return item;
    }

    let zeroes_needed = req_len - res.length;
    while (zeroes_needed) {
      zeroes_needed--;
      res = "0" + res;
    }
    return res;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Hostel ID */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-40 px-6 py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-600 tracking-wide">
          HOSTEL{" "}
          {prependZeroes(
            JSON.parse(localStorage.getItem("user"))?.hostelId,
            4
          ) || "0000"}
        </h1>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Logo and Animated Title */}
          <div className="flex flex-col items-center justify-center mb-12 md:mb-16">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <img
                src={kriti_logo}
                alt="KRITI Logo"
                className="w-24 h-24 md:w-32 md:h-32 object-contain animate-spin-slow"
              />
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex gap-1 md:gap-2">
                  {["K", "R", "I", "T", "I"].map((letter, index) => (
                    <span
                      key={index}
                      className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-text tracking-tight"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        display: "inline-block",
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
                <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-fade-in">
                  2026
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <button
              onClick={() => navigate("/techsecy/problem-statements")}
              className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold">Problem Statements</h3>
              </div>
              <p className="text-blue-50 text-left text-sm font-normal">
                View and explore available problem statements
              </p>
            </button>

            <button
              onClick={() => navigate("/techsecy/register-team")}
              className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold">Register Team</h3>
              </div>
              <p className="text-purple-50 text-left text-sm font-normal">
                Register your team and add members
              </p>
            </button>

            <button
              onClick={() => navigate("/techsecy/submissions")}
              className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold">Submissions</h3>
              </div>
              <p className="text-green-50 text-left text-sm font-normal">
                Submit your project deliverables
              </p>
            </button>

            <button
              onClick={() => navigate("/techsecy/guidelines")}
              className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-8.25-3 1.5 1.5 3-3.75"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold">Guidelines</h3>
              </div>
              <p className="text-orange-50 text-left text-sm font-normal">
                Read competition rules and guidelines
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
