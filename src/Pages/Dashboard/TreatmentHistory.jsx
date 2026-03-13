import React, { useState, useEffect, useRef } from "react";
import { treatmentAPI } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import { animate, stagger } from "animejs";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  LineElement, PointElement, LinearScale, CategoryScale, Filler,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale, Filler);

// ─── Severity palette ─────────────────────────────────────────────────────
const SEV = {
  cleanskin:         { txt:"#0f766e", label:"Clear Skin"      },
  mild:              { txt:"#a16207", label:"Mild"            },
  moderate:          { txt:"#c2410c", label:"Moderate"        },
  severe:            { txt:"#991b1b", label:"Severe"          },
  unknown:           { txt:"#475569", label:"Unknown"         },
};

// ─── Tokens ───────────────────────────────────────────────────────────────
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
const SEC_LINE = { flex:1, height:1, background:"linear-gradient(90deg,rgba(13,148,136,0.22),transparent)" };

// ─── Shimmer ──────────────────────────────────────────────────────────────
const Sk = ({ w="100%", h=14, r=7, style={} }) => (
  <div style={{
    width:w, height:h, borderRadius:r, flexShrink:0,
    background:"linear-gradient(90deg,#e0f2f1 25%,#b2dfdb 50%,#e0f2f1 75%)",
    backgroundSize:"200% 100%", animation:"th-shimmer 1.5s infinite", ...style,
  }}/>
);

