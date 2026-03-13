import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import { animate, stagger } from "animejs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// ─── Severity palette ─────────────────────────────────────────────────────
const SEV = {
  cleanskin:         { bg:"rgba(13,148,136,0.09)",  bdr:"#0d9488", txt:"#0f766e", label:"Clear Skin"      },
  mild:              { bg:"rgba(202,138,4,0.09)",   bdr:"#ca8a04", txt:"#a16207", label:"Mild"            },
  moderate:          { bg:"rgba(234,88,12,0.09)",   bdr:"#ea580c", txt:"#c2410c", label:"Moderate"        },
  "moderate-severe": { bg:"rgba(220,38,38,0.09)",   bdr:"#dc2626", txt:"#b91c1c", label:"Moderate-Severe" },
  severe:            { bg:"rgba(185,28,28,0.1)",    bdr:"#b91c1c", txt:"#991b1b", label:"Severe"          },
};
const SEV_HEX = {
  cleanskin:"#0d9488", mild:"#ca8a04", moderate:"#ea580c",
  "moderate-severe":"#dc2626", severe:"#b91c1c",
};

const CARD = {
  background:"rgba(255,255,255,0.82)",
  backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
  border:"1.5px solid rgba(20,184,166,0.18)",
  borderRadius:20,
  boxShadow:"0 4px 24px rgba(15,118,110,0.08),inset 0 1px 0 rgba(255,255,255,0.95)",
};
const SEC_LABEL = {
  fontSize:10.5, fontWeight:700, letterSpacing:"1.2px",
  textTransform:"uppercase", color:"#5eada0",
  display:"flex", alignItems:"center", gap:8,
};
const SEC_LINE = { flex:1, height:1, background:"linear-gradient(90deg,rgba(13,148,136,0.22),transparent)" };

// ─── Shimmer ──────────────────────────────────────────────────────────────
const Sk = ({ w="100%", h=14, r=7, style={} }) => (
  <div style={{
    width:w, height:h, borderRadius:r, flexShrink:0,
    background:"linear-gradient(90deg,#e0f2f1 25%,#b2dfdb 50%,#e0f2f1 75%)",
    backgroundSize:"200% 100%", animation:"pf-shimmer 1.5s infinite", ...style,
  }}/>
);

const ProfileSkeleton = () => (
  <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",flexDirection:"column",gap:9}}><Sk w={120} h={28} r={8}/><Sk w={220} h={12} r={5}/></div>
    <div style={{...CARD,padding:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <Sk w={62} h={62} r={16} style={{flexShrink:0}}/>
        <div style={{flex:1,minWidth:160,display:"flex",flexDirection:"column",gap:9}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><Sk w={140} h={18} r={6}/><Sk w={68} h={20} r={20}/></div>
          <Sk w={190} h={12} r={5}/><Sk w={120} h={10} r={5}/>
        </div>
        <Sk w={88} h={52} r={14} style={{flexShrink:0}}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",marginTop:14,paddingTop:14,borderTop:"1px solid rgba(20,184,166,0.1)"}}>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{flex:"1 1 48%",display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"8px 6px"}}>
            <Sk w={36} h={10} r={5}/><Sk w={44} h={14} r={6}/>
          </div>
        ))}
      </div>
    </div>
    <div style={{...CARD,padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
      <Sk w="40%" h={11} r={5}/>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{display:"flex",flexDirection:"column",gap:6}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><Sk w="45%" h={11} r={5}/><Sk w={58} h={20} r={20}/></div>
            <Sk h={6} r={99}/>
          </div>
        ))}
      </div>
    </div>
    {[1,2,3,4,5].map(i=>(
      <div key={i} style={{...CARD,padding:"15px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><Sk w={34} h={34} r={10}/><Sk w={120} h={13} r={5}/></div>
        <Sk w={14} h={14} r={4}/>
      </div>
    ))}
  </div>
);

// ─── InfoRow ──────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div style={{
    display:"flex", alignItems:"baseline",
    justifyContent:"space-between", gap:12,
    padding:"10px 0",
    borderBottom:"1px solid rgba(20,184,166,0.08)",
    flexWrap:"wrap",
  }}>
    <span style={{fontSize:10.5,fontWeight:700,letterSpacing:"0.8px",textTransform:"uppercase",color:"#94a3b8",flexShrink:0}}>
      {label}
    </span>
    <span style={{fontSize:13,fontWeight:600,color:"#334155",textAlign:"right",lineHeight:1.5,wordBreak:"break-word",maxWidth:"100%"}}>
      {value || <span style={{color:"#cbd5e1",fontStyle:"italic",fontWeight:400}}>Not provided</span>}
    </span>
  </div>
);

