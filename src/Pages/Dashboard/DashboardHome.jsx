import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userAPI, treatmentAPI, authAPI } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const SEVERITY_COLORS = {
  cleanskin: { bg: "rgba(20,184,166,0.15)", border: "#14b8a6", text: "#14b8a6", label: "Clear Skin", icon: "bi-emoji-smile" },
  mild: { bg: "rgba(234,179,8,0.12)", border: "#eab308", text: "#eab308", label: "Mild", icon: "bi-exclamation-circle" },
  moderate: { bg: "rgba(249,115,22,0.12)", border: "#f97316", text: "#f97316", label: "Moderate", icon: "bi-exclamation-triangle" },
  "moderate-severe": { bg: "rgba(239,68,68,0.12)", border: "#ef4444", text: "#ef4444", label: "Moderate-Severe", icon: "bi-exclamation-octagon" },
  severe: { bg: "rgba(220,38,38,0.15)", border: "#dc2626", text: "#dc2626", label: "Severe", icon: "bi-shield-exclamation" },
};

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <svg className="animate-spin h-10 w-10 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#14b8a6" strokeWidth="4" />
        <path className="opacity-75" fill="#14b8a6" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-slate-400 text-sm">Loading your dashboard...</p>
    </div>
  </div>
);

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);
  const [startingPlan, setStartingPlan] = useState(false);
  const [userData, setUserData] = useState(null);
  const [status, setStatus] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [uRes, sRes] = await Promise.all([
          userAPI.getMyUserInfo(),
          userAPI.getUserStatus(),
        ]);
        setUserData(uRes.data);
        setStatus(sRes.data);

        if (sRes.data.both_completed) {
          try {
            const tRes = await treatmentAPI.getStatus();
            setTreatmentPlan(tRes.data);
          } catch (e) {
            // No treatment plan yet
          }
        }

        const cRes = await authAPI.getUserCount();
        setUserCount(cRes.data.totalUsers);
      } catch (e) {
        toast.error("Failed to load data");
      } finally {
        setPageLoading(false);
      }
    };
    init();
  }, []);

  const handleGeneratePlan = async () => {
    setStartingPlan(true);
    try {
      const res = await treatmentAPI.generateDayOne();
      toast.success("Day 1 treatment plan generated!");
      const tRes = await treatmentAPI.getStatus();
      setTreatmentPlan(tRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate plan";
      if (msg.includes("already")) {
        const tRes = await treatmentAPI.getStatus();
        setTreatmentPlan(tRes.data);
      } else {
        toast.error(msg);
      }
    } finally {
      setStartingPlan(false);
    }
  };

  if (pageLoading) return <Spinner />;

  const username = userData?.user?.username || "User";
  const severity = treatmentPlan?.overallSeverity;
  const sev = SEVERITY_COLORS[severity];
  const today = treatmentPlan?.days?.find(d => d.day === treatmentPlan?.currentDay);
  const daysCompleted = treatmentPlan?.totalDaysCompleted || 0;

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <Toaster position="top-center" />

      {/* Welcome header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Welcome back, <span style={{ background: "linear-gradient(90deg, #14b8a6, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{username}</span> 👋
            </h1>
          </div>
          {severity && sev && (
            <div className="flex-shrink-0 px-4 py-2 rounded-2xl text-center hidden sm:block"
              style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
              <p className="text-xs text-slate-400 mb-0.5">Severity</p>
              <p className="text-sm font-bold" style={{ color: sev.text }}>{sev.label}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Current Day", value: treatmentPlan ? `Day ${treatmentPlan.currentDay}` : "—", icon: "bi-calendar-check", color: "#14b8a6" },
          { label: "Days Completed", value: daysCompleted, icon: "bi-check-circle", color: "#0ea5e9" },
          { label: "Skin Severity", value: sev?.label || "Pending", icon: sev?.icon || "bi-activity", color: sev?.text || "#64748b" },
          { label: "Community", value: userCount ? `${userCount}+ users` : "...", icon: "bi-people", color: "#a78bfa" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-3">
              <i className={`bi ${icon} text-base`} style={{ color }}></i>
              <span className="text-slate-400 text-xs">{label}</span>
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Onboarding state */}
      {!status?.both_completed ? (
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(20,184,166,0.2)" }}>
          <h2 className="text-white font-bold text-lg mb-4">Complete Your Setup</h2>
          <div className="space-y-3">
            {[
              { done: status?.questionnaire_completed, label: "Health Questionnaire", to: "/onboarding/questionnaire", step: "1" },
              { done: status?.acne_analysis_completed, label: "Acne Image Analysis", to: "/onboarding/upload", step: "2" },
            ].map(({ done, label, to, step }) => (
              <div key={step} className="flex items-center justify-between gap-4 p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${done ? "rgba(20,184,166,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: done ? "rgba(20,184,166,0.8)" : "rgba(255,255,255,0.08)", color: done ? "white" : "#64748b" }}>
                    {done ? <i className="bi bi-check"></i> : step}
                  </div>
                  <span className="text-sm" style={{ color: done ? "#14b8a6" : "white" }}>{label}</span>
                </div>
                {!done && (
                  <Link to={to} className="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
                    style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
                    Start
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : !treatmentPlan ? (
        /* Generate plan CTA */
        <div className="rounded-2xl p-8 mb-6 text-center"
          style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.2)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.3)" }}>
            <i className="bi bi-cpu text-teal-400 text-2xl"></i>
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Ready to Start Treatment</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Your acne analysis is complete. Let our AI generate a personalized Day 1 treatment plan for you.
          </p>
          <button id="generate-plan-btn" onClick={handleGeneratePlan} disabled={startingPlan}
            className="px-8 py-3 rounded-xl font-semibold text-white text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)", opacity: startingPlan ? 0.7 : 1 }}>
            {startingPlan ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating with AI...
              </span>
            ) : <><i className="bi bi-magic mr-2"></i>Generate My Treatment Plan</>}
          </button>
        </div>
      ) : (
        /* Today's plan preview */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Today's Plan — Day {treatmentPlan.currentDay}</h2>
            <Link to="/dashboard/treatment" className="text-teal-400 hover:text-teal-300 text-sm transition-colors">
              Full plan <i className="bi bi-arrow-right ml-1"></i>
            </Link>
          </div>

          {today && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {[
                { session: "Morning", icon: "bi-sunrise", treatment: today.morning?.treatment, done: today.morning?.completed, color: "#f59e0b" },
                { session: "Afternoon", icon: "bi-sun", treatment: today.afternoon?.treatment, done: today.afternoon?.completed, color: "#0ea5e9" },
                { session: "Evening", icon: "bi-moon-stars", treatment: today.evening?.treatment, done: today.evening?.completed, color: "#a78bfa" },
              ].map(({ session, icon, treatment, done, color }) => (
                <div key={session} className="rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <i className={`bi ${icon}`} style={{ color }}></i>
                    <span className="text-xs font-semibold" style={{ color }}>{session}</span>
                    {done && <i className="bi bi-check-circle-fill text-teal-400 text-xs ml-auto"></i>}
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">{treatment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Motivation */}
          {today?.motivation && (
            <div className="rounded-2xl p-4"
              style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.15)" }}>
              <i className="bi bi-quote text-teal-400 text-xl mr-2"></i>
              <span className="text-teal-300 text-sm italic">{today.motivation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
