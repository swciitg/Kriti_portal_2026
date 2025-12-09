import { useState } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"

export default function SideBar({activePage , setActivePage})  {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const pages = ["Problem Statements", "Score Table", "Schedule"]

    return (
        <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 
                ${sidebarOpen ? "w-64" : "w-6 lg:w-12"}`}>
        
                <div className="flex items-center justify-between p-1 lg:p-4 ">
                  {sidebarOpen && (
                    <h2 className="font-bold text-3xl text-blue-600 pt-4 pl-2 lg:pl-0 lg:pt-0">
                      Super Admin
                    </h2>
                  )}
        
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="cursor-pointer">
                    {sidebarOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
                  </button>
              </div>
        
              {sidebarOpen && (
                <nav className="mt-4 ">
                  {pages.map((p) => (
                    <button
                      key={p}
                      onClick={() => setActivePage(p)}
                      className={`w-full text-left px-5 py-4 text-md font-semibold transition cursor-pointer
                      ${activePage === p ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}
                    >
                      {p}
                    </button>
                  ))}
                </nav>
              )}
            </div>
    )
}