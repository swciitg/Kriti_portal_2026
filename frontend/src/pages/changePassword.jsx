import { useState , useEffect } from "react";
import { BACKEND_URL } from "../constants.js";

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
        console.log(error);
        setError("Some Internal Error Occured");
        setLoading(false);
      }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-16">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold mb-6">
          Reset Password
        </h1>
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600 mb-3">{success}</p>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring mb-4"
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
