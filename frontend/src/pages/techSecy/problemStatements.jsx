import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";
import { BACKEND_URL } from "../../constants";
import PdfViewer from "../superAdmin/components/viewPS.jsx";
import TechSecyNavbar from "./components/navbar.jsx";
import full_bg from "../../assets/full_bg.png"

export default function ProblemStatementsForTechSecy() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

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
        const res = await fetch(`${BACKEND_URL}/v1/ps/protected`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        // console.log(res)
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch PS");

        const filtered = data.ps.map((item) => ({
          id: item._id,
          name: item.name,
          prep: item.prep,
          teamStrength: item.teamStrength,
          points: item.points,
          startDate: new Date(item.startDate).toLocaleString("en-US", {
            timeZone: local_time_zone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          pdf: item.pdf,
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

  async function DownloadPDF(url, filename) {
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
      setError("Some error occured in Downloading Problem Statment");
    }
  }

  const filteredPS = problemStatements.filter((ps) =>
    ps.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // helper arrays per prep to avoid repeated filters and enable conditional rendering
  const highPS = filteredPS.filter((ps) => ps.prep === "high");
  const midPS = filteredPS.filter((ps) => ps.prep === "mid");
  const lowPS = filteredPS.filter((ps) => ps.prep === "low");
  const noPS = filteredPS.filter((ps) => ps.prep === "no");

  const getPrepColor = (prep) => {
    const colors = {
      high: "bg-red-100 text-red-700 border-red-200",
      mid: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-green-100 text-green-700 border-green-200",
      no: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[prep] || colors.no;
  };

  // Presentational carousel (UI-only) that shows PS name and deadline — no category tags
  const PSCarousel = ({ items, title }) => {
    const ref = useRef(null);

    const scrollBy = (dir = 1) => {
      const el = ref.current;
      if (!el) return;
      el.scrollBy({
        left: el.clientWidth * dir,
        behavior: "smooth",
      });
    };

    if (!items || items.length === 0) return null;

    return (
      <div className="mt-10">
        <h2 className="text-3xl font-bold text-white mb-6">{title}</h2>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60 transition"
          >
            ❮
          </button>

          {/* Carousel */}
          <div
            ref={ref}
            className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-10 py-6 carousel-no-scrollbar"
          >
            {items.map((ps) => (
              <div
                key={ps.id}
                className="snap-start min-w-[380px] max-w-[380px]"
              >
                <div className="h-full rounded-3xl bg-[#171B34] backdrop-blur-xl border border-white/20 shadow-xl hover:scale-[1.03] transition-all duration-300">
                  <div className="p-6 flex flex-col h-full">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 pb-4">
                      {ps.name}
                    </h3>
                    {/* Stats */}
                    <div className="flex justify-between mb-6 text-white">
                      <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
                        <p className="text-sm opacity-70">Team Size</p>
                        <p className="text-lg font-bold">{ps.teamStrength}</p>
                      </div>
                      <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
                        <p className="text-sm opacity-70">Points</p>
                        <p className="text-lg font-bold">{ps.points}</p>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      style={{background:"#93BBFF"}}
                      onClick={() => DownloadPDF(ps.pdf, ps.name + ".pdf")}
                      className="mt-auto text-[#0B0914] py-3 rounded-xl font-semibold shadow-lg transition-all"
                    >
                      View Problem Statement
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60 transition"
          >
            ❯
          </button>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-cover bg-no-repeat"
    style={{ backgroundImage: `url(${full_bg})` }}>
      {pdfUrl && <PdfViewer pdfUrl={pdfUrl} setPdfUrl={setPdfUrl} />}
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20 fixed left-[45vw] top-[30vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-white font-medium">
              Loading problem statements...
            </p>
          </div>
        </div>
      )}
      <div>
        <TechSecyNavbar />
      </div>
      <h1 className="text-white text-5xl text-center pt-30 font-bold bebas-neue-regular">
        PROBLEM STATEMENTS
      </h1>
      {highPS.length > 0 && (
        <div className="px-16 text-white">
          <h2 className="text-3xl pt-12 font-bold bebas-neue-regular">
            High Prep Problem Statements
          </h2>
          <p className="text-md pt-4">
            These are the competitions that involve proof-of-concept
            demonstration, implementation etc., that happen during the meet.
            This requires extensive preparation of any prototypes, submissions,
            etc., from the contingent as directed by the Problem Statement.{" "}
            <br /> The problem-solving will require sustained efforts of 4-10
            weeks or more with weekly input of 10-30 hours. A significant amount
            of prototyping costs/resources will be involved in high-prep
            competition
          </p>
          <h2 className="pt-12 text-2xl font-bold bebas-neue-regular">
            Listing of High Prep Problem Statements
          </h2>
          <div className="mt-6">
            <PSCarousel items={highPS} />
          </div>
        </div>
      )}
      {midPS.length > 0 && (
        <div className="px-16 text-white ">
          <h2 className="text-3xl pt-12 font-bold bebas-neue-regular">
            Mid Prep Problem Statements
          </h2>
          <p className="text-md pt-4">
            These are the competitions that involve demonstrations or
            presentations that happen during the meet. This may require the
            preparation of some prototypes, submissions, etc., from the
            contingents as per the Problem Statement.
            <br /> The problem-solving will require a sustained effort of
            anywhere between 2-4 weeks with weekly input of 8-20 hours.
          </p>
          <h2 className="pt-12 text-2xl font-bold bebas-neue-regular">
            Listing of Mid Prep Problem Statements
          </h2>
          <div className="mt-6">
            <PSCarousel items={midPS} />
          </div>
        </div>
      )}
      {lowPS.length > 0 && (
        <div className="px-16 text-white">
          <h2 className="text-3xl pt-12 font-bold bebas-neue-regular">
            Low Prep Problem Statements
          </h2>
          <p className="text-md pt-4">
            These are the competitions that involve presentations that happen
            during the meet. This may require the preparation of some
            submissions, etc., from the contingents as per the problem
            statement. The problem-solving will require a sustained effort of
            anywhere between 4-7 days
          </p>
          <h2 className="pt-12 text-2xl font-bold bebas-neue-regular">
            Listing of Low Prep Problem Statements
          </h2>
          <div className="mt-6">
            <PSCarousel items={lowPS} />
          </div>
        </div>
      )}
      {noPS.length > 0 && (
        <div className="px-16 text-white">
          <h2 className="text-3xl pt-12 font-bold">
            No Prep Problem Statements
          </h2>
          <p className="text-md pt-4">
            These are the competitions that require on-the-spot efforts with no
            prior preparation of any prototypes, submissions, etc., from the
            contingent.
          </p>
          <h2 className="pt-12 text-2xl font-bold">
            Listing of No Prep Problem Statements
          </h2>
          <div className="mt-6">
            <PSCarousel items={noPS} />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <p className="font-medium">{error}</p>
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
              {searchTerm ? "Try adjusting your search terms" : "Comming soon!"}
            </p>
          </div>
        )}

        {/* Stats Summary
        {!loading && filteredPS.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">
                  {problemStatements.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total PS</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {problemStatements.filter((ps) => ps.prep === "high").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">High Prep</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {problemStatements.filter((ps) => ps.prep === "mid").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Mid Prep</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {problemStatements.filter((ps) => ps.prep === "low").length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Low Prep</p>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