// ─── Accordion section ────────────────────────────────────────────────────
const Section = ({ title, icon, children, defaultOpen=false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const bodyRef = useRef(null);

  const toggle = () => {
    if (open) {
      if (bodyRef.current) {
        animate(bodyRef.current, {
          height:[bodyRef.current.scrollHeight,0],
          opacity:[1,0],
          duration:240,
          easing:"easeInCubic",
          onComplete:()=>setOpen(false),
        });
      } else setOpen(false);
    } else {
      setOpen(true);
      requestAnimationFrame(()=>{
        if (bodyRef.current)
          animate(bodyRef.current, {
            height:[0,bodyRef.current.scrollHeight],
            opacity:[0,1],
            duration:300,
            easing:"easeOutCubic",
          });
      });
    }
  };

  return (
    <div className="pf-section" style={{...CARD,overflow:"hidden",marginBottom:10}}>
      <button onClick={toggle} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
        padding:"14px 18px", border:"none", background:"rgba(255,255,255,0.5)",
        cursor:"pointer", textAlign:"left", transition:"background 0.18s",
      }}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(240,253,250,0.85)"}
        onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.5)"}
      >
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{
            width:34,height:34,borderRadius:10,flexShrink:0,
            background:"rgba(20,184,166,0.09)",border:"1.5px solid rgba(20,184,166,0.2)",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            <i className={`bi ${icon}`} style={{color:"#0d9488",fontSize:14}}/>
          </div>
          <span style={{fontSize:13.5,fontWeight:800,color:"#0f2b27"}}>{title}</span>
        </div>
        <i className={`bi bi-chevron-${open?"up":"down"}`} style={{
          fontSize:11,color:"#94a3b8",flexShrink:0,
          transition:"transform 0.25s",transform:open?"rotate(180deg)":"rotate(0deg)",
        }}/>
      </button>
      {open && (
        <div ref={bodyRef} style={{overflow:"hidden"}}>
          <div style={{padding:"4px 18px 16px",borderTop:"1px solid rgba(20,184,166,0.1)"}}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Area donut ───────────────────────────────────────────────────────────
const AreaDonut = ({ areas }) => {
  const counts = {};
  areas.forEach(a=>{ counts[a.prediction]=(counts[a.prediction]||0)+1; });
  const ORDER  = ["cleanskin","mild","moderate","moderate-severe","severe"];
  const active = ORDER.filter(k=>counts[k]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
      <div style={{position:"relative",width:145,height:145}}>
        <Doughnut data={{
          labels: active.map(k=>SEV[k]?.label||k),
          datasets:[{
            data:   active.map(k=>counts[k]),
            backgroundColor: active.map(k=>`${SEV_HEX[k]}cc`),
            borderColor:     active.map(k=>SEV_HEX[k]),
            borderWidth:2, hoverOffset:6,
          }],
        }} options={{
          cutout:"68%",
          plugins:{
            legend:{display:false},
            tooltip:{
              backgroundColor:"rgba(255,255,255,0.95)",
              titleColor:"#0f172a",bodyColor:"#475569",
              borderColor:"rgba(20,184,166,0.3)",borderWidth:1,
              padding:9,cornerRadius:9,
              callbacks:{label:ctx=>`  ${ctx.label}: ${ctx.raw} area${ctx.raw>1?"s":""}`},
            },
          },
          animation:{animateRotate:true,duration:900},
        }}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <span style={{fontSize:22,fontWeight:900,color:"#0f2b27",lineHeight:1}}>{areas.length}</span>
          <span style={{fontSize:9.5,color:"#64748b",fontWeight:600}}>areas</span>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5,width:"100%"}}>
        {active.map(k=>(
          <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:SEV_HEX[k],flexShrink:0}}/>
              <span style={{fontSize:10.5,color:"#64748b",fontWeight:500}}>{SEV[k]?.label}</span>
            </div>
            <span style={{fontSize:10.5,fontWeight:800,color:SEV_HEX[k]}}>{counts[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────
const Profile = () => {
  const { logout } = useAuth();
  const [info,    setInfo]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    userAPI.getMyUserInfo()
      .then(res=>setInfo(res.data))
      .catch(()=>toast.error("Failed to load profile"))
      .finally(()=>setLoading(false));
  },[]);

  useEffect(()=>{
    if (loading) return;
    animate(".pf-card", {
      translateY:[18,0],
      opacity:[0,1],
      delay:stagger(65,{start:80}),
      duration:460,
      easing:"easeOutCubic",
    });
    animate(".pf-section", {
      translateX:[-12,0],
      opacity:[0,1],
      delay:stagger(50,{start:380}),
      duration:360,
      easing:"easeOutCubic",
    });
  },[loading]);

  if (loading) return (
    <>
      <style>{`@keyframes pf-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      <div style={{padding:"22px 16px 56px",maxWidth:680,margin:"0 auto"}}><ProfileSkeleton/></div>
    </>
  );

  const user = info?.user;
  const q    = info?.questionnaire;
  const a    = info?.acne_analysis;

  const overallSeverity = (()=>{
    if (!a?.areas?.length) return null;
    const preds = a.areas.map(ar=>ar.prediction);
    if (preds.includes("severe")) return "severe";
    const mod = preds.filter(p=>p==="moderate").length;
    if (mod > preds.length/2) return "moderate-severe";
    if (mod > 0) return "moderate";
    if (preds.includes("mild")) return "mild";
    return "cleanskin";
  })();

  const sev       = overallSeverity ? SEV[overallSeverity] : null;
  const initial   = user?.username?.[0]?.toUpperCase()||"U";
  const formatDate = d => d ? new Date(d).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) : "—";

  return (
    <>
      <style>{`
        @keyframes pf-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .pf-card    { opacity:0; }
        .pf-section { opacity:0; }

        /* ─ Account inner row ─ */
        .pf-account-inner { display:flex; align-items:center; gap:16px; }

        /* ─ Stats strip ─ */
        .pf-stats-strip    { display:flex; flex-wrap:nowrap; }
        .pf-stat-cell      { flex:1; text-align:center; padding:8px 6px; border-right:1px solid rgba(20,184,166,0.1); }
        .pf-stat-cell:last-child { border-right:none; }

        /* ─ Analysis grid ─ */
        .pf-analysis-grid  { display:grid; grid-template-columns:1fr 170px; gap:18px; align-items:start; }
        .pf-donut-col      { position:sticky; top:20px; }

        /* ─ Area rows ─ */
        .pf-area-row { transition:background 0.18s, transform 0.18s; }
        .pf-area-row:hover { background:rgba(240,253,250,0.95)!important; transform:translateY(-1px); }
        .pf-area-row-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }

        /* ─ Section btn hover ─ */
        .pf-section-btn:hover { background:rgba(240,253,250,0.85)!important; }

        /* ════════════════════════════════
           TABLET  ≤ 768px
        ════════════════════════════════ */
        @media (max-width: 768px) {
          .pf-analysis-grid  { grid-template-columns:1fr!important; }
          .pf-donut-col      { position:static!important; display:flex; justify-content:center; padding-top:4px; }
          .pf-stats-strip    { flex-wrap:wrap; }
          .pf-stat-cell      { flex:1 1 48%; border-right:none!important; border-bottom:1px solid rgba(20,184,166,0.08); }
          .pf-stat-cell:nth-child(odd)  { border-right:1px solid rgba(20,184,166,0.1)!important; }
          .pf-stat-cell:nth-last-child(-n+2) { border-bottom:none!important; }
        }

        /* ════════════════════════════════
           MOBILE  ≤ 480px  — row-wise
        ════════════════════════════════ */
        @media (max-width: 480px) {
          /* account card wraps into a column but keeps avatar+text in a row */
          .pf-account-inner  { flex-wrap:wrap; gap:12px; }
          .pf-avatar-box     { width:48px!important; height:48px!important; border-radius:14px!important; font-size:20px!important; }

          /* stat cells: all 4 in a 2×2 grid */
          .pf-stats-strip    { flex-wrap:wrap; }
          .pf-stat-cell      { flex:1 1 48%; border-right:none!important; border-bottom:1px solid rgba(20,184,166,0.08); padding:10px 6px; }
          .pf-stat-cell:nth-child(odd)  { border-right:1px solid rgba(20,184,166,0.1)!important; }
          .pf-stat-cell:nth-last-child(-n+2) { border-bottom:none!important; }

          /* info row: label left, value right, both on SAME row (no column stacking) */
          .pf-info-row-inner { flex-direction:row!important; align-items:center!important; }
          .pf-info-value     { text-align:right!important; max-width:55%!important; font-size:12px!important; }
          .pf-info-label     { font-size:9.5px!important; }

          /* area row: severity pill drops below name */
          .pf-area-row-header { flex-wrap:wrap; gap:6px; }

          /* section btn: tighter padding */
          .pf-section-btn    { padding:12px 14px!important; }
          .pf-section-btn span { font-size:13px!important; }
        }
      `}</style>

      <Toaster position="top-center" toastOptions={{
        style:{borderRadius:12,fontSize:13,fontWeight:500,border:"1px solid rgba(13,148,136,0.2)",background:"#f0fdfa",color:"#0f766e"},
      }}/>

      <div style={{padding:"28px 24px 64px",maxWidth:680,margin:"0 auto"}}>

        {/* ── Header ── */}
        <div className="pf-card" style={{marginBottom:20}}>
          <h1 style={{margin:"0 0 5px",fontSize:"1.6rem",fontWeight:900,color:"#0f2b27",letterSpacing:"-0.5px",lineHeight:1.2}}>Profile</h1>
          <p style={{margin:0,fontSize:13,color:"#64748b",fontWeight:500}}>Your account and health information</p>
        </div>

        {/* ── Account card ── */}
        <div className="pf-card" style={{...CARD,padding:"20px 22px",marginBottom:14}}>
          <div className="pf-account-inner">
            {/* Avatar */}
            <div className="pf-avatar-box" style={{
              width:62,height:62,borderRadius:18,flexShrink:0,
              background:"linear-gradient(135deg,#0f766e,#14b8a6,#06b6d4)",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 4px 16px rgba(13,148,136,0.3),inset 0 1px 0 rgba(255,255,255,0.2)",
              fontSize:24,fontWeight:900,color:"white",letterSpacing:"-0.5px",
            }}>{initial}</div>

            {/* Name / email */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:4,flexWrap:"wrap"}}>
                <h2 style={{margin:0,fontSize:17,fontWeight:900,color:"#0f2b27",letterSpacing:"-0.3px"}}>{user?.username}</h2>
                {user?.isVerified && (
                  <span style={{
                    display:"inline-flex",alignItems:"center",gap:4,
                    fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,
                    background:"rgba(20,184,166,0.1)",color:"#0d9488",
                    border:"1.5px solid rgba(20,184,166,0.28)",
                    boxShadow:"0 1px 6px rgba(20,184,166,0.1)",
                  }}>
                    <i className="bi bi-patch-check-fill" style={{fontSize:9}}/>Verified
                  </span>
                )}
              </div>
              <p style={{margin:"0 0 3px",fontSize:12.5,color:"#64748b",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</p>
              <p style={{margin:0,fontSize:11,color:"#94a3b8",fontWeight:500}}>Joined {formatDate(user?.createdAt)}</p>
            </div>

            {/* Severity badge */}
            {sev && (
              <div style={{
                flexShrink:0,padding:"10px 18px",borderRadius:14,textAlign:"center",
                background:sev.bg,border:`1.5px solid ${sev.bdr}55`,
                boxShadow:`0 4px 12px ${sev.bdr}18`,
              }}>
                <p style={{margin:"0 0 3px",fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:sev.txt,opacity:0.75}}>Severity</p>
                <p style={{margin:0,fontSize:13,fontWeight:900,color:sev.txt}}>{sev.label}</p>
              </div>
            )}
          </div>

          {/* Stats strip */}
          {(q||a) && (
            <div className="pf-stats-strip" style={{marginTop:16,paddingTop:14,borderTop:"1px solid rgba(20,184,166,0.1)"}}>
              {[
                {label:"Questionnaire",  done:!!q,              icon:"bi-clipboard2-check", value:null       },
                {label:"Acne Analysis",  done:!!a?.areas?.length,icon:"bi-cpu",             value:null       },
                {label:"Skin Type",      done:!!q?.skinType,     icon:"bi-droplet",         value:q?.skinType},
                {label:"Age Group",      done:!!q?.ageGroup,     icon:"bi-person",          value:q?.ageGroup},
              ].map(({label,done,icon,value})=>(
                <div key={label} className="pf-stat-cell">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:4}}>
                    <i className={`bi ${icon}`} style={{fontSize:11,color:done?"#0d9488":"#94a3b8"}}/>
                    <span style={{fontSize:9.5,fontWeight:700,color:"#94a3b8",letterSpacing:"0.5px"}}>{label}</span>
                  </div>
                  {value
                    ? <p style={{margin:0,fontSize:11,fontWeight:700,color:"#334155",textAlign:"center"}}>{value}</p>
                    : <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:done?"#0d9488":"#e2e8f0"}}/>
                        <span style={{fontSize:10,fontWeight:600,color:done?"#0d9488":"#94a3b8"}}>{done?"Done":"Pending"}</span>
                      </div>
                  }
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Acne Analysis card ── */}
        {a?.areas?.length > 0 && (
          <div className="pf-card" style={{...CARD,padding:"20px",marginBottom:14}}>
            <div style={{...SEC_LABEL,marginBottom:16}}>
              Acne Analysis Results<div style={SEC_LINE}/>
            </div>
            <div className="pf-analysis-grid">
              {/* Area list */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {a.areas.map(area=>{
                  const s = SEV[area.prediction]||SEV.mild;
                  const areaLabel = area.area.replace(/([A-Z])/g," $1").trim();
                  return (
                    <div key={area.area} className="pf-area-row" style={{
                      padding:"11px 13px",borderRadius:13,
                      background:"rgba(248,253,252,0.8)",
                      border:`1.5px solid ${s.bdr}30`,
                    }}>
                      <div className="pf-area-row-header">
                        <span style={{fontSize:13,fontWeight:800,color:"#0f2b27",textTransform:"capitalize"}}>{areaLabel}</span>
                        <span style={{
                          fontSize:10.5,fontWeight:700,padding:"3px 10px",borderRadius:20,flexShrink:0,
                          background:s.bg,color:s.txt,border:`1px solid ${s.bdr}45`,
                        }}>{s.label}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:9}}>
                        <span style={{fontSize:10,fontWeight:600,color:"#94a3b8",flexShrink:0}}>Confidence</span>
                        <div style={{flex:1,height:5,borderRadius:99,background:"rgba(20,184,166,0.1)",overflow:"hidden"}}>
                          <div style={{
                            height:"100%",borderRadius:99,
                            background:`linear-gradient(90deg,${s.bdr},${s.bdr}88)`,
                            width:`${area.confidence}%`,
                            transition:"width 1s cubic-bezier(0.16,1,0.3,1)",
                          }}/>
                        </div>
                        <span style={{fontSize:10.5,fontWeight:800,color:s.txt,flexShrink:0}}>{area.confidence.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Donut */}
              <div className="pf-donut-col"><AreaDonut areas={a.areas}/></div>
            </div>
          </div>
        )}

        {/* ── Questionnaire sections ── */}
        {q ? (
          <>
            <Section title="Basic Information"   icon="bi-person"            defaultOpen>
              <InfoRow label="Age Group"      value={q.ageGroup}/>
              <InfoRow label="Sex"            value={q.sex}/>
              <InfoRow label="Skin Type"      value={q.skinType}/>
              <InfoRow label="Acne Duration"  value={q.acneDuration}/>
              <InfoRow label="Sensitive Skin" value={q.sensitiveSkin}/>
            </Section>
            <Section title="Acne Details"        icon="bi-search">
              <InfoRow label="Locations"   value={q.acneLocation?.join(", ")}/>
              <InfoRow label="Description" value={q.acneDescription}/>
            </Section>
            <Section title="Allergy & Medical"   icon="bi-shield-exclamation">
              <InfoRow label="Medication Allergy"   value={q.medicationAllergy}/>
              <InfoRow label="Allergy Types"        value={q.allergyReactionTypes?.join(", ")}/>
              <InfoRow label="Medication Reactions" value={q.acneMedicationReaction?.join(", ")}/>
              <InfoRow label="Food Allergy"         value={q.foodAllergy}/>
            </Section>
            <Section title="Products & Diet"     icon="bi-droplet">
              <InfoRow label="Using Acne Products" value={q.usingAcneProducts}/>
              <InfoRow label="Current Products"    value={q.currentProducts?.join(", ")}/>
              <InfoRow label="Dairy Consumption"   value={q.dairyConsumption}/>
            </Section>
            <Section title="Lifestyle"           icon="bi-heart-pulse">
              <InfoRow label="Stress Level"     value={q.stressLevel}/>
              <InfoRow label="Sleep Hours"      value={q.sleepHours}/>
              <InfoRow label="Additional Notes" value={q.additionalFeelings}/>
            </Section>
          </>
        ) : (
          <div className="pf-section" style={{
            ...CARD,padding:"32px 24px",textAlign:"center",
            border:"1.5px dashed rgba(20,184,166,0.22)",background:"rgba(240,253,250,0.5)",
          }}>
            <div style={{width:48,height:48,borderRadius:14,margin:"0 auto 14px",background:"rgba(20,184,166,0.07)",border:"1.5px solid rgba(20,184,166,0.18)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <i className="bi bi-clipboard" style={{fontSize:20,color:"#5eada0"}}/>
            </div>
            <p style={{margin:"0 0 5px",fontSize:14,fontWeight:700,color:"#0f2b27"}}>Questionnaire not completed</p>
            <p style={{margin:0,fontSize:12.5,color:"#94a3b8",lineHeight:1.6}}>Complete your health questionnaire to see detailed information here.</p>
          </div>
        )}

      </div>
    </>
  );
};

export default Profile;
