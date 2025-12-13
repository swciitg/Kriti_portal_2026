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
            const res = await fetch(`${BACKEND_URL}/api/v1/auth/logout` , {
                method : "GET" , 
                headers : {
                    "Content-Type": "application/json"  ,
                    "Authorization" : localStorage.getItem("accessToken")
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

    return  (
        <div className="fixed top-0 right-0 flex justify-between items-center">
        <button
            onClick={() => handleClick()}
            className=" bg-blue-600 text-white py-2 px-4 font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer"
        >
          { 
            isSignedIn()? 
            "Log Out" : "Sign In"
          }
        </button>

            <button
            onClick={() => {
                navigate('/change-password')
            }}
                className="m-2 bg-blue-600 text-white py-2 px-4 font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer"
            >
                Change Password
            </button>
        
        
        </div>
    )

}