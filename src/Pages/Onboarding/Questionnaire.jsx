import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { userAPI } from "../../services/api";

const STEPS = [
  { title: "Basic Info", icon: "bi-person-circle", desc: "Tell us about yourself" },
  { title: "Acne Details", icon: "bi-search", desc: "Describe your skin concerns" },
  { title: "Allergy Info", icon: "bi-shield-exclamation", desc: "Safety first" },
  { title: "Products & Diet", icon: "bi-droplet", desc: "Current routines" },
  { title: "Lifestyle", icon: "bi-heart-pulse", desc: "Daily habits" },
];

/* ─── Skeleton ─── */
const SkeletonBlock = ({ w = "100%", h = 16, rounded = 8 }) => (
  <div style={{
    width: w, height: h, borderRadius: rounded, flexShrink: 0,
    background: "linear-gradient(90deg, #e0f2f1 25%, #b2dfdb 50%, #e0f2f1 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  }} />
);

const StepSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    {[1, 2, 3].map(i => (
      <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <SkeletonBlock w="42%" h={13} rounded={6} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[1, 2, 3, 4].map(j => <SkeletonBlock key={j} h={46} rounded={12} />)}
        </div>
      </div>
    ))}
    <SkeletonBlock h={78} rounded={12} />
  </div>
);

/* ─── Checkbox ─── */
const Checkbox = ({ label, name, value, checked, onChange }) => (
  <label style={{
    display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
    padding: "10px 12px", borderRadius: 12, userSelect: "none",
    background: checked ? "rgba(20,184,166,0.07)" : "rgba(255,255,255,0.75)",
    border: checked ? "1.5px solid #14b8a6" : "1.5px solid #e2e8f0",
    boxShadow: checked ? "0 0 0 3px rgba(20,184,166,0.1)" : "none",
    transition: "all 0.18s",
  }}>
    <input type="checkbox" name={name} value={value} checked={checked} onChange={onChange} style={{ display: "none" }} />
    <div style={{
      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: checked ? "linear-gradient(135deg,#0f766e,#14b8a6)" : "#f8fafc",
      border: checked ? "none" : "1.5px solid #cbd5e1",
      transition: "all 0.18s",
    }}>
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <span style={{ fontSize: 13, fontWeight: 500, color: checked ? "#0f766e" : "#475569", transition: "color 0.18s" }}>
      {label}
    </span>
  </label>
);

/* ─── Radio ─── */
const Radio = ({ label, name, value, checked, onChange }) => (
  <label style={{
    display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
    padding: "10px 12px", borderRadius: 12, userSelect: "none",
    background: checked ? "rgba(20,184,166,0.07)" : "rgba(255,255,255,0.75)",
    border: checked ? "1.5px solid #14b8a6" : "1.5px solid #e2e8f0",
    boxShadow: checked ? "0 0 0 3px rgba(20,184,166,0.1)" : "none",
    transition: "all 0.18s",
  }}>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={{ display: "none" }} />
    <div style={{
      width: 17, height: 17, borderRadius: "50%", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: checked ? "linear-gradient(135deg,#0f766e,#14b8a6)" : "#f8fafc",
      border: checked ? "none" : "1.5px solid #94a3b8",
      transition: "all 0.18s",
    }}>
      {checked && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />}
    </div>
    <span style={{ fontSize: 13, fontWeight: 500, color: checked ? "#0f766e" : "#475569", transition: "color 0.18s" }}>
      {label}
    </span>
  </label>
);

/* ─── Field wrapper ─── */
const Field = ({ label, children }) => (
  <div>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
      {label}
    </label>
    {children}
  </div>
);

