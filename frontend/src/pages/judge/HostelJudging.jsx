import { useNavigate, useParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants"

function HostelJudging() {
  const navigate = useNavigate();
  const { hostelId } = useParams();
  const { user } = useContext(userContext);

  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [psInfo, setPsInfo] = useState(null);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [saving, setSaving] = useState(false);
  const [maxPptScore, setMaxPptScore] = useState(100); // Store the max score from overallPointsDistribution[1]

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Judge" && user?.role !== "Judge")
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

        const response = await fetch(`${BACKEND_URL}/v1/judge/get-ps`, {
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
          const pptCriteria = data.ps.pptPointsDistribution || [];
          setCriteria(pptCriteria);

          // Get the max PPT score from overallPointsDistribution[1]
          const maxScore = data.ps.overallPointsDistribution?.[1] || 100;
          setMaxPptScore(maxScore);

          // Find the submission for this hostel
          const submission = data.ps.submissions?.find(
            (sub) => sub.hostelId === parseInt(hostelId)
          );

          setCurrentSubmission(submission);

          // Initialize scores based on submission data or zeros
          // pptPointsDistribution is an array where index corresponds to criteria order
          // Convert from storage format (weighted out of maxScore) to display format (out of 100)
          const initialScores = pptCriteria.reduce((acc, criterion, index) => {
            // Get the score from the array at this index
            const existingScore = submission?.pptPointsDistribution?.[index];

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
  }, [user, navigate, hostelId]);

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
      // Convert from display format (out of 100) to storage format (out of maxPptScore)
      // Storage score = (displayScore/100) * (weightage/100) * maxPptScore
      const pptPointsDistribution = criteria.map((criterion) => {
        const displayScore = scores[criterion.field] || 0;
        return (displayScore / 100) * (criterion.weightage / 100) * maxPptScore;
      });

      const token = localStorage.getItem("accessToken") || user?.accessToken;
      const response = await fetch(`${BACKEND_URL}/v1/judge/save-ppt-scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          submissionId: currentSubmission._id,
          pptPointsDistribution
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
        navigate("/judge/dashboard");
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
    navigate("/judge/dashboard");
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
      <div className="max-w-7xl mx-auto mb-6">
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
                Judge Presentation
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

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Scoring Form */}
        <div className="lg:col-span-2">
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

        {/* Right Column - Guidelines Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-800">Judging Guidelines</h3>
            </div>

            <div className="space-y-4">
              {/* Evaluation Type Info */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h4 className="font-semibold text-blue-900 mb-1">Evaluation Type</h4>
                <p className="text-sm text-blue-800">
                  Presentation & Attendance Scoring
                </p>
              </div>

              {/* How Scoring Works */}
              <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
                <h4 className="font-semibold text-purple-900 mb-2">How Scoring Works</h4>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Enter scores from 0-100 for each criterion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Each score is weighted by its percentage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Total weighted score = sum of all weighted criteria</span>
                  </li>
                </ul>
              </div>

              {/* Max Score Distribution */}
              {psInfo && (
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                  <h4 className="font-semibold text-green-900 mb-2">Score Distribution</h4>
                  <div className="text-sm text-green-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Max Presentation Score:</span>
                      <span className="font-bold">{maxPptScore} pts</span>
                    </div>
                    <div className="text-xs mt-2 pt-2 border-t border-green-200">
                      <p className="font-medium mb-1">Overall Distribution:</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Final Submission:</span>
                          <span>{psInfo.overallPointsDistribution?.[0] || 0} pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Presentation:</span>
                          <span>{psInfo.overallPointsDistribution?.[1] || 0} pts</span>
                        </div>
                        {psInfo.midEvalExist && (
                          <div className="flex justify-between">
                            <span>Mid Evaluation:</span>
                            <span>{psInfo.overallPointsDistribution?.[2] || 0} pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Final Score Calculation */}
              {/* <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                <h4 className="font-semibold text-orange-900 mb-2">Final Score Calculation</h4>
                <p className="text-sm text-orange-800 mb-2">
                  Your weighted score (out of 100) is converted to the actual point value:
                </p>
                <div className="bg-white p-3 rounded border border-orange-200">
                  <code className="text-xs text-orange-900 break-all">
                    Actual Score = (Weighted Score / 100) × {maxPptScore}
                  </code>
                </div>
                <p className="text-xs text-orange-700 mt-2">
                  Example: If weighted score is 85/100, actual score = 85% of {maxPptScore} = {Math.round(maxPptScore * 0.85)} points
                </p>
              </div>*/}

              {/* Important Notes */}
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                <h4 className="font-semibold text-red-900 mb-2">⚠️ Important Notes</h4>
                <ul className="text-sm text-red-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Scores are saved per presentation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>You can edit and re-save anytime before final verification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Evaluate both presentation quality and attendance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span>Be fair and consistent across all hostels</span>
                  </li>
                </ul>
              </div>

              {/* Criteria Breakdown */}
              <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded">
                <h4 className="font-semibold text-indigo-900 mb-2">Criteria Weightage</h4>
                <div className="space-y-2">
                  {criteria.map((criterion, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-indigo-800 font-medium">{criterion.field}</span>
                      <span className="bg-indigo-200 text-indigo-900 px-2 py-1 rounded text-xs font-bold">
                        {criterion.weightage}%
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-indigo-200 flex justify-between font-bold text-indigo-900">
                    <span>Total:</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostelJudging;
