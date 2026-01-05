// src/components/TeamRegistrationGuidelines.jsx
export default function TeamRegistrationGuidelines({ variant = "full" }) {
  const steps = [
    {
      number: "1",
      title: "Fill Team Details",
      description: "Enter complete information for each team member including name, email, year, phone, and department."
    },
    {
      number: "2",
      title: "Add All Members",
      description: "Use 'Add Member' button to add team members up to the maximum team strength limit."
    },
    {
      number: "3",
      title: "Submit",
      description: "Double-check all details and click 'Register Team' to complete registration. Once submitted, details cannot be changed."
    }
  ];

  const tips = [
    "All fields marked with * are mandatory. Ensure accurate information.",
    "You must click 'Register Team' button to complete your registration.",
    "Review all information carefully before final submission."
  ];

  if (variant === "compact") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-blue-900">Quick Tips</h3>
        </div>
        <ul className="space-y-2 text-sm text-blue-800">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="text-blue-600 flex-shrink-0">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6 shadow-lg h-fit">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-900">Registration Guidelines</h2>
      </div>

      <div className="space-y-6">
        {/* Steps */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            Registration Process
          </h3>
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                {step.number}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm mb-1">{step.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          Important Notes
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-yellow-800">
              {tips[0]}
            </p>
          </div>

          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-red-800">
              {tips[1]}
            </p>
          </div>

          <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-800">
              {tips[2]}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h4 className="font-semibold text-gray-900 text-sm mb-2">Need Help?</h4>
        <p className="text-xs text-gray-600">
          For any queries or assistance, please contact the convener.
        </p>
      </div>
    </div>
  );
}