/* ─── Decorative background ─── */
const Blobs = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
    <div style={{
      position: "absolute", top: "-8%", left: "-8%", width: 420, height: 420, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)", filter: "blur(55px)",
    }} />
    <div style={{
      position: "absolute", bottom: "-10%", right: "-5%", width: 360, height: 360, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(14,165,233,0.13) 0%, transparent 70%)", filter: "blur(55px)",
    }} />
    <div style={{
      position: "absolute", top: "38%", right: "8%", width: 210, height: 210, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)", filter: "blur(35px)",
    }} />
    <div style={{
      position: "absolute", inset: 0, opacity: 0.35,
      backgroundImage: "radial-gradient(circle, #99f6e4 1px, transparent 1px)",
      backgroundSize: "28px 28px",
    }} />
  </div>
);

/* ─── Shared styles ─── */
const pageStyle = {
  minHeight: "100vh",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "linear-gradient(145deg, #f0fdfa 0%, #e6fffa 35%, #f0f9ff 70%, #ecfdf5 100%)",
  padding: "40px 16px",
  position: "relative", overflow: "hidden",
};

const cardStyle = {
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
  border: "1.5px solid rgba(20,184,166,0.22)",
  borderRadius: 22,
  padding: "28px 24px",
  boxShadow: "0 8px 32px rgba(15,118,110,0.1), inset 0 1px 0 rgba(255,255,255,0.85)",
};

const gradientBtn = (active) => ({
  flex: 1, padding: "11px 18px",
  borderRadius: 14, border: "none",
  background: active ? "linear-gradient(135deg,#0f766e 0%,#14b8a6 60%,#2dd4bf 100%)" : "rgba(203,213,225,0.4)",
  boxShadow: active ? "0 4px 14px rgba(20,184,166,0.35)" : "none",
  color: active ? "white" : "#94a3b8",
  fontSize: 14, fontWeight: 600,
  cursor: active ? "pointer" : "not-allowed",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  transition: "all 0.2s",
});

const outlineBtn = {
  flex: 1, padding: "11px 18px", borderRadius: 14,
  background: "rgba(255,255,255,0.75)", border: "1.5px solid #b2dfdb",
  color: "#0f766e", fontSize: 14, fontWeight: 600, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  transition: "all 0.2s",
};

const textareaStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 12,
  background: "rgba(255,255,255,0.8)", border: "1.5px solid #e2e8f0",
  fontSize: 14, color: "#1e293b", outline: "none",
  fontFamily: "inherit", resize: "none", transition: "border-color 0.2s",
  boxSizing: "border-box",
};

