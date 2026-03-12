import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { userAPI } from "../../services/api";

// ── Preview image imports ─────────────────────────────────────────────────
import backAcneImg   from "../../assets/AcnePreviewImages/backAcne.jpg";
import foreheadImg   from "../../assets/AcnePreviewImages/forHead.jpeg";
import leftCheekImg  from "../../assets/AcnePreviewImages/leftcheek.jpg";
import neckImg       from "../../assets/AcnePreviewImages/neckAcne.jpeg";
import cheekImg      from "../../assets/AcnePreviewImages/cheekAcen.jpeg";
import fullFaceImg   from "../../assets/AcnePreviewImages/FullFaceAcne.jpeg";
import rightCheekImg from "../../assets/AcnePreviewImages/rightCheek.jpg";

ChartJS.register(ArcElement, Tooltip, Legend);

// ── Constants ─────────────────────────────────────────────────────────────
const AREAS = [
  { key: "forehead",   label: "Forehead",    icon: "bi-person",            preview: foreheadImg   },
  { key: "leftCheek",  label: "Left Cheek",  icon: "bi-arrow-left",        preview: leftCheekImg  },
  { key: "rightCheek", label: "Right Cheek", icon: "bi-arrow-right",       preview: rightCheekImg },
  { key: "chin",       label: "Chin",        icon: "bi-chevron-down",      preview: cheekImg      },
  { key: "neck",       label: "Neck",        icon: "bi-person-standing",   preview: neckImg       },
  { key: "back",       label: "Back",        icon: "bi-arrow-down-circle", preview: backAcneImg   },
  { key: "fullFace",   label: "Full Face",   icon: "bi-person-circle",     preview: fullFaceImg   },
];

const SEVERITY_COLORS = {
  cleanskin:         { bg: "rgba(13,148,136,0.08)",  border: "#0d9488", text: "#0f766e", grad: "linear-gradient(135deg,#0d9488,#14b8a6)", hex: "#14b8a6", label: "Clear Skin"      },
  mild:              { bg: "rgba(234,179,8,0.08)",   border: "#ca8a04", text: "#a16207", grad: "linear-gradient(135deg,#ca8a04,#eab308)", hex: "#eab308", label: "Mild"            },
  moderate:          { bg: "rgba(234,88,12,0.08)",   border: "#ea580c", text: "#c2410c", grad: "linear-gradient(135deg,#ea580c,#f97316)", hex: "#f97316", label: "Moderate"        },
  "moderate-severe": { bg: "rgba(220,38,38,0.08)",   border: "#dc2626", text: "#b91c1c", grad: "linear-gradient(135deg,#dc2626,#ef4444)", hex: "#ef4444", label: "Mod-Severe"      },
  severe:            { bg: "rgba(185,28,28,0.08)",   border: "#b91c1c", text: "#991b1b", grad: "linear-gradient(135deg,#b91c1c,#dc2626)", hex: "#dc2626", label: "Severe"          },
};

// ── Skeleton helpers ──────────────────────────────────────────────────────
const Shimmer = ({ w = "100%", h = 16, r = 8, style = {} }) => (
  <div style={{
    width: w, height: h, borderRadius: r, flexShrink: 0,
    background: "linear-gradient(90deg,#e0f2f1 25%,#b2dfdb 50%,#e0f2f1 75%)",
    backgroundSize: "200% 100%",
    animation: "ap-shimmer 1.5s infinite",
    ...style,
  }} />
);

const AreaRowSkeleton = () => (
  <div style={{
    display: "flex", borderRadius: 16, overflow: "hidden",
    border: "1.5px solid #e2e8f0", background: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  }}>
    <Shimmer w="42%" h={150} r={0} />
    <div style={{ flex: 1, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
      <Shimmer w="55%" h={13} r={5} />
      <Shimmer w="75%" h={10} r={5} />
      <Shimmer w="40%" h={10} r={5} style={{ marginTop: 4 }} />
      <Shimmer h={36} r={10} style={{ marginTop: 6 }} />
    </div>
  </div>
);

const ResultSkeleton = () => (
  <div>
    {/* Overall badge skeleton */}
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <Shimmer w={200} h={80} r={16} style={{ display: "inline-block" }} />
    </div>
    {/* Donut skeleton */}
    <div style={{
      background: "white", borderRadius: 20, padding: 24,
      border: "1.5px solid #e2e8f0", marginBottom: 16,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
    }}>
      <Shimmer w={120} h={13} r={5} />
      <Shimmer w={220} h={220} r={110} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
        {[1,2,3,4].map(i => <Shimmer key={i} h={36} r={10} />)}
      </div>
    </div>
    {/* Area cards skeleton */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ background: "white", borderRadius: 14, padding: 14, border: "1.5px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 8 }}>
          <Shimmer w="55%" h={12} r={5} />
          <Shimmer w="38%" h={22} r={20} />
          <Shimmer h={5} r={99} />
        </div>
      ))}
    </div>
    <Shimmer h={50} r={14} />
  </div>
);

