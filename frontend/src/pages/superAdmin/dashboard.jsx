import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import SideBar from "./components/sidebar.jsx"
import GroupSection from "./components/groupSection.jsx"
import { useContext } from "react"
import { userContext } from "../../context/userContext.jsx"

export default function SuperAdminDashboard() {
  const [activePage, setActivePage] = useState("Problem Statements")
  const { user } = useContext(userContext);
  const navigate = useNavigate();

  const [problemStatements , setProblemStatements] = useState([]);
  const [hostelIds , setHostelIds] = useState([]);

  async function getInfo() {
    
  }

  useEffect(() => {
    if ((!user || user.role !== "SuperAdmin")
        || JSON.parse(localStorage.getItem("user"))?.role !== "SuperAdmin"
        ) {
            navigate("/sign-in");
        }
    else {
      getInfo();
    }
  } , [])
    

  const grouped = {
    high: problemStatements.filter(p => p.prep === "high"),
    mid: problemStatements.filter(p => p.prep === "mid"),
    low: problemStatements.filter(p => p.prep === "low"),
    no: problemStatements.filter(p => p.prep === "no"),
  }

  return (
    <div className="min-h-screen bg-gray-100 flex px-64 pb-16">


    <SideBar activePage={activePage} setActivePage={setActivePage}/>

    <div className={`flex-1 p-6 transition-all`}>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">{activePage}</h1>


      {activePage === "Problem Statements" && (
        <div className="space-y-10">

          {
            problemStatements.length === 0 && 
            <div className="text-md font-semibold text-gray-700 p-2 flex justify-center">
              No Items to show
            </div>
          }

          {grouped.high.length > 0 && (
            <GroupSection title="High Prep" items={grouped.high} />
          )}

          {grouped.mid.length > 0 && (
            <GroupSection title="Mid Prep" items={grouped.mid} />
          )}

          {grouped.low.length > 0 && (
            <GroupSection title="Low Prep" items={grouped.low} />
          )}

          {grouped.no.length > 0 && (
            <GroupSection title="No Prep" items={grouped.no} />
          )}

        </div>
      )}

      {activePage !== "Problem Statements" && (
        <div className="text-gray-600 text-lg">
          This section will be developed later.
        </div>
      )}
    </div>
  </div>
  )
}
