import { BrowserRouter, Routes, Route } from "react-router-dom"
import SignIn from "./pages/signIn.jsx"
import Footer from "./components/footer.jsx"
import OnboardUserPage from "./pages/convener/createUser.jsx"
import { UserProvider } from "./context/userContext.jsx"
import ConvenerDashboard from "./pages/convener/dashboard.jsx"
import AuthButton from "./components/authButton.jsx"

function App() {
  return (
    <UserProvider>
    <BrowserRouter>
    
    <AuthButton/>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />

        <Route path="/convener" element={<ConvenerDashboard />} />
        <Route path="/convener/onboard-user" element={<OnboardUserPage />} />
      </Routes>
    </BrowserRouter>
    <Footer/>
    </UserProvider>
  )
}

export default App
