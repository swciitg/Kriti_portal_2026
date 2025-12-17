import {useState } from 'react'
import TeamsCard from './teams.jsx';
import SubmissionCard from './submissions.jsx'

export default function ProblemCard({ ps }) {
  const [teamSelected , setTeamSelected] = useState(null);
  const [submissionSelected , setSubmissionSelected] = useState(null);


  function handleTeamsClick() {
    setTeamSelected(prev => !prev)
  }

  function handleSubmissionClick() {
    setSubmissionSelected(prev => !prev)
  }

  return (
    <>
    {
      teamSelected && 
      <TeamsCard id = {ps._id} name = {ps.name} close = {handleTeamsClick}/>
    }

    {
      submissionSelected && 
      <SubmissionCard  id = {ps._id} name = {ps.name} close = {handleSubmissionClick}/>
    }

    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{ps.name}</h3>

      <div className="text-sm text-gray-600 space-y-1">
        <p>Registration deadline: <span className="text-gray-800 font-medium">{ps.registrationDeadline}</span></p>
        <p>Submission deadline: <span className="text-gray-800 font-medium">{ps.submissionDeadline}</span></p>
      </div>

      <div className="flex justify-between items-center gap-2">
        <button onClick={handleTeamsClick}
        className="mt-4 h-full w-1/2 cursor-pointer bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
          View Teams Registered
        </button>
        <button onClick={handleSubmissionClick}
        className="mt-4 h-full w-1/2 cursor-pointer bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
          Inspect Submissions
        </button>
      </div>

      <button className="mt-4 w-full cursor-pointer gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
        Download Problem Statement
      </button>
    </div>
    </>
  )
}