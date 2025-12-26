import { useState } from "react"
import { BACKEND_URL } from "../constants.js"
import { useContext } from "react"
import { userContext } from "../context/userContext.jsx"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"

export default function SignIn() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "Convener"
  })
  const { updateUser } = useContext(userContext)
  const navigate = useNavigate()

  const [error, setError] = useState("")

  const [showPassword , setShowPassword] = useState(false);

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
      // page redirect login based on role

    } catch (error) {
      setError("Something went wrong")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-5">
        <h1 className="text-2xl font-bold text-center text-gray-900">Sign In</h1>

        {error && (
          <p className="w-full text-center text-red-600 text-md">{error}</p>
        )}

        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <div className="relative">
          <input
          type={showPassword ? "text" : "password"}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <span
          className="absolute right-3 top-3 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Select Role</p>
          <div className="grid grid-cols-2 gap-2 text-gray-700">
            {[
            // ["SuperAdmin" , "Super Admin"],
            ["Convener" , "Kriti Convener"],
            ["Company" , "Company POC"],
            ["Judge" , "Problem Statement Judge"],
            ["TechSecy" , "Hostel Technical Secretary"]].map(r => (
              <label key={r[0]} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={r[0]}
                  checked={form.role === r[0]}
                  onChange={() => setForm({ ...form, role: r[0] })}
                />
                <span className="text-sm font-semibold">{r[1]}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer"
        >
          Sign In
        </button>

        <p
        onClick={() => {
            navigate('/superadmin/sign-in')
        }}
        className="text-blue-500 text-md cursor-pointer"
        >
            Sign-In as Super Admin
        </p>
      
        <p
        onClick={() => {
            navigate('/change-password')
        }}
        className="text-blue-500 text-md cursor-pointer"
        >
            Change Password
        </p>
      </form>
    </div>
  )
}
