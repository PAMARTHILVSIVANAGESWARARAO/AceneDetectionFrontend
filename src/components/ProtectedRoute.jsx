import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../services/api";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState(() => {
    try {
      const cached = sessionStorage.getItem("acnepilot_status_cache");
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(!status);

  useEffect(() => {
    const handleUpdate = () => {
      setStatus(null);
      setLoading(true);
    };
    window.addEventListener("auth:update_status", handleUpdate);
    return () => window.removeEventListener("auth:update_status", handleUpdate);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (status) {
      setLoading(false);
      return;
    }
    
    let mounted = true;
    userAPI.getUserStatus()
      .then(res => {
        if (mounted) {
          sessionStorage.setItem("acnepilot_status_cache", JSON.stringify(res.data));
          setStatus(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) setLoading(false);
      });
      
    return () => { mounted = false; };
  }, [isAuthenticated, status]);

  if (!isAuthenticated) {
    localStorage.setItem("acnepilot_last_route", location.pathname);
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0f0d 0%, #0d1f1a 40%, #0a1628 100%)" }}>
        <svg className="animate-spin h-10 w-10 text-teal-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (status) {
    const isDashboard = location.pathname.startsWith("/dashboard");
    const isUpload = location.pathname === "/onboarding/upload";
    const isQuestionnaire = location.pathname === "/onboarding/questionnaire";

    if (!status.questionnaire_completed && !isQuestionnaire) {
      return <Navigate to="/onboarding/questionnaire" replace />;
    }
    if (status.questionnaire_completed && !status.acne_analysis_completed && isDashboard) {
      return <Navigate to="/onboarding/upload" replace />;
    }
    if (status.both_completed && (isQuestionnaire || isUpload)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
