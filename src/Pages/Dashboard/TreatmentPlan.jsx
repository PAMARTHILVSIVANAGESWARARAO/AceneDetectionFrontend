import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { treatmentAPI } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import { animate, stagger } from "animejs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// ─── Config ───────────────────────────────────────────────────────────────
const SESSION_CONFIG = [
  { key: "morning",   icon: "bi-sunrise",    label: "Morning",   color: "#f59e0b" },
  { key: "afternoon", icon: "bi-sun",        label: "Afternoon", color: "#0ea5e9" },
  { key: "evening",   icon: "bi-moon-stars", label: "Evening",   color: "#a78bfa" },
];

const SEV = {
  cleanskin:         { bg:"rgba(13,148,136,0.09)",  bdr:"#0d9488", txt:"#0f766e", label:"Clear Skin"      },
  mild:              { bg:"rgba(202,138,4,0.09)",   bdr:"#ca8a04", txt:"#a16207", label:"Mild"            },
  moderate:          { bg:"rgba(234,88,12,0.09)",   bdr:"#ea580c", txt:"#c2410c", label:"Moderate"        },
  "moderate-severe": { bg:"rgba(220,38,38,0.09)",   bdr:"#dc2626", txt:"#b91c1c", label:"Moderate-Severe" },
  severe:            { bg:"rgba(185,28,28,0.1)",    bdr:"#b91c1c", txt:"#991b1b", label:"Severe"          },
};

// ─── Shared tokens ────────────────────────────────────────────────────────
const CARD = {
  background:     "rgba(255,255,255,0.82)",
  backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
  border:         "1.5px solid rgba(20,184,166,0.18)",
  borderRadius:   20,
  boxShadow:      "0 4px 24px rgba(15,118,110,0.08),inset 0 1px 0 rgba(255,255,255,0.95)",
};

const SEC_LABEL = {
  fontSize:10.5, fontWeight:700, letterSpacing:"1.2px",
  textTransform:"uppercase", color:"#5eada0",
  display:"flex", alignItems:"center", gap:8, marginBottom:14,
};
const SEC_LINE = {
  flex:1, height:1,
  background:"linear-gradient(90deg,rgba(13,148,136,0.22),transparent)",
};

const GRAD_BTN = (disabled) => ({
  width:"100%", padding:"13px 20px", borderRadius:13, border:"none",
  background: disabled
    ? "linear-gradient(135deg,#a7c8c5,#b2ddd9)"
    : "linear-gradient(135deg,#0f766e 0%,#14b8a6 55%,#06b6d4 100%)",
  boxShadow: disabled ? "none" : "0 4px 18px rgba(13,148,136,0.28),inset 0 1px 0 rgba(255,255,255,0.15)",
  color:"white", fontSize:14, fontWeight:700,
  cursor: disabled ? "not-allowed" : "pointer",
  display:"flex", alignItems:"center", justifyContent:"center", gap:9,
  transition:"all 0.22s", pointerEvents: disabled ? "none" : "auto",
  letterSpacing:"0.1px",
});

// ─── Shimmer skeleton ─────────────────────────────────────────────────────
const Sk = ({ w="100%", h=14, r=7, style={} }) => (
  <div style={{
    width:w, height:h, borderRadius:r, flexShrink:0,
    background:"linear-gradient(90deg,#e0f2f1 25%,#b2dfdb 50%,#e0f2f1 75%)",
    backgroundSize:"200% 100%", animation:"tp-shimmer 1.5s infinite", ...style,
  }}/>
);

