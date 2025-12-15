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
import PSCreate from "./pages/convener/psCreate.jsx"
import JudgeRequests from "./pages/convener/judgeRequests.jsx"
import CompanyRequests from "./pages/convener/companyRequests.jsx"
import TechSecyDashboard from "./pages/techSecy/dashboard.jsx"
import PSScreen from "./pages/techSecy/components/psScreen.jsx"
import RegisterTeam from "./pages/techSecy/components/registerTeam.jsx"
import JudgeDashboard from "./pages/judge/dashboard.jsx"
import HostelJudging from "./pages/judge/HostelJudging.jsx"
import CompanyDashboard from "./pages/company/dashboard.jsx"
import SubmissionJudging from "./pages/company/SubmissionJudging.jsx"


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
          <Route path="/convener/ps/create" element={<PSCreate />} />
          <Route path="/convener/ps/:id" element={<PSDetails />} />
          <Route path="/convener/judge-requests" element={<JudgeRequests />} />
          <Route path="/convener/company-requests" element={<CompanyRequests />} />

          <Route path="/superadmin/sign-in" element={<SuperAdminSignIn />} />
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/techsecy" element={<TechSecyDashboard />} />
          <Route path="/techsecy/register-team" element={<PSScreen />} />
          <Route
            path="/techsecy/register-team/:psId"
            element={<RegisterTeam />}
          />

          <Route path="/judge/dashboard" element={<JudgeDashboard />} />
          <Route path="/judge/hostel/:hostelId" element={<HostelJudging />} />

          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/hostel/:hostelId" element={<SubmissionJudging />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </UserProvider>
  );
}

export default App
