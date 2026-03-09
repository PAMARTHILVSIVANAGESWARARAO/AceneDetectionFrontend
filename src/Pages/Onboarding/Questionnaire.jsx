import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { userAPI } from "../../services/api";

const STEPS = [
  { title: "Basic Info", icon: "bi-person-circle" },
  { title: "Acne Details", icon: "bi-search" },
  { title: "Allergy Info", icon: "bi-shield-exclamation" },
  { title: "Products & Diet", icon: "bi-droplet" },
  { title: "Lifestyle", icon: "bi-heart-pulse" },
];

const Checkbox = ({ label, name, value, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <input type="checkbox" name={name} value={value} checked={checked}
      onChange={onChange} className="hidden" />
    <div className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 flex-shrink-0"
      style={{
        background: checked ? "rgba(20,184,166,0.8)" : "rgba(255,255,255,0.06)",
        border: checked ? "2px solid #14b8a6" : "1px solid rgba(255,255,255,0.2)"
      }}>
      {checked && <i className="bi bi-check text-white text-xs font-bold"></i>}
    </div>
    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
  </label>
);

const Radio = ({ label, name, value, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl transition-all duration-200"
    style={{
      background: checked ? "rgba(20,184,166,0.1)" : "rgba(255,255,255,0.03)",
      border: checked ? "1px solid rgba(20,184,166,0.4)" : "1px solid rgba(255,255,255,0.08)"
    }}>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="hidden" />
    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ border: checked ? "none" : "2px solid rgba(255,255,255,0.3)", background: checked ? "#14b8a6" : "transparent" }}>
      {checked && <div className="w-2 h-2 rounded-full bg-white"></div>}
    </div>
    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
  </label>
);

