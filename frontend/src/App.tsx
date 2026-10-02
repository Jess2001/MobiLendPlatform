import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import MobiLendDashboard from './components/MobiLendDashboard';
import ApplyPage from './components/ApplyPage';
import LoanDetailsPage from './components/LoanDetailsPage';
import RepaymentPage from './components/RepaymentPage';
import VerifyAccountPage from './components/auth/VerifyAccountPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/auth/RequireAuth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes — no Layout (no dashboard nav/footer) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyAccountPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Everything else requires a verified session */}
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/" element={<MobiLendDashboard />} />
              <Route path="/apply" element={<ApplyPage />} />
              <Route path="/my-loan" element={<LoanDetailsPage />} />
              <Route path="/repayments" element={<RepaymentPage />} />
              {/* Transactions, Profile routes get added here as each
                  screen's Stitch export is converted. */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;