const TreatmentSkeleton = () => (
  <div style={{padding:"28px 24px 56px",maxWidth:740,margin:"0 auto",display:"flex",flexDirection:"column",gap:16}}>
    {/* header */}
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Sk w={195} h={27} r={8}/>
          <Sk w={58}  h={24} r={20}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Sk w={64}  h={11} r={5}/>
          <Sk w={76}  h={11} r={5}/>
          <Sk w={4}   h={4}  r={99}/>
          <Sk w={112} h={11} r={5}/>
        </div>
      </div>
      <Sk w={92} h={54} r={14}/>
    </div>

    {/* progress strip */}
    <div style={{...CARD,padding:"14px 18px",display:"flex",alignItems:"center",gap:0}}>
      {[1,2,3,4,5,6,7].map(i=>(
        <React.Fragment key={i}>
          <Sk w={26} h={26} r={99} style={{flexShrink:0}}/>
          {i<7 && <Sk h={3} r={99} style={{flex:1,margin:"0 2px"}}/>}
        </React.Fragment>
      ))}
    </div>

    {/* session donut + info */}
    <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:14}}>
      <div style={{...CARD,padding:"18px",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <Sk w="60%" h={10} r={5}/>
        <Sk w={130} h={130} r={65}/>
        <div style={{display:"flex",gap:10}}>
          <Sk w={32} h={32} r={99}/>
          <Sk w={32} h={32} r={99}/>
          <Sk w={32} h={32} r={99}/>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[1,2,3].map(i=>(
          <div key={i} style={{...CARD,overflow:"hidden",flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderBottom:"1px solid rgba(20,184,166,0.1)",background:"rgba(240,253,250,0.5)"}}>
              <Sk w={32} h={32} r={9}/>
              <Sk w={72} h={12} r={5}/>
              <Sk w={80} h={10} r={5} style={{marginLeft:"auto"}}/>
            </div>
            <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:7}}>
              <Sk h={12} r={5}/>
              <Sk h={12} r={5} w="82%"/>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* motivation */}
    <div style={{...CARD,padding:"18px"}}>
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <Sk w={34} h={34} r={10}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
          <Sk w="26%" h={10} r={5}/>
          <Sk h={13} r={5}/>
          <Sk h={13} r={5} w="78%"/>
        </div>
      </div>
    </div>

    {/* review */}
    <div style={{...CARD,padding:"22px 20px",display:"flex",flexDirection:"column",gap:14}}>
      <Sk w="44%" h={14} r={6}/>
      <div style={{display:"flex",gap:12}}><Sk h={50} r={13}/><Sk h={50} r={13}/></div>
      <Sk h={90} r={12}/>
      <Sk h={50} r={13}/>
    </div>
  </div>
);

// ─── Session completion donut ─────────────────────────────────────────────

