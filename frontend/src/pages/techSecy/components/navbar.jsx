import techBoardLogo from  "../../../assets/tech.png"
import techSecy_bg from "../../../assets/techsecy_bg.png"
import { useNavigate } from "react-router-dom"
import { useContext, useState } from "react";
import { userContext } from "../../../context/userContext";
import { BACKEND_URL } from "../../../constants.js";

export default function TechSecyNavbar() {
    const navigate = useNavigate();
    const { user, updateUser } = useContext(userContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    async function LogoutHandler() {
        try {
          const token = localStorage.getItem("accessToken");
          const res = await fetch(`${BACKEND_URL}/v1/auth/logout`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          });

          const data = await res.json();

          if (res.status === 401 || data.success) {
            updateUser(null);
            localStorage.removeItem("accessToken");
            navigate("/sign-in");
          }
        } catch (error) {
          console.log(error);
        }
        setIsMenuOpen(false);
      }

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    const handleRulebookOpen = () => {
        window.open('/kriti-submission/Kriti_Rulebook.pdf', '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            <nav className="absolute w-full px-4 md:px-8 lg:px-16 py-4 flex items-center justify-between z-50">
                {/* Logo */}
                <div className="flex items-center">
                    <img
                        src={techBoardLogo}
                        alt="Tech Board Logo"
                        className="h-12 md:h-12 lg:h-16 w-auto cursor-pointer"
                    />
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center gap-4 md:gap-6 lg:gap-8">
                    <button
                        className="cursor-pointer text-white text-md md:text-base hover:text-gray-300 transition-colors"
                        onClick={() => {navigate("/techsecy/problem-statements")}}
                    >
                        Problem Statements
                    </button>
                    <button
                        className="cursor-pointer text-white text-md md:text-base hover:text-gray-300 transition-colors"
                        onClick={() => {
                            handleRulebookOpen()
                        }}
                    >
                        Rulebook
                    </button>
                    {/* <button
                        className="cursor-pointer text-white text-md md:text-base hover:text-gray-300 transition-colors"
                        onClick={() => {navigate("/techsecy/register-team")}}
                    >
                        Registrations
                    </button> */}
                    <button
                        className="cursor-pointer text-white text-md md:text-base hover:text-gray-300 transition-colors"
                        onClick={() => {LogoutHandler()}}
                    >
                        Logout
                    </button>
                    <button
                        onClick={() => navigate("/change-password")}
                        className="cursor-pointer text-white text-md md:text-base hover:text-gray-300 transition-colors"
                    >
                        Change Password
                    </button>
                </div>

                {/* Hamburger Menu Button */}
                <button
                    className="md:hidden text-white focus:outline-none z-50"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 flex items-center justify-center"
                    style={{ backgroundImage: `url(${techSecy_bg})` }}
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div
                        className="flex flex-col gap-6 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="cursor-pointer text-white text-xl hover:text-gray-300 transition-colors"
                            onClick={() => handleNavigation("/techsecy/problem-statements")}
                        >
                            Problem Statements
                        </button>
                        <button
                            className="cursor-pointer text-white text-xl hover:text-gray-300 transition-colors"
                            onClick={() => {
                                handleRulebookOpen()
                            }}
                        >
                            Rulebook
                        </button>
                        {/* <button
                            className="cursor-pointer text-white text-xl hover:text-gray-300 transition-colors"
                            onClick={() => handleNavigation("/techsecy/register-team")}
                        >
                            Registrations
                        </button> */}
                        <button
                            className="cursor-pointer text-white text-xl hover:text-gray-300 transition-colors"
                            onClick={() => {LogoutHandler()}}
                        >
                            Logout
                        </button>
                        <button
                            onClick={() => handleNavigation("/change-password")}
                            className="cursor-pointer text-white text-xl hover:text-gray-300 transition-colors"
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
