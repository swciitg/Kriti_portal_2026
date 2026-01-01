import { useContext } from "react"
import { userContext } from "../context/userContext"
import { BACKEND_URL } from "../constants";
import { useNavigate } from "react-router-dom";

export default function AuthButton() {
    const {user , updateUser} = useContext(userContext);
    const navigate = useNavigate();

    function isSignedIn() {
        const stored = JSON.parse(localStorage.getItem("user"));
        if (!user && !stored) return false;
        return true;
    }

    async function LogoutHandler() {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${BACKEND_URL}/v1/auth/logout` , {
                method : "GET" ,
                headers : {
                    "Content-Type": "application/json"  ,
                    "Authorization" : token ? `Bearer ${token}` : ""
                }
            });

            const data = await res.json();

            if(res.status === 401 || data.success) {
                updateUser(null);
                localStorage.removeItem("accessToken");
                navigate('/sign-in');
            }
        } catch (error) {
            console.log(error);
        }
    }

    function handleClick() {
        if (isSignedIn()) {
            LogoutHandler();
        } else {
            navigate('/sign-in')
        }
    }

    // Don't show auth buttons on submission form pages (they have their own header)
    const currentPath = window.location.pathname;
    const isSubmissionPage = currentPath.includes('/submissions');
    
    if (isSubmissionPage) {
        return null; // Hide on submission pages
    }

    return  (
        <div className="fixed top-4 right-4 z-50 flex gap-2 justify-end items-center">
            <button
                onClick={() => handleClick()}
                className="bg-blue-600 text-white py-2 px-4 font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer shadow-md"
            >
                {isSignedIn() ? "Log Out" : "Sign In"}
            </button>

            {isSignedIn() && (
                <button
                    onClick={() => navigate('/change-password')}
                    className="bg-blue-600 text-white py-2 px-4 font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer shadow-md"
                >
                    Change Password
                </button>
            )}
        </div>
    )
}
