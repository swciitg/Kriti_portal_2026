import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import SideBar from "./components/sidebar.jsx"
import GroupSection from "./components/groupSection.jsx"
import { useContext } from "react"
import { userContext } from "../../context/userContext.jsx"
import { BACKEND_URL } from "../../constants.js"

export default function SuperAdminDashboard() {
  const [activePage, setActivePage] = useState("Problem Statements")
  const { user } = useContext(userContext);
  const navigate = useNavigate();

  const [problemStatements , setProblemStatements] = useState([]);
  const [hostelIds , setHostelIds] = useState([]);

  const [error , setError] = useState(""); 

  useEffect(() =>{
    if(!error || error.trim().length === 0) {
      return;
    }

    const timeoutInstance = setTimeout(() => {
      setError('');
    } , 5000);
    
    return () => clearTimeout(timeoutInstance);
  } , [error]);

  async function getInfo() {
    try {
      setError("");
      const response = await fetch(`${BACKEND_URL}/api/v1/superadmin/get-info` , {
        method : "GET" , 
        headers : {
          "Content-type" : "application/json" , 
          "Authorization" : localStorage.getItem("accessToken")
        }
      });
  
      const data = await response.json();
  
      if(!data.success) {
        setError(data.message);
        return;
      }
  
      if(data.ps?.length > 0) {
        setProblemStatements(data.ps);
      } 
      if(data.hostelId?.length > 0) {
        setHostelIds(data.hostelId);
      }
      setError('');
    } catch (error) {
      setError("Some Error in superadmin dashboard");
      setProblemStatements([]);
      setHostelIds([]); 
    }
  }

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "SuperAdmin" && user?.role !== "SuperAdmin")
    ) {
      navigate("/sign-in");
    }
    else {
      getInfo();
    }
  } , [user])
    

  const grouped = {
    high: problemStatements.filter(p => p.prep === "high"),
    mid: problemStatements.filter(p => p.prep === "mid"),
    low: problemStatements.filter(p => p.prep === "low"),
    no: problemStatements.filter(p => p.prep === "no"),
  }

  return (
    <div className="min-h-screen bg-gray-100 flex px-64 pb-16">

    {error && (
      <div className="flex justify-center items-center fixed top-0 left-0 w-[100vw] h-[100vh]">
        <p className="text-red-600 text-md">{error}</p>
      </div>
    )}

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
