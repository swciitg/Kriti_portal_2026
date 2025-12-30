import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { userContext } from "../../context/userContext";
import { useEffect } from "react";
import swcLogo from "../../assets/swc.svg";
import techLogo from "../../assets/tech.jpg"

function ConvenerDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const [lastLogin, setLastLogin] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Convener" && user?.role !== "Convener")
    ) {
      navigate("/sign-in");
    } else {
      // Get last login from stored user data
      const userData = user || stored;
      if (userData?.previousLastLogin) {
        setLastLogin(userData.previousLastLogin);
      }
    }
  }, [user]);

  const menuItems = [
    {
      title: "Guidelines",
      description: "View instructions on how to use the platform",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      path: "/convener/guidelines",
      color: "from-teal-500 to-teal-600",
    },
    {
      title: "Onboard New User",
      description: "Add new users to the platform",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
      path: "/convener/onboard-user",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Manage Problem Statements",
      description: "Create and edit problem statements",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      path: "/convener/ps",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Team Register Edit Requests",
      description: "Review team modification requests",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      path: "/convener/team-requests",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Manage Judge Requests",
      description: "Review and approve judge applications",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      path: "/convener/judge-requests",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Manage Company Requests",
      description: "Review and approve company registrations",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      path: "/convener/company-requests",
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-start gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img src={swcLogo} alt="SWC Logo" className="h-12 w-12" />
                <img src={techLogo} alt="SWC Logo" className="h-12 w-12" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Convener Dashboard
                </h1>
              </div>
            </div>
            {/* Last Login Info */}
            {lastLogin && (
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-xs font-medium text-red-800">Last Login</p>
                  <p className="text-xs text-red-700">
                    {new Date(lastLogin).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Asia/Kolkata'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden group"
            >
              <div className={`bg-gradient-to-r ${item.color} p-6 text-white`}>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-white text-gray-700 bg-opacity-20 rounded-full p-4 backdrop-blur-sm group-hover:bg-opacity-30 transition-all">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">
                  {item.title}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-center text-sm">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center justify-center text-blue-600 font-semibold group-hover:text-blue-700">
                  <span className="mr-2">Go to page</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default ConvenerDashboard;