const Questionnaire = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    ageGroup: "", sex: "", skinType: "", acneDuration: "",
    acneLocation: [], sensitiveSkin: "", acneDescription: "",
    medicationAllergy: "", allergyReactionTypes: [], acneMedicationReaction: [],
    usingAcneProducts: "", currentProducts: [], stoppedDueToSideEffects: "",
    foodAllergy: "", allergyFoods: [], foodTriggersAcne: "",
    dairyConsumption: "", stressLevel: "", sleepHours: "", additionalFeelings: ""
  });

  const setField = (name, val) => setData(p => ({ ...p, [name]: val }));

  const toggleArray = (name, val) => setData(p => ({
    ...p, [name]: p[name].includes(val) ? p[name].filter(v => v !== val) : [...p[name], val]
  }));

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

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all duration-200";
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Age Group</label>
            <div className="grid grid-cols-2 gap-2">
              {["Under 18", "18-25", "25-35", "35-45", "45+"].map(v => (
                <Radio key={v} label={v} name="ageGroup" value={v} checked={data.ageGroup === v}
                  onChange={() => setField("ageGroup", v)} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sex</label>
            <div className="grid grid-cols-3 gap-2">
              {["Male", "Female", "Other"].map(v => (
                <Radio key={v} label={v} name="sex" value={v} checked={data.sex === v}
                  onChange={() => setField("sex", v)} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Skin Type</label>
            <div className="grid grid-cols-2 gap-2">
              {["Oily", "Dry", "Combination", "Normal", "Sensitive"].map(v => (
                <Radio key={v} label={v} name="skinType" value={v} checked={data.skinType === v}
                  onChange={() => setField("skinType", v)} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">How long have you had acne?</label>
            <div className="grid grid-cols-2 gap-2">
              {["Less than 1 year", "1-2 years", "2-3 years", "3+ years"].map(v => (
                <Radio key={v} label={v} name="acneDuration" value={v} checked={data.acneDuration === v}
                  onChange={() => setField("acneDuration", v)} />
              ))}
            </div>
          </div>
        </div>
      );
      case 1: return (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Acne Locations (select all that apply)</label>
            <div className="grid grid-cols-2 gap-2">
              {["forehead", "leftCheek", "rightCheek", "chin", "neck", "back", "shoulders", "fullFace"].map(v => (
                <Checkbox key={v} label={v.replace(/([A-Z])/g, ' $1').trim()} name="acneLocation" value={v}
                  checked={data.acneLocation.includes(v)}
                  onChange={() => toggleArray("acneLocation", v)} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Do you have sensitive skin?</label>
            <div className="flex gap-3">
              {["Yes", "No"].map(v => (
                <Radio key={v} label={v} name="sensitiveSkin" value={v} checked={data.sensitiveSkin === v}
                  onChange={() => setField("sensitiveSkin", v)} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Describe your acne (optional)</label>
            <textarea value={data.acneDescription} onChange={e => setField("acneDescription", e.target.value)}
              placeholder="e.g., whiteheads, blackheads, cysts, nodules..."
              rows={3}
              className={inputClass}
              style={{ ...inputStyle, resize: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Do you have medication allergies?</label>
            <div className="flex gap-3">
              {["Yes", "No"].map(v => (
                <Radio key={v} label={v} name="medicationAllergy" value={v} checked={data.medicationAllergy === v}
                  onChange={() => setField("medicationAllergy", v)} />
              ))}
            </div>
          </div>
          {data.medicationAllergy === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Allergy reaction types</label>
              <div className="grid grid-cols-2 gap-2">
                {["itching", "redness", "swelling", "burning", "hives", "anaphylaxis"].map(v => (
                  <Checkbox key={v} label={v.charAt(0).toUpperCase() + v.slice(1)} name="allergyReactionTypes" value={v}
                    checked={data.allergyReactionTypes.includes(v)} onChange={() => toggleArray("allergyReactionTypes", v)} />
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Past reactions to acne medications</label>
            <div className="grid grid-cols-2 gap-2">
              {["dryness", "redness", "irritation", "sensitivity", "peeling", "none"].map(v => (
                <Checkbox key={v} label={v.charAt(0).toUpperCase() + v.slice(1)} name="acneMedicationReaction" value={v}
                  checked={data.acneMedicationReaction.includes(v)} onChange={() => toggleArray("acneMedicationReaction", v)} />
              ))}
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Are you currently using acne products?</label>
            <div className="flex gap-3">
              {["Yes", "No"].map(v => (
                <Radio key={v} label={v} name="usingAcneProducts" value={v} checked={data.usingAcneProducts === v}
                  onChange={() => setField("usingAcneProducts", v)} />
              ))}
            </div>
          </div>
          {data.usingAcneProducts === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current products</label>
              <div className="grid grid-cols-1 gap-2">
                {["Salicylic acid wash", "Benzoyl peroxide", "Adapalene", "Clindamycin", "Tea tree oil", "Retinol"].map(v => (
                  <Checkbox key={v} label={v} name="currentProducts" value={v}
                    checked={data.currentProducts.includes(v)} onChange={() => toggleArray("currentProducts", v)} />
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Do you have a food allergy?</label>
            <div className="flex gap-3">
              {["Yes", "No"].map(v => (
                <Radio key={v} label={v} name="foodAllergy" value={v} checked={data.foodAllergy === v}
                  onChange={() => setField("foodAllergy", v)} />
              ))}
            </div>
          </div>
          {data.foodAllergy === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Allergy foods</label>
              <div className="grid grid-cols-2 gap-2">
                {["Dairy", "Gluten", "Nuts", "Eggs", "Shellfish", "Soy"].map(v => (
                  <Checkbox key={v} label={v} name="allergyFoods" value={v}
                    checked={data.allergyFoods.includes(v)} onChange={() => toggleArray("allergyFoods", v)} />
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Dairy consumption</label>
            <div className="grid grid-cols-2 gap-2">
              {["None", "Occasional", "Regular", "High"].map(v => (
                <Radio key={v} label={v} name="dairyConsumption" value={v} checked={data.dairyConsumption === v}
                  onChange={() => setField("dairyConsumption", v)} />
              ))}
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Stress level</label>
            <div className="grid grid-cols-3 gap-2">
              {["Low", "Moderate", "High"].map(v => (
                <Radio key={v} label={v} name="stressLevel" value={v} checked={data.stressLevel === v}
                  onChange={() => setField("stressLevel", v)} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Average sleep hours</label>
            <div className="grid grid-cols-2 gap-2">
              {["Less than 4", "4-6", "6-8", "8-10", "10+"].map(v => (
                <Radio key={v} label={v} name="sleepHours" value={v} checked={data.sleepHours === v}
                  onChange={() => setField("sleepHours", v)} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Anything else we should know? (optional)</label>
            <textarea value={data.additionalFeelings} onChange={e => setField("additionalFeelings", e.target.value)}
              placeholder="Any additional information about your skin or health..."
              rows={3}
              className={inputClass}
              style={{ ...inputStyle, resize: "none" }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
          </div>
        </div>
      );
      default: return null;
    }
  };

  const canProceed = () => {
    if (step === 0) return data.ageGroup && data.sex && data.skinType && data.acneDuration;
    if (step === 1) return data.acneLocation.length > 0 && data.sensitiveSkin;
    if (step === 2) return data.medicationAllergy;
    if (step === 3) {
      if (!data.usingAcneProducts || !data.dairyConsumption || !data.foodAllergy) return false;
      if (data.usingAcneProducts === "Yes" && data.currentProducts.length === 0) return false;
      if (data.foodAllergy === "Yes" && data.allergyFoods.length === 0) return false;
      return true;
    }
    if (step === 4) return data.stressLevel && data.sleepHours;
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10"
      style={{ background: "linear-gradient(135deg, #0a0f0d 0%, #0d1f1a 40%, #0a1628 100%)" }}>
      <Toaster position="top-center" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.3) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-lg mx-4">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
              <i className="bi bi-activity text-white text-sm"></i>
            </div>
            <span className="text-xl font-black text-white">AcnePilot</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-slate-400">Step {step + 1} of {STEPS.length}</span>
            <span className="text-xs text-teal-400 font-medium">{STEPS[step].title}</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: "linear-gradient(90deg, #0f766e, #14b8a6)" }} />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: i < step ? "rgba(20,184,166,0.8)" : i === step ? "linear-gradient(135deg, #0f766e, #14b8a6)" : "rgba(255,255,255,0.06)",
                    border: i <= step ? "none" : "1px solid rgba(255,255,255,0.15)",
                    color: i <= step ? "white" : "#64748b"
                  }}>
                  {i < step ? <i className="bi bi-check text-xs"></i> : i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(20,184,166,0.2)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
          }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.3)" }}>
              <i className={`bi ${STEPS[step].icon} text-teal-400`}></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{STEPS[step].title}</h2>
              <p className="text-slate-500 text-xs">Help us personalize your treatment</p>
            </div>
          </div>

          {renderStep()}

          <div className="flex gap-3 mt-7">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <i className="bi bi-arrow-left mr-1.5"></i> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button id={`questionnaire-next-${step}`} onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ 
                  background: canProceed() ? "linear-gradient(135deg, #0f766e, #14b8a6)" : "rgba(255,255,255,0.08)", 
                  opacity: canProceed() ? 1 : 0.5,
                  cursor: canProceed() ? "pointer" : "not-allowed",
                  pointerEvents: canProceed() ? "auto" : "none"
                }}>
                Continue <i className="bi bi-arrow-right ml-1.5"></i>
              </button>
            ) : (
              <button id="questionnaire-submit" onClick={handleSubmit} disabled={loading || !canProceed()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ 
                  background: "linear-gradient(135deg, #0f766e, #14b8a6)", 
                  opacity: (loading || !canProceed()) ? 0.5 : 1,
                  cursor: (loading || !canProceed()) ? "not-allowed" : "pointer",
                  pointerEvents: (loading || !canProceed()) ? "none" : "auto"
                }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : "Complete Questionnaire ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
