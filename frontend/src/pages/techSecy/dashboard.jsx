import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { userContext } from "../../context/userContext";

function TechSecyDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "TechSecy" && user?.role !== "TechSecy")
    ) {
      navigate("/sign-in");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          Tech Secy Dashboard
        </h1>
      </nav>

      <div className="flex flex-col flex-1 items-center justify-center px-4 gap-10">
        <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 flex flex-col gap-4">
          <button
            onClick={() => navigate("/techsecy/register-team")}
            className="w-full py-3 rounded-lg bg-blue-600 text-white text-lg font-medium hover:bg-blue-700 transition"
          >
            Register Team
          </button>
          
          <button
            onClick={() => navigate("/techsecy/submissions")}
            className="w-full py-3 rounded-lg bg-green-600 text-white text-lg font-medium hover:bg-green-700 transition"
          >
            PS Submission
          </button>
        </div>
      </div>
    </div>
  );
}

export default TechSecyDashboard;
