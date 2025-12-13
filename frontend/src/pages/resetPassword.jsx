import { useEffect, useState } from "react";
import { BACKEND_URL } from "../constants.js";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() =>{
    if(!error || error.trim().length === 0) {
      return;
    }

    const timeoutInstance = setTimeout(() => {
      setError('');
    } , 5000);
    
    return () => clearTimeout(timeoutInstance);
  } , [error]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  async function handleReset() {
    try {
            setLoading(true);
            setError("");
            setSuccess("");
            if (!newPassword || !token) {
              setError("Please enter an email address");
              setLoading(false);
              return;
            } 
      
            const response = await fetch(`${BACKEND_URL}/api/v1/auth/reset-password` , {
              method : "POST" , 
              headers : {
                "Content-type" : "application/json" , 
              } , 
              body : JSON.stringify({ newPassword , token })
            });
      
            const data = await response.json();
            if(!data.success || response.status !== 200) {
              setError(data.message);
              setLoading(false);
              return;
            }
      
            setLoading(false);
            setSuccess(data.message);
          } catch (error) {
            console.log(error);
            setError("Some Internal Error Occured");
            setLoading(false);
          }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-16">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold mb-6">
          Set New Password
        </h1>

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600 mb-3">{success}</p>
        )}

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2 border border-black-200 rounded-lg focus:outline-none focus:ring-2 mb-4"
          placeholder="Enter new password"
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}
