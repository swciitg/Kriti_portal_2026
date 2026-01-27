import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";
import bgImage from "../../assets/techsecy_bg.png";
import SubmissionBox from "./components/SubmissionBox.jsx";
import TechSecyNavbar from "./components/navbar.jsx";

export default function SubmissionsPage() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);
  const [psList, setPsList] = useState([]);
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
    async function fetchPS() {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${BACKEND_URL}/v1/pssubmission/ps/open`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await response.json();
        if (!data.success || !data.psList?.length) {
          setError("No problem statements available yet");
          return;
        }

        setPsList(data.psList);
      } catch (err) {
        setError("Failed to fetch problem statements");
      }
    }

    fetchPS();
  }, []);

  const midEvalPs = psList.filter((ps) => ps.midEvalExist);
  const endTermPs = psList;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <img
        src={bgImage}
        alt=""
        className="fixed inset-0 w-full h-full object-cover -z-10"
      />

      <div className="pb-20">
        <TechSecyNavbar />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-14">
        {/* MID EVAL */}
        {midEvalPs.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">
              Mid Evaluation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {midEvalPs.map((ps) => (
                <div
                  key={ps._id}
                  className="rounded-xl p-6 bg-slate-900 border border-slate-700 space-y-4"
                >
                  <h3 className="text-lg font-medium text-slate-100">
                    {ps.name}
                  </h3>

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

        {/* END TERM */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-100 mb-6">
            End Term Submission
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {endTermPs.map((ps) => (
              <div
                key={ps._id}
                className="rounded-xl p-6 bg-slate-900 border border-slate-700 space-y-4"
              >
                <h3 className="text-lg font-medium text-slate-100">
                  {ps.name}
                </h3>

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