// ── Shared styles ─────────────────────────────────────────────────────────
const PAGE_BG  = "linear-gradient(145deg,#f0fdfa 0%,#e6fffa 35%,#f0f9ff 70%,#ecfdf5 100%)";
const CARD_S   = {
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
  border: "1.5px solid rgba(20,184,166,0.2)", borderRadius: 22,
  padding: "24px 22px", marginBottom: 18,
  boxShadow: "0 8px 32px rgba(15,118,110,0.08),inset 0 1px 0 rgba(255,255,255,0.9)",
};
const gradBtn = (off) => ({
  width: "100%", padding: "14px 24px", borderRadius: 14, border: "none",
  background: off ? "linear-gradient(135deg,#a7c8c5,#b2ddd9)"
                  : "linear-gradient(135deg,#0f766e 0%,#14b8a6 55%,#06b6d4 100%)",
  boxShadow: off ? "none" : "0 4px 20px rgba(13,148,136,0.3),inset 0 1px 0 rgba(255,255,255,0.2)",
  color: "white", fontSize: 15, fontWeight: 600,
  cursor: off ? "not-allowed" : "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
  transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
  letterSpacing: "0.1px",
  pointerEvents: off ? "none" : "auto",
});

// ── Background decoration ─────────────────────────────────────────────────
const Blobs = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
    <div style={{ position:"absolute",top:"-10%",left:"-8%",width:460,height:460,borderRadius:"50%",
      background:"radial-gradient(circle,rgba(20,184,166,0.2) 0%,transparent 70%)",filter:"blur(70px)" }} />
    <div style={{ position:"absolute",bottom:"-10%",right:"-8%",width:380,height:380,borderRadius:"50%",
      background:"radial-gradient(circle,rgba(14,165,233,0.13) 0%,transparent 70%)",filter:"blur(65px)" }} />
    <div style={{ position:"absolute",inset:0,opacity:0.25,
      backgroundImage:"radial-gradient(circle,#99f6e4 1px,transparent 1px)",
      backgroundSize:"28px 28px" }} />
    <div style={{ position:"absolute",inset:0,
      backgroundImage:"linear-gradient(rgba(13,148,136,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(13,148,136,0.04) 1px,transparent 1px)",
      backgroundSize:"40px 40px" }} />
  </div>
);

