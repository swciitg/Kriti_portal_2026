import { useState , useEffect } from "react";
import { BACKEND_URL } from "../constants.js";
import techSecy_bg from "../assets/techsecy_bg.png"

export default function RequestPasswordReset() {
  const [email, setEmail] = useState("");
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

  async function handleSubmit() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        if (!email) {
          setError("Please enter an email address");
          setLoading(false);
          return;
        } 
  
        const response = await fetch(`${BACKEND_URL}/v1/auth/request-password-change` , {
          method : "POST" , 
          headers : {
            "Content-type" : "application/json" , 
          } , 
          body : JSON.stringify({ email })
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
        // console.log(error);
        setError("Some Internal Error Occured");
        setLoading(false);
      }
  }


  return (
<div className="min-h-screen  bg-cover bg-center bg-no-repeat  flex items-center justify-center px-16"
    style={{ backgroundImage: `url(${techSecy_bg})` }}>
      <div className="w-full max-w-md bg-[#1a1d2e] rounded-xl shadow-lg p-8 border border-gray-800">
        <h1 className="text-2xl font-semibold mb-6 text-white">
          Reset Password
        </h1>
        {error && (
          <p className="text-sm text-red-400 mb-3 bg-red-900/20 border border-red-700 rounded-lg p-3">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-400 mb-3 bg-green-900/20 border border-green-700 rounded-lg p-3">{success}</p>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 bg-[#0f1219] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors mb-4"
          placeholder="Enter your registered Email ID"
        />


        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

      </div>
    </div>
  );
}
