import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../constants";
import PdfViewer from "./superAdmin/components/viewPS.jsx";

export default function PublicProblemStatements() {
  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchPS = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/v1/ps/public`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch PS");

        const filtered = data.ps.map((item) => ({
          id: item._id,
          name: item.name,
          prep: item.prep,
          teamStrength: item.teamStrength,
          points: item.points,
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
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      setError("Some error occurred in downloading problem statement");
    }
  }

  // Filter problem statements by prep level
  const highPS = problemStatements.filter((ps) => ps.prep === "high");
  const midPS = problemStatements.filter((ps) => ps.prep === "mid");
  const lowPS = problemStatements.filter((ps) => ps.prep === "low");
  const noPS = problemStatements.filter((ps) => ps.prep === "no");

  // Carousel component for displaying problem statements
  const PSCarousel = ({ items }) => {
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
      <div className="relative overflow-hidden">
        {/* Left Arrow */}
        {items.length > 1 && (
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-1 sm:left-2 top-1/2 z-10 -translate-y-1/2 bg-black/40 backdrop-blur-md p-2 sm:p-3 rounded-full hover:bg-black/60 transition text-white text-sm sm:text-base"
            aria-label="Scroll left"
          >
            ❮
          </button>
        )}

        {/* Carousel */}
        <div
          ref={ref}
          className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-10 sm:px-12 md:px-14 py-4 sm:py-6 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((ps) => (
            <div
              key={ps.id}
              className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] lg:w-[380px]"
            >
              <div className="h-full rounded-2xl sm:rounded-3xl bg-[#171B34] backdrop-blur-xl border border-white/20 shadow-xl hover:scale-[1.03] transition-all duration-300">
                <div className="p-4 sm:p-5 md:p-6 flex flex-col h-full">
                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 line-clamp-2 pb-3 sm:pb-4 min-h-[3.5rem] sm:min-h-[4rem]">
                    {ps.name}
                  </h3>
                  {/* Stats */}
                  <div className="flex justify-between mb-4 sm:mb-6 text-white gap-2">
                    <div className="bg-white/10 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-center flex-1">
                      <p className="text-xs sm:text-sm opacity-70">Team Size</p>
                      <p className="text-base sm:text-lg font-bold">{ps.teamStrength}</p>
                    </div>
                    <div className="bg-white/10 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-center flex-1">
                      <p className="text-xs sm:text-sm opacity-70">Points</p>
                      <p className="text-base sm:text-lg font-bold">{ps.points}</p>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    style={{background:"#93BBFF"}}
                    onClick={() => DownloadPDF(ps.pdf, ps.name + ".pdf")}
                    className="mt-auto text-[#0B0914] py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold shadow-lg transition-all"
                  >
                    View Problem Statement
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {items.length > 1 && (
          <button
            onClick={() => scrollBy(1)}
            className="absolute right-1 sm:right-2 top-1/2 z-10 -translate-y-1/2 bg-black/40 backdrop-blur-md p-2 sm:p-3 rounded-full hover:bg-black/60 transition text-white text-sm sm:text-base"
            aria-label="Scroll right"
          >
            ❯
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {pdfUrl && <PdfViewer pdfUrl={pdfUrl} setPdfUrl={setPdfUrl} />}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white font-medium">
              Loading problem statements...
            </p>
          </div>
        </div>
      )}

      {!loading && (
        <>
          <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl text-center font-bold mb-3 sm:mb-4">
              PROBLEM STATEMENTS
            </h1>
            <p className="text-white/80 text-base sm:text-lg md:text-xl text-center mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-4">
              Explore exciting challenges and showcase your technical skills
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl max-w-3xl mx-auto backdrop-blur-md">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* High Prep Section */}
            {highPS.length > 0 && (
              <div className="mb-10 sm:mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                  High Prep Problem Statements
                </h2>
                <p className="text-white/80 text-sm sm:text-base md:text-md mb-4 sm:mb-5 md:mb-6">
                  These are the competitions that involve proof-of-concept
                  demonstration, implementation etc., that happen during the meet.
                  This requires extensive preparation of any prototypes, submissions,
                  etc., from the contingent as directed by the Problem Statement.
                  <br />
                  The problem-solving will require sustained efforts of 4-10
                  weeks or more with weekly input of 10-30 hours. A significant amount
                  of prototyping costs/resources will be involved in high-prep
                  competition.
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5 md:mb-6">
                  Listing of High Prep Problem Statements
                </h3>
                <PSCarousel items={highPS} />
              </div>
            )}

            {/* Mid Prep Section */}
            {midPS.length > 0 && (
              <div className="mb-10 sm:mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                  Mid Prep Problem Statements
                </h2>
                <p className="text-white/80 text-sm sm:text-base md:text-md mb-4 sm:mb-5 md:mb-6">
                  These are the competitions that involve demonstrations or
                  presentations that happen during the meet. This may require the
                  preparation of some prototypes, submissions, etc., from the
                  contingents as per the Problem Statement.
                  <br />
                  The problem-solving will require a sustained effort of
                  anywhere between 2-4 weeks with weekly input of 8-20 hours.
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5 md:mb-6">
                  Listing of Mid Prep Problem Statements
                </h3>
                <PSCarousel items={midPS} />
              </div>
            )}

            {/* Low Prep Section */}
            {lowPS.length > 0 && (
              <div className="mb-10 sm:mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                  Low Prep Problem Statements
                </h2>
                <p className="text-white/80 text-sm sm:text-base md:text-md mb-4 sm:mb-5 md:mb-6">
                  These are the competitions that involve presentations that happen
                  during the meet. This may require the preparation of some
                  submissions, etc., from the contingents as per the problem
                  statement. The problem-solving will require a sustained effort of
                  anywhere between 4-7 days.
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5 md:mb-6">
                  Listing of Low Prep Problem Statements
                </h3>
                <PSCarousel items={lowPS} />
              </div>
            )}

            {/* No Prep Section */}
            {noPS.length > 0 && (
              <div className="mb-10 sm:mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                  No Prep Problem Statements
                </h2>
                <p className="text-white/80 text-sm sm:text-base md:text-md mb-4 sm:mb-5 md:mb-6">
                  These are the competitions that require on-the-spot efforts with no
                  prior preparation of any prototypes, submissions, etc., from the
                  contingent.
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5 md:mb-6">
                  Listing of No Prep Problem Statements
                </h3>
                <PSCarousel items={noPS} />
              </div>
            )}

            {/* Empty State */}
            {problemStatements.length === 0 && !error && (
              <div className="text-center py-12 sm:py-16 md:py-20">
                <div className="bg-white/10 backdrop-blur-md rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/60"
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
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  No problem statements yet
                </h3>
                <p className="text-white/60 text-sm sm:text-base">Coming soon!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