// ── Area row: example image left | upload zone right ─────────────────────
const AreaRow = ({ area, userPreview, isDragOver, fileRef, onDragOver, onDragLeave, onDrop, onClick, onRemove, onFileChange }) => {
  const [exLoaded,   setExLoaded]   = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const hasFile = !!userPreview;

  return (
    <div style={{
      display: "flex", borderRadius: 16, overflow: "hidden",
      border:     hasFile    ? "2px solid #14b8a6" : "1.5px solid rgba(20,184,166,0.22)",
      boxShadow:  hasFile    ? "0 0 0 3px rgba(20,184,166,0.13),0 4px 16px rgba(20,184,166,0.1)"
                             : "0 2px 8px rgba(0,0,0,0.04)",
      background: "white",
      transition: "box-shadow 0.2s,border-color 0.2s",
    }}>

      {/* ── LEFT: reference example ── */}
      <div style={{ width: "42%", flexShrink: 0, position: "relative",
        background: "#f0fdfa", borderRight: "1.5px solid rgba(20,184,166,0.12)", minHeight: 150 }}>
        {!exLoaded && (
          <div style={{ position:"absolute",inset:0,
            background:"linear-gradient(90deg,#e0f2f1 25%,#b2dfdb 50%,#e0f2f1 75%)",
            backgroundSize:"200% 100%", animation:"ap-shimmer 1.5s infinite" }} />
        )}
        <img src={area.preview} alt={`${area.label} example`}
          onLoad={() => setExLoaded(true)}
          style={{ width:"100%",height:"100%",objectFit:"cover",display:"block",
            opacity: exLoaded ? 1 : 0, transition:"opacity 0.3s", minHeight:150 }} />
        {/* "Example" badge */}
        <div style={{ position:"absolute",top:7,left:7,
          background:"rgba(15,118,110,0.82)",backdropFilter:"blur(6px)",
          borderRadius:6,padding:"3px 8px",display:"flex",alignItems:"center",gap:4 }}>
          <div style={{ width:5,height:5,borderRadius:"50%",background:"#5effe4" }} />
          <span style={{ fontSize:9,fontWeight:700,color:"white",letterSpacing:"0.6px",textTransform:"uppercase" }}>
            Example
          </span>
        </div>
        {/* Area label */}
        <div style={{ position:"absolute",bottom:0,left:0,right:0,
          padding:"18px 10px 7px",
          background:"linear-gradient(transparent,rgba(0,0,0,0.52))" }}>
          <span style={{ fontSize:12,fontWeight:700,color:"white" }}>{area.label}</span>
        </div>
      </div>

      {/* ── RIGHT: user upload zone ── */}
      <div
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        onClick={hasFile ? undefined : onClick}
        style={{
          flex: 1, position: "relative",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: hasFile ? 0 : "16px 12px",
          cursor: hasFile ? "default" : "pointer",
          background: isDragOver ? "rgba(204,251,241,0.55)"
                    : hasFile    ? "transparent"
                                 : "rgba(240,253,250,0.5)",
          transition: "background 0.2s",
          minHeight: 150, overflow: "hidden",
        }}
      >
        <input ref={fileRef} type="file" accept=".jpg,.jpeg"
          style={{ display:"none" }} onChange={onFileChange} />

        {hasFile ? (
          <>
            {!userLoaded && (
              <div style={{ position:"absolute",inset:0,
                background:"linear-gradient(90deg,#e0f2f1 25%,#b2dfdb 50%,#e0f2f1 75%)",
                backgroundSize:"200% 100%", animation:"ap-shimmer 1.5s infinite" }} />
            )}
            <img src={userPreview} alt="uploaded"
              onLoad={() => setUserLoaded(true)}
              style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
                opacity:userLoaded?1:0, transition:"opacity 0.3s" }} />
            {/* teal tint */}
            <div style={{ position:"absolute",inset:0,background:"rgba(20,184,166,0.08)" }} />
            {/* hover overlay */}
            <div className="ap-hover-overlay" style={{
              position:"absolute",inset:0,opacity:0,transition:"opacity 0.2s",
              background:"linear-gradient(transparent 25%,rgba(0,0,0,0.5) 100%)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,
            }}>
              <button onClick={e=>{e.stopPropagation();onRemove();}} style={{
                padding:"6px 14px",borderRadius:8,border:"none",
                background:"rgba(239,68,68,0.9)",color:"white",fontSize:11,fontWeight:600,
                cursor:"pointer",display:"flex",alignItems:"center",gap:5,
              }}>
                <i className="bi bi-trash" style={{fontSize:10}}/> Remove
              </button>
              <button onClick={e=>{e.stopPropagation();onClick();}} style={{
                padding:"6px 14px",borderRadius:8,border:"none",
                background:"rgba(15,118,110,0.9)",color:"white",fontSize:11,fontWeight:600,
                cursor:"pointer",display:"flex",alignItems:"center",gap:5,
              }}>
                <i className="bi bi-arrow-repeat" style={{fontSize:10}}/> Replace
              </button>
            </div>
            {/* checkmark */}
            <div style={{ position:"absolute",top:7,right:7,zIndex:2,
              width:22,height:22,borderRadius:"50%",
              background:"linear-gradient(135deg,#0f766e,#14b8a6)",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 2px 6px rgba(0,0,0,0.22)" }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* caption */}
            <div style={{ position:"absolute",bottom:0,left:0,right:0,zIndex:1,
              padding:"14px 10px 6px",background:"linear-gradient(transparent,rgba(0,0,0,0.52))" }}>
              <span style={{ fontSize:11,fontWeight:600,color:"white" }}>Your photo ✓</span>
            </div>
          </>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:7,pointerEvents:"none" }}>
            <div style={{
              width:42,height:42,borderRadius:12,
              background: isDragOver
                ? "linear-gradient(135deg,rgba(13,148,136,0.22),rgba(20,184,166,0.32))"
                : "linear-gradient(135deg,rgba(13,148,136,0.1),rgba(20,184,166,0.18))",
              border:"1.5px solid rgba(13,148,136,0.18)",
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"all 0.2s",
            }}>
              <i className={`bi ${isDragOver ? "bi-cloud-arrow-down-fill" : area.icon}`}
                style={{ color:"#0d9488",fontSize:16 }} />
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ margin:0,fontSize:12,fontWeight:700,color:"#134e4a",lineHeight:1.3 }}>
                {isDragOver ? "Drop to upload" : "Upload photo"}
              </p>
              <p style={{ margin:"3px 0 0",fontSize:10,color:"#5eada0" }}>Click or drag & drop</p>
            </div>
            <span style={{
              fontSize:9.5,fontWeight:600,color:"#0d9488",padding:"3px 10px",borderRadius:20,
              background:"rgba(13,148,136,0.08)",border:"1px solid rgba(13,148,136,0.15)",
            }}>JPG · max 10MB</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Donut chart for results ───────────────────────────────────────────────
