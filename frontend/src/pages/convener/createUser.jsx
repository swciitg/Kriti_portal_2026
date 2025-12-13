import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { userContext } from "../../context/userContext"
import { BACKEND_URL } from "../../constants"
import { Eye, EyeOff } from "lucide-react"

export default function OnboardUserPage() {
  const navigate = useNavigate()
  const { user } = useContext(userContext)

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "TechSecy",
    hostelId: "",
    ps: ""
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [showPassword , setShowPassword] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Convener" && user?.role !== "Convener")
    ) {
      navigate("/sign-in");
    }
  }, [user])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BACKEND_URL}/api/v1/convener/create-user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!(data.success)) {
        setError(data.message || "Failed")
        setLoading(false)
        return
      }

      setLoading(false)
    } catch (err) {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Onboard User</h1>

        {error && (
          <p className="w-full text-center text-red-600 text-md">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full border rounded-lg px-4 py-2 outline-none"
            value={form.username}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-2 outline-none"
            value={form.email}
            onChange={handleChange}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full border rounded-lg px-4 py-2 outline-none"
              value={form.password}
              onChange={handleChange}
            />

            <span
              className="absolute right-3 top-3 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-gray-700 text-md font-semibold">Role</p>
            <div className="flex flex-col gap-2">
              {[["TechSecy" , "Hostel Technical Secretary"],
              ["Judge" , "Judge"],
              ["Company" , "Company POC"]].map(r => (
                <label key={r[0]} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value={r[0]}
                    checked={form.role === r[0]}
                    onChange={handleChange}
                  />
                  <span className="text-gray-700 font-semibold">{r[1]}</span>
                </label>
              ))}
            </div>
          </div>

          {form.role === "TechSecy" && (
            <input
              type="text"
              name="hostelId"
              placeholder="Hostel ID"
              className="w-full border rounded-lg px-4 py-2 outline-none"
              value={form.hostelId}
              onChange={handleChange}
            />
          )}

          {form.role === "Judge" && (
            <input
              type="text"
              name="ps"
              placeholder="Problem Statement Name"
              className="w-full border rounded-lg px-4 py-2 outline-none"
              value={form.ps}
              onChange={handleChange}
            />
          )}

          {form.role === "Company" && (
            <input
              type="text"
              name="ps"
              placeholder="Problem Statement Name"
              className="w-full border rounded-lg px-4 py-2 outline-none"
              value={form.ps}
              onChange={handleChange}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  )
}
