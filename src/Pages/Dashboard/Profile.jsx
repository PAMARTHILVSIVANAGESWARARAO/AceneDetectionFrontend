import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const SEVERITY_COLORS = {
  cleanskin: { bg: "rgba(20,184,166,0.15)", border: "#14b8a6", text: "#14b8a6", label: "Clear Skin" },
  mild: { bg: "rgba(234,179,8,0.12)", border: "#eab308", text: "#eab308", label: "Mild" },
  moderate: { bg: "rgba(249,115,22,0.12)", border: "#f97316", text: "#f97316", label: "Moderate" },
  "moderate-severe": { bg: "rgba(239,68,68,0.12)", border: "#ef4444", text: "#ef4444", label: "Moderate-Severe" },
  severe: { bg: "rgba(220,38,38,0.15)", border: "#dc2626", text: "#dc2626", label: "Severe" },
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 py-2.5"
    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
    <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
    <span className="text-sm text-slate-200 font-medium text-right max-w-xs">{value || "—"}</span>
  </div>
);

const Section = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden mb-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <button className="w-full flex items-center justify-between gap-3 px-5 py-4" onClick={() => setOpen(p => !p)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}>
            <i className={`bi ${icon} text-teal-400 text-sm`}></i>
          </div>
          <span className="text-white font-semibold text-sm">{title}</span>
        </div>
        <i className={`bi bi-chevron-${open ? "up" : "down"} text-slate-500 text-xs`}></i>
      </button>
      {open && (
        <div className="px-5 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="pt-2">{children}</div>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const { logout } = useAuth();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getMyUserInfo()
      .then(res => setInfo(res.data))
      .catch(() => toast.error("Failed to load profile"))
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

  const user = info?.user;
  const q = info?.questionnaire;
  const a = info?.acne_analysis;

  // Derive overall severity from acne analysis
  const overallSeverity = (() => {
    if (!a?.areas?.length) return null;
    const preds = a.areas.map(ar => ar.prediction);
    if (preds.includes("severe")) return "severe";
    const mod = preds.filter(p => p === "moderate").length;
    if (mod > preds.length / 2) return "moderate-severe";
    if (mod > 0) return "moderate";
    if (preds.includes("mild")) return "mild";
    return "cleanskin";
  })();

  const sev = overallSeverity ? SEVERITY_COLORS[overallSeverity] : null;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-slate-400 text-sm">Your account and health information</p>
      </div>

      {/* Account card */}
      <div className="rounded-2xl p-5 mb-4"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
            <span className="text-white text-xl font-bold uppercase">
              {user?.username?.[0] || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-white font-bold text-lg">{user?.username}</h2>
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(20,184,166,0.12)", color: "#14b8a6", border: "1px solid rgba(20,184,166,0.25)" }}>
                  <i className="bi bi-patch-check-fill text-xs"></i> Verified
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm truncate">{user?.email}</p>
            <p className="text-slate-600 text-xs mt-1">Joined {formatDate(user?.createdAt)}</p>
          </div>
          {sev && (
            <div className="flex-shrink-0 text-center px-3 py-2 rounded-xl"
              style={{ background: sev.bg, border: `1px solid ${sev.border}40` }}>
              <p className="text-xs text-slate-500 mb-0.5">Severity</p>
              <p className="text-xs font-bold" style={{ color: sev.text }}>{sev.label}</p>
            </div>
          )}
        </div>
      </div>

      {/* Questionnaire sections */}
      {q ? (
        <>
          <Section title="Basic Information" icon="bi-person" defaultOpen>
            <InfoRow label="Age Group" value={q.ageGroup} />
            <InfoRow label="Sex" value={q.sex} />
            <InfoRow label="Skin Type" value={q.skinType} />
            <InfoRow label="Acne Duration" value={q.acneDuration} />
            <InfoRow label="Sensitive Skin" value={q.sensitiveSkin} />
          </Section>

          <Section title="Acne Details" icon="bi-search">
            <InfoRow label="Locations" value={q.acneLocation?.join(", ")} />
            <InfoRow label="Description" value={q.acneDescription} />
          </Section>

          <Section title="Allergy & Medical" icon="bi-shield-exclamation">
            <InfoRow label="Medication Allergy" value={q.medicationAllergy} />
            <InfoRow label="Allergy Types" value={q.allergyReactionTypes?.join(", ")} />
            <InfoRow label="Medication Reactions" value={q.acneMedicationReaction?.join(", ")} />
            <InfoRow label="Food Allergy" value={q.foodAllergy} />
          </Section>

          <Section title="Products & Diet" icon="bi-droplet">
            <InfoRow label="Using Acne Products" value={q.usingAcneProducts} />
            <InfoRow label="Current Products" value={q.currentProducts?.join(", ")} />
            <InfoRow label="Dairy Consumption" value={q.dairyConsumption} />
          </Section>

          <Section title="Lifestyle" icon="bi-heart-pulse">
            <InfoRow label="Stress Level" value={q.stressLevel} />
            <InfoRow label="Sleep Hours" value={q.sleepHours} />
            <InfoRow label="Additional Notes" value={q.additionalFeelings} />
          </Section>
        </>
      ) : (
        <div className="rounded-2xl p-8 text-center mb-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.08)" }}>
          <i className="bi bi-clipboard text-slate-600 text-3xl mb-3 block"></i>
          <p className="text-slate-400 text-sm">Questionnaire not yet completed</p>
        </div>
      )}

      {/* Acne analysis results */}
      {a?.areas?.length > 0 && (
        <Section title="Acne Analysis Results" icon="bi-cpu">
          <div className="space-y-3 pt-1">
            {a.areas.map(area => {
              const areaSev = SEVERITY_COLORS[area.prediction] || SEVERITY_COLORS.mild;
              return (
                <div key={area.area} className="rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${areaSev.border}30` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-medium capitalize">
                      {area.area.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: areaSev.bg, color: areaSev.text, border: `1px solid ${areaSev.border}40` }}>
                      {areaSev.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Confidence</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${area.confidence}%`, background: `linear-gradient(90deg, ${areaSev.border}, ${areaSev.border}88)` }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: areaSev.text }}>{area.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
};

export default Profile;
