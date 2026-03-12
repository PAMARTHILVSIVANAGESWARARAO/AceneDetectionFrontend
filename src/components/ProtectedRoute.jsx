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
      .catch(() => {
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
      <>
        <style>{`
          @keyframes pr-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
          @keyframes pr-spin    { to{transform:rotate(360deg)} }
          @keyframes pr-pulse   { 0%,100%{opacity:1} 50%{opacity:0.45} }
          @keyframes pr-fadeup  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        `}</style>

        <div style={{
          minHeight: "100vh",
          background: "linear-gradient(145deg,#f0fdfa 0%,#e6fffa 35%,#f0f9ff 70%,#ecfdf5 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          {/* Blobs */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
            <div style={{ position:"absolute",top:"-10%",left:"-8%",width:420,height:420,borderRadius:"50%",
              background:"radial-gradient(circle,rgba(20,184,166,0.2) 0%,transparent 70%)",filter:"blur(65px)" }}/>
            <div style={{ position:"absolute",bottom:"-10%",right:"-8%",width:360,height:360,borderRadius:"50%",
              background:"radial-gradient(circle,rgba(14,165,233,0.13) 0%,transparent 70%)",filter:"blur(60px)" }}/>
            <div style={{ position:"absolute",inset:0,opacity:0.25,
              backgroundImage:"radial-gradient(circle,#99f6e4 1px,transparent 1px)",
              backgroundSize:"28px 28px" }}/>
          </div>

          {/* Card */}
          <div style={{
            position: "relative",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: "1.5px solid rgba(20,184,166,0.22)",
            borderRadius: 24, padding: "40px 48px",
            boxShadow: "0 8px 32px rgba(15,118,110,0.1),inset 0 1px 0 rgba(255,255,255,0.9)",
            animation: "pr-fadeup 0.4s ease both",
          }}>
            {/* Logo */}
            <div style={{ display:"flex",alignItems:"center",gap:9 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "linear-gradient(135deg,#0f766e,#14b8a6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(13,148,136,0.35)",
              }}>
                <i className="bi bi-activity" style={{ color:"white", fontSize:14 }}/>
              </div>
              <span style={{
                fontSize: 18, fontWeight: 900, letterSpacing: "-0.4px",
                background: "linear-gradient(135deg,#0f766e,#0ea5e9)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>AcnePilot</span>
            </div>

            {/* Spinner ring */}
            <div style={{ position:"relative",width:56,height:56 }}>
              {/* Track */}
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none"
                style={{ position:"absolute",inset:0 }}>
                <circle cx="28" cy="28" r="24"
                  stroke="rgba(20,184,166,0.15)" strokeWidth="4"/>
              </svg>
              {/* Spinning arc */}
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none"
                style={{ position:"absolute",inset:0,animation:"pr-spin 0.85s linear infinite" }}>
                <circle cx="28" cy="28" r="24"
                  stroke="url(#pr-grad)" strokeWidth="4"
                  strokeLinecap="round" strokeDasharray="38 113"/>
                <defs>
                  <linearGradient id="pr-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0f766e"/>
                    <stop offset="100%" stopColor="#2dd4bf"/>
                  </linearGradient>
                </defs>
              </svg>
              {/* Centre dot */}
              <div style={{
                position:"absolute",inset:0,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
                <div style={{
                  width:10,height:10,borderRadius:"50%",
                  background:"linear-gradient(135deg,#0f766e,#14b8a6)",
                  animation:"pr-pulse 1.4s ease-in-out infinite",
                }}/>
              </div>
            </div>

            {/* Text */}
            <div style={{ textAlign:"center",display:"flex",flexDirection:"column",gap:5 }}>
              <p style={{ margin:0,fontSize:15,fontWeight:700,color:"#0f2b27" }}>
                Verifying your session
              </p>
              <p style={{ margin:0,fontSize:12,color:"#5eada0",lineHeight:1.5 }}>
                Checking your account status…
              </p>
            </div>

            {/* Skeleton content preview */}
            <div style={{ width:"100%",display:"flex",flexDirection:"column",gap:8,marginTop:4 }}>
              {[80,55,70].map((w,i) => (
                <div key={i} style={{
                  width:`${w}%`,height:10,borderRadius:6,marginInline:"auto",
                  background:"linear-gradient(90deg,#e0f2f1 25%,#b2dfdb 50%,#e0f2f1 75%)",
                  backgroundSize:"200% 100%",
                  animation:`pr-shimmer 1.5s ${i*0.18}s infinite`,
                }}/>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (status) {
    const isDashboard     = location.pathname.startsWith("/dashboard");
    const isUpload        = location.pathname === "/onboarding/upload";
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