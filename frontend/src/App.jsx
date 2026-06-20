import { Route, Routes } from 'react-router-dom';
import NavBar from './components/layout/NavBar.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import CalculatorsPage from './pages/CalculatorsPage.jsx';
import TrackerPage from './pages/TrackerPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MotivationPage from './pages/MotivationPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen pt-[104px] md:pt-[60px]">
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/motivation" element={<MotivationPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/tracker"
            element={
              <ProtectedRoute>
                <TrackerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
