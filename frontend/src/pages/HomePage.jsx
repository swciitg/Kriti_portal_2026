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
    <div className="min-h-screen bg-cover bg-no-repeat flex flex-col items-center justify-center px-4"
    style={{ backgroundImage: `url(${full_bg})` }}>
    
      {/* KRITI Logo */}
        <img
          src={kriti_name}
          alt="KRITI"
          className="w-[90%] max-w-[1200px] mb-4 mt-32"
        />
    
        {/* Text Content */}
        <div className="text-center -mt-16 md:-mt-24 lg:-mt-32 mb-24 bebas-neue-regular">
            <h2 className="text-[#9BB4D9] text-xl sm:text-2xl md:text-4xl font-bold lg:text-5xl tracking-wide mb-4 md:mb-6"
                style={{ }}>
                THE ULTIMATE
            </h2>
            <h1 className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-extrabold tracking-wide mb-6 md:mb-10"
                style={{ }}>
                TECH BATTLE
            </h1>
            <p className="text-[#9BB4D9] text-3xl md:text-5xl lg:text-6xl tracking-wider font-bold"
                style={{ }}>
                2026
            </p>
        </div>


        <PublicProblemStatements/>
      </div>
    // <div className="min-h-screen">
    //   <TechSecyLandingScreen />
    //   <PublicProblemStatements />
    // </div>
  );
}