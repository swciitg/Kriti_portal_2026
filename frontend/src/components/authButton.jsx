// AuthButton.jsx
import { useContext } from "react";
import { userContext } from "../context/userContext";
import { BACKEND_URL } from "../constants";
import { useNavigate } from "react-router-dom";

export default function AuthButton() {
  const { user, updateUser } = useContext(userContext);
  const navigate = useNavigate();

  function isSignedIn() {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!user && !stored) return false;
    return true;
  }

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
  }

  function handleClick() {
    if (isSignedIn()) {
      LogoutHandler();
    } else {
      navigate("/sign-in");
    }
  }

  const currentPath = window.location.pathname;
  const isSubmissionPage = currentPath.includes("/submissions");
  const isTechSecyPage = currentPath.startsWith("/kriti-submission/techsecy");

  if (isSubmissionPage || isTechSecyPage) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-10">
      <button
        onClick={() => handleClick()}
        className="cursor-pointer text-white text-md md:text-base hover:text-gray-300 transition-colors"
      >
        {isSignedIn() ? "Log Out" : "Sign In"}
      </button>

      {/* {isSignedIn() && ( */}
        <button
          onClick={() => navigate("/change-password")}
          className="cursor-pointer text-white text-md md:text-base hover:text-gray-300 transition-colors"
        >
          Change Password
        </button>
      {/* )} */}
    </div>
  );
}