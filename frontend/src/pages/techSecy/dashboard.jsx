// src/pages/techSecy/dashboard.jsx
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../context/userContext";
import kriti_logo from "../../assets/tech.png";
import TechSecyLandingScreen from "./components/landingScreen";
import TechSecyNavbar from "./components/navbar";
import PsDetails from "./components/PsDetails.jsx";
import { CarouselDefault } from "./components/Carousel.jsx";

export default function TechSecyDashboard() {
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
  }, [user, navigate]);

  function prependZeroes(item, req_len) {
    if (item === undefined || item === null) {
      return null;
    }
    let res = item.toString();
    if (res.length >= req_len) {
      return item;
    }

    let zeroes_needed = req_len - res.length;
    while (zeroes_needed) {
      zeroes_needed--;
      res = "0" + res;
    }
    return res;
  }

  return (
    <>
    <TechSecyNavbar/>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Hostel ID */}
      {/* <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-40 px-6 py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-600 tracking-wide">
          HOSTEL{" "}
          {prependZeroes(
            JSON.parse(localStorage.getItem("user"))?.hostelId,
            4
          ) || "0000"}
        </h1>
      </div> */}

      {/* Main Content */}
      <div className="">
        <div className="">
          <TechSecyLandingScreen/>
          {/* <div className="flex flex-col items-center justify-center mb-12 md:mb-16">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <img
                src={kriti_logo}
                alt="KRITI Logo"
                className="w-24 h-24 md:w-32 md:h-32 object-contain animate-spin-slow"
              />
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex gap-1 md:gap-2">
                  {["K", "R", "I", "T", "I"].map((letter, index) => (
                    <span
                      key={index}
                      className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-text tracking-tight"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        display: "inline-block",
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
                <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-fade-in">
                  2026
                </span>
              </div>
            </div>
          </div> */}

          {/* Quick Actions Grid */}
          <div className="p-3 lg:p-20">
            <PsDetails />
            <div className="pt-12 lg:pt-36">
              <h1 className="text-center text-3xl font-bold">About Kriti</h1>
              <p className="pt-3 text-center">
                Greetings, innovators and tech enthusiasts of IIT Guwahati!
                We’re excited to introduce Kriti, the grand inter-hostel
                technical competition that showcases the spirit of innovation,
                collaboration, and technical brilliance. This year, Kriti
                invites you to a journey across cutting-edge technologies and
                diverse domains, where hostels compete to claim their title as
                the ultimate tech powerhouse. From AI/ML and blockchain to
                aeromodelling, robotics, and beyond, Kriti is the stage where
                talent meets opportunity.
              </p>
              <div className="pt-5">
                <CarouselDefault />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    </>
  );
}
