import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../context/userContext";
import TechSecyLandingScreen from "./techSecy/components/landingScreen.jsx";
import PublicProblemStatements from "./PublicProblemStatements.jsx";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const currentUser = user || storedUser;
    const token = localStorage.getItem("accessToken");

    if (currentUser && token) {
      // Redirect to appropriate dashboard based on role
      switch (currentUser.role) {
        case "Convener":
          navigate("/convener");
          break;
        case "TechSecy":
          navigate("/techsecy");
          break;
        case "Judge":
          navigate("/judge/dashboard");
          break;
        case "Company":
          navigate("/company/dashboard");
          break;
        case "SuperAdmin":
          navigate("/superadmin");
          break;
        default:
          // If role is unknown, stay on home page
          break;
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen">
      <TechSecyLandingScreen />
      <PublicProblemStatements />
    </div>
  );
}