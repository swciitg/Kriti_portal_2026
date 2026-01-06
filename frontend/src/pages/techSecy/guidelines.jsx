import { useNavigate } from "react-router-dom"
import { useState } from "react";
import TeamRegistrationGuidelines from "../../components/TeamRegistrationGuidelines"
import SubmissionGuidelines from "../../components/SubmissionGuidelines";
import bgImage from "../../assets/techsecy_bg.png";

export default function Guidelines() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("registration");

    return (
        <div className="min-h-screen relative">
          {/* Background Image */}
          <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover fixed" />
          
          {/* Content Overlay */}
          <div className="relative z-10">
            <nav className="w-full bg-[#0f1629]/80 backdrop-blur-md shadow-lg border-b border-[#93BBFF]/20 sticky top-0 z-100">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <button
                  onClick={() => navigate("/techsecy")}
                  className="flex items-center text-[#93BBFF] hover:text-white mb-4 transition-colors font-medium group"
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
                    <h1 className="text-3xl font-bold text-white">Guidelines for Registration and Submissions</h1>
                  </div>
                </div>
              </div>
            </nav>

            <div className = "max-w-7xl mx-auto px-6 py-4 pt-10">
            <div className="bg-[#0f1629]/60 backdrop-blur-md rounded-2xl shadow-lg mb-6 p-2 border border-[#93BBFF]/20">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("registration")}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                    activeTab === "registration"
                      ? "bg-[#93BBFF] text-black"
                      : "bg-[#1a1f3a]/80 text-gray-300 hover:bg-[#2d4a8f]/60 hover:text-white border border-[#93BBFF]/20"
                  }`}
                >
                  Registration Guide
                </button>
                <button
                  onClick={() => setActiveTab("submission")}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                    activeTab === "submission"
                      ? "bg-[#93BBFF] text-black"
                      : "bg-[#1a1f3a]/80 text-gray-300 hover:bg-[#2d4a8f]/60 hover:text-white border border-[#93BBFF]/20"
                  }`}
                >
                  Submission Guide
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {activeTab === "registration" && (
                    <div className="bg-[#0f1629]/60 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-[#93BBFF]/20">
                      <h2 className="text-2xl font-bold text-white mb-4">Team Registration Guidelines</h2>
                      <p className="text-gray-300 mb-6">
                        Follow these steps to successfully register your team for problem statements.
                      </p>
                      <TeamRegistrationGuidelines variant="compact" />
                      
                      <div className="mt-6 p-4 bg-[#93BBFF]/10 border border-[#93BBFF]/30 rounded-lg backdrop-blur-sm">
                        <h3 className="font-semibold text-[#93BBFF] mb-2">Ready to register?</h3>
                        <button
                          onClick={() => navigate("/techsecy/register-team")}
                          className="mt-2 bg-[#93BBFF] text-black px-6 py-2 rounded-lg hover:bg-[#7AABEF] transition font-medium"
                        >
                          Go to Team Registration
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "submission" && (
                    <div className="bg-[#0f1629]/60 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-[#93BBFF]/20">
                      <h2 className="text-2xl font-bold text-white mb-4">Submission Guidelines</h2>
                      <p className="text-gray-300 mb-6">
                        Learn how to submit your deliverables correctly and on time.
                      </p>
                      <SubmissionGuidelines variant="compact" />
                      
                      <div className="mt-6 p-4 bg-[#93BBFF]/10 border border-[#93BBFF]/30 rounded-lg backdrop-blur-sm">
                        <h3 className="font-semibold text-[#93BBFF] mb-2">Ready to submit?</h3>
                        <button
                          onClick={() => navigate("/techsecy/submissions")}
                          className="mt-2 bg-[#93BBFF] text-black px-6 py-2 rounded-lg hover:bg-[#7AABEF] transition font-medium"
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
        </div>
    )
}