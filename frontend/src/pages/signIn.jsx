import { useState, useEffect } from "react"
import { BACKEND_URL } from "../constants.js"
import { useContext } from "react"
import { userContext } from "../context/userContext.jsx"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import swcLogo from "../assets/swc.svg"
import techLogo from "../assets/tech.png"
import techSecy_bg from "../assets/techSecy_bg.png"

export default function SignIn() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "Convener"
  })
  const { user, updateUser } = useContext(userContext)
  const navigate = useNavigate()

  const [error, setError] = useState("")

  const [showPassword , setShowPassword] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (user || stored) {
      const currentUser = user || stored;
      if (currentUser.role === "Convener") {
        navigate("/convener");
      } else if (currentUser.role === "Judge") {
        navigate("/judge/dashboard");
      } else if (currentUser.role === "Company") {
        navigate("/company/dashboard");
      } else if (currentUser.role === "TechSecy") {
        navigate("/techsecy");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch(`${BACKEND_URL}/v1/auth/sign-in`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json()

      if(!(data.success)) {
        // Check if it's a verified judge/company trying to login
        if (data.verified) {
          if (data.accessRequestPending) {
            setError("Your marks have been verified and your access request is pending. Please wait for convener approval.")
          } else {
            setError("Your marks have been verified. You can no longer access the system. If you need to make changes, please request access from the dashboard.")
          }
        } else {
          setError(data.message || "Failed")
        }
        return
      }

      if (data.accessToken){
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        updateUser(data.user);
      }

      if(data.user.role === "Convener") {
        navigate('/convener')
      }

      if(data.user.role === "Judge") {
        navigate('/judge/dashboard')
      }

      if(data.user.role === "Company") {
        navigate('/company/dashboard')
      }
      if (data.user.role === "TechSecy") {
        navigate("/techsecy");
      }

    } catch (error) {
      setError("Something went wrong")
    }
  }

  return (
<div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-8" 
      style={{ backgroundImage: `url(${techSecy_bg})` }}>
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-[#1a1d2e] rounded-xl shadow-lg p-6 space-y-6 border border-gray-800">
          <div className="flex items-center justify-center gap-1 mb-2">
            <img src={techLogo} alt="Tech Logo" className="h-12 w-12 rounded-lg" />
            <h1 className="text-3xl font-bold text-white">Sign In</h1>
          </div>

          <p className="text-sm text-gray-400 text-center">Welcome to Kriti Portal</p>

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-[#0f1219] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2 bg-[#0f1219] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Convener", "Kriti Convener"],
                  ["Company", "Submission Judge"],
                  ["Judge", "Problem Statement Judge"],
                  ["TechSecy", "Hostel Technical Secretary"]
                ].map(r => (
                  <label
                    key={r[0]}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                      form.role === r[0]
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-[#0f1219] hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r[0]}
                      checked={form.role === r[0]}
                      onChange={() => setForm({ ...form, role: r[0] })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-200">{r[1]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
