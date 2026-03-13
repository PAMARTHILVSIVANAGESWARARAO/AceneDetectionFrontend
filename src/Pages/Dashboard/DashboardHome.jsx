import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userAPI, treatmentAPI, authAPI } from "../../services/api";
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
  cleanskin:         { bg:"rgba(13,148,136,0.09)",  bdr:"#0d9488", txt:"#0f766e", label:"Clear Skin",      icon:"bi-emoji-smile"        },
  mild:              { bg:"rgba(202,138,4,0.09)",   bdr:"#ca8a04", txt:"#a16207", label:"Mild",            icon:"bi-exclamation-circle"  },
  moderate:          { bg:"rgba(234,88,12,0.09)",   bdr:"#ea580c", txt:"#c2410c", label:"Moderate",        icon:"bi-exclamation-triangle"},
  "moderate-severe": { 
  bg: "rgba(255,0,0,0.1)", 
  bdr: "#ff0000", 
  txt: "#cc0000", 
  label: "Moderate-severe", 
  icon: "bi-exclamation-octagon" 
},

  severe:            { bg:"rgba(185,28,28,0.1)",    bdr:"#b91c1c", txt:"#991b1b", label:"Severe",          icon:"bi-shield-exclamation"  },
};

// ─── Card style token ─────────────────────────────────────────────────────
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

const RESPONSIVE_CSS = `
  @media (max-width: 1024px) {
    .dh-home-wrap { padding: 22px 16px 44px !important; }
    .dh-header-row { flex-direction: column !important; gap: 14px !important; }
    .dh-header-widgets { width: 100% !important; flex-direction: column !important; }
    .dh-clock-widget, .dh-calendar-widget { width: 100% !important; min-width: 0 !important; }
    .dh-stat-grid { grid-template-columns: 1fr !important; }
    .dh-charts-grid { grid-template-columns: 1fr !important; }
    .dh-session-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 640px) {
    .dh-plan-head { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
  }
`;

// ─── Shimmer skeleton ─────────────────────────────────────────────────────
const Sk = ({ w="100%", h=14, r=7, style={} }) => (
  <div style={{
    width:w, height:h, borderRadius:r, flexShrink:0,
    background:"linear-gradient(90deg,#e0f2f1 25%,#b2dfdb 50%,#e0f2f1 75%)",
    backgroundSize:"200% 100%", animation:"dh-shimmer 1.5s infinite", ...style,
  }}/>
);

