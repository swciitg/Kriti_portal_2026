// src/components/SubmissionGuidelines.jsx
export default function SubmissionGuidelines({ variant = "full" }) {
  const steps = [
    {
      number: "1",
      title: "Review Deliverables",
      description: "Check all required deliverables for this problem statement. Each deliverable is marked with its expected file type."
    },
    {
      number: "2",
      title: "Upload Files Individually",
      description: "For file deliverables, select the file first, then click the 'Upload' button. Files are uploaded to temporary storage."
    },
    {
      number: "3",
      title: "Verify Uploads",
      description: "Once uploaded, you'll see a confirmation with file preview. You can replace any file before final submission."
    },
    {
      number: "4",
      title: "Submit Before Deadline",
      description: "Review all deliverables carefully and click 'Submit' when ready. Make sure everything is correct before submitting."
    }
  ];

  const tips = [
    "Late submissions will receive a penalty, but you can still submit after the deadline.",
    "Once submitted, you cannot modify or resubmit. Review carefully before confirming.",
    "Ensure all required deliverables are uploaded before clicking the submit button."
  ];

  if (variant === "compact") {
    return (
      <div className="bg-[#93BBFF]/10 border border-[#93BBFF]/30 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-[#93BBFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-[#93BBFF]">Quick Tips</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-200">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="text-[#93BBFF] flex-shrink-0">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1629]/60 backdrop-blur-md border border-[#93BBFF]/20 rounded-lg p-6 sticky top-6 h-fit">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-6 h-6 text-[#93BBFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-white">Submission Guidelines</h2>
      </div>

      <div className="space-y-6 mb-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-300 text-sm uppercase tracking-wide">
            Step-by-Step Process
          </h3>
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-[#93BBFF]/20 border border-[#93BBFF]/40 rounded-full flex items-center justify-center text-[#93BBFF] font-semibold text-sm">
                {step.number}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white text-sm mb-1">{step.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#93BBFF]/20 pt-6">
        <h3 className="font-semibold text-gray-300 text-sm uppercase tracking-wide mb-3">
          Important Notes
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md backdrop-blur-sm">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-yellow-200">{tips[0]}</p>
          </div>

          <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-md backdrop-blur-sm">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-red-200">{tips[1]}</p>
          </div>

          <div className="flex gap-2 p-3 bg-[#93BBFF]/10 border border-[#93BBFF]/30 rounded-md backdrop-blur-sm">
            <svg className="w-5 h-5 text-[#93BBFF] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-200">{tips[2]}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#1a1f3a]/60 border border-[#93BBFF]/20 rounded-md backdrop-blur-sm">
        <h4 className="font-semibold text-white text-sm mb-2">Need Help?</h4>
        <p className="text-xs text-gray-300">
          If you face any issues during submission, contact your convener or refer to the help documentation.
        </p>
      </div>
    </div>
  );
}