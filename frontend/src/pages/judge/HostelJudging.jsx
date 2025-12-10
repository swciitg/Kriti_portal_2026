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

        const response = await fetch(`${BACKEND_URL}/api/v1/judge/get-ps`, {
          method: "GET",
          headers : {
            "Content-type" : "application/json" ,
            "Authorization" : localStorage.getItem("accessToken")
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch PS criteria");
        }

        const data = await response.json();

        if (data.success && data.ps) {
          setPsInfo(data.ps);
          const pptCriteria = data.ps.pptPointsDistribution || [];
          setCriteria(pptCriteria);

          // Initialize scores for all criteria
          const initialScores = pptCriteria.reduce((acc, criterion) => {
            acc[criterion.field] = 0;
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
  }, [user, navigate]);

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

  // Calculate weighted score for each criterion
  const calculateWeightedScore = (field, score) => {
    const criterion = criteria.find((c) => c.field === field);
    return ((score / 100) * criterion.weightage).toFixed(2);
  };

  // Calculate total weighted score
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
  const handleSave = () => {
    const totalScore = calculateTotalScore();
    const judgingData = {
      hostelId,
      scores,
      totalScore,
      timestamp: new Date().toISOString(),
    };

    // TODO: Implement API call to save data
    console.log("Saving judging data:", judgingData);
    alert(`Scores saved successfully! Total Score: ${totalScore}/100`);
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
                Judge Presentation
              </h1>
              {psInfo && (
                <p className="text-sm text-gray-600 mt-1">
                  Problem Statement: {psInfo.name}
                </p>
              )}
            </div>
            <span className="bg-blue-500 text-white px-6 py-2 rounded-full text-xl font-bold">
              {hostelId}
            </span>
          </div>
        </div>
      </div>

      {/* Scoring Form */}
      <div className="max-w-4xl mx-auto">
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
                        type="text"
                        min="0"
                        max="100"
                        step="5"
                        value={scores[criterion.field]}
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
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Save Scores
          </button>
        </div>
      </div>
    </div>
  );
}

export default HostelJudging;
