import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { OnboardedRoute, ProtectedRoute, PublicOnlyRoute } from "@/components/RouteGuards";
import Dashboard from "@/pages/Dashboard";
import ForgotPassword from "@/pages/ForgotPassword";
import Index from "@/pages/Index";
import Interview from "@/pages/Interview";
import InterviewHistory from "@/pages/InterviewHistory";
import InterviewResults from "@/pages/InterviewResults";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import ResetPassword from "@/pages/ResetPassword";
import Signup from "@/pages/Signup";

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<OnboardedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<InterviewHistory />} />
                <Route path="/interview" element={<Interview />} />
                <Route path="/interview/:id" element={<InterviewResults />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProfileProvider>
    </AuthProvider>
  );
}
