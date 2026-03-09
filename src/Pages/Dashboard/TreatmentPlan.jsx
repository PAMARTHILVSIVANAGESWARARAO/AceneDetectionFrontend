import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { treatmentAPI, userAPI } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const SESSION_CONFIG = [
  { key: "morning", icon: "bi-sunrise", label: "Morning", color: "#f59e0b" },
  { key: "afternoon", icon: "bi-sun", label: "Afternoon", color: "#0ea5e9" },
  { key: "evening", icon: "bi-moon-stars", label: "Evening", color: "#a78bfa" },
];

const SEVERITY_COLORS = {
  cleanskin: { text: "#14b8a6", label: "Clear Skin" },
  mild: { text: "#eab308", label: "Mild" },
  moderate: { text: "#f97316", label: "Moderate" },
  "moderate-severe": { text: "#ef4444", label: "Moderate-Severe" },
  severe: { text: "#dc2626", label: "Severe" },
};

const TreatmentPlan = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nextDayPlan, setNextDayPlan] = useState(null);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const res = await treatmentAPI.getStatus();
      setPlan(res.data);
      const currentDay = res.data.days?.find(d => d.day === res.data.currentDay);
      if (currentDay?.feedback) setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.includes("No treatment plan")) {
        navigate("/dashboard");
      } else {
        toast.error("Failed to load treatment plan");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!feedback) { toast.error("Please select positive or negative feedback"); return; }
    setSubmitting(true);
    try {
      const res = await treatmentAPI.submitReview({
        day: plan.currentDay,
        feedback,
        notes: notes.trim() || undefined,
      });
      setNextDayPlan(res.data.plan);
      setSubmitted(true);
      toast.success(`Day ${plan.currentDay} reviewed! Day ${res.data.day} plan ready.`);
      // Reload
      const updated = await treatmentAPI.getStatus();
      setPlan(updated.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#14b8a6" strokeWidth="4" />
          <path className="opacity-75" fill="#14b8a6" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!plan) return null;

  const currentDayData = plan.days?.find(d => d.day === plan.currentDay);
  const sev = SEVERITY_COLORS[plan.overallSeverity];
  const alreadyReviewed = currentDayData?.feedback || submitted;

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-1">
          <h1 className="text-2xl font-bold text-white">Treatment Plan</h1>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: "rgba(20,184,166,0.12)", color: "#14b8a6", border: "1px solid rgba(20,184,166,0.25)" }}>
            Day {plan.currentDay}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 text-sm">Severity:</span>
          <span className="text-sm font-semibold" style={{ color: sev?.text }}>{sev?.label}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 text-sm">{plan.totalDaysCompleted} days completed</span>
        </div>
      </div>

      {/* Adjustment reason */}
      {currentDayData?.adjustment_reason && (
        <div className="rounded-xl p-4 mb-5 flex items-start gap-3"
          style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
          <i className="bi bi-info-circle text-blue-400 flex-shrink-0 mt-0.5"></i>
          <p className="text-blue-300 text-sm">{currentDayData.adjustment_reason}</p>
        </div>
      )}

      {/* Session cards */}
      <div className="space-y-4 mb-6">
        {SESSION_CONFIG.map(({ key, icon, label, color }) => {
          const sess = currentDayData?.[key];
          return (
            <div key={key} className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Card header */}
              <div className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
                  <i className={`bi ${icon}`} style={{ color }}></i>
                </div>
                <span className="font-semibold text-white text-sm">{label}</span>
                {sess?.completed && (
                  <div className="ml-auto flex items-center gap-1 text-xs text-teal-400">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Completed</span>
                  </div>
                )}
              </div>
              {/* Treatment text */}
              <div className="px-5 py-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {sess?.treatment || "No treatment specified"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivation */}
      {currentDayData?.motivation && (
        <div className="rounded-2xl p-5 mb-6"
          style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.15)" }}>
          <div className="flex items-start gap-3">
            <i className="bi bi-stars text-teal-400 text-xl flex-shrink-0"></i>
            <div>
              <p className="text-xs text-teal-500 uppercase tracking-wider mb-1 font-medium">Daily Motivation</p>
              <p className="text-teal-200 text-sm italic leading-relaxed">{currentDayData.motivation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Review section */}
      {alreadyReviewed ? (
        <div className="rounded-2xl p-5 text-center"
          style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.2)" }}>
          <i className="bi bi-check-circle-fill text-teal-400 text-3xl mb-3 block"></i>
          <h3 className="text-white font-semibold mb-1">Day {plan.currentDay - 1} Reviewed</h3>
          <p className="text-slate-400 text-sm">
            {nextDayPlan ? "Your Day " + plan.currentDay + " plan is shown above." : "You've already submitted your review for this day."}
          </p>
          <button onClick={loadPlan}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
            <i className="bi bi-arrow-clockwise mr-1.5"></i> Refresh
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-white font-semibold mb-4">How did today's treatment go?</h3>

          {/* Feedback radio */}
          <div className="flex gap-3 mb-4">
            {[
              { value: "positive", icon: "bi-hand-thumbs-up", label: "Worked Well", color: "#14b8a6" },
              { value: "negative", icon: "bi-hand-thumbs-down", label: "Had Issues", color: "#ef4444" },
            ].map(({ value, icon, label, color }) => (
              <button key={value} id={`feedback-${value}`} onClick={() => setFeedback(value)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: feedback === value ? `${color}20` : "rgba(255,255,255,0.04)",
                  border: feedback === value ? `2px solid ${color}` : "1px solid rgba(255,255,255,0.1)",
                  color: feedback === value ? color : "rgba(255,255,255,0.5)"
                }}>
                <i className={`bi ${icon}`}></i>
                {label}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Notes (optional)</label>
            <textarea id="review-notes" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Describe any reactions, improvements, or concerns..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", resize: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
          </div>

          <button id="submit-review" onClick={handleSubmitReview} disabled={submitting || !feedback}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)", opacity: (submitting || !feedback) ? 0.6 : 1 }}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating next day with AI...
              </span>
            ) : "Submit Review & Get Next Day Plan"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlan;
