import { BrowserRouter, Routes, Route } from "react-router-dom"
import SignIn from "./pages/signIn.jsx"
import Footer from "./components/footer.jsx"
import OnboardUserPage from "./pages/convener/createUser.jsx"
import { UserProvider } from "./context/userContext.jsx"
import ConvenerDashboard from "./pages/convener/dashboard.jsx"
import AuthButton from "./components/authButton.jsx"
import SuperAdminSignIn from "./pages/superAdmin/signIn.jsx"
import SuperAdminDashboard from "./pages/superAdmin/dashboard.jsx"
import PSManager from "./pages/convener/psManager.jsx"
import PSDetails from "./pages/convener/psDetails.jsx"


function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AuthButton />
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />

          <Route path="/convener" element={<ConvenerDashboard />} />
          <Route path="/convener/onboard-user" element={<OnboardUserPage />} />
          <Route path="/convener/ps" element={<PSManager />} />
          <Route path="/convener/ps/:id" element={<PSDetails />} />

          <Route path="/superadmin/sign-in" element={<SuperAdminSignIn />} />
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
    
      </Routes>
    </BrowserRouter>
    <Footer/>

    </UserProvider>
  );
}

export default App
