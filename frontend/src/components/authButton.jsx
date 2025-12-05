import { useContext } from "react"
import { userContext } from "../context/userContext"
import { BACKEND_URL } from "../constants";
import { useNavigate } from "react-router-dom";

export default function AuthButton() {

    const {user , updateUser} = useContext(userContext);
    const navigate = useNavigate();

    async function LogoutHandler() {
        const res = await fetch(`${BACKEND_URL}/api/v1/auth/logout` , {
            method : "GET" , 
            headers : {
                "Content-Type": "application/json"  ,
                "Authorization" : localStorage.getItem("accessToken")
            }
        });
        const data = await res.json();

        if(data.success) {
            updateUser(null);
            localStorage.removeItem("accessToken");
            navigate('/sign-in');
        } 
        
    }

    function handleClick() {
        if(!user && !localStorage.getItem("user") && !localStorage.getItem("accessToken")) {
            navigate('/sign-in')
        } else {
            LogoutHandler();
        }    
    }

    return  (
        <>
        <button
            onClick={() => handleClick()}
            className="fixed top-0 right-0 m-2 bg-blue-600 text-white py-2 px-4 font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer"
        >
          {
            (!user && !localStorage.getItem("user") && !localStorage.getItem("accessToken")) ? 
            "Sign In" : "Log Out"
          }
        </button>
        
        </>
    )

}