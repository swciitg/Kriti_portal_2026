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
      <div className="relative">
        {/* Left Arrow */}
        {items.length > 1 && (
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60 transition text-white"
            aria-label="Scroll left"
          >
            ❮
          </button>
        )}

        {/* Carousel */}
        <div
          ref={ref}
          className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-10 py-6"
        >
          {items.map((ps) => (
            <div
              key={ps.id}
              className="snap-start min-w-[380px] max-w-[380px]"
            >
              <div className="h-full rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:scale-[1.03] transition-all duration-300">
                <div className="p-6 flex flex-col h-full">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 pb-4 min-h-[4rem]">
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
                    onClick={() => DownloadPDF(ps.pdf, ps.name + ".pdf")}
                    className="mt-auto w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 rounded-xl font-semibold shadow-lg transition-all"
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
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60 transition text-white"
            aria-label="Scroll right"
          >
            ❯
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900">
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
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-white text-5xl text-center font-bold mb-4">
              PROBLEM STATEMENTS
            </h1>
            <p className="text-white/80 text-xl text-center mb-12 max-w-3xl mx-auto">
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
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">
                  High Prep Problem Statements
                </h2>
                <p className="text-white/80 text-md mb-6">
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
                <h3 className="text-2xl font-bold text-white mb-6">
                  Listing of High Prep Problem Statements
                </h3>
                <PSCarousel items={highPS} />
              </div>
            )}

            {/* Mid Prep Section */}
            {midPS.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Mid Prep Problem Statements
                </h2>
                <p className="text-white/80 text-md mb-6">
                  These are the competitions that involve demonstrations or
                  presentations that happen during the meet. This may require the
                  preparation of some prototypes, submissions, etc., from the
                  contingents as per the Problem Statement.
                  <br />
                  The problem-solving will require a sustained effort of
                  anywhere between 2-4 weeks with weekly input of 8-20 hours.
                </p>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Listing of Mid Prep Problem Statements
                </h3>
                <PSCarousel items={midPS} />
              </div>
            )}

            {/* Low Prep Section */}
            {lowPS.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Low Prep Problem Statements
                </h2>
                <p className="text-white/80 text-md mb-6">
                  These are the competitions that involve presentations that happen
                  during the meet. This may require the preparation of some
                  submissions, etc., from the contingents as per the problem
                  statement. The problem-solving will require a sustained effort of
                  anywhere between 4-7 days.
                </p>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Listing of Low Prep Problem Statements
                </h3>
                <PSCarousel items={lowPS} />
              </div>
            )}

            {/* No Prep Section */}
            {noPS.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">
                  No Prep Problem Statements
                </h2>
                <p className="text-white/80 text-md mb-6">
                  These are the competitions that require on-the-spot efforts with no
                  prior preparation of any prototypes, submissions, etc., from the
                  contingent.
                </p>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Listing of No Prep Problem Statements
                </h3>
                <PSCarousel items={noPS} />
              </div>
            )}

            {/* Empty State */}
            {problemStatements.length === 0 && !error && (
              <div className="text-center py-20">
                <div className="bg-white/10 backdrop-blur-md rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-white/60"
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
                <h3 className="text-xl font-semibold text-white mb-2">
                  No problem statements yet
                </h3>
                <p className="text-white/60">Coming soon!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}