// ─── Day progress strip ───────────────────────────────────────────────────
const DayProgress = ({ days, currentDay }) => {
  const visible = (days || []).slice(0, 14);
  return (
    <div style={{...CARD,padding:"14px 18px",display:"flex",alignItems:"center",gap:0,overflowX:"auto"}}>
      {visible.map((d, i) => {
        const done    = d.feedback != null;
        const current = d.day === currentDay;
        return (
          <React.Fragment key={d.day}>
            {i > 0 && (
              <div style={{
                flex:1, minWidth:8, height:2.5, borderRadius:99,
                background: done
                  ? "linear-gradient(90deg,#0f766e,#14b8a6)"
                  : "rgba(20,184,166,0.15)",
                transition:"background 0.4s",
              }}/>
            )}
            <div title={`Day ${d.day}`} style={{
              width:  current ? 32 : 24,
              height: current ? 32 : 24,
              borderRadius:"50%", flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: current ? 11 : 9.5, fontWeight:800,
              background: done
                ? "linear-gradient(135deg,#0f766e,#14b8a6)"
                : current
                  ? "linear-gradient(135deg,#14b8a6,#2dd4bf)"
                  : "rgba(240,253,250,0.9)",
              border: (done||current) ? "none" : "1.5px solid rgba(20,184,166,0.28)",
              color:  (done||current) ? "white" : "#94a3b8",
              boxShadow: current
                ? "0 0 0 4px rgba(20,184,166,0.2),0 3px 10px rgba(20,184,166,0.25)"
                : done ? "0 2px 6px rgba(13,148,136,0.2)" : "none",
              transition:"all 0.35s",
            }}>
              {done
                ? <svg width="9" height="8" viewBox="0 0 9 8" fill="none"><path d="M1 4L3.5 6.5L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : d.day}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────
const TreatmentPlan = () => {
  const navigate     = useNavigate();
  const [plan,       setPlan]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback,   setFeedback]   = useState("");
  const [notes,      setNotes]      = useState("");
  const [nextDayPlan,setNextDayPlan]= useState(null);
  const pageRef = useRef(null);

  useEffect(() => { loadPlan(); }, []);

  // Anime entrance
  useEffect(() => {
    if (loading) return;
    animate(".tp-card", {
      translateY:[18,0], opacity:[0,1],
      delay: stagger(65, { start:60 }),
      duration:460, easing:"easeOutCubic",
    });
  }, [loading]);

  // Auto-submit at midnight
  useEffect(() => {
    if (!plan || loading) return;
    const alreadyReviewed = plan.days?.find(d => d.day === plan.currentDay)?.feedback != null;
    if (alreadyReviewed) return;

    const now      = new Date();
    const midnight = new Date(now);
    midnight.setHours(24,0,0,0);
    const ms = midnight.getTime() - now.getTime();

    const timer = setTimeout(async () => {
      try {
        await treatmentAPI.submitReview({
          day: plan.currentDay,
          feedback:"negative",
          notes:"Auto-submitted: User did not complete today's treatment review.",
        });
        toast.error("Day automatically closed — treatment not reviewed");
        loadPlan();
      } catch(e) { console.error("Auto-submit failed",e); }
    }, ms);
    return () => clearTimeout(timer);
  }, [plan, loading]);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const res = await treatmentAPI.getStatus();
      setPlan(res.data);
    } catch(err) {
      const msg = err.response?.data?.message || "";
      if (msg.includes("No treatment plan")) navigate("/dashboard");
      else toast.error("Failed to load treatment plan");
    } finally { setLoading(false); }
  };

  const handleSubmitReview = async () => {
    if (!feedback) { toast.error("Please select positive or negative feedback"); return; }
    setSubmitting(true);
    try {
      const res = await treatmentAPI.submitReview({
        day:   plan.currentDay,
        feedback,
        notes: notes.trim() || undefined,
      });
      setNextDayPlan(res.data.plan);
      toast.success(`Day ${plan.currentDay} reviewed! Day ${res.data.day} plan ready.`);
      const updated = await treatmentAPI.getStatus();
      setPlan(updated.data);
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <>
      <style>{`@keyframes tp-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      <TreatmentSkeleton/>
    </>
  );

  if (!plan) return null;

  const currentDayData = plan.days?.find(d => d.day === plan.currentDay);
  const sev            = SEV[plan.overallSeverity];
  const alreadyReviewed = currentDayData?.feedback != null;

  return (
    <>
      <style>{`
        @keyframes tp-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes tp-spin    { to{transform:rotate(360deg)} }
        @keyframes tp-fadeup  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .tp-card { opacity:0; }
        .tp-session:hover { transform:translateY(-2px)!important; box-shadow:0 8px 24px rgba(15,118,110,0.1)!important; }
        .tp-fbtn:hover { transform:scale(1.02)!important; }
        .tp-grad-btn:not([disabled]):hover {
          transform:translateY(-2px) scale(1.01)!important;
          box-shadow:0 8px 28px rgba(13,148,136,0.38)!important;
        }
        .tp-grad-btn:not([disabled]):active { transform:scale(0.99)!important; }
      `}</style>

      <Toaster position="top-center" toastOptions={{
        style:{borderRadius:12,fontSize:13,fontWeight:500,border:"1px solid rgba(13,148,136,0.2)",background:"#f0fdfa",color:"#0f766e"},
      }}/>

      <div ref={pageRef} style={{padding:"28px 24px 64px",maxWidth:740,margin:"0 auto"}}>

        {/* ── Header ── */}
        <div className="tp-card" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:18}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <h1 style={{margin:0,fontSize:"1.6rem",fontWeight:900,color:"#0f2b27",letterSpacing:"-0.5px",lineHeight:1.2}}>
                Treatment Plan
              </h1>
              <span style={{
                fontSize:11,fontWeight:700,padding:"4px 13px",borderRadius:20,
                background:"linear-gradient(135deg,rgba(20,184,166,0.12),rgba(20,184,166,0.06))",
                border:"1.5px solid rgba(20,184,166,0.28)",color:"#0d9488",
                boxShadow:"0 2px 8px rgba(20,184,166,0.1)",
              }}>Day {plan.currentDay}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:"#64748b",fontWeight:500}}>Severity:</span>
              <span style={{fontSize:12,fontWeight:800,color:sev?.txt}}>{sev?.label}</span>
              <div style={{width:3,height:3,borderRadius:"50%",background:"#cbd5e1"}}/>
              <span style={{fontSize:12,color:"#64748b",fontWeight:500}}>
                {plan.totalDaysCompleted} day{plan.totalDaysCompleted!==1?"s":""} completed
              </span>
            </div>
          </div>

          {/* Severity badge */}
          {sev && (
            <div style={{
              flexShrink:0,padding:"10px 20px",borderRadius:14,textAlign:"center",
              background:sev.bg, border:`1.5px solid ${sev.bdr}55`,
              boxShadow:`0 4px 12px ${sev.bdr}18`,
            }}>
              <p style={{margin:"0 0 3px",fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:sev.txt,opacity:0.75}}>
                Severity
              </p>
              <p style={{margin:0,fontSize:13,fontWeight:900,color:sev.txt}}>{sev.label}</p>
            </div>
          )}
        </div>

        {/* ── Day progress ── */}
        {plan.days?.length > 0 && (
          <div className="tp-card" style={{marginBottom:14}}>
            <DayProgress days={plan.days} currentDay={plan.currentDay}/>
          </div>
        )}

        {/* ── Adjustment reason ── */}
        {currentDayData?.adjustment_reason && (
          <div className="tp-card" style={{
            ...CARD,padding:"14px 16px",marginBottom:14,
            display:"flex",alignItems:"flex-start",gap:11,
            background:"rgba(14,165,233,0.06)",border:"1.5px solid rgba(14,165,233,0.2)",
          }}>
            <div style={{width:32,height:32,borderRadius:9,flexShrink:0,background:"rgba(14,165,233,0.1)",border:"1px solid rgba(14,165,233,0.22)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className="bi bi-info-circle" style={{color:"#0ea5e9",fontSize:14}}/>
            </div>
            <p style={{margin:0,fontSize:13,color:"#0369a1",lineHeight:1.65,fontWeight:500}}>{currentDayData.adjustment_reason}</p>
          </div>
        )}

        {/* ── Session donut + session cards side-by-side ── */}
        {/* <div className="tp-card" style={{display:"grid",gridTemplateColumns:"190px 1fr",gap:14,marginBottom:14}}> */}
        <div
  className="tp-card"
  style={{
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
    marginBottom: 14
  }}
>
         

          {/* Session cards column */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {SESSION_CONFIG.map(({key,icon,label,color})=>{
              const sess = currentDayData?.[key];
              return (
                <div key={key} className="tp-session" style={{
                  ...CARD,overflow:"hidden",flex:1,
                  transition:"transform 0.2s,box-shadow 0.2s",
                }}>
                  {/* header */}
                  <div style={{
                    display:"flex",alignItems:"center",gap:11,
                    padding:"11px 16px",
                    borderBottom:"1px solid rgba(20,184,166,0.1)",
                    background:"rgba(240,253,250,0.55)",
                  }}>
                    <div style={{width:32,height:32,borderRadius:9,flexShrink:0,background:`${color}18`,border:`1.5px solid ${color}28`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <i className={`bi ${icon}`} style={{color,fontSize:14}}/>
                    </div>
                    <span style={{fontSize:13,fontWeight:800,color:"#0f2b27"}}>{label}</span>
                    {sess?.completed && (
                      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,fontSize:10.5,fontWeight:700,color:"#0d9488",padding:"3px 10px",borderRadius:20,background:"rgba(20,184,166,0.09)",border:"1px solid rgba(20,184,166,0.22)"}}>
                        <i className="bi bi-check-circle-fill" style={{fontSize:9.5}}/> Completed
                      </div>
                    )}
                  </div>
                  {/* body */}
                  <div style={{padding:"12px 16px"}}>
                    <p style={{
                      margin:0,fontSize:12.5,lineHeight:1.7,
                      color: sess?.treatment ? "#334155" : "#94a3b8",
                      fontStyle: sess?.treatment ? "normal" : "italic",
                    }}>
                      {sess?.treatment || "No treatment specified for this session"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Motivation ── */}
        {currentDayData?.motivation && (
          <div className="tp-card" style={{
            ...CARD,padding:"16px 18px",marginBottom:14,
            background:"rgba(240,253,250,0.75)",
            border:"1.5px solid rgba(20,184,166,0.2)",
          }}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{width:36,height:36,borderRadius:11,flexShrink:0,background:"rgba(20,184,166,0.1)",border:"1.5px solid rgba(20,184,166,0.22)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(20,184,166,0.1)"}}>
                <i className="bi bi-stars" style={{color:"#0d9488",fontSize:16}}/>
              </div>
              <div>
                <p style={{margin:"0 0 5px",fontSize:9.5,fontWeight:700,letterSpacing:"1.1px",textTransform:"uppercase",color:"#0d9488",opacity:0.8}}>
                  Daily Motivation
                </p>
                <p style={{margin:0,fontSize:13.5,color:"#0f766e",fontStyle:"italic",lineHeight:1.7,fontWeight:500}}>
                  {currentDayData.motivation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Review section ── */}
        {alreadyReviewed ? (
          <div className="tp-card" style={{
            ...CARD,padding:"30px 24px",textAlign:"center",
            background:"rgba(240,253,250,0.85)",
            border:"1.5px solid rgba(20,184,166,0.25)",
          }}>
            <div style={{width:60,height:60,borderRadius:"50%",margin:"0 auto 16px",background:"linear-gradient(135deg,rgba(20,184,166,0.15),rgba(20,184,166,0.07))",border:"2px solid rgba(20,184,166,0.3)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 0 7px rgba(20,184,166,0.07)"}}>
              <i className="bi bi-check-circle-fill" style={{color:"#0d9488",fontSize:26}}/>
            </div>
            <h3 style={{margin:"0 0 7px",fontSize:17,fontWeight:900,color:"#0f2b27",letterSpacing:"-0.3px"}}>
              Day {plan.currentDay} Reviewed
            </h3>
            <p style={{margin:"0 0 22px",fontSize:13,color:"#64748b",lineHeight:1.65}}>
              {nextDayPlan ? `Your Day ${plan.currentDay + 1} plan is shown above.` : "You've already submitted your review for today."}
            </p>
            <button onClick={loadPlan} disabled={loading} className="tp-grad-btn" style={GRAD_BTN(loading)}>
              <i className="bi bi-arrow-clockwise"/>
              Refresh Plan
            </button>
          </div>
        ) : (
          <div className="tp-card" style={{...CARD,padding:"22px 20px"}}>
            <div style={SEC_LABEL}>
              How did today go?
              <div style={SEC_LINE}/>
            </div>

            {/* Feedback buttons */}
            <div style={{display:"flex",gap:12,marginBottom:16}}>
              {[
                {value:"positive",icon:"bi-hand-thumbs-up",   label:"Worked Well", activeColor:"#0d9488", activeBg:"rgba(13,148,136,0.08)", activeBdr:"rgba(13,148,136,0.45)"},
                {value:"negative",icon:"bi-hand-thumbs-down",  label:"Had Issues",  activeColor:"#dc2626", activeBg:"rgba(220,38,38,0.07)",  activeBdr:"rgba(220,38,38,0.45)"},
              ].map(({value,icon,label,activeColor,activeBg,activeBdr})=>{
                const active = feedback===value;
                return (
                  <button key={value} id={`feedback-${value}`}
                    onClick={()=>setFeedback(value)}
                    className="tp-fbtn"
                    style={{
                      flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                      padding:"13px 14px", borderRadius:13,
                      background: active ? activeBg : "rgba(248,250,252,0.8)",
                      border: active ? `2px solid ${activeBdr}` : "1.5px solid rgba(20,184,166,0.15)",
                      color: active ? activeColor : "#64748b",
                      fontSize:13.5, fontWeight:700, cursor:"pointer",
                      boxShadow: active ? `0 0 0 3px ${activeColor}14` : "none",
                      transition:"all 0.18s", transform:"scale(1)",
                    }}>
                    <i className={`bi ${icon}`} style={{fontSize:16}}/>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Notes */}
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#64748b",marginBottom:8}}>
                Notes <span style={{fontWeight:500,color:"#94a3b8"}}>(optional)</span>
              </label>
              <textarea
                id="review-notes"
                value={notes}
                onChange={e=>setNotes(e.target.value)}
                placeholder="Describe any reactions, improvements, or concerns…"
                rows={3}
                style={{
                  width:"100%",padding:"12px 14px",borderRadius:12,
                  background:"rgba(255,255,255,0.85)",
                  border:"1.5px solid rgba(20,184,166,0.18)",
                  fontSize:13,color:"#1e293b",outline:"none",
                  fontFamily:"inherit",resize:"none",
                  transition:"border-color 0.2s,box-shadow 0.2s",
                  boxSizing:"border-box",lineHeight:1.65,
                }}
                onFocus={e=>{e.currentTarget.style.borderColor="#14b8a6";e.currentTarget.style.boxShadow="0 0 0 3px rgba(20,184,166,0.12)";}}
                onBlur={e=>{e.currentTarget.style.borderColor="rgba(20,184,166,0.18)";e.currentTarget.style.boxShadow="none";}}
              />
            </div>

            {/* Submit */}
            <button
              id="submit-review"
              onClick={handleSubmitReview}
              disabled={submitting||!feedback}
              className="tp-grad-btn"
              style={GRAD_BTN(submitting||!feedback)}
            >
              {submitting ? (
                <>
                  <svg style={{animation:"tp-spin 0.75s linear infinite",flexShrink:0}} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Generating next day with AI…
                </>
              ) : (
                <>
                  <i className="bi bi-send"/>
                  Submit Review & Get Next Day Plan
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default TreatmentPlan;
