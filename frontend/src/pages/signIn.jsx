import { useState } from "react"
import { BACKEND_URL } from "../constants.js"
import { useContext } from "react"
import { userContext } from "../context/userContext.jsx"

export default function SignIn() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "Convener"
  })
  const { updateUser } = useContext(userContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/sign-in`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken)
      updateUser(data.user)
      // page redirect login based on role
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-5">
        <h1 className="text-2xl font-bold text-center text-gray-900">Sign In</h1>

        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <input
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Select Role</p>
          <div className="grid grid-cols-2 gap-2 text-gray-700">
            {[["SuperAdmin" , "Super Admin"], 
            ["Convener" , "Kriti Convener"], 
            ["Judge" , "Judge"], 
            ["Company" , "Company POC"], 
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
      </form>
    </div>
  )
}
