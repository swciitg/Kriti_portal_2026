import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { userContext } from "../../context/userContext";
import swcLogo from "../../assets/swc.svg";
import techLogo from "../../assets/tech.jpg";

function ConvenerGuidelines() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Convener" && user?.role !== "Convener")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  const sections = [
    {
      title: "Onboard New User",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
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
      color: "from-blue-500 to-blue-600",
      instructions: [
        "Navigate to 'Onboard New User' from the dashboard",
        "Fill in the required user details including name, email, and role",
        "Select appropriate role: Tech Secy, Judge, or Company",
        "The system will automatically generate and send login credentials to the user's email",
        "Verify that the email is correct before submission",
        "Users will receive their temporary password via email and can change it on first login"
      ]
    },
    {
      title: "Manage Problem Statements",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
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
      color: "from-indigo-500 to-indigo-600",
      instructions: [
        "Access the Problem Statements page to view all existing problem statements",
        "Click 'Create New PS' to add a new problem statement",
        "Fill in all required fields: title, description, company, and other relevant details",
        "You can edit existing problem statements by clicking on them",
        "Assign problem statements to specific companies if applicable",
        "Mark problem statements as active/inactive based on current requirements",
        "Delete problem statements that are no longer needed (use with caution)"
      ]
    },
    {
      title: "Team Register Edit Requests",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
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
      color: "from-orange-500 to-orange-600",
      instructions: [
        "Review all pending team modification requests from Tech Secretaries",
        "Check the request details carefully including team members and changes requested",
        "Verify that the modifications are valid and follow competition rules",
        "Approve legitimate requests by clicking the 'Approve' button",
        "Reject invalid requests with a clear reason for rejection",
        "Monitor the request queue regularly to avoid delays",
        "Contact Tech Secretaries if clarification is needed before approval"
      ]
    },
    {
      title: "Manage Judge Requests",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
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
      color: "from-green-500 to-green-600",
      instructions: [
        "This page has two main functionalities: Verification Requests and Access Requests",
        "Verification Requests: Review requests from judges who have completed their marking",
        "Once you accept a verification request, the judge will no longer be able to login and modify marks",
        "Access Requests: Handle requests from judges asking permission to re-login and change their marks",
        "Evaluate access requests carefully - only approve if there's a valid reason for mark modification",
        "Approve access requests to allow judges to login again and modify their previously submitted marks",
        "Keep a log of all verification acceptances and access grants for accountability"
      ]
    },
    {
      title: "Manage Company Requests",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
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
      color: "from-purple-500 to-purple-600",
      instructions: [
        "This page has two main functionalities: Verification Requests and Access Requests",
        "Verification Requests: Review requests from companies who have finished marking submissions",
        "Once you accept a verification request, the company will be locked out and cannot modify marks",
        "Access Requests: Handle requests from companies asking permission to re-login and modify marks",
        "Carefully evaluate why the company needs to change marks before granting access",
        "Approve access requests to allow companies to login again and update their previously submitted evaluations",
        "Keep a log of all verification acceptances and access grants for accountability"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/convener")}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img src={swcLogo} alt="SWC Logo" className="h-12 w-12" />
                <img src={techLogo} alt="Tech Logo" className="h-12 w-12" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Convener Guidelines
                </h1>
                <p className="text-gray-600 mt-1">
                  Instructions for using the Kriti Portal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Section */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-start gap-4">
            <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">Welcome, Convener!</h2>
              <p className="text-teal-50 leading-relaxed">
                As a convener, you have administrative privileges to manage the entire Kriti platform.
                This includes onboarding users, managing problem statements, approving requests from
                various stakeholders, and ensuring smooth operation of the competition. Please follow
                the guidelines below for each functionality available on your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Guidelines Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className={`bg-gradient-to-r ${section.color} p-4`}>
                <div className="flex items-center gap-3 text-white">
                  <div className="bg-white bg-opacity-20 rounded-full p-3 backdrop-blur-sm">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-bold">{section.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <ol className="space-y-3">
                  {section.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed pt-0.5">
                        {instruction}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        {/* Best Practices Section */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <svg
              className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-3">
                Important Best Practices
              </h3>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Regularly check for pending requests to avoid bottlenecks in the workflow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Double-check all email addresses before onboarding new users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Maintain clear communication with Tech Secretaries, Judges, and Companies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Keep backup records of all approved requests and changes made</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Be cautious when deleting data - it may be permanent and irreversible</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            Need Help?
          </h3>
          <p className="text-blue-700">
            If you encounter any issues or need assistance, please contact Team SWC.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConvenerGuidelines;
