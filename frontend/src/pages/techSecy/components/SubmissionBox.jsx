import { useNavigate } from "react-router-dom";

const SubmissionBox = ({
  title,
  type, // "mid" | "final"
  submitted,
  submissionOpen,
  deadline,
  submittedTime,
  penalty,
  submissionId,
  psId,
  color = "blue", // "blue" | "green"
}) => {
  const navigate = useNavigate();

  const colorMap = {
    blue: {
      borderOpen: "border-blue-400 bg-blue-50",
      button: "bg-blue-600 hover:bg-blue-700",
      icon: "text-blue-600",
    },
    green: {
      borderOpen: "border-green-400 bg-green-50",
      button: "bg-green-600 hover:bg-green-700",
      icon: "text-green-600",
    },
  };

  const theme = colorMap[color];

  return (
    <div
      className={`border-2 rounded-xl p-5 transition-all ${
        submitted
          ? "border-gray-300 bg-gray-50"
          : submissionOpen
            ? `${theme.borderOpen} shadow-sm`
            : "border-gray-200 bg-gray-50"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
          <svg
            className={`w-5 h-5 ${theme.icon}`}
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
          {title}
        </h3>

        {submitted && (
          <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-semibold">
            ✓ Submitted
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center text-gray-700">
          <span className="font-medium">Deadline:</span>
          <span className="ml-2">
            {new Date(deadline).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>

        {submitted && (
          <>
            <div className="flex items-center text-gray-700">
              <span className="font-medium">Submitted:</span>
              <span className="ml-2">
                {new Date(submittedTime).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>

            {penalty?.length > 0 && (
              <div className="text-red-600 bg-red-50 px-2 py-1 rounded">
                Late Submission Penalty
              </div>
            )}
          </>
        )}
      </div>

      {/* Action */}
      {submitted ? (
        <button
          onClick={() => navigate(`/techsecy/submissions/view/${submissionId}`)}
          className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
        >
          View Submission
        </button>
      ) : (
        <button
          onClick={() =>
            navigate(`/techsecy/submissions/submit/${psId}?type=${type}`)
          }
          className={`w-full px-4 py-2.5 text-white rounded-lg transition font-medium ${theme.button}`}
        >
          Submit Now
        </button>
      )}
    </div>
  );
};

export default SubmissionBox;