/* ─── Main ─── */
const Questionnaire = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [stepLoading, setStepLoading] = useState(false);

  const [data, setData] = useState({
    ageGroup: "", sex: "", skinType: "", acneDuration: "",
    acneLocation: [], sensitiveSkin: "", acneDescription: "",
    medicationAllergy: "", allergyReactionTypes: [], acneMedicationReaction: [],
    usingAcneProducts: "", currentProducts: [],
    foodAllergy: "", allergyFoods: [],
    dairyConsumption: "", stressLevel: "", sleepHours: "", additionalFeelings: "",
  });

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 1300);
    return () => clearTimeout(t);
  }, []);

  const setField = (name, val) => setData(p => ({ ...p, [name]: val }));
  const toggleArray = (name, val) => setData(p => ({
    ...p, [name]: p[name].includes(val) ? p[name].filter(v => v !== val) : [...p[name], val],
  }));

  const goToStep = (n) => {
    setStepLoading(true);
    setTimeout(() => { setStep(n); setStepLoading(false); }, 380);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await userAPI.saveUserInfo(data);
      sessionStorage.removeItem("acnepilot_status_cache");
      window.dispatchEvent(new Event("auth:update_status"));
      toast.success("Questionnaire saved!");
      navigate("/onboarding/upload");
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Failed to save";
      if (status === 409 || msg.toLowerCase().includes("already")) {
        sessionStorage.removeItem("acnepilot_status_cache");
        window.dispatchEvent(new Event("auth:update_status"));
        navigate("/onboarding/upload");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return data.ageGroup && data.sex && data.skinType && data.acneDuration;
    if (step === 1) return data.acneLocation.length > 0 && data.sensitiveSkin;
    if (step === 2) return !!data.medicationAllergy;
    if (step === 3) {
      if (!data.usingAcneProducts || !data.dairyConsumption || !data.foodAllergy) return false;
      if (data.usingAcneProducts === "Yes" && data.currentProducts.length === 0) return false;
      if (data.foodAllergy === "Yes" && data.allergyFoods.length === 0) return false;
      return true;
    }
    if (step === 4) return data.stressLevel && data.sleepHours;
    return true;
  };

  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 };
  const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 };
  const row = { display: "flex", gap: 10 };

  const renderStep = () => {
    if (stepLoading) return <StepSkeleton />;
    switch (step) {
      case 0: return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Age Group">
            <div style={grid2}>
              {["Under 18","18-25","25-35","35-45","45+"].map(v => (
                <Radio key={v} label={v} name="ageGroup" value={v} checked={data.ageGroup===v} onChange={()=>setField("ageGroup",v)} />
              ))}
            </div>
          </Field>
          <Field label="Sex">
            <div style={grid3}>
              {["Male","Female","Other"].map(v => (
                <Radio key={v} label={v} name="sex" value={v} checked={data.sex===v} onChange={()=>setField("sex",v)} />
              ))}
            </div>
          </Field>
          <Field label="Skin Type">
            <div style={grid2}>
              {["Oily","Dry","Combination","Normal","Sensitive"].map(v => (
                <Radio key={v} label={v} name="skinType" value={v} checked={data.skinType===v} onChange={()=>setField("skinType",v)} />
              ))}
            </div>
          </Field>
          <Field label="How long have you had acne?">
            <div style={grid2}>
              {["Less than 1 year","1-2 years","2-3 years","3+ years"].map(v => (
                <Radio key={v} label={v} name="acneDuration" value={v} checked={data.acneDuration===v} onChange={()=>setField("acneDuration",v)} />
              ))}
            </div>
          </Field>
        </div>
      );
      case 1: return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Acne Locations (select all that apply)">
            <div style={grid2}>
              {["forehead","leftCheek","rightCheek","chin","neck","back","shoulders","fullFace"].map(v => (
                <Checkbox key={v} label={v.replace(/([A-Z])/g,' $1').trim()} name="acneLocation" value={v}
                  checked={data.acneLocation.includes(v)} onChange={()=>toggleArray("acneLocation",v)} />
              ))}
            </div>
          </Field>
          <Field label="Do you have sensitive skin?">
            <div style={row}>
              {["Yes","No"].map(v => (
                <Radio key={v} label={v} name="sensitiveSkin" value={v} checked={data.sensitiveSkin===v} onChange={()=>setField("sensitiveSkin",v)} />
              ))}
            </div>
          </Field>
          <Field label="Describe your acne (optional)">
            <textarea value={data.acneDescription} onChange={e=>setField("acneDescription",e.target.value)}
              placeholder="e.g., whiteheads, blackheads, cysts, nodules..." rows={3} style={textareaStyle}
              onFocus={e=>e.currentTarget.style.borderColor="#14b8a6"}
              onBlur={e=>e.currentTarget.style.borderColor="#e2e8f0"} />
          </Field>
        </div>
      );
      case 2: return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Do you have medication allergies?">
            <div style={row}>
              {["Yes","No"].map(v => (
                <Radio key={v} label={v} name="medicationAllergy" value={v} checked={data.medicationAllergy===v} onChange={()=>setField("medicationAllergy",v)} />
              ))}
            </div>
          </Field>
          {data.medicationAllergy === "Yes" && (
            <Field label="Allergy reaction types">
              <div style={grid2}>
                {["itching","redness","swelling","burning","hives","anaphylaxis"].map(v => (
                  <Checkbox key={v} label={v.charAt(0).toUpperCase()+v.slice(1)} name="allergyReactionTypes" value={v}
                    checked={data.allergyReactionTypes.includes(v)} onChange={()=>toggleArray("allergyReactionTypes",v)} />
                ))}
              </div>
            </Field>
          )}
          <Field label="Past reactions to acne medications">
            <div style={grid2}>
              {["dryness","redness","irritation","sensitivity","peeling","none"].map(v => (
                <Checkbox key={v} label={v.charAt(0).toUpperCase()+v.slice(1)} name="acneMedicationReaction" value={v}
                  checked={data.acneMedicationReaction.includes(v)} onChange={()=>toggleArray("acneMedicationReaction",v)} />
              ))}
            </div>
          </Field>
        </div>
      );
      case 3: return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Are you currently using acne products?">
            <div style={row}>
              {["Yes","No"].map(v => (
                <Radio key={v} label={v} name="usingAcneProducts" value={v} checked={data.usingAcneProducts===v} onChange={()=>setField("usingAcneProducts",v)} />
              ))}
            </div>
          </Field>
          {data.usingAcneProducts === "Yes" && (
            <Field label="Current products">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Salicylic acid wash","Benzoyl peroxide","Adapalene","Clindamycin","Tea tree oil","Retinol"].map(v => (
                  <Checkbox key={v} label={v} name="currentProducts" value={v}
                    checked={data.currentProducts.includes(v)} onChange={()=>toggleArray("currentProducts",v)} />
                ))}
              </div>
            </Field>
          )}
          <Field label="Do you have a food allergy?">
            <div style={row}>
              {["Yes","No"].map(v => (
                <Radio key={v} label={v} name="foodAllergy" value={v} checked={data.foodAllergy===v} onChange={()=>setField("foodAllergy",v)} />
              ))}
            </div>
          </Field>
          {data.foodAllergy === "Yes" && (
            <Field label="Allergy foods">
              <div style={grid2}>
                {["Dairy","Gluten","Nuts","Eggs","Shellfish","Soy"].map(v => (
                  <Checkbox key={v} label={v} name="allergyFoods" value={v}
                    checked={data.allergyFoods.includes(v)} onChange={()=>toggleArray("allergyFoods",v)} />
                ))}
              </div>
            </Field>
          )}
          <Field label="Dairy consumption">
            <div style={grid2}>
              {["None","Occasional","Regular","High"].map(v => (
                <Radio key={v} label={v} name="dairyConsumption" value={v} checked={data.dairyConsumption===v} onChange={()=>setField("dairyConsumption",v)} />
              ))}
            </div>
          </Field>
        </div>
      );
      case 4: return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Stress level">
            <div style={grid3}>
              {["Low","Moderate","High"].map(v => (
                <Radio key={v} label={v} name="stressLevel" value={v} checked={data.stressLevel===v} onChange={()=>setField("stressLevel",v)} />
              ))}
            </div>
          </Field>
          <Field label="Average sleep hours">
            <div style={grid2}>
              {["Less than 4","4-6","6-8","8-10","10+"].map(v => (
                <Radio key={v} label={v} name="sleepHours" value={v} checked={data.sleepHours===v} onChange={()=>setField("sleepHours",v)} />
              ))}
            </div>
          </Field>
          <Field label="Anything else we should know? (optional)">
            <textarea value={data.additionalFeelings} onChange={e=>setField("additionalFeelings",e.target.value)}
              placeholder="Any additional information about your skin or health..." rows={3} style={textareaStyle}
              onFocus={e=>e.currentTarget.style.borderColor="#14b8a6"}
              onBlur={e=>e.currentTarget.style.borderColor="#e2e8f0"} />
          </Field>
        </div>
      );
      default: return null;
    }
  };

  /* ─── Full page skeleton on initial load ─── */
  if (pageLoading) return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      <div style={pageStyle}>
        <Blobs />
        <div style={{ position: "relative", width: "100%", maxWidth: 520 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <SkeletonBlock w={145} h={34} rounded={8} />
          </div>
          <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            <SkeletonBlock h={7} rounded={8} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {[1,2,3,4,5].map(i => <SkeletonBlock key={i} w={30} h={30} rounded={15} />)}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <SkeletonBlock w={40} h={40} rounded={10} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <SkeletonBlock w="42%" h={18} rounded={6} />
                <SkeletonBlock w="58%" h={12} rounded={6} />
              </div>
            </div>
            <StepSkeleton />
            <div style={{ marginTop: 28 }}>
              <SkeletonBlock h={44} rounded={14} />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const ok = canProceed();

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ap-btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(20,184,166,0.45)!important}
        .ap-btn-outline:hover{background:#f0fdfa!important}
      `}</style>
      <Toaster position="top-center" toastOptions={{
        style: { background: "#f0fdfa", color: "#0f766e", border: "1px solid #99f6e4", borderRadius: 12, fontSize: 14 }
      }} />
      <div style={pageStyle}>
        <Blobs />
        <div style={{ position: "relative", width: "100%", maxWidth: 520 }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg,#0f766e,#14b8a6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 14px rgba(20,184,166,0.4)",
              }}>
                <i className="bi bi-activity" style={{ color: "white", fontSize: 16 }}></i>
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#0f766e", letterSpacing: "-0.5px" }}>AcnePilot</span>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Step {step + 1} of {STEPS.length}</span>
              <span style={{ fontSize: 12, color: "#0f766e", fontWeight: 600 }}>{STEPS[step].title}</span>
            </div>
            <div style={{ height: 6, borderRadius: 10, background: "#e0f2f1", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 10,
                background: "linear-gradient(90deg,#0f766e,#14b8a6,#2dd4bf)",
                width: `${((step + 1) / STEPS.length) * 100}%`,
                transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: "0 0 10px rgba(20,184,166,0.5)",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{
                  width: 30, height: 30, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  background: i < step
                    ? "linear-gradient(135deg,#0f766e,#14b8a6)"
                    : i === step
                      ? "linear-gradient(135deg,#14b8a6,#2dd4bf)"
                      : "#f0fdfa",
                  border: i <= step ? "none" : "1.5px solid #b2dfdb",
                  color: i <= step ? "white" : "#94a3b8",
                  boxShadow: i === step ? "0 0 0 4px rgba(20,184,166,0.18)" : "none",
                  transition: "all 0.3s",
                }}>
                  {i < step
                    ? <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Card */}
          <div style={cardStyle}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: "linear-gradient(135deg,rgba(20,184,166,0.14),rgba(20,184,166,0.05))",
                border: "1.5px solid rgba(20,184,166,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={`bi ${STEPS[step].icon}`} style={{ color: "#14b8a6", fontSize: 16 }}></i>
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
                  {STEPS[step].title}
                </h2>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0, marginTop: 2 }}>{STEPS[step].desc}</p>
              </div>
            </div>

            {renderStep()}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              {step > 0 && (
                <button className="ap-btn-outline" onClick={() => goToStep(step - 1)} style={outlineBtn}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M8.5 2L4 6.5L8.5 11" stroke="#0f766e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button
                  id={`questionnaire-next-${step}`}
                  className={ok ? "ap-btn-primary" : ""}
                  onClick={() => ok && goToStep(step + 1)}
                  style={gradientBtn(ok)}
                >
                  Continue
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M4.5 2L9 6.5L4.5 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ) : (
                <button
                  id="questionnaire-submit"
                  className={ok && !loading ? "ap-btn-primary" : ""}
                  onClick={handleSubmit}
                  disabled={loading || !ok}
                  style={gradientBtn(ok && !loading)}
                >
                  {loading ? (
                    <>
                      <svg style={{ animation: "spin 0.8s linear infinite" }} width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Questionnaire
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 6.5L5 9.5L11 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Questionnaire;