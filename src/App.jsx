import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Landing
import Hero from "./HeroPage/Hero";
import NotFoundPage from "./HeroPage/NotFound/NotFoundPage";

// Auth
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import VerifyOtp from "./Pages/VerifyOtp";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

// Onboarding
import Questionnaire from "./Pages/Onboarding/Questionnaire";
import AcneUpload from "./Pages/Onboarding/AcneUpload";

// Dashboard
import DashboardLayout from "./Pages/Dashboard/DashboardLayout";
import DashboardHome from "./Pages/Dashboard/DashboardHome";
import TreatmentPlan from "./Pages/Dashboard/TreatmentPlan";
import TreatmentHistory from "./Pages/Dashboard/TreatmentHistory";
import Profile from "./Pages/Dashboard/Profile";

// Guards
import ProtectedRoute from "./components/ProtectedRoute";

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    const skipRoutes = ["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password"];
    const path = location.pathname;
    const token = localStorage.getItem("acnepilot_token");
    if (token && !skipRoutes.some(route => path.startsWith(route))) {
      localStorage.setItem("acnepilot_last_route", path);
    }
  }, [location]);
  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <RouteTracker />
      <Toaster position="top-center" toastOptions={{
        style: {
          background: "rgba(15,25,20,0.95)",
          color: "#e2e8f0",
          border: "1px solid rgba(20,184,166,0.25)",
          backdropFilter: "blur(12px)",
        }
      }} />
      <Routes>
        {/* Public landing */}
        <Route path="/" element={<Hero />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Onboarding - protected */}
        <Route path="/onboarding/questionnaire" element={
          <ProtectedRoute><Questionnaire /></ProtectedRoute>
        } />
        <Route path="/onboarding/upload" element={
          <ProtectedRoute><AcneUpload /></ProtectedRoute>
        } />

        {/* Dashboard - protected + nested layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardLayout /></ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="treatment" element={<TreatmentPlan />} />
          <Route path="history" element={<TreatmentHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;