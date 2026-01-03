import { useNavigate } from "react-router-dom"
import { useState } from "react";
import TeamRegistrationGuidelines from "../../components/TeamRegistrationGuidelines"
import SubmissionGuidelines from "../../components/SubmissionGuidelines";

export default function Guidelines() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("registration");

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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Guidelines for Registration and Submissions</h1>
                </div>
              </div>
            </div>
          </nav>

          <div className = "max-w-7xl mx-auto px-6 py-4 pt-10">
          <div className="bg-white rounded-2xl shadow-lg mb-6 p-2">
            <div className="flex gap-2">
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
          </div>
        </div>
    )
}