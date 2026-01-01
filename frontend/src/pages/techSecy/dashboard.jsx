// src/pages/techSecy/dashboard.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";
import TeamRegistrationGuidelines from "../../components/TeamRegistrationGuidelines";
import SubmissionGuidelines from "../../components/SubmissionGuidelines";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name || "TechSecy"}!
          </h1>
          <p className="text-gray-600">
            Manage your team registrations and problem statement submissions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 p-2">
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
        </div>

        {/* Content Area - Conditional Grid */}
        {activeTab === "overview" ? (
          // Full width for overview
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition shadow-md hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-bold">Submissions</h3>
                  </div>
                </button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>
        ) : (
          // Grid layout with sidebar for guideline tabs
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {activeTab === "registration" && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Registration Guidelines</h2>
                  <p className="text-gray-600 mb-6">
                    Follow these steps to successfully register your team for problem statements.
                  </p>
                  <TeamRegistrationGuidelines variant="compact" />
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Ready to register?</h3>
                    <button
                      onClick={() => navigate("/techsecy/register-team")}
                      className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Go to Team Registration
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "submission" && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Submission Guidelines</h2>
                  <p className="text-gray-600 mb-6">
                    Learn how to submit your deliverables correctly and on time.
                  </p>
                  <SubmissionGuidelines variant="compact" />
                  
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Ready to submit?</h3>
                    <button
                      onClick={() => navigate("/techsecy/submissions")}
                      className="mt-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      Go to Submissions
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Show guidelines for active tab */}
            <div className="lg:col-span-1">
              {activeTab === "registration" && <TeamRegistrationGuidelines />}
              {activeTab === "submission" && <SubmissionGuidelines />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
