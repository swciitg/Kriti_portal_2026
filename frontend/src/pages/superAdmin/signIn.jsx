import { useState , useContext } from "react"
import { useNavigate } from "react-router-dom"
import { userContext } from "../../context/userContext.jsx"
import { Eye, EyeOff } from "lucide-react"

export default function SignIn() {
  const [form, setForm] = useState({
    publicKey: "",
    privateKey: ""
  })

  const { updateUser } = useContext(userContext)
  const navigate = useNavigate()

  const [error, setError] = useState("")

  const [showPublicKey, setShowPublicKey] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch(`/api/v1/superadmin/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || "Failed")
        return
      }

      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken)
      updateUser(data.user)

      // redirect based on role

    } catch (error) {
      setError("Something went wrong")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-5">
        
        <h1 className="text-2xl font-bold text-center text-gray-900">Sign In</h1>

        {error && <p className="text-center text-red-600">{error}</p>}

        {/* Public Key */}
        <div className="relative">
          <input
            type={showPublicKey ? "text" : "password"}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
            placeholder="Key of Technical Board General Secretary"
            value={form.publicKey}
            onChange={(e) => setForm({ ...form, publicKey: e.target.value })}
          />
          <span
            className="absolute right-3 top-3 cursor-pointer"
            onClick={() => setShowPublicKey(!showPublicKey)}
          >
            {showPublicKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {/* Private Key */}
        <div className="relative">
          <input
            type={showPrivateKey ? "text" : "password"}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
            placeholder="Key of Technical Board Chairperson"
            value={form.privateKey}
            onChange={(e) => setForm({ ...form, privateKey: e.target.value })}
          />
          <span
            className="absolute right-3 top-3 cursor-pointer"
            onClick={() => setShowPrivateKey(!showPrivateKey)}
          >
            {showPrivateKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Sign In
        </button>

        <p
        onClick={() => {
            navigate('/sign-in')
        }}
        className="text-blue-500 text-md cursor-pointer"
        >   
            Sign-In for a different role
        </p>

      </form>
    </div>
  )
}