const HistorySkeleton = () => (
  <div className="th-wrap" style={{display:"flex",flexDirection:"column",gap:18}}>
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      <Sk w={240} h={28} r={8}/><Sk w={280} h={12} r={5}/>
    </div>
    <div className="th-stat-grid">
      {[1,2,3,4].map(i=>(
        <div key={i} style={{...CARD,padding:"18px 14px",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          <Sk w={34} h={34} r={99}/><Sk w="55%" h={22} r={6}/><Sk w="70%" h={10} r={5}/>
        </div>
      ))}
    </div>
    <div className="th-chart-grid">
      <div style={{...CARD,padding:"20px",display:"flex",flexDirection:"column",gap:12}}>
        <Sk w="40%" h={10} r={5}/><Sk h={160} r={12}/>
      </div>
      <div style={{...CARD,padding:"20px",display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
        <Sk w="50%" h={10} r={5}/><Sk w={130} h={130} r={65}/>
        <div style={{display:"flex",flexDirection:"column",gap:6,width:"100%"}}><Sk h={10} r={5}/><Sk h={10} r={5}/></div>
      </div>
    </div>
    {[1,2,3,4].map(i=>(
      <div key={i} style={{...CARD,padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}>
        <Sk w={36} h={36} r={10}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
          <Sk w="30%" h={12} r={5}/><Sk w="70%" h={10} r={5}/>
        </div>
        <Sk w={80} h={24} r={20}/><Sk w={16} h={16} r={4}/>
      </div>
    ))}
  </div>
);

// ─── Feedback line ────────────────────────────────────────────────────────
const FeedbackLine = ({ completedDays }) => {
  const labels  = completedDays.map(d=>`D${d.day}`);
  const rolling = completedDays.map((_,i)=>{
    const slice = completedDays.slice(0,i+1);
    return Math.round((slice.filter(d=>d.feedback==="positive").length/slice.length)*100);
  });

  return (
    <div style={{height:155,position:"relative"}}>
      {completedDays.length < 2 ? (
        <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:11,fontWeight:600,color:"#b2dfdb",background:"rgba(255,255,255,0.9)",padding:"4px 14px",borderRadius:20,border:"1px solid rgba(20,184,166,0.15)"}}>
            Complete more days to see your trend
          </span>
        </div>
      ) : (
        <Line data={{
          labels,
          datasets:[{
            label:"Positive Rate %", data:rolling,
            borderColor:"#14b8a6",
            backgroundColor:"rgba(20,184,166,0.07)",
            pointBackgroundColor: completedDays.map(d=>d.feedback==="positive"?"#0d9488":"#ef4444"),
            pointBorderColor:"#fff",
            pointBorderWidth:2, pointRadius:5, pointHoverRadius:7,
            tension:0.42, fill:true, borderWidth:2.5,
          }],
        }} options={{
          responsive:true, maintainAspectRatio:false,
          plugins:{
            legend:{display:false},
            tooltip:{
              backgroundColor:"rgba(255,255,255,0.95)",
              titleColor:"#0f172a",bodyColor:"#475569",
              borderColor:"rgba(20,184,166,0.3)",borderWidth:1,
              padding:9,cornerRadius:9,
              callbacks:{label:ctx=>` ${ctx.raw}% positive rate`},
            },
          },
          scales:{
            x:{grid:{color:"rgba(20,184,166,0.07)"},ticks:{color:"#94a3b8",font:{size:9,weight:"600"}},border:{display:false}},
            y:{min:0,max:100,grid:{color:"rgba(20,184,166,0.07)"},ticks:{color:"#94a3b8",font:{size:9},callback:v=>`${v}%`,stepSize:25},border:{display:false}},
          },
        }}/>
      )}
    </div>
  );
};

// ─── Feedback donut ───────────────────────────────────────────────────────
const FeedbackDonut = ({ positives, negatives }) => {
  const total = positives+negatives;
  const pct   = total>0 ? Math.round((positives/total)*100) : 0;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
      <div style={{position:"relative",width:130,height:130}}>
        <Doughnut data={{
          labels:["Positive","Negative"],
          datasets:[{
            data: total>0 ? [positives, negatives||0.3] : [0.3,1],
            backgroundColor:["rgba(20,184,166,0.85)","rgba(239,68,68,0.7)"],
            borderColor:["#0d9488","#dc2626"],
            borderWidth:2, hoverOffset:6,
          }],
        }} options={{
          cutout:"70%",
          plugins:{
            legend:{display:false},
            tooltip:{backgroundColor:"rgba(255,255,255,0.95)",titleColor:"#0f172a",bodyColor:"#475569",borderColor:"rgba(20,184,166,0.3)",borderWidth:1,padding:9,cornerRadius:9},
          },
          animation:{animateRotate:true,duration:900},
        }}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <span style={{fontSize:20,fontWeight:900,color:"#0f2b27",lineHeight:1}}>{pct}%</span>
          <span style={{fontSize:9,color:"#64748b",fontWeight:600}}>positive</span>
        </div>
      </div>
      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:5}}>
        {[
          {label:"Positive",count:positives,color:"#0d9488",dot:"rgba(20,184,166,0.85)"},
          {label:"Negative",count:negatives,color:"#dc2626",dot:"rgba(239,68,68,0.7)"},
        ].map(({label,count,color,dot})=>(
          <div key={label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:dot,flexShrink:0}}/>
              <span style={{fontSize:11,color:"#64748b",fontWeight:500}}>{label}</span>
            </div>
            <span style={{fontSize:11,fontWeight:800,color}}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────
const EmptyState = ({ icon, title, sub }) => (
  <div style={{textAlign:"center",padding:"48px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
    <div style={{width:56,height:56,borderRadius:18,background:"rgba(20,184,166,0.07)",border:"1.5px solid rgba(20,184,166,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <i className={`bi ${icon}`} style={{fontSize:22,color:"#5eada0"}}/>
    </div>
    <div>
      <p style={{margin:"0 0 4px",fontSize:14,fontWeight:700,color:"#0f2b27"}}>{title}</p>
      <p style={{margin:0,fontSize:12.5,color:"#94a3b8",lineHeight:1.6}}>{sub}</p>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────
const TreatmentHistory = () => {
  const [plan,     setPlan]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(()=>{
    treatmentAPI.getStatus()
      .then(res=>setPlan(res.data))
      .catch(()=>toast.error("Failed to load history"))
      .finally(()=>setLoading(false));
  },[]);

  useEffect(()=>{
    if (loading) return;
    animate(".th-card",{ translateY:[18,0], opacity:[0,1], delay:stagger(60,{start:80}),  duration:460, easing:"easeOutCubic" });
    animate(".th-stat",{ scale:[0.9,1],    opacity:[0,1], delay:stagger(55,{start:200}), duration:360, easing:"easeOutBack"  });
  },[loading]);

  const toggle = (day) => {
    if (expanded===day) {
      const el = document.getElementById(`th-expand-${day}`);
      if (el) animate(el,{ height:[el.scrollHeight,0], opacity:[1,0], duration:240, easing:"easeInCubic", onComplete:()=>setExpanded(null) });
      else setExpanded(null);
    } else {
      setExpanded(day);
      requestAnimationFrame(()=>{
        const el = document.getElementById(`th-expand-${day}`);
        if (el) animate(el,{ height:[0,el.scrollHeight], opacity:[0,1], duration:300, easing:"easeOutCubic" });
      });
    }
  };

  if (loading) return (
    <>
      <style>{`
        @keyframes th-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes th-fadeup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .th-wrap{padding:22px 16px 56px;max-width:780px;margin:0 auto}
        .th-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}
        .th-chart-grid{display:grid;grid-template-columns:1fr 190px;gap:14px}
        @media(max-width:640px){
          .th-stat-grid{grid-template-columns:repeat(2,1fr)!important}
          .th-chart-grid{grid-template-columns:1fr!important}
        }
      `}</style>
      <div className="th-wrap"><HistorySkeleton/></div>
    </>
  );

  if (!plan) return (
    <div style={{padding:"28px 24px",maxWidth:780,margin:"0 auto"}}>
      <EmptyState icon="bi-calendar-x" title="No history yet" sub="Start your treatment plan to track progress here."/>
    </div>
  );

  const rawSeverity   = plan.overallSeverity;
  const severity      = rawSeverity === "moderate-severe" ? "unknown" : rawSeverity;
  const sev           = SEV[severity];
  const completedDays = plan.days?.filter(d=>d.feedback!==null)||[];
  const positives     = completedDays.filter(d=>d.feedback==="positive").length;
  const negatives     = completedDays.filter(d=>d.feedback==="negative").length;
  const streakDays    = (()=>{ let s=0; for(let i=completedDays.length-1;i>=0;i--){ if(completedDays[i].feedback==="positive")s++; else break; } return s; })();

  return (
    <>
      <style>{`
        @keyframes th-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes th-fadeup  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .th-card    { opacity:0; }
        .th-stat    { opacity:0; }
        .th-expand  { overflow:hidden; }
        .th-day-row:hover      { background:rgba(240,253,250,0.9)!important; }
        .th-session-inner:hover{ transform:translateY(-1px)!important; }
        .th-stat:hover         { transform:translateY(-2px)!important; box-shadow:0 8px 28px rgba(15,118,110,0.1)!important; }

        /* ─ Layout wrappers ─ */
        .th-wrap { padding:28px 24px 64px; max-width:780px; margin:0 auto; }

        /* ─ Stat grid: 4 cols ─ */
        .th-stat-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 13px;
          margin-bottom: 18px;
        }

        /* ─ Charts row: line + donut ─ */
        .th-chart-grid {
          display: grid;
          grid-template-columns: 1fr 190px;
          gap: 14px;
          margin-bottom: 18px;
        }

        /* ─ Expanded sessions: 3 cols ─ */
        .th-sessions-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
        }

        /* ─ Day row inner ─ */
        .th-day-inner {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .th-day-preview {
          display: block;
        }
        .th-feedback-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          flex-shrink: 0;
        }

        /* ════════════════════════════
           TABLET ≤ 768px
        ════════════════════════════ */
        @media (max-width: 768px) {
          .th-chart-grid {
            grid-template-columns: 1fr !important;
          }
          .th-sessions-grid {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }

        /* ════════════════════════════
           MOBILE ≤ 480px
        ════════════════════════════ */
        @media (max-width: 480px) {
          .th-wrap { padding: 16px 12px 56px; }

          /* 2-col stat grid */
          .th-stat-grid {
            grid-template-columns: repeat(2,1fr) !important;
            gap: 10px !important;
          }

          /* Single-col charts */
          .th-chart-grid {
            grid-template-columns: 1fr !important;
          }

          /* Sessions stack to 1 col */
          .th-sessions-grid {
            grid-template-columns: 1fr !important;
          }

          /* Day row: hide preview text, keep pill compact */
          .th-day-preview { display:none !important; }
          .th-feedback-pill { padding:3px 8px !important; font-size:10px !important; }
          .th-day-inner  { gap:8px !important; }

          /* Day bubble smaller */
          .th-day-bubble {
            width:30px !important;
            height:30px !important;
            font-size:11px !important;
          }

          /* Tighten row padding */
          .th-day-btn { padding:11px 12px !important; }
          .th-expand-inner { padding:12px 12px !important; }

          /* Stat card: shrink value font */
          .th-stat-value { font-size:18px !important; }
        }
      `}</style>

      <Toaster position="top-center" toastOptions={{
        style:{borderRadius:12,fontSize:13,fontWeight:500,border:"1px solid rgba(13,148,136,0.2)",background:"#f0fdfa",color:"#0f766e"},
      }}/>

      <div className="th-wrap">

        {/* ── Header ── */}
        <div className="th-card" style={{marginBottom:22}}>
          <h1 style={{margin:"0 0 5px",fontSize:"1.6rem",fontWeight:900,color:"#0f2b27",letterSpacing:"-0.5px",lineHeight:1.2}}>
            Treatment Progress
          </h1>
          <p style={{margin:0,fontSize:13,color:"#64748b",fontWeight:500}}>
            Tracking your skincare journey day by day
            {sev && <> · Severity: <span style={{fontWeight:700,color:sev.txt}}>{sev.label}</span></>}
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="th-stat-grid">
          {[
            {label:"Total Days",      value:plan.currentDay-1, icon:"bi-calendar3",        color:"#0d9488",bg:"rgba(13,148,136,0.08)"},
            {label:"Completed",       value:completedDays.length,icon:"bi-check-circle",   color:"#0ea5e9",bg:"rgba(14,165,233,0.08)"},
            {label:"Positive",        value:positives,          icon:"bi-hand-thumbs-up",  color:"#22c55e",bg:"rgba(34,197,94,0.08)" },
            {label:"Positive Streak", value:streakDays,         icon:"bi-lightning-charge",color:"#f59e0b",bg:"rgba(245,158,11,0.08)"},
          ].map(({label,value,icon,color,bg})=>(
            <div key={label} className="th-stat" style={{
              ...CARD,padding:"16px 14px",
              display:"flex",flexDirection:"column",alignItems:"center",
              gap:6,textAlign:"center",
              transition:"transform 0.2s,box-shadow 0.2s",
            }}>
              <div style={{width:36,height:36,borderRadius:11,background:bg,border:`1px solid ${color}22`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <i className={`bi ${icon}`} style={{color,fontSize:16}}/>
              </div>
              <p className="th-stat-value" style={{margin:0,fontSize:22,fontWeight:900,color:"#0f2b27",lineHeight:1,letterSpacing:"-0.3px"}}>{value}</p>
              <p style={{margin:0,fontSize:10.5,color:"#64748b",fontWeight:600}}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Charts row ── */}
        {completedDays.length>0 && (
          <div className="th-card th-chart-grid">
            <div style={{...CARD,padding:"20px 20px 16px"}}>
              <div style={SEC_LABEL}>Positive Rate Over Time<div style={SEC_LINE}/></div>
              <FeedbackLine completedDays={completedDays}/>
            </div>
            <div style={{...CARD,padding:"20px 16px"}}>
              <div style={SEC_LABEL}>Response Split<div style={SEC_LINE}/></div>
              <FeedbackDonut positives={positives} negatives={negatives}/>
            </div>
          </div>
        )}

        {/* ── Day timeline ── */}
        <div className="th-card" style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={SEC_LABEL}>Day History<div style={SEC_LINE}/></div>

          {plan.days?.length===0 ? (
            <EmptyState icon="bi-clock-history" title="No days yet" sub="Your treatment history will appear here as you progress."/>
          ) : (
            [...(plan.days||[])].reverse().map(day=>{
              const isOpen    = expanded===day.day;
              const isCurrent = day.day===plan.currentDay;
              const isPos     = day.feedback==="positive";
              const isNeg     = day.feedback==="negative";
              const fbColor   = isPos?"#0d9488":isNeg?"#dc2626":null;
              const fbBg      = isPos?"rgba(13,148,136,0.09)":isNeg?"rgba(220,38,38,0.08)":null;
              const fbBdr     = isPos?"rgba(13,148,136,0.3)":isNeg?"rgba(220,38,38,0.3)":null;

              return (
                <div key={day.day} style={{
                  ...CARD,overflow:"hidden",
                  border:     isCurrent?"1.5px solid rgba(20,184,166,0.4)":CARD.border,
                  boxShadow:  isCurrent?"0 4px 24px rgba(13,148,136,0.12),inset 0 1px 0 rgba(255,255,255,0.95)":CARD.boxShadow,
                }}>
                  {/* Row button */}
                  <button
                    id={`day-row-${day.day}`}
                    className="th-day-row th-day-btn"
                    onClick={()=>toggle(day.day)}
                    style={{
                      width:"100%",textAlign:"left",cursor:"pointer",
                      border:"none",background:"rgba(255,255,255,0.6)",
                      padding:"14px 18px",transition:"background 0.18s",
                    }}
                  >
                    <div className="th-day-inner">
                      {/* Bubble */}
                      <div className="th-day-bubble" style={{
                        width:36,height:36,borderRadius:11,flexShrink:0,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:13,fontWeight:900,
                        background: isCurrent?"linear-gradient(135deg,#0f766e,#14b8a6)":day.feedback?"rgba(20,184,166,0.1)":"rgba(240,253,250,0.8)",
                        border: isCurrent?"none":"1.5px solid rgba(20,184,166,0.2)",
                        color:  isCurrent?"white":day.feedback?"#0d9488":"#94a3b8",
                        boxShadow: isCurrent?"0 3px 10px rgba(13,148,136,0.25)":"none",
                      }}>{day.day}</div>

                      {/* Label + preview */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                          <span style={{fontSize:13.5,fontWeight:800,color:"#0f2b27"}}>Day {day.day}</span>
                          {isCurrent && (
                            <span style={{fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:20,background:"rgba(20,184,166,0.1)",color:"#0d9488",border:"1px solid rgba(20,184,166,0.28)",flexShrink:0}}>
                              Current
                            </span>
                          )}
                        </div>
                        <p className="th-day-preview" style={{margin:0,fontSize:11.5,color:"#94a3b8",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"92%"}}>
                          {day.morning?.treatment?.substring(0,65)||"No treatment data"}…
                        </p>
                      </div>

                      {/* Feedback pill */}
                      {day.feedback && (
                        <div className="th-feedback-pill" style={{background:fbBg,color:fbColor,border:`1px solid ${fbBdr}`}}>
                          <i className={`bi bi-hand-thumbs-${isPos?"up":"down"}`} style={{fontSize:10}}/>
                          <span className="th-fb-label">{day.feedback.charAt(0).toUpperCase()+day.feedback.slice(1)}</span>
                        </div>
                      )}

                      {/* Chevron */}
                      <i className={`bi bi-chevron-${isOpen?"up":"down"}`} style={{
                        fontSize:11,color:"#94a3b8",flexShrink:0,
                        transition:"transform 0.25s",
                        transform:isOpen?"rotate(180deg)":"rotate(0deg)",
                      }}/>
                    </div>
                  </button>

                  {/* Expanded panel */}
                  {isOpen && (
                    <div id={`th-expand-${day.day}`} className="th-expand" style={{borderTop:"1px solid rgba(20,184,166,0.1)"}}>
                      <div className="th-expand-inner" style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:10}}>

                        {/* Sessions */}
                        <div className="th-sessions-grid">
                          {[
                            {session:"Morning",   icon:"bi-sunrise",    data:day.morning,   color:"#f59e0b"},
                            {session:"Afternoon", icon:"bi-sun",        data:day.afternoon, color:"#0ea5e9"},
                            {session:"Evening",   icon:"bi-moon-stars", data:day.evening,   color:"#a78bfa"},
                          ].map(({session,icon,data,color})=>(
                            <div key={session} className="th-session-inner" style={{
                              background:"rgba(248,253,252,0.8)",
                              border:"1.5px solid rgba(20,184,166,0.12)",
                              borderRadius:13,padding:"12px 13px",
                              transition:"transform 0.2s",
                            }}>
                              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
                                <div style={{width:26,height:26,borderRadius:7,background:`${color}18`,border:`1.5px solid ${color}28`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                  <i className={`bi ${icon}`} style={{color,fontSize:11}}/>
                                </div>
                                <span style={{fontSize:11,fontWeight:800,color}}>{session}</span>
                                {data?.completed && <i className="bi bi-check-circle-fill" style={{color:"#0d9488",fontSize:9,marginLeft:"auto"}}/>}
                              </div>
                              <p style={{margin:0,fontSize:11,color:"#475569",lineHeight:1.65}}>{data?.treatment||"—"}</p>
                            </div>
                          ))}
                        </div>

                        {/* Motivation */}
                        {day.motivation && (
                          <div style={{padding:"11px 14px",borderRadius:12,background:"rgba(20,184,166,0.06)",border:"1px solid rgba(20,184,166,0.15)",display:"flex",alignItems:"flex-start",gap:9}}>
                            <i className="bi bi-quote" style={{color:"#14b8a6",fontSize:15,flexShrink:0,marginTop:1}}/>
                            <p style={{margin:0,fontSize:12,color:"#0f766e",fontStyle:"italic",lineHeight:1.65}}>{day.motivation}</p>
                          </div>
                        )}

                        {/* Notes */}
                        {day.notes && (
                          <div style={{padding:"11px 14px",borderRadius:12,background:"rgba(248,250,252,0.8)",border:"1.5px solid rgba(20,184,166,0.12)"}}>
                            <p style={{margin:"0 0 4px",fontSize:9.5,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#5eada0"}}>Your Notes</p>
                            <p style={{margin:0,fontSize:12,color:"#334155",lineHeight:1.65}}>{day.notes}</p>
                          </div>
                        )}

                        {/* AI adjustment */}
                        {day.adjustment_reason && (
                          <div style={{padding:"11px 14px",borderRadius:12,background:"rgba(14,165,233,0.06)",border:"1.5px solid rgba(14,165,233,0.18)",display:"flex",alignItems:"flex-start",gap:9}}>
                            <i className="bi bi-cpu" style={{color:"#0ea5e9",fontSize:13,flexShrink:0,marginTop:1}}/>
                            <div>
                              <p style={{margin:"0 0 3px",fontSize:9.5,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#0ea5e9",opacity:0.8}}>AI Adjustment</p>
                              <p style={{margin:0,fontSize:12,color:"#0369a1",lineHeight:1.65}}>{day.adjustment_reason}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default TreatmentHistory;