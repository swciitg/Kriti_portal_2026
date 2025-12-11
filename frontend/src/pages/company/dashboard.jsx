import { useNavigate } from "react-router-dom";
import { useContext } from "react"
import { userContext } from "../../context/userContext"
import { useEffect } from "react";

function CompanyDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Company" && user?.role !== "Company")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  // Array of hostel IDs (dummy data)
  const hostel_ids = [
    '001',
    '002',
    '003',
    '004',
    '005',
    '006',
    '007',
    '008'
  ];

  const handleHostelClick = (hostelId) => {
    navigate(`/company/hostel/${hostelId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Company Dashboard - Hostel Submissions
      </h1>

      <div className="max-w-3xl mx-auto">
        {/* Hostel List Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
            Select Hostel to Judge
          </h2>
          <ul className="space-y-3">
            {hostel_ids.map((hostelId) => (
              <li key={hostelId}>
                <button
                  onClick={() => handleHostelClick(hostelId)}
                  className="w-full text-left px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-200 hover:shadow-md border border-blue-200 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-800">
                      {hostelId}
                    </span>
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboard;
