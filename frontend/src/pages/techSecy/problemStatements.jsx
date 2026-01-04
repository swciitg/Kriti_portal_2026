import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";
import PdfViewer from "../superAdmin/components/viewPS.jsx";

export default function ProblemStatementsForTechSecy() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfUrl , setPdfUrl] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "TechSecy" && user?.role !== "TechSecy")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPS = async () => {
      const local_time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${BACKEND_URL}/v1/ps/protected` , 
        {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": token ? `Bearer ${token}` : "",
            },
        }
        );
        // console.log(res)
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch PS");

        const filtered = data.ps.map((item) => ({
          id: item._id,
          name: item.name,
          prep: item.prep,
          teamStrength: item.teamStrength,
          points: item.points,
          startDate : new Date(item.startDate).toLocaleString("en-US", {
            timeZone: local_time_zone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          pdf : item.pdf
        }));

        setProblemStatements(filtered);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPS();
  }, []);


  async function DownloadPDF(url , filename) {
      try {
        // const res = await fetch(url)
        // const blob = await res.blob();
        // const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        setError("Some error occured in Downloading Problem Statment")
      }
  }



  const filteredPS = problemStatements.filter((ps) =>
    ps.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrepColor = (prep) => {
    const colors = {
      high: "bg-red-100 text-red-700 border-red-200",
      mid: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-green-100 text-green-700 border-green-200",
      no: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[prep] || colors.no;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">

    {
        pdfUrl && 
        <PdfViewer pdfUrl={pdfUrl} setPdfUrl={setPdfUrl}/>
    }
    <nav className="w-full bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <button
                onClick={() => navigate("/techsecy")}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors font-medium group"
              >
                <svg
                  className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Problem Statements
                    </h1>
                    <p className="text-gray-600">
                        Manage and monitor all problem statements
                    </p>
                </div>
            </div>
            </div>
          </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
    

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search problem statements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading problem statements...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPS.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? "No results found" : "No problem statements yet"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first problem statement to get started"}
            </p>
          </div>
        )}

        {/* Problem Statements Grid */}
        {!loading && filteredPS.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPS.map((ps) => (
              <div
                key={ps.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 min-h-[3.5rem]">
                    {ps.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPrepColor(
                        ps.prep
                      )} bg-white`}
                    >
                      {ps.prep.toUpperCase()} Prep
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Team Size</span>
                      <span className="text-sm text-gray-800 font-semibold">
                        {ps.teamStrength} members
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Points</span>
                      <span className="text-sm text-gray-800 font-semibold">
                        {ps.points} pts
                      </span>
                    </div>
                    {/* <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Start Date</span>
                      <span className="text-sm text-gray-800 font-semibold">
                        {ps.startDate.substr(0 , 10)} {" at "} {ps.startDate.substr(11)}
                      </span>
                    </div> */}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => {
                        // setPdfUrl(ps.pdf)
                        DownloadPDF(ps.pdf , ps.name + ".pdf")
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && filteredPS.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">{problemStatements.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total PS</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {problemStatements.filter(ps => ps.prep === "high").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">High Prep</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {problemStatements.filter(ps => ps.prep === "mid").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Mid Prep</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {problemStatements.filter(ps => ps.prep === "low").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Low Prep</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