const DashboardSkeleton = () => (
  <div style={{padding:"28px 24px 48px",maxWidth:980,margin:"0 auto",display:"flex",flexDirection:"column",gap:18}}>
    {/* top row */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16}}>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        <Sk w={150} h={11} r={5}/>
        <Sk w={300} h={28} r={8}/>
      </div>
      <div style={{display:"flex",gap:12}}>
        <Sk w={110} h={82} r={18}/>
        <Sk w={140} h={82} r={18}/>
      </div>
    </div>
    {/* stat cards */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13}}>
      {[1,2,3,4].map(i=>(
        <div key={i} style={{...CARD,padding:"16px 14px",display:"flex",flexDirection:"column",gap:10,animation:`dh-fadeup 0.4s ${i*0.07}s both`}}>
          <Sk w={32} h={32} r={9}/><Sk w="52%" h={10} r={5}/><Sk w="70%" h={22} r={6}/>
        </div>
      ))}
    </div>
    {/* two col */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div style={{...CARD,padding:"20px",display:"flex",flexDirection:"column",gap:12}}>
        <Sk w="40%" h={11} r={5}/><Sk h={160} r={12}/>
      </div>
      <div style={{...CARD,padding:"20px",display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
        <Sk w="40%" h={11} r={5}/><Sk w={160} h={160} r={80}/>
      </div>
    </div>
    {/* bottom card */}
    <div style={{...CARD,padding:"22px 20px",display:"flex",flexDirection:"column",gap:14}}>
      <Sk w="38%" h={13} r={6}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        {[1,2,3].map(i=>(
          <div key={i} style={{background:"rgba(240,253,250,0.7)",border:"1.5px solid rgba(20,184,166,0.12)",borderRadius:14,padding:"14px",display:"flex",flexDirection:"column",gap:9}}>
            <Sk w={50} h={10} r={5}/><Sk h={12} r={5}/><Sk w="80%" h={12} r={5}/><Sk w="60%" h={12} r={5}/>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Live Clock Widget ────────────────────────────────────────────────────
const ClockWidget = () => {
  const [time, setTime] = useState(new Date());
  const secRef = useRef(null);
  const minRef = useRef(null);
  const hrRef  = useRef(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now);
      const s = now.getSeconds();
      const m = now.getMinutes();
      const h = now.getHours() % 12;
      if (secRef.current) secRef.current.style.transform = `rotate(${s * 6}deg)`;
      if (minRef.current) minRef.current.style.transform = `rotate(${m * 6}deg)`;
      if (hrRef.current)  hrRef.current.style.transform  = `rotate(${(h * 30) + (m * 0.5)}deg)`;
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const hh = time.getHours();
  const mm  = String(time.getMinutes()).padStart(2,"0");
  const ss  = String(time.getSeconds()).padStart(2,"0");
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12  = String(hh % 12 || 12).padStart(2,"0");

  return (
    <div className="dh-clock-widget" style={{...CARD, padding:"18px 20px", display:"flex", flexDirection:"column", gap:12, minWidth:160}}>
      {/* analog face */}
      <div style={{position:"relative",width:80,height:80,margin:"0 auto"}}>
        {/* track */}
        <svg width="80" height="80" viewBox="0 0 80 80" style={{position:"absolute",inset:0}}>
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(20,184,166,0.12)" strokeWidth="2"/>
          {/* hour ticks */}
          {[...Array(12)].map((_,i)=>{
            const a = (i*30-90)*Math.PI/180;
            const x1=40+30*Math.cos(a), y1=40+30*Math.sin(a);
            const x2=40+34*Math.cos(a), y2=40+34*Math.sin(a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(20,184,166,0.35)" strokeWidth="1.5" strokeLinecap="round"/>;
          })}
        </svg>
        {/* hands */}
        <div ref={hrRef} style={{position:"absolute",bottom:"50%",left:"calc(50% - 1.5px)",width:3,height:22,borderRadius:3,background:"#0f766e",transformOrigin:"bottom center",transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}/>
        <div ref={minRef} style={{position:"absolute",bottom:"50%",left:"calc(50% - 1px)",width:2,height:28,borderRadius:2,background:"#14b8a6",transformOrigin:"bottom center",transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}/>
        <div ref={secRef} style={{position:"absolute",bottom:"50%",left:"calc(50% - 0.5px)",width:1,height:32,borderRadius:1,background:"#f97316",transformOrigin:"bottom center",transition:"transform 0.08s linear"}}/>
        {/* centre dot */}
        <div style={{position:"absolute",top:"50%",left:"50%",width:6,height:6,borderRadius:"50%",background:"#0f766e",transform:"translate(-50%,-50%)",boxShadow:"0 0 0 2px white"}}/>
      </div>
      {/* digital */}
      <div style={{textAlign:"center"}}>
        <p style={{margin:0,fontSize:22,fontWeight:900,color:"#0f2b27",letterSpacing:"-0.5px",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>
          {h12}:{mm}<span style={{fontSize:13,fontWeight:700,color:"#5eada0",marginLeft:3}}>{ampm}</span>
        </p>
        <p style={{margin:"3px 0 0",fontSize:10,color:"#94a3b8",fontWeight:500}}>:{ss}</p>
      </div>
    </div>
  );
};

// ─── Mini Calendar Widget ─────────────────────────────────────────────────
const CalendarWidget = () => {
  const today    = new Date();
  const [view,   setView]   = useState({ y: today.getFullYear(), m: today.getMonth() });
  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m+1, 0).getDate();
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const cells = [];
  for (let i=0;i<firstDay;i++) cells.push(null);
  for (let d=1;d<=daysInMonth;d++) cells.push(d);

  const isToday = (d) => d===today.getDate() && view.m===today.getMonth() && view.y===today.getFullYear();

  return (
    <div className="dh-calendar-widget" style={{...CARD, padding:"16px 18px", minWidth:200}}>
      {/* header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={()=>setView(v=>{ const d=new Date(v.y,v.m-1,1); return {y:d.getFullYear(),m:d.getMonth()}; })}
          style={{width:24,height:24,borderRadius:6,border:"1px solid rgba(20,184,166,0.2)",background:"rgba(20,184,166,0.06)",color:"#0d9488",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <i className="bi bi-chevron-left"/>
        </button>
        <span style={{fontSize:12,fontWeight:800,color:"#0f2b27"}}>{MONTHS[view.m]} {view.y}</span>
        <button onClick={()=>setView(v=>{ const d=new Date(v.y,v.m+1,1); return {y:d.getFullYear(),m:d.getMonth()}; })}
          style={{width:24,height:24,borderRadius:6,border:"1px solid rgba(20,184,166,0.2)",background:"rgba(20,184,166,0.06)",color:"#0d9488",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <i className="bi bi-chevron-right"/>
        </button>
      </div>
      {/* day labels */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DAYS.map(d=>(
          <div key={d} style={{textAlign:"center",fontSize:9,fontWeight:700,color:"#94a3b8",padding:"2px 0"}}>{d}</div>
        ))}
      </div>
      {/* cells */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((d,i)=>(
          <div key={i} style={{
            aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",
            borderRadius:6,fontSize:10,fontWeight: isToday(d) ? 800 : 500,
            background: isToday(d) ? "linear-gradient(135deg,#0f766e,#14b8a6)" : "transparent",
            color: isToday(d) ? "white" : d ? "#334155" : "transparent",
            boxShadow: isToday(d) ? "0 2px 8px rgba(13,148,136,0.3)" : "none",
            cursor: d ? "default" : "none",
          }}>{d}</div>
        ))}
      </div>
      {/* today footer */}
      <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid rgba(20,184,166,0.1)",textAlign:"center"}}>
        <span style={{fontSize:10,fontWeight:600,color:"#5eada0"}}>
          {today.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
        </span>
      </div>
    </div>
  );
};

// ─── Severity Donut ───────────────────────────────────────────────────────
const SeverityDonut = ({ severity }) => {
  const s = SEV[severity];
  if (!s) return null;

  const ORDER   = ["cleanskin","mild","moderate","moderate-severe","severe"];
  const idx     = ORDER.indexOf(severity);

  const COLORS  = ["#0d9488","#ca8a04","#ea580c","#dc2626","#b91c1c"];

  const data = {
    labels: ORDER.map(k=>SEV[k]?.label || k),
    datasets:[{
      data: ORDER.map((_,i) => i<=idx ? 1 : 0.18),
      backgroundColor: ORDER.map((_,i) => i<=idx ? COLORS[i] : "rgba(20,184,166,0.07)"),
      borderColor:     ORDER.map((_,i) => i<=idx ? COLORS[i] : "rgba(20,184,166,0.12)"),
      borderWidth:2, hoverOffset:6,
    }],
  };

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
      <div style={{position:"relative",width:140,height:140}}>
        <Doughnut data={data} options={{
          cutout:"68%",
          plugins:{legend:{display:false},tooltip:{
            backgroundColor:"rgba(255,255,255,0.95)",
            titleColor:"#0f172a",bodyColor:"#475569",
            borderColor:"rgba(20,184,166,0.3)",borderWidth:1,
            padding:10,cornerRadius:10,
            callbacks:{label:ctx=>`  ${ctx.label}`},
          }},
          animation:{animateRotate:true,duration:900},
        }}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <i className={`bi ${s.icon}`} style={{fontSize:16,color:s.txt,marginBottom:2}}/>
          <span style={{fontSize:11,fontWeight:800,color:s.txt,lineHeight:1}}>{s.label}</span>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4,width:"100%"}}>
        {ORDER.map((k,i)=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:i<=idx?COLORS[i]:"rgba(20,184,166,0.18)",flexShrink:0}}/>
            <span style={{fontSize:10.5,color:i<=idx?"#334155":"#94a3b8",fontWeight:i===idx?700:500,flex:1}}>{SEV[k]?.label || k}</span>
            {i===idx && <span style={{fontSize:9,fontWeight:700,color:s.txt,background:s.bg,padding:"1px 6px",borderRadius:10,border:`1px solid ${s.bdr}40`}}>current</span>}
          </div>
        ))}
      </div>
    </div>
  );
};


// ─── Main component ───────────────────────────────────────────────────────
const DashboardHome = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [pageLoading,  setPageLoading]  = useState(true);
  const [startingPlan, setStartingPlan] = useState(false);
  const [userData,     setUserData]     = useState(null);
  const [status,       setStatus]       = useState(null);
  const [treatmentPlan,setTreatmentPlan]= useState(null);
  const [userCount,    setUserCount]    = useState(null);
  const pageRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [uRes, sRes] = await Promise.all([userAPI.getMyUserInfo(), userAPI.getUserStatus()]);
        setUserData(uRes.data);
        setStatus(sRes.data);
        if (sRes.data.both_completed) {
          try { const tRes = await treatmentAPI.getStatus(); setTreatmentPlan(tRes.data); } catch {}
        }
        const cRes = await authAPI.getUserCount();
        setUserCount(cRes.data.totalUsers);
      } catch { toast.error("Failed to load data"); }
      finally { setPageLoading(false); }
    };
    init();
  }, []);

  // Anime entrance after data loads
  useEffect(() => {
    if (pageLoading) return;
    animate(".dh-card", {
      translateY: [20, 0], opacity: [0, 1],
      delay: stagger(60, { start: 80 }),
      duration: 480, easing: "easeOutCubic",
    });
    animate(".dh-stat", {
      scale: [0.92, 1], opacity: [0, 1],
      delay: stagger(55, { start: 200 }),
      duration: 360, easing: "easeOutBack",
    });
  }, [pageLoading]);

  const handleGeneratePlan = async () => {
    setStartingPlan(true);
    try {
      await treatmentAPI.generateDayOne();
      toast.success("Day 1 treatment plan generated!");
      const tRes = await treatmentAPI.getStatus();
      setTreatmentPlan(tRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate plan";
      if (msg.includes("already")) { const tRes = await treatmentAPI.getStatus(); setTreatmentPlan(tRes.data); }
      else toast.error(msg);
    } finally { setStartingPlan(false); }
  };

  if (pageLoading) return (
    <>
      <style>{`@keyframes dh-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}} @keyframes dh-fadeup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} ${RESPONSIVE_CSS}`}</style>
      <DashboardSkeleton/>
    </>
  );

  const username      = userData?.user?.username || "User";
  const severity      = treatmentPlan?.overallSeverity;
  const sev           = SEV[severity];
  const today         = treatmentPlan?.days?.find(d => d.day === treatmentPlan?.currentDay);
  const daysCompleted = treatmentPlan?.totalDaysCompleted || 0;

  const GRAD_TXT = { background:"linear-gradient(135deg,#0d9488,#0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" };

  return (
    <>
      <style>{`
        @keyframes dh-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes dh-fadeup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dh-spin{to{transform:rotate(360deg)}}
        @keyframes dh-pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .dh-card{opacity:0}
        .dh-stat{opacity:0}
        .dh-session-card:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(15,118,110,0.1)!important}
        .dh-stat-card:hover{transform:translateY(-2px)!important;box-shadow:0 8px 28px rgba(15,118,110,0.1)!important}
        ${RESPONSIVE_CSS}
      `}</style>

      <Toaster position="top-center" toastOptions={{
        style:{borderRadius:12,fontSize:13,fontWeight:500,border:"1px solid rgba(13,148,136,0.2)",background:"#f0fdfa",color:"#0f766e"},
      }}/>

      <div ref={pageRef} className="dh-home-wrap" style={{padding:"28px 24px 56px",maxWidth:980,margin:"0 auto"}}>

        {/* ── Header row ── */}
        <div className="dh-card dh-header-row" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:24}}>
          <div>
            <p style={{margin:"0 0 5px",fontSize:12.5,color:"#94a3b8",fontWeight:500}}>
              {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
            </p>
            <h1 style={{margin:0,fontSize:"1.8rem",fontWeight:900,color:"#0f2b27",letterSpacing:"-0.5px",lineHeight:1.15}}>
              Welcome back,{" "}
              <span style={GRAD_TXT}>{username}</span> 👋
            </h1>
            <p style={{margin:"6px 0 0",fontSize:13,color:"#64748b",fontWeight:500}}>
              Here's your skin health overview for today.
            </p>
          </div>

          {/* Clock + Calendar widgets */}
          <div className="dh-header-widgets" style={{display:"flex",gap:12,flexShrink:0}}>
            <ClockWidget/>
            <CalendarWidget/>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="dh-stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:18}}>
          {[
            {label:"Current Day",    value: treatmentPlan?`Day ${treatmentPlan.currentDay}`:"—",     icon:"bi-calendar-check",    color:"#0d9488",  bg:"rgba(13,148,136,0.08)"},
            {label:"Days Completed", value: daysCompleted,                                            icon:"bi-check-circle",      color:"#0ea5e9",  bg:"rgba(14,165,233,0.08)"},
            {label:"Skin Severity",  value: sev?.label||"Pending",                                   icon: sev?.icon||"bi-activity", color: sev?.txt||"#64748b", bg: sev?.bg||"rgba(20,184,166,0.06)"},
            {label:"Community",      value: userCount?`${userCount}+ users`:"…",                     icon:"bi-people",            color:"#a78bfa",  bg:"rgba(167,139,250,0.08)"},
          ].map(({label,value,icon,color,bg})=>(
            <div key={label} className="dh-stat dh-stat-card" style={{
              ...CARD, padding:"16px 16px",
              display:"flex",flexDirection:"column",gap:5,
              transition:"transform 0.2s,box-shadow 0.2s",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}>
                <div style={{width:34,height:34,borderRadius:10,background:bg,border:`1px solid ${color}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <i className={`bi ${icon}`} style={{color,fontSize:15}}/>
                </div>
                <span style={{fontSize:11,color:"#64748b",fontWeight:600}}>{label}</span>
              </div>
              <p style={{margin:0,fontSize:22,fontWeight:900,color:"#0f2b27",lineHeight:1,letterSpacing:"-0.3px"}}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Charts row: adherence line + severity donut + session donut ── */}
        {treatmentPlan && (
          <div className="dh-card dh-charts-grid" style={{display:"grid",gridTemplateColumns:"1fr 180px 160px",gap:14,marginBottom:18}}>
            {/* Line chart */}
            
            {/* Severity donut */}
            <div style={{...CARD,padding:"18px 14px"}}>
              <div style={SEC_LABEL}>Severity<div style={SEC_LINE}/></div>
              <SeverityDonut severity={severity}/>
            </div>
            {/* Session donut */}

          </div>
        )}

        {/* ── Onboarding checklist ── */}
        {!status?.both_completed && (
          <div className="dh-card" style={{...CARD,padding:"22px 20px",marginBottom:16}}>
            <div style={SEC_LABEL}>Complete Your Setup<div style={SEC_LINE}/></div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {done:status?.questionnaire_completed, label:"Health Questionnaire", to:"/onboarding/questionnaire", step:"1"},
                {done:status?.acne_analysis_completed,  label:"Acne Image Analysis",  to:"/onboarding/upload",        step:"2"},
              ].map(({done,label,to,step})=>(
                <div key={step} style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,
                  padding:"12px 14px",borderRadius:13,
                  background: done?"rgba(20,184,166,0.06)":"rgba(248,250,252,0.8)",
                  border:`1.5px solid ${done?"rgba(20,184,166,0.3)":"rgba(20,184,166,0.1)"}`,
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{
                      width:28,height:28,borderRadius:"50%",flexShrink:0,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      background: done?"linear-gradient(135deg,#0f766e,#14b8a6)":"rgba(20,184,166,0.1)",
                      fontSize:12,fontWeight:700,
                      color: done?"white":"#5eada0",
                      boxShadow: done?"0 2px 8px rgba(20,184,166,0.3)":"none",
                    }}>
                      {done?<i className="bi bi-check"/>:step}
                    </div>
                    <span style={{fontSize:13,fontWeight:600,color:done?"#0d9488":"#334155"}}>{label}</span>
                  </div>
                  {!done && (
                    <Link to={to} style={{fontSize:12,padding:"7px 18px",borderRadius:9,background:"linear-gradient(135deg,#0f766e,#14b8a6)",color:"white",fontWeight:700,textDecoration:"none",boxShadow:"0 3px 10px rgba(20,184,166,0.28)"}}>
                      Start
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Generate plan CTA ── */}
        {status?.both_completed && !treatmentPlan && (
          <div className="dh-card" style={{...CARD,padding:"40px 28px",textAlign:"center",marginBottom:16}}>
            <div style={{width:64,height:64,borderRadius:20,margin:"0 auto 18px",background:"rgba(20,184,166,0.1)",border:"1.5px solid rgba(20,184,166,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className="bi bi-cpu" style={{color:"#0d9488",fontSize:26}}/>
            </div>
            <h2 style={{margin:"0 0 8px",fontSize:20,fontWeight:900,color:"#0f2b27",letterSpacing:"-0.3px"}}>Ready to Start Treatment</h2>
            <p style={{margin:"0 0 24px",fontSize:13.5,color:"#64748b",lineHeight:1.7,maxWidth:380,marginInline:"auto"}}>
              Your acne analysis is complete. Let our AI generate a personalised Day 1 treatment plan for you.
            </p>
            <button id="generate-plan-btn" onClick={handleGeneratePlan} disabled={startingPlan}
              style={{
                padding:"14px 36px",borderRadius:14,border:"none",
                background: startingPlan?"linear-gradient(135deg,#a7c8c5,#b2ddd9)":"linear-gradient(135deg,#0f766e,#14b8a6,#06b6d4)",
                boxShadow: startingPlan?"none":"0 5px 20px rgba(20,184,166,0.32)",
                color:"white",fontSize:14,fontWeight:700,
                cursor:startingPlan?"not-allowed":"pointer",
                display:"inline-flex",alignItems:"center",gap:10,
                transition:"all 0.22s",
              }}>
              {startingPlan?(
                <>
                  <svg style={{animation:"dh-spin 0.75s linear infinite",flexShrink:0}} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Generating with AI…
                </>
              ):<><i className="bi bi-magic"/>Generate My Treatment Plan</>}
            </button>
          </div>
        )}

        {/* ── Today's plan preview ── */}
        {treatmentPlan && (
          <div className="dh-card" style={{...CARD,padding:"22px 20px"}}>
            <div className="dh-plan-head" style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={SEC_LABEL}>
                Today's Plan — Day {treatmentPlan.currentDay}
                <div style={SEC_LINE}/>
              </div>
              <Link to="/dashboard/treatment" style={{fontSize:12,fontWeight:700,color:"#0d9488",textDecoration:"none",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                Full plan <i className="bi bi-arrow-right"/>
              </Link>
            </div>

            {today && (
              <div className="dh-session-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:14}}>
                {[
                  {session:"Morning",   icon:"bi-sunrise",    treatment:today.morning?.treatment,   done:today.morning?.completed,   color:"#f59e0b"},
                  {session:"Afternoon", icon:"bi-sun",        treatment:today.afternoon?.treatment, done:today.afternoon?.completed, color:"#0ea5e9"},
                  {session:"Evening",   icon:"bi-moon-stars", treatment:today.evening?.treatment,   done:today.evening?.completed,   color:"#a78bfa"},
                ].map(({session,icon,treatment,done,color})=>(
                  <div key={session} className="dh-session-card" style={{
                    background:"rgba(248,253,252,0.8)",
                    border:`1.5px solid ${done?"rgba(20,184,166,0.3)":"rgba(20,184,166,0.1)"}`,
                    borderRadius:15, padding:"15px 15px",
                    display:"flex",flexDirection:"column",gap:8,
                    transition:"transform 0.2s,box-shadow 0.2s",
                    boxShadow:"0 2px 8px rgba(0,0,0,0.03)",
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:30,height:30,borderRadius:8,background:`${color}18`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <i className={`bi ${icon}`} style={{color,fontSize:13}}/>
                      </div>
                      <span style={{fontSize:12,fontWeight:800,color:"#0f2b27"}}>{session}</span>
                      {done && (
                        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,fontSize:10,fontWeight:700,color:"#0d9488",padding:"2px 8px",borderRadius:20,background:"rgba(20,184,166,0.09)",border:"1px solid rgba(20,184,166,0.2)"}}>
                          <i className="bi bi-check-circle-fill" style={{fontSize:9}}/> Done
                        </div>
                      )}
                    </div>
                    <p style={{margin:0,fontSize:12,color:"#475569",lineHeight:1.65,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                      {treatment||"—"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Motivation */}
            {today?.motivation && (
              <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 16px",borderRadius:13,background:"rgba(20,184,166,0.06)",border:"1px solid rgba(20,184,166,0.15)"}}>
                <i className="bi bi-quote" style={{color:"#14b8a6",fontSize:18,flexShrink:0,marginTop:1}}/>
                <p style={{margin:0,fontSize:13,color:"#0d9488",fontStyle:"italic",lineHeight:1.65,fontWeight:500}}>
                  {today.motivation}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
};

export default DashboardHome;
