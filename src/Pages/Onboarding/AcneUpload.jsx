import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { userAPI } from "../../services/api";

const AREAS = [
  { key: "forehead", label: "Forehead", icon: "bi-person" },
  { key: "leftCheek", label: "Left Cheek", icon: "bi-arrow-left" },
  { key: "rightCheek", label: "Right Cheek", icon: "bi-arrow-right" },
  { key: "chin", label: "Chin", icon: "bi-chevron-down" },
  { key: "neck", label: "Neck", icon: "bi-person-standing" },
  { key: "back", label: "Back", icon: "bi-arrow-down-circle" },
  { key: "fullFace", label: "Full Face", icon: "bi-person-circle" },
];

const SEVERITY_COLORS = {
  cleanskin: { bg: "rgba(20,184,166,0.15)", border: "#14b8a6", text: "#14b8a6", label: "Clear Skin" },
  mild: { bg: "rgba(234,179,8,0.15)", border: "#eab308", text: "#eab308", label: "Mild" },
  moderate: { bg: "rgba(249,115,22,0.15)", border: "#f97316", text: "#f97316", label: "Moderate" },
  "moderate-severe": { bg: "rgba(239,68,68,0.12)", border: "#ef4444", text: "#ef4444", label: "Moderate-Severe" },
  severe: { bg: "rgba(220,38,38,0.15)", border: "#dc2626", text: "#dc2626", label: "Severe" },
};

const AcneUpload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileRefs = useRef({});

  const handleFile = (area, file) => {
    if (!file) return;
    if (!["image/jpeg", "image/jpg"].includes(file.type)) {
      toast.error("Only JPG/JPEG images are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`File too large (max 10MB)`);
      return;
    }
    setFiles(p => ({ ...p, [area]: file }));
    setPreviews(p => ({ ...p, [area]: URL.createObjectURL(file) }));
  };

  const handleDrop = (area, e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(area, file);
  };

  const removeFile = (area) => {
    setFiles(p => { const n = { ...p }; delete n[area]; return n; });
    setPreviews(p => { const n = { ...p }; delete n[area]; return n; });
  };

  const handleUpload = async () => {
    if (Object.keys(files).length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    Object.entries(files).forEach(([area, file]) => formData.append(area, file));
    try {
      const res = await userAPI.uploadAcneImages(formData);
      const { areas, overallSeverity: serverSeverity } = res.data;
      setResults({ areas, overallSeverity: serverSeverity });
      toast.success("Analysis complete!");
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Upload failed";
      if (status === 409 || msg.toLowerCase().includes("already")) {
        sessionStorage.removeItem("acnepilot_status_cache");
        window.dispatchEvent(new Event("auth:update_status"));
        toast.success("Analysis already completed!");
        navigate("/dashboard");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const overallSeverity = results?.overallSeverity || (() => {
    // Fallback if backend doesn't send it, but DB should
    if (!results?.areas) return null;
    const preds = results.areas.map(a => a.prediction);
    if (preds.includes("severe")) return "severe";
    const mod = preds.filter(p => p === "moderate").length;
    if (mod > results.areas.length / 2) return "moderate-severe";
    if (mod > 0) return "moderate";
    if (preds.includes("mild")) return "mild";
    return "cleanskin";
  })();

  return (
    <div className="min-h-screen relative overflow-hidden py-10 px-4"
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

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
              <i className="bi bi-activity text-white text-sm"></i>
            </div>
            <span className="text-xl font-black text-white">AcnePilot</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Upload Acne Images</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Upload clear, well-lit photos of affected areas (JPG only, max 10MB each).
            Our AI will analyze each area individually.
          </p>
        </div>

        {/* Results shown */}
        {results ? (
          <div>
            {/* Overall severity badge */}
            <div className="text-center mb-6">
              <div className="inline-block px-6 py-3 rounded-2xl"
                style={{
                  background: SEVERITY_COLORS[overallSeverity]?.bg,
                  border: `2px solid ${SEVERITY_COLORS[overallSeverity]?.border}`
                }}>
                <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Overall Severity</p>
                <p className="text-2xl font-bold" style={{ color: SEVERITY_COLORS[overallSeverity]?.text }}>
                  {SEVERITY_COLORS[overallSeverity]?.label}
                </p>
              </div>
            </div>

            {/* Per-area results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {results.areas?.map((area) => {
                const sev = SEVERITY_COLORS[area.prediction] || SEVERITY_COLORS.mild;
                return (
                  <div key={area.area} className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${sev.border}40` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-semibold capitalize">
                        {area.area.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}>
                        {sev.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">Confidence:</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${area.confidence}%`, background: `linear-gradient(90deg, ${sev.border}, ${sev.border}88)` }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: sev.text }}>{area.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button id="goto-dashboard" onClick={() => {
              sessionStorage.removeItem("acnepilot_status_cache");
              window.dispatchEvent(new Event("auth:update_status"));
              navigate("/dashboard");
            }}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm"
              style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
              Continue to Dashboard <i className="bi bi-arrow-right ml-2"></i>
            </button>
          </div>
        ) : (
          <>
            {/* Upload grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {AREAS.map(({ key, label, icon }) => (
                <div key={key}
                  className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group"
                  style={{
                    background: previews[key] ? "transparent" : "rgba(255,255,255,0.04)",
                    border: previews[key] ? "2px solid rgba(20,184,166,0.6)" : "2px dashed rgba(255,255,255,0.12)",
                    minHeight: "140px"
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(key, e)}
                  onClick={() => fileRefs.current[key]?.click()}>
                  
                  <input ref={el => fileRefs.current[key] = el} type="file" accept=".jpg,.jpeg"
                    className="hidden" id={`upload-${key}`}
                    onChange={e => handleFile(key, e.target.files[0])} />

                  {previews[key] ? (
                    <>
                      <img src={previews[key]} alt={label}
                        className="w-full h-full object-cover absolute inset-0" style={{ aspectRatio: "1" }} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={e => { e.stopPropagation(); removeFile(key); }}
                          className="w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center">
                          <i className="bi bi-trash text-white text-sm"></i>
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-center"
                        style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
                        <span className="text-white text-xs font-medium">{label}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 gap-2 min-h-[140px]">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                        style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}>
                        <i className={`bi ${icon} text-teal-400`}></i>
                      </div>
                      <span className="text-white text-xs font-medium text-center">{label}</span>
                      <span className="text-slate-500 text-xs text-center">Click or drop</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="flex items-start gap-3 rounded-xl p-4 mb-6"
              style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.15)" }}>
              <i className="bi bi-info-circle text-teal-400 mt-0.5 flex-shrink-0"></i>
              <p className="text-slate-400 text-xs leading-relaxed">
                Upload at least one image. You can upload up to 7 different facial/body areas.
                Only JPG/JPEG format is accepted. Images are processed securely and only used for analysis.
              </p>
            </div>

            <button id="upload-analyze" onClick={handleUpload}
              disabled={loading || Object.keys(files).length === 0}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #0f766e, #14b8a6)",
                opacity: (loading || Object.keys(files).length === 0) ? 0.5 : 1,
                cursor: (loading || Object.keys(files).length === 0) ? "not-allowed" : "pointer",
                pointerEvents: (loading || Object.keys(files).length === 0) ? "none" : "auto"
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing with AI...
                </span>
              ) : (
                <span>
                  <i className="bi bi-cpu mr-2"></i>
                  Analyze {Object.keys(files).length > 0 ? `${Object.keys(files).length} Image${Object.keys(files).length > 1 ? "s" : ""}` : "Images"}
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AcneUpload;
