// src/pages/techSecy/submissions.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";
import bgImage from "../../assets/techsecy_bg.png";
import SubmissionBox from "./components/submissionBox";

export default function SubmissionsPage() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const [psList, setPsList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    async function fetchPS() {
      try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${BACKEND_URL}/v1/pssubmission/ps/open`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await response.json();
        // console.log("Fetched PS Data:", data);

        if (!data.success) {
          setError(data.message || "Failed to fetch PS");
          return;
        }

        if (!data.psList || data.psList.length === 0) {
          setError("No PS found for your teams");
          return;
        }

        

        /**
         * by srinjoy on 04-01-2026 from tb_needs
         * This below check is reduntant and might be risky as this now will in local time ps.startDate 
         * is in UTC
         */

        // Filter out PS where startDate is in the future
        // const now = new Date();
        // const availablePsList = data.psList.filter((ps) => {
        //   if (!ps.startDate) return true; // If no startDate, show it
        //   return new Date(ps.startDate) <= now;
        // });

        const availablePsList = data.psList

        setPsList(availablePsList);
        
        if (availablePsList.length === 0) {
          setError("No PS are currently available for submission. Check back later.");
        } else {
          setError("");
        }
      } catch (err) {
        setError("Failed to fetch PS: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPS();
  }, []);

  const midEvalPs = psList.filter((ps) => ps.midEvalExist);
  const endTermPs = psList; 

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover fixed" />
        <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
                className="w-12 h-12 text-gray-400"
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
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error.includes("currently available") ? "No problem statements yet" : "No problem statements yet"}
          </h2>
          <p className="text-gray-600 mb-6">{error} Problem Statements will be visible only after team registration.</p>
        </div>
      </div>
    );
  }

  if (psList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover fixed"
        />
        <div className="bg-white shadow-2xl rounded-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-blue-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h2>
          <p className="text-gray-600 mb-2">
            Problem statements haven't started yet
          </p>
          <p className="text-sm text-gray-400">Check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <img
        src={bgImage}
        alt=""
        className="inset-0 w-full h-full object-cover fixed -z-10"
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* ================= MID EVALUATION SECTION ================= */}
        {midEvalPs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Mid Evaluation
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {midEvalPs.map((ps) => (
                <div
                  key={ps._id}
                  className="rounded-2xl p-6 border border-gray-600 space-y-4"
                >
                  <h3 className="text-xl font-medium text-white">{ps.name}</h3>

                  <SubmissionBox
                    title="Mid Evaluation Submission"
                    type="mid"
                    color="green"
                    submitted={ps.midSubmitted}
                    submissionOpen={ps.midEvalSubmissionOpen}
                    deadline={ps.midEvalSubmissionDeadline}
                    submittedTime={ps.midSubmissionTime}
                    penalty={ps.midPenalty}
                    submissionId={ps.midSubmissionId}
                    psId={ps._id}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= END TERM SECTION ================= */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">
            End Term Submission
          </h2>

          <div className="grid grid-cols-3 gap-6">
            {endTermPs.map((ps) => (
              <div
                key={ps._id}
                className="rounded-2xl p-6 border border-gray-600 space-y-4"
              >
                <h3 className="text-xl font-medium text-white">{ps.name}</h3>

                <SubmissionBox
                  title="Final Submission"
                  type="final"
                  color="blue"
                  submitted={ps.finalSubmitted}
                  submissionOpen={ps.finalSubmissionOpen}
                  deadline={ps.submissionDeadline}
                  submittedTime={ps.finalSubmissionTime}
                  penalty={ps.finalPenalty}
                  submissionId={ps.finalSubmissionId}
                  psId={ps._id}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}