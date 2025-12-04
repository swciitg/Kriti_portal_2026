import { createContext, useState, useEffect } from "react"

export const userContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem("user")
    if (data) setUser(JSON.parse(data))
  }, [])

  const updateUser = u => {
    setUser(u)
    if (u) localStorage.setItem("user", JSON.stringify(u))
    else localStorage.removeItem("user")
  }

  return (
    <userContext.Provider value={{ user, updateUser }}>
      {children}
    </userContext.Provider>
  )
}
