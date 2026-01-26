import { useNavigate } from "react-router-dom";

const SubmissionBox = ({
  title,
  type,
  submitted,
  submissionOpen,
  deadline,
  submittedTime,
  penalty,
  submissionId,
  psId,
  color = "blue",
}) => {
  const navigate = useNavigate();

  const colorMap = {
    blue: {
      button: "bg-indigo-500 hover:bg-indigo-600",
      icon: "text-indigo-400",
    },
    green: {
      button: "bg-emerald-500 hover:bg-emerald-600",
      icon: "text-emerald-400",
    },
  };

  const theme = colorMap[color];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-slate-100 flex items-center gap-2">
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
          <span className="text-xs bg-emerald-900/40 text-emerald-300 px-3 py-1 rounded-full">
            Submitted
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm text-slate-300 mb-5">
        <div>
          <span className="text-slate-400">Deadline:</span>{" "}
          {new Date(deadline).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>

        {submitted && (
          <div>
            <span className="text-slate-400">Submitted:</span>{" "}
            {new Date(submittedTime).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
        )}

        {penalty?.length > 0 && (
          <div className="text-red-400 text-xs">
            Late submission penalty applied
          </div>
        )}
      </div>

      {/* Action */}
      {submitted ? (
        <button
          onClick={() => navigate(`/techsecy/submissions/view/${submissionId}`)}
          className="w-full px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
        >
          View Submission
        </button>
      ) : (
        <button
          onClick={() =>
            navigate(`/techsecy/submissions/submit/${psId}?type=${type}`)
          }
          className={`w-full px-4 py-2.5 rounded-lg text-white font-medium ${theme.button}`}
        >
          Submit Now
        </button>
      )}
    </div>
  );
};

export default SubmissionBox;
