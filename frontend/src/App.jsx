import { BrowserRouter, Routes, Route } from "react-router-dom"
import SignIn from "./pages/signIn.jsx"
import Footer from "./components/footer.jsx"
import OnboardUserPage from "./pages/convener/createUser.jsx"
import { UserProvider } from "./context/userContext.jsx"
import ConvenerDashboard from "./pages/convener/dashboard.jsx"
import ConvenerGuidelines from "./pages/convener/guidelines.jsx"
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
import RequestPasswordReset from "./pages/changePassword.jsx";
import ResetPassword from "./pages/resetPassword.jsx";
import TeamRequestAll from "./pages/convener/teamRequestAll.jsx";
import SubmissionsPage from "./pages/techSecy/submissions.jsx";
import SubmissionForm from "./pages/techSecy/submissionForm.jsx";
import ViewSubmission from "./pages/techSecy/viewSubmission.jsx";
import Guidelines from "./pages/techSecy/guidelines.jsx"
import ProblemStatementsForTechSecy from "./pages/techSecy/problemStatements.jsx"


function App() {
  return (
    <UserProvider>
      <BrowserRouter basename="/kriti-submission">
        <AuthButton />
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/change-password" element={<RequestPasswordReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/convener" element={<ConvenerDashboard />} />
          <Route path="/convener/guidelines" element={<ConvenerGuidelines />} />
          <Route path="/convener/onboard-user" element={<OnboardUserPage />} />
          <Route path="/convener/ps" element={<PSManager />} />
          <Route path="/convener/ps/create" element={<PSCreate />} />
          <Route path="/convener/ps/:id" element={<PSDetails />} />
          <Route path="/convener/judge-requests" element={<JudgeRequests />} />
          <Route path="/convener/company-requests" element={<CompanyRequests />} />
          <Route path="/convener/team-requests" element={<TeamRequestAll />} />

          <Route path="/superadmin/sign-in" element={<SuperAdminSignIn />} />
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/techsecy" element={<TechSecyDashboard />} />
          <Route path="/techsecy/register-team" element={<PSScreen />} />
          <Route
            path="/techsecy/register-team/:psId"
            element={<RegisterTeam />}
          />

          <Route path="/techsecy/submissions" element={<SubmissionsPage />} />
          <Route path="/techsecy/submissions/submit/:psId" element={<SubmissionForm />} />
          <Route path="/techsecy/submissions/view/:submissionId" element={<ViewSubmission />} />
          <Route path="/techsecy/guidelines" element={<Guidelines />} />
          <Route path="/techsecy/problem-statements" element={<ProblemStatementsForTechSecy />} />

          <Route path="/judge/dashboard" element={<JudgeDashboard />} />
          <Route path="/judge/hostel/:hostelId" element={<HostelJudging />} />

          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route
            path="/company/hostel/:hostelId"
            element={<SubmissionJudging />}
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
