import { Download } from "lucide-react"

export default function ProblemCard({ ps }) {
  return (
    <>

    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{ps.name}</h3>

      <div className="text-sm text-gray-600 space-y-1">
        <p>Registration: <span className="text-gray-800 font-medium">{ps.registrationDeadline}</span></p>
        <p>Submission: <span className="text-gray-800 font-medium">{ps.submissionDeadline}</span></p>
      </div>

      <div className="flex justify-between items-center gap-2">
        <button className="mt-4 w-1/2 cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          View Teams
        </button>
        <button className="mt-4 w-1/2 cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          View Submissions
        </button>
      </div>

      <button className="mt-4 w-full flex items-center justify-center cursor-pointer gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
        <Download size={18} />
        Download Problem Statement
      </button>
    </div>
    </>
  )
}