const SeverityDonut = ({ areas }) => {
  // Count how many areas fall into each severity
  const counts = {};
  areas.forEach(a => {
    const key = a.prediction || "cleanskin";
    counts[key] = (counts[key] || 0) + 1;
  });

  const labels  = Object.keys(counts).map(k => SEVERITY_COLORS[k]?.label || k);
  const values  = Object.values(counts);
  const colors  = Object.keys(counts).map(k => SEVERITY_COLORS[k]?.hex || "#14b8a6");
  const borders = Object.keys(counts).map(k => SEVERITY_COLORS[k]?.border || "#14b8a6");

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors.map(c => c + "cc"),
      borderColor: borders,
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const options = {
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.raw} area${ctx.raw > 1 ? "s" : ""}`,
        },
        backgroundColor: "rgba(255,255,255,0.95)",
        titleColor: "#0f172a",
        bodyColor: "#475569",
        borderColor: "rgba(20,184,166,0.3)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
      },
    },
    animation: { animateRotate: true, duration: 1000 },
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:16 }}>
      {/* Chart */}
      <div style={{ position:"relative",width:200,height:200 }}>
        <Doughnut data={chartData} options={options} />
        {/* Centre label */}
        <div style={{
          position:"absolute",inset:0,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          pointerEvents:"none",
        }}>
          <span style={{ fontSize:11,color:"#64748b",fontWeight:500 }}>{areas.length} Area{areas.length!==1?"s":""}</span>
          <span style={{ fontSize:13,color:"#0f766e",fontWeight:800 }}>Analyzed</span>
        </div>
      </div>

      {/* Legend chips */}
      <div style={{ display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8 }}>
        {Object.keys(counts).map(k => {
          const s = SEVERITY_COLORS[k] || SEVERITY_COLORS.mild;
          return (
            <div key={k} style={{
              display:"flex",alignItems:"center",gap:6,
              padding:"5px 12px",borderRadius:20,
              background:s.bg,border:`1px solid ${s.border}55`,
            }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:s.hex,flexShrink:0 }} />
              <span style={{ fontSize:11,fontWeight:600,color:s.text }}>{s.label}</span>
              <span style={{
                fontSize:10,fontWeight:700,color:"white",
                background:s.hex,borderRadius:10,padding:"1px 6px",
              }}>{counts[k]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────
const AcneUpload = () => {
  const navigate   = useNavigate();
  const [files,     setFiles]     = useState({});
  const [previews,  setPreviews]  = useState({});
  const [loading,   setLoading]   = useState(false);
  const [results,   setResults]   = useState(null);
  const [dragOver,  setDragOver]  = useState(null);
  const fileRefs = useRef({});

  // ── Exact same handlers as original ──────────────────────────────────
  const handleFile = (area, file) => {
    if (!file) return;
    if (!["image/jpeg", "image/jpg"].includes(file.type)) {
      toast.error("Only JPG/JPEG images are allowed"); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)"); return;
    }
    setFiles(p => ({ ...p, [area]: file }));
    setPreviews(p => ({ ...p, [area]: URL.createObjectURL(file) }));
  };

  const handleDrop = (area, e) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(area, file);
  };

  const removeFile = (area) => {
    setFiles(p   => { const n = { ...p }; delete n[area]; return n; });
    setPreviews(p => { const n = { ...p }; delete n[area]; return n; });
  };

  const handleUpload = async () => {
    if (Object.keys(files).length === 0) {
      toast.error("Please upload at least one image"); return;
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
      const msg    = err.response?.data?.message || "Upload failed";
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

  // Same fallback as original
  const overallSeverity = results?.overallSeverity || (() => {
    if (!results?.areas) return null;
    const preds = results.areas.map(a => a.prediction);
    if (preds.includes("severe")) return "severe";
    const mod = preds.filter(p => p === "moderate").length;
    if (mod > results.areas.length / 2) return "moderate-severe";
    if (mod > 0) return "moderate";
    if (preds.includes("mild")) return "mild";
    return "cleanskin";
  })();

  const uploadCount = Object.keys(files).length;
  const sevMeta     = SEVERITY_COLORS[overallSeverity] || SEVERITY_COLORS.mild;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        @keyframes ap-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes ap-spin    { to{transform:rotate(360deg)} }
        @keyframes ap-fadeup  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .ap-root * { box-sizing:border-box; font-family:'DM Sans',system-ui,sans-serif; }
        .ap-area-row:hover { box-shadow:0 6px 22px rgba(13,148,136,0.13)!important; }
        .ap-hover-overlay  { opacity:0!important; }
        .ap-area-row:hover .ap-hover-overlay { opacity:1!important; }
        .ap-btn:not([disabled]):hover {
          transform:translateY(-2px) scale(1.01)!important;
          box-shadow:0 8px 28px rgba(13,148,136,0.42)!important;
        }
        .ap-btn:not([disabled]):active { transform:scale(0.99)!important; }
        .ap-result-card:hover { transform:translateY(-2px)!important; }
      `}</style>

      <Toaster position="top-center" toastOptions={{
        style: {
          borderRadius: 12, fontSize: 13.5, fontWeight: 500,
          border: "1px solid rgba(13,148,136,0.2)",
          boxShadow: "0 8px 24px rgba(13,148,136,0.1)",
          background: "#f0fdfa", color: "#0f766e",
        },
      }}/>

      <div className="ap-root" style={{
        minHeight: "100vh",
        background: PAGE_BG,
        position: "relative", overflow: "hidden",
        padding: "44px 16px 72px",
      }}>
        <Blobs />

        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{ textAlign:"center",marginBottom:28,animation:"ap-fadeup 0.45s ease both" }}>
            <div style={{ display:"flex",justifyContent:"center",marginBottom:14 }}>
              <div style={{
                display:"inline-flex",alignItems:"center",gap:9,
                background:"white",border:"1px solid rgba(13,148,136,0.2)",
                borderRadius:50,padding:"6px 16px 6px 6px",
                boxShadow:"0 4px 14px rgba(13,148,136,0.1)",
              }}>
                <div style={{
                  width:28,height:28,borderRadius:8,
                  background:"linear-gradient(135deg,#0f766e,#14b8a6)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:"0 3px 8px rgba(13,148,136,0.3)",
                }}>
                  <i className="bi bi-activity" style={{ color:"white",fontSize:12 }} />
                </div>
                <span style={{
                  fontWeight:700,fontSize:14,letterSpacing:"-0.3px",
                  background:"linear-gradient(135deg,#0f766e,#0ea5e9)",
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
                }}>AcnePilot</span>
              </div>
            </div>
            <h1 style={{
              fontFamily:"'DM Serif Display',serif",
              fontSize:"1.85rem",color:"#0f2b27",margin:"0 0 8px",
              letterSpacing:"-0.4px",lineHeight:1.2,
            }}>Upload Acne Images</h1>
            <p style={{ color:"#5eada0",fontSize:"0.85rem",lineHeight:1.65,margin:0,maxWidth:420,marginInline:"auto" }}>
              Each row shows an <strong style={{ color:"#0f766e" }}>example reference photo</strong> on the left.
              Match the angle and upload your own photo on the right.
            </p>
          </div>

          {/* ── Results ── */}
          {results ? (
            <div style={{ animation:"ap-fadeup 0.45s ease both" }}>

              {/* Overall severity */}
              <div style={{ textAlign:"center",marginBottom:20 }}>
                <div style={{
                  display:"inline-block",padding:"18px 32px",borderRadius:18,
                  background:`rgba(255,255,255,0.9)`,
                  border:`2px solid ${sevMeta.border}55`,
                  boxShadow:`0 4px 20px ${sevMeta.border}22`,
                  position:"relative",overflow:"hidden",
                }}>
                  {/* soft glow */}
                  <div style={{
                    position:"absolute",inset:0,
                    background:`radial-gradient(circle at 50% 50%,${sevMeta.bg} 0%,transparent 70%)`,
                  }}/>
                  <div style={{ position:"relative" }}>
                    <p style={{ fontSize:10,fontWeight:700,letterSpacing:"1.4px",
                      textTransform:"uppercase",color:sevMeta.text,opacity:0.7,margin:"0 0 4px" }}>
                      Overall Severity
                    </p>
                    <p style={{ fontSize:"1.75rem",fontFamily:"'DM Serif Display',serif",
                      color:sevMeta.text,margin:"0 0 8px",lineHeight:1 }}>
                      {sevMeta.label}
                    </p>
                    <span style={{
                      display:"inline-block",padding:"4px 14px",borderRadius:30,
                      background:sevMeta.grad,color:"white",
                      fontSize:11,fontWeight:700,letterSpacing:"0.4px",
                      boxShadow:`0 3px 10px ${sevMeta.border}40`,
                    }}>
                      {results.areas?.length} Area{results.areas?.length!==1?"s":""} Assessed
                    </span>
                  </div>
                </div>
              </div>

              {/* Donut chart card */}
              <div style={{ ...CARD_S }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:18 }}>
                  <span style={{ fontSize:10.5,fontWeight:700,letterSpacing:"1.2px",
                    textTransform:"uppercase",color:"#5eada0" }}>Severity Distribution</span>
                  <div style={{ flex:1,height:1,background:"linear-gradient(90deg,rgba(13,148,136,0.22),transparent)" }}/>
                </div>
                <SeverityDonut areas={results.areas || []} />
              </div>

              {/* Per-area cards */}
              <div style={{ ...CARD_S }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
                  <span style={{ fontSize:10.5,fontWeight:700,letterSpacing:"1.2px",
                    textTransform:"uppercase",color:"#5eada0" }}>Area Breakdown</span>
                  <div style={{ flex:1,height:1,background:"linear-gradient(90deg,rgba(13,148,136,0.22),transparent)" }}/>
                </div>
                <div className="grid grid-cols-2 gap-3" style={{ marginBottom:20 }}>
                  {results.areas?.map(area => {
                    const sev = SEVERITY_COLORS[area.prediction] || SEVERITY_COLORS.mild;
                    return (
                      <div key={area.area} className="ap-result-card" style={{
                        background:"white",borderRadius:14,padding:"14px",
                        border:`1.5px solid ${sev.border}30`,
                        boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                        transition:"transform 0.18s",
                      }}>
                        <p style={{ fontSize:13,fontWeight:700,color:"#0f2b27",margin:"0 0 7px",
                          textTransform:"capitalize" }}>
                          {area.area.replace(/([A-Z])/g," $1").trim()}
                        </p>
                        <span style={{
                          display:"inline-block",padding:"3px 11px",borderRadius:20,
                          background:sev.grad,color:"white",
                          fontSize:10,fontWeight:700,marginBottom:10,
                        }}>{sev.label}</span>
                        <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                          <span style={{ fontSize:9.5,color:"#8fb5b0",fontWeight:500,whiteSpace:"nowrap" }}>Confidence</span>
                          <div style={{ flex:1,height:4,borderRadius:99,background:"rgba(13,148,136,0.1)",overflow:"hidden" }}>
                            <div style={{
                              height:"100%",borderRadius:99,background:sev.grad,
                              width:`${area.confidence}%`,
                              transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)",
                            }}/>
                          </div>
                          <span style={{ fontSize:10.5,fontWeight:700,color:sev.text,whiteSpace:"nowrap" }}>
                            {area.confidence.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button id="goto-dashboard" className="ap-btn" style={gradBtn(false)}
                  onClick={() => {
                    sessionStorage.removeItem("acnepilot_status_cache");
                    window.dispatchEvent(new Event("auth:update_status"));
                    navigate("/dashboard");
                  }}>
                  Continue to Dashboard <i className="bi bi-arrow-right" />
                </button>
              </div>
            </div>

          ) : (
            /* ── Upload view ── */
            <div style={{ animation:"ap-fadeup 0.45s 0.1s ease both" }}>

              {/* Step indicator */}
              <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:20 }}>
                {["Upload Photos","AI Analysis","View Results"].map((s,i) => (
                  <React.Fragment key={s}>
                    <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                      <div style={{
                        width:7,height:7,borderRadius:"50%",
                        background:i===0?"linear-gradient(135deg,#0f766e,#14b8a6)":"rgba(13,148,136,0.22)",
                      }}/>
                      <span style={{ fontSize:11,fontWeight:500,color:i===0?"#0f766e":"#9fc9c4" }}>{s}</span>
                    </div>
                    {i<2 && <div style={{ flex:1,height:1,background:"rgba(13,148,136,0.18)" }}/>}
                  </React.Fragment>
                ))}
              </div>

              {/* Column headers */}
              <div style={{ display:"grid",gridTemplateColumns:"42% 1fr",marginBottom:8,paddingInline:2 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:"#14b8a6" }}/>
                  <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.8px",
                    textTransform:"uppercase",color:"#0d9488" }}>Example Photo</span>
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:"rgba(13,148,136,0.35)" }}/>
                  <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.8px",
                    textTransform:"uppercase",color:"#64748b" }}>Your Upload</span>
                </div>
              </div>

              {/* Area rows */}
              <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:16 }}>
                {AREAS.map(area => (
                  <div key={area.key} className="ap-area-row" style={{ transition:"box-shadow 0.2s" }}>
                    <AreaRow
                      area={area}
                      userPreview={previews[area.key]}
                      isDragOver={dragOver === area.key}
                      fileRef={el => (fileRefs.current[area.key] = el)}
                      onDragOver={e => { e.preventDefault(); setDragOver(area.key); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={e => handleDrop(area.key, e)}
                      onClick={() => fileRefs.current[area.key]?.click()}
                      onRemove={() => removeFile(area.key)}
                      onFileChange={e => handleFile(area.key, e.target.files[0])}
                    />
                  </div>
                ))}
              </div>

              {/* Info bar */}
              <div style={{
                display:"flex",alignItems:"flex-start",gap:11,
                background:"linear-gradient(135deg,rgba(204,251,241,0.5),rgba(224,242,254,0.38))",
                border:"1px solid rgba(13,148,136,0.18)",
                borderRadius:13,padding:"11px 15px",marginBottom:16,
              }}>
                <i className="bi bi-info-circle" style={{ color:"#0d9488",fontSize:14,flexShrink:0,marginTop:1 }}/>
                <p style={{ fontSize:12,color:"#3d8f87",lineHeight:1.65,margin:0 }}>
                  Upload at least one image. You can upload up to 7 facial/body areas.
                  Only <strong style={{ color:"#0f766e" }}>JPG/JPEG</strong> format accepted.
                  Images are processed securely and only used for analysis.
                </p>
              </div>

              {/* Analyze button */}
              <button
                id="upload-analyze"
                className="ap-btn"
                style={gradBtn(loading || uploadCount === 0)}
                disabled={loading || uploadCount === 0}
                onClick={handleUpload}
              >
                {loading ? (
                  <>
                    <svg style={{ animation:"ap-spin 0.75s linear infinite",flexShrink:0 }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Analyzing with AI…
                  </>
                ) : (
                  <>
                    <i className="bi bi-cpu"/>
                    Analyze {uploadCount > 0
                      ? `${uploadCount} Image${uploadCount > 1 ? "s" : ""}`
                      : "Images"}
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AcneUpload;