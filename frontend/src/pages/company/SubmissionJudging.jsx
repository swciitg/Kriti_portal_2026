import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants"

function SubmissionJudging() {
  const navigate = useNavigate();
  const { hostelId } = useParams();
  const location = useLocation();
  const { user } = useContext(userContext);
  const isMidEval = location.state?.isMidEval || false; // Get whether this is mid eval from navigation state

  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [psInfo, setPsInfo] = useState(null);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [saving, setSaving] = useState(false);
  const [maxSubmissionScore, setMaxSubmissionScore] = useState(100); // Store the max score from overallPointsDistribution[0] or [2] for midEval

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Company" && user?.role !== "Company")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  // Fetch PS and criteria from backend
  useEffect(() => {
    const fetchPSCriteria = async () => {
      try {
        const stored = localStorage.getItem("accessToken");
        const token = stored || user?.accessToken;

        if (!token) {
          navigate("/sign-in");
          return;
        }

        const response = await fetch(`${BACKEND_URL}/v1/company/get-sub`, {
          method: "GET",
          headers : {
            "Content-Type" : "application/json" ,
            "Authorization" : token ? `Bearer ${token}` : ""
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch PS criteria");
        }

        const data = await response.json();
        console.log(data)

        if (data.success && data.ps) {
          setPsInfo(data.ps);
          
          // Use midEvalPointsDistribution if isMidEval, otherwise use submissionPointsDistribution
          const submissionCriteria = isMidEval 
            ? (data.ps.midEvalPointsDistribution || [])
            : (data.ps.submissionPointsDistribution || []);
          setCriteria(submissionCriteria);

          // Get the max score from overallPointsDistribution[2] for midEval, [0] for final
          const maxScore = isMidEval 
            ? (data.ps.overallPointsDistribution?.[2] || 100)
            : (data.ps.overallPointsDistribution?.[0] || 100);
          setMaxSubmissionScore(maxScore);

          // Find the submission for this hostel based on isMidEval flag
          const submission = data.ps.submissions?.find(
            (sub) => sub.hostelId === parseInt(hostelId) && sub.midEval === isMidEval
          );

          setCurrentSubmission(submission);

          // Initialize scores based on submission data or zeros
          // submissionPointsDistribution is an array where index corresponds to criteria order
          // Convert from storage format (weighted out of maxScore) to display format (out of 100)
          const initialScores = submissionCriteria.reduce((acc, criterion, index) => {
            // Get the score from the array at this index
            const existingScore = submission?.submissionPointsDistribution?.[index];

            // Convert from storage format to display format (out of 100)
            // Storage format: (displayScore/100) * (weightage/100) * maxScore
            // So: displayScore = (existingScore / maxScore) / (weightage/100) * 100
            if (existingScore !== undefined) {
              const maxForCriterion = (criterion.weightage / 100) * maxScore;
              acc[criterion.field] = Math.round(((existingScore / maxForCriterion) * 100) * 100) / 100;
            } else {
              acc[criterion.field] = 0;
            }
            return acc;
          }, {});

          setScores(initialScores);
        }
      } catch (error) {
        console.error("Error fetching PS criteria:", error);
        alert("Failed to load evaluation criteria");
      } finally {
        setLoading(false);
      }
    };

    fetchPSCriteria();
  }, [user, navigate, hostelId, isMidEval]);

  // State to store scores for each field (out of 100)
  const [scores, setScores] = useState({});

  // Handle score input change
  const handleScoreChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    // Ensure value is between 0 and 100
    const clampedValue = Math.min(Math.max(numValue, 0), 100);
    setScores((prev) => ({
      ...prev,
      [field]: clampedValue,
    }));
  };

  // Calculate weighted score for each criterion (displayed out of 100)
  const calculateWeightedScore = (field, score) => {
    const criterion = criteria.find((c) => c.field === field);
    return ((score / 100) * criterion.weightage).toFixed(2);
  };

  // Calculate total weighted score (displayed out of 100)
  const calculateTotalScore = () => {
    return criteria
      .reduce((total, criterion) => {
        const score = scores[criterion.field] || 0;
        const weightedScore = (score / 100) * criterion.weightage;
        return total + weightedScore;
      }, 0)
      .toFixed(2);
  };

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);

      // Convert scores object to array matching criteria order
      // Convert from display format (out of 100) to storage format (out of maxSubmissionScore)
      // Storage score = (displayScore/100) * (weightage/100) * maxSubmissionScore
      const submissionPointsDistribution = criteria.map((criterion) => {
        const displayScore = scores[criterion.field] || 0;
        return (displayScore / 100) * (criterion.weightage / 100) * maxSubmissionScore;
      });

      const token = localStorage.getItem("accessToken") || user?.accessToken;
      const response = await fetch(`${BACKEND_URL}/v1/company/save-sub`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          submissionId: currentSubmission._id,
          submissionPointsDistribution
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save scores");
      }

      if (data.success) {
        const totalScore = calculateTotalScore();
        alert(`Scores saved successfully! Total Score: ${totalScore}/100`);
        // Optionally navigate back to dashboard
        // navigate("/company/dashboard");
      } else {
        throw new Error(data.message || "Failed to save scores");
      }
    } catch (error) {
      console.error("Error saving scores:", error);
      alert(`Error saving scores: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/company/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading evaluation criteria...</p>
        </div>
      </div>
    );
  }

  if (!currentSubmission) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
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
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Submission Found</h2>
            <p className="text-gray-600">No submission found for Hostel {hostelId}.</p>
          </div>
        </div>
      </div>
    );
  }

  if (criteria.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
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
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Evaluation Criteria Found</h2>
            <p className="text-gray-600">Please contact the administrator to set up evaluation criteria.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
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

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Judge Submissions
              </h1>
              {psInfo && (
                <p className="text-sm text-gray-600 mt-1">
                  Problem Statement: {psInfo.name}
                </p>
              )}
              {currentSubmission && (
                <p className="text-xs text-gray-500 mt-1">
                  Submission ID: {currentSubmission._id}
                </p>
              )}
            </div>
            <span className="bg-blue-500 text-white px-6 py-2 rounded-full text-xl font-bold">
              Hostel {hostelId}
            </span>
          </div>
        </div>
      </div>

      {/* Scoring Form */}
      <div className="max-w-4xl mx-auto">
        {/* Deliverables Section */}
        {currentSubmission && currentSubmission.deliverables && currentSubmission.deliverables.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
              Submission Deliverables
            </h2>
            <div className="space-y-3">
              {currentSubmission.deliverables.map((deliverable, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 capitalize mb-1">
                        {deliverable.name}
                      </h3>
                      <p className="text-sm text-gray-600 break-all">
                        {deliverable.url}
                      </p>
                    </div>
                    <a
                      href={deliverable.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Open
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
            Evaluation Criteria
          </h2>

          <div className="space-y-6">
            {criteria.map((criterion, index) => (
              <div
                key={index}
                className="p-5 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {criterion.field}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Weightage: {criterion.weightage}% of total score
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">
                        Score (out of 100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={scores[criterion.field] || 0}
                        onChange={(e) =>
                          handleScoreChange(criterion.field, e.target.value)
                        }
                        className="w-32 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center text-lg font-semibold"
                      />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-500 mb-1">
                        Weighted
                      </span>
                      <div className="bg-blue-100 px-4 py-2 rounded-lg min-w-[80px] text-center">
                        <span className="text-xl font-bold text-blue-600">
                          {calculateWeightedScore(
                            criterion.field,
                            scores[criterion.field]
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Score Summary */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-2xl font-semibold mb-2">
                Total Weighted Score
              </h2>
              <p className="text-blue-100 text-sm">
                Sum of all weighted scores
              </p>
            </div>
            <div className="bg-white rounded-lg px-8 py-4">
              <span className="text-5xl font-bold text-blue-600">
                {calculateTotalScore()}
              </span>
              <span className="text-2xl text-gray-600 ml-2">/100</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleBack}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Scores"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubmissionJudging;
