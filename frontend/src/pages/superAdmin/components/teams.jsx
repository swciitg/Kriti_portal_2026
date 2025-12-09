import { useState } from "react"
import { ChevronRight } from "lucide-react"

export default function TeamsCard({id , name , close}) {
  const [selectedHostel, setSelectedHostel] = useState(null)

  const [teams , setTeams] = useState([
    {
      hostelId: 1,
      submitted: true,
      teamMember: [
        { name: "Aarav Singh", email: "aarav@xyz.com", rollNumber: 21001 },
        { name: "Riya Sharma", email: "riya@xyz.com", rollNumber: 21002 },
        { name: "Riya Sharma", email: "riya@xyz.com", rollNumber: 21006 },
        { name: "Riya Sharma", email: "riya@xyz.com", rollNumber: 21005 },
        { name: "Riya Sharma", email: "riya@xyz.com", rollNumber: 21004 }
      ]
    },
    {
      hostelId: 2,
      submitted: false,
      teamMember: [
        { name: "Rohan Jain", email: "rohan@xyz.com", rollNumber: 21015 },
        { name: "Kriti Verma", email: "kriti@xyz.com", rollNumber: 21018 },
      ]
    },
    {
      hostelId: 3,
      submitted: true,
      teamMember: [
        { name: "Ishan Mehta", email: "ishan@xyz.com", rollNumber: 21029 },
        { name: "Nandini Rao", email: "nandini@xyz.com", rollNumber: 21033 },
      ]
    }
  ])



  const activeTeam = teams.find((t) => t.hostelId === selectedHostel)

  return (
    <div className="fixed flex justify-center items-center w-[100vw] h-[100vh] top-0 left-0 bg-black/50">


      <div className="flex w-[70vw] pr-4 h-[80vh] bg-gray-100 rounded-xl shadow-sm overflow-hidden relative">

        {/* Cross Button */}
        <button
          onClick={close}
          className="absolute top-2 right-2 text-black font-bold text-xl cursor-pointer"
        >
          ✕
        </button>

        {/* Sidebar */}
        <div className="w-48 bg-white shadow-md p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">Hostels</h2>

          <div className="space-y-2">
            { teams.length > 0 &&
            teams.map((t) => (
              <button
                key={t.hostelId}
                onClick={() => setSelectedHostel(t.hostelId)}
                className={`w-full px-3 py-2 flex items-center gap-2 rounded-lg transition 
                ${selectedHostel === t.hostelId ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}
              >
                <ChevronRight size={18} />
                Hostel {t.hostelId}
              </button>
            ))}
             {
              teams.length === 0 && 
              <div className="text-gray-500 text-lg">
                No Hostels have Registered yet!
              </div>
             }
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 p-6 overflow-y-auto">

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{name}</h2>

          {!selectedHostel && (
            <div className="text-gray-500 text-lg">
              Select a hostel to view its team details.
            </div>
          )}

          {activeTeam && (
            <div className="space-y-5">

              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="text-2xl font-semibold text-gray-800">Hostel {activeTeam.hostelId} Team</h3>
                <p className="mt-1 text-blue-600 font-medium">
                  Status: {activeTeam.submitted ? "Submitted" : "Not Submitted"}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-blue-700 mb-4">Team Members</h4>

                <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1">
                  {activeTeam.teamMember.map((member, i) => (
                    <div
                      key={i}
                      className="p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition"
                    >
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <p className="text-gray-700 text-sm">{member.email}</p>
                      <p className="text-gray-600 text-sm">Roll: {member.rollNumber}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

    </div>

  )
}
