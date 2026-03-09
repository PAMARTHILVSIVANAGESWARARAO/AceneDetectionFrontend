import React, { useState, useEffect } from "react";
import { treatmentAPI } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const SEVERITY_COLORS = {
  cleanskin: { text: "#14b8a6", label: "Clear Skin" },
  mild: { text: "#eab308", label: "Mild" },
  moderate: { text: "#f97316", label: "Moderate" },
  "moderate-severe": { text: "#ef4444", label: "Moderate-Severe" },
  severe: { text: "#dc2626", label: "Severe" },
};

const TreatmentHistory = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    treatmentAPI.getStatus()
      .then(res => setPlan(res.data))
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#14b8a6" strokeWidth="4" />
        <path className="opacity-75" fill="#14b8a6" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  if (!plan) return (
    <div className="p-8 text-center">
      <i className="bi bi-calendar-x text-slate-600 text-4xl mb-3 block"></i>
      <p className="text-slate-400">No treatment history found. Start your treatment first.</p>
    </div>
  );

  const sev = SEVERITY_COLORS[plan.overallSeverity];
  const completedDays = plan.days?.filter(d => d.feedback !== null) || [];
  const positives = completedDays.filter(d => d.feedback === "positive").length;
  const negatives = completedDays.filter(d => d.feedback === "negative").length;
  const streakDays = (() => {
    let s = 0;
    for (let i = completedDays.length - 1; i >= 0; i--) {
      if (completedDays[i].feedback === "positive") s++;
      else break;
    }
    return s;
  })();

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Treatment Progress</h1>
        <p className="text-slate-400 text-sm">Tracking your skincare journey day by day</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Days", value: plan.currentDay - 1, icon: "bi-calendar3", color: "#14b8a6" },
          { label: "Completed", value: completedDays.length, icon: "bi-check-lg", color: "#0ea5e9" },
          { label: "Positive", value: positives, icon: "bi-hand-thumbs-up", color: "#22c55e" },
          { label: "Positive Streak", value: streakDays, icon: "bi-lightning-charge", color: "#f59e0b" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <i className={`bi ${icon} text-xl mb-2 block`} style={{ color }}></i>
            <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
            <p className="text-slate-400 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {completedDays.length > 0 && (
        <div className="rounded-2xl p-5 mb-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm font-medium">Positive Response Rate</span>
            <span className="text-sm font-bold" style={{ color: "#22c55e" }}>
              {completedDays.length > 0 ? Math.round((positives / completedDays.length) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${completedDays.length > 0 ? (positives / completedDays.length) * 100 : 0}%`,
                background: "linear-gradient(90deg, #14b8a6, #22c55e)"
              }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-500">● <span style={{ color: "#22c55e" }}>Positive: {positives}</span></span>
            <span className="text-xs text-slate-500">● <span style={{ color: "#ef4444" }}>Negative: {negatives}</span></span>
          </div>
        </div>
      )}

      {/* Day timeline */}
      <div className="space-y-3">
        {plan.days?.length === 0 && (
          <div className="text-center py-12">
            <i className="bi bi-clock-history text-slate-600 text-4xl mb-3 block"></i>
            <p className="text-slate-400">Your treatment history will appear here.</p>
          </div>
        )}
        {[...(plan.days || [])].reverse().map((day) => {
          const isOpen = expanded === day.day;
          const isCurrent = day.day === plan.currentDay;
          const feedbackColor = day.feedback === "positive" ? "#22c55e" : day.feedback === "negative" ? "#ef4444" : null;

          return (
            <div key={day.day} className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: isCurrent ? "1px solid rgba(20,184,166,0.35)" : "1px solid rgba(255,255,255,0.06)"
              }}>
              {/* Day row */}
              <button id={`day-row-${day.day}`} className="w-full text-left" onClick={() => setExpanded(isOpen ? null : day.day)}>
                <div className="flex items-center gap-3 px-5 py-4">
                  {/* Day number */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{
                      background: isCurrent ? "linear-gradient(135deg, #0f766e, #14b8a6)" : day.feedback ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                      color: isCurrent ? "white" : "rgba(255,255,255,0.6)"
                    }}>
                    {day.day}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">Day {day.day}</span>
                      {isCurrent && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(20,184,166,0.15)", color: "#14b8a6", border: "1px solid rgba(20,184,166,0.3)" }}>
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{day.morning?.treatment?.substring(0, 60)}...</p>
                  </div>

                  {/* Feedback badge */}
                  {day.feedback && (
                    <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: `${feedbackColor}18`, color: feedbackColor, border: `1px solid ${feedbackColor}40` }}>
                      <i className={`bi ${day.feedback === "positive" ? "bi-hand-thumbs-up" : "bi-hand-thumbs-down"}`}></i>
                      {day.feedback.charAt(0).toUpperCase() + day.feedback.slice(1)}
                    </div>
                  )}

                  <i className={`bi bi-chevron-${isOpen ? "up" : "down"} text-slate-500 text-xs flex-shrink-0`}></i>
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="pt-3 space-y-2">
                    {[
                      { session: "Morning", icon: "bi-sunrise", treatment: day.morning?.treatment, color: "#f59e0b" },
                      { session: "Afternoon", icon: "bi-sun", treatment: day.afternoon?.treatment, color: "#0ea5e9" },
                      { session: "Evening", icon: "bi-moon-stars", treatment: day.evening?.treatment, color: "#a78bfa" },
                    ].map(({ session, icon, treatment, color }) => (
                      <div key={session} className="rounded-xl p-3"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <i className={`bi ${icon} text-xs`} style={{ color }}></i>
                          <span className="text-xs font-semibold" style={{ color }}>{session}</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">{treatment}</p>
                      </div>
                    ))}
                  </div>

                  {day.motivation && (
                    <div className="rounded-xl p-3"
                      style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.1)" }}>
                      <p className="text-teal-400 text-xs italic">{day.motivation}</p>
                    </div>
                  )}

                  {day.notes && (
                    <div className="rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-xs text-slate-500 mb-1">Your notes:</p>
                      <p className="text-slate-300 text-xs">{day.notes}</p>
                    </div>
                  )}

                  {day.adjustment_reason && (
                    <div className="rounded-xl p-3"
                      style={{ background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.1)" }}>
                      <p className="text-xs text-blue-400 mb-1">AI Adjustment:</p>
                      <p className="text-blue-300 text-xs">{day.adjustment_reason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TreatmentHistory;
