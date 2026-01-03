// src/pages/techSecy/dashboard.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";
// import TeamRegistrationGuidelines from "../../components/TeamRegistrationGuidelines";
// import SubmissionGuidelines from "../../components/SubmissionGuidelines";
import kriti_logo from "../../assets/tech.png"

export default function TechSecyDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "TechSecy" && user?.role !== "TechSecy")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);


  /**
   * This below function does only fixes for FRONTEND OF TECHSECY, nowhere else
   */
  function prependZeroes(item , req_len) {
    if(item === undefined || item === null) {
      return null;
    }
    let res = item.toString()
    if(res.length >= req_len) {
      return item;
    }

    let zeroes_neeeded = req_len - res.length
    while(zeroes_neeeded) {
      zeroes_neeeded--;
      res = "0" + res;
    }

    return res
  }


  return (
    <>
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center w-[100vw] bg-white">
          <h1 className="text-5xl font-extrabold text-blue-500 tracking-wide absolute top-4 left-4">
            HOSTEL {prependZeroes(JSON.parse(localStorage.getItem("user"))?.hostelId , 4) || "0000"}
          </h1>
        </div>


        {/* <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name || "TechSecy"}!
          </h1>
          <p className="text-gray-600">
            Manage your team registrations and problem statement submissions
          </p>
        </div> */}



          

        <div className=" flex items-center justify-center mt-16 md:mt-32">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={kriti_logo}
              alt="KRITI Logo"
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
            />
            <h1 className="text-[120px] font-extrabold tracking-wide text-blue-500">
              K {" "} R {" "} I {" "} T {" "} I
            </h1>
          </div>
        </div>




        {/* Tab Navigation */}
        {/* <div className="bg-white rounded-2xl shadow-lg mb-6 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("registration")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === "registration"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Registration Guide
            </button>
            <button
              onClick={() => setActiveTab("submission")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === "submission"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Submission Guide
            </button>
          </div>
        </div> */}

        {/* Content Area - Conditional Grid */}
        {activeTab === "overview" ? (
          // Full width for overview
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="p-8">
              {/* <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 
                <button
                  onClick={() => navigate("/techsecy/problem-statements")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>

                    <h3 className="text-xl font-bold">Problem Statements</h3>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/techsecy/register-team")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-xl font-bold">Register Team</h3>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/techsecy/submissions")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-bold">Submissions</h3>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/techsecy/guidelines")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                    </svg>

                    <h3 className="text-xl font-bold">Guidelines</h3>
                  </div>
                </button>

              </div>
            </div>

            {/* Info Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Team Registration</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Register your team with all member details before the deadline
                </p>
                <button
                  onClick={() => setActiveTab("registration")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  View Guidelines
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Submit Deliverables</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Upload required files and URLs for mid-eval and final submissions
                </p>
                <button
                  onClick={() => setActiveTab("submission")}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                >
                  View Guidelines
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div> */}
          </div>
        ) : (
          // Grid layout with sidebar for guideline tabs
          <>
            {/* the code here has been shifted to ./guidelines.jsx */}
          </>
        )}
      </div>
    </div>
    </>
  );
}
