import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../context/userContext";
import full_bg from "../assets/full_bg.png"
import kriti_name from  "../assets/kriti_name.svg"
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
    <div className="min-h-screen overflow-x-hidden bg-cover bg-top bg-no-repeat" style={{ backgroundImage: `url(${full_bg})` }}>
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 pt-8 sm:pt-12 md:pt-16">

        {/* KRITI Logo */}
          <img
            src={kriti_name}
            alt="KRITI"
            className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] max-w-[1200px] mb-2 sm:mb-4 md:mb-6 mt-16 sm:mt-20 md:mt-28 lg:mt-32"
          />

          {/* Text Content */}
          <div className="text-center -mt-8 sm:-mt-12 md:-mt-20 lg:-mt-28 xl:-mt-32 mb-12 sm:mb-16 md:mb-20 lg:mb-24 bebas-neue-regular px-2">
              <h2 className="text-[#9BB4D9] text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold tracking-wide mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                  THE ULTIMATE
              </h2>
              <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-8xl font-extrabold tracking-wide mb-3 sm:mb-4 md:mb-6 lg:mb-10">
                  TECH BATTLE
              </h1>
              <p className="text-[#9BB4D9] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-wider font-bold">
                  2026
              </p>
          </div>
      </div>

      <PublicProblemStatements/>
    </div>
    // <div className="min-h-screen">
    //   <TechSecyLandingScreen />
    //   <PublicProblemStatements />
    // </div>
  );
}
