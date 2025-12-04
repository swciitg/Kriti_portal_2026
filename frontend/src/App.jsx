import { BrowserRouter, Routes, Route } from "react-router-dom"
import SignIn from "./pages/signIn.jsx"
import Footer from "./components/footer.jsx"
import OnboardUserPage from "./pages/createUser.jsx"
import { UserProvider } from "./context/userContext.jsx"

function App() {
  return (
    <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/onboard-user" element={<OnboardUserPage />} />
      </Routes>
    </BrowserRouter>
    <Footer/>
    </UserProvider>
  )
}

export default App
