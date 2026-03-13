import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { animate, stagger } from "animejs";

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const NAV_ITEMS = [
  { to: "/dashboard",           label: "Overview",       icon: "bi-house",            end: true  },
  { to: "/dashboard/treatment", label: "Treatment Plan", icon: "bi-card-heading", end: false },
  { to: "/dashboard/history",   label: "Progress",       icon: "bi-graph-up-arrow",   end: false },
  { to: "/dashboard/profile",   label: "Profile",        icon: "bi-person-circle",    end: false },

];

// ─────────────────────────────────────────────
//  Design tokens (inline — no Tailwind needed)
// ─────────────────────────────────────────────
const TOKEN = {
  pageBg:      "linear-gradient(145deg,#f0fdfa 0%,#e8faf7 40%,#f0f9ff 75%,#ecfdf5 100%)",
  sidebarBg:   "rgba(255,255,255,0.82)",
  sidebarBdr:  "rgba(20,184,166,0.18)",
  cardBg:      "rgba(255,255,255,0.78)",
  cardBdr:     "rgba(20,184,166,0.18)",
  cardShadow:  "0 4px 24px rgba(15,118,110,0.08),inset 0 1px 0 rgba(255,255,255,0.9)",
  activeGrad:  "linear-gradient(135deg,#0f766e 0%,#14b8a6 55%,#06b6d4 100%)",
  activeGlow:  "0 4px 16px rgba(20,184,166,0.32),inset 0 1px 0 rgba(255,255,255,0.18)",
  hoverBg:     "rgba(20,184,166,0.07)",
  teal900:     "#0f2b27",
  teal700:     "#0f766e",
  teal500:     "#14b8a6",
  teal300:     "#5eada0",
  slate500:    "#64748b",
  slate300:    "#94a3b8",
  red:         "#dc2626",
  redBg:       "rgba(220,38,38,0.07)",
  redBdr:      "rgba(220,38,38,0.22)",
};

// ─────────────────────────────────────────────
//  Shimmer skeleton primitive
// ─────────────────────────────────────────────
const Sk = ({ w = "100%", h = 13, r = 7, style = {} }) => (
  <div style={{
    width: w, height: h, borderRadius: r, flexShrink: 0,
    background: "linear-gradient(90deg,#e0f2f1 25%,#b2dfdb 50%,#e0f2f1 75%)",
    backgroundSize: "200% 100%",
    animation: "dl-shimmer 1.6s ease-in-out infinite",
    ...style,
  }} />
);

// ─────────────────────────────────────────────
//  Sidebar skeleton (shown once on first mount)
// ─────────────────────────────────────────────
const SidebarSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 10px" }}>
    {[70, 90, 58, 50].map((w, i) => (
      <div key={i} style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px", borderRadius: 12,
        background: "rgba(20,184,166,0.04)",
        animation: `dl-fadeup 0.4s ${i * 0.07}s both`,
      }}>
        <Sk w={18} h={18} r={5} />
        <Sk w={`${w}%`} h={11} r={5} />
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────
//  Page content skeleton
// ─────────────────────────────────────────────
const PageSkeleton = () => (
  <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 900, margin: "0 auto" }}>
    {/* heading */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <Sk w={150} h={11} r={5} />
        <Sk w={260} h={26} r={8} />
      </div>
      <Sk w={100} h={52} r={14} />
    </div>
    {/* stat cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 13 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          background: TOKEN.cardBg, backdropFilter: "blur(16px)",
          border: `1.5px solid ${TOKEN.cardBdr}`, borderRadius: 18,
          padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10,
          boxShadow: TOKEN.cardShadow,
          animation: `dl-fadeup 0.4s ${i * 0.06}s both`,
        }}>
          <Sk w={30} h={30} r={9} />
          <Sk w="50%" h={10} r={5} />
          <Sk w="68%" h={20} r={6} />
        </div>
      ))}
    </div>
    {/* main card */}
    <div style={{
      background: TOKEN.cardBg, backdropFilter: "blur(16px)",
      border: `1.5px solid ${TOKEN.cardBdr}`, borderRadius: 20,
      padding: "22px 20px", display: "flex", flexDirection: "column", gap: 14,
      boxShadow: TOKEN.cardShadow,
    }}>
      <Sk w="32%" h={13} r={5} />
      {[100, 88, 72].map((w, i) => <Sk key={i} h={13} r={5} w={`${w}%`} />)}
      <Sk h={130} r={14} />
    </div>
  </div>
);

// ─────────────────────────────────────────────
//  Decorative blobs
// ─────────────────────────────────────────────
const Blobs = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
    <div style={{
      position: "absolute", top: "-12%", left: "-8%",
      width: 460, height: 460, borderRadius: "50%",
      background: "radial-gradient(circle,rgba(20,184,166,0.18) 0%,transparent 70%)",
      filter: "blur(70px)",
    }} />
    <div style={{
      position: "absolute", bottom: "-10%", right: "-7%",
      width: 380, height: 380, borderRadius: "50%",
      background: "radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%)",
      filter: "blur(65px)",
    }} />
    <div style={{
      position: "absolute", top: "40%", right: "20%",
      width: 260, height: 260, borderRadius: "50%",
      background: "radial-gradient(circle,rgba(20,184,166,0.07) 0%,transparent 70%)",
      filter: "blur(50px)",
    }} />
    {/* dot grid */}
    <div style={{
      position: "absolute", inset: 0, opacity: 0.22,
      backgroundImage: "radial-gradient(circle,#99f6e4 1px,transparent 1px)",
      backgroundSize: "28px 28px",
    }} />
    {/* fine line grid */}
    <div style={{
      position: "absolute", inset: 0, opacity: 1,
      backgroundImage:
        "linear-gradient(rgba(13,148,136,0.035) 1px,transparent 1px)," +
        "linear-gradient(90deg,rgba(13,148,136,0.035) 1px,transparent 1px)",
      backgroundSize: "44px 44px",
    }} />
  </div>
);

// ─────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────
const DashboardLayout = () => {
  const { logout }    = useAuth();
  const navigate      = useNavigate();
  const location      = useLocation();
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [navReady,    setNavReady]      = useState(false);
  const [pageLoading, setPageLoading]   = useState(false);
  const [prevPath,    setPrevPath]      = useState(location.pathname);

  const sidebarRef    = useRef(null);
  const outletRef     = useRef(null);
  const overlayRef    = useRef(null);

  // ── Sidebar mount animation ──────────────────────────────────────
  useEffect(() => {
    // tiny delay so React finishes painting
    const t = setTimeout(() => {
      setNavReady(true);
      if (sidebarRef.current) {
        animate(sidebarRef.current, {
          translateX: [-32, 0],
          opacity:    [0, 1],
          duration:   480,
          easing:     "easeOutCubic",
        });
      }
      requestAnimationFrame(() => {
        const navItems = document.querySelectorAll(".dl-nav-item");
        if (!navItems.length) return;
        animate(".dl-nav-item", {
          translateX: [-16, 0],
          opacity:  [0, 1],
          delay:    stagger(55, { start: 160 }),
          duration: 360,
          easing:   "easeOutCubic",
        });
      });
    }, 60);
    return () => clearTimeout(t);
  }, []);

  // ── Page transition on route change ─────────────────────────────
  useEffect(() => {
    if (location.pathname === prevPath) return;
    setPrevPath(location.pathname);
    setPageLoading(true);

    if (outletRef.current) {
      animate(outletRef.current, { opacity: [1, 0], translateY: [0, -8], duration: 160, easing: "easeInCubic" });
    }
    const t = setTimeout(() => {
      setPageLoading(false);
      requestAnimationFrame(() => {
        if (outletRef.current) {
          animate(outletRef.current, { opacity: [0, 1], translateY: [12, 0], duration: 380, easing: "easeOutCubic" });
        }
      });
    }, 400);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // ── Mobile sidebar open ─────────────────────────────────────────
  useEffect(() => {
    if (!sidebarOpen) return;
    if (overlayRef.current) {
      animate(overlayRef.current, { opacity: [0, 1], duration: 220, easing: "easeOutCubic" });
    }
    animate(".dl-mob-sidebar", { translateX: [-260, 0], opacity: [0, 1], duration: 300, easing: "easeOutCubic" });
    animate(".dl-mob-nav-item", {
      translateX: [-14, 0], opacity: [0, 1],
      delay: stagger(50, { start: 130 }),
      duration: 280, easing: "easeOutCubic",
    });
  }, [sidebarOpen]);

  const closeMobile = () => {
    animate(".dl-mob-sidebar", { translateX: [0, -260], opacity: [1, 0], duration: 220, easing: "easeInCubic", onComplete: () => setSidebarOpen(false) });
    if (overlayRef.current) animate(overlayRef.current, { opacity: [1, 0], duration: 220, easing: "easeInCubic" });
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const currentLabel = NAV_ITEMS.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || "";

  // ── Nav link style ───────────────────────────────────────────────
  const navLinkStyle = (isActive) => ({
    display: "flex", alignItems: "center", gap: 11,
    padding: "10px 14px", borderRadius: 12,
    fontSize: 13.5, fontWeight: isActive ? 700 : 500,
    color:      isActive ? "#fff" : TOKEN.slate500,
    background: isActive ? TOKEN.activeGrad : "transparent",
    border:     isActive ? "none" : "1px solid transparent",
    boxShadow:  isActive ? TOKEN.activeGlow : "none",
    textDecoration: "none",
    transition: "color 0.18s,background 0.18s,box-shadow 0.18s",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  });

  // ── Shared sidebar inner markup ─────────────────────────────────
  const SidebarInner = ({ mobile = false }) => (
    <>
      {/* ── Logo ── */}
      <div style={{
        padding: "18px 18px 16px",
        borderBottom: `1px solid rgba(20,184,166,0.14)`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11, flexShrink: 0,
          background: TOKEN.activeGrad,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(13,148,136,0.32)",
        }}>
          <i className="bi bi-activity" style={{ color: "white", fontSize: 15 }} />
        </div>
        <div>
          <h1 style={{
            margin: 0, fontSize: 15.5, fontWeight: 900,
            letterSpacing: "-0.4px", lineHeight: 1.1,
            background: "linear-gradient(135deg,#0f766e,#0ea5e9)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>AcnePilot</h1>
          <p style={{ margin: 0, fontSize: 10.5, color: "#0d9488", fontWeight: 600 }}>AI Dermatology</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
        {navReady ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {NAV_ITEMS.map(({ to, label, icon, end }) => (
              <NavLink
                key={to} to={to} end={end}
                className={mobile ? "dl-mob-nav-item" : "dl-nav-item"}
                style={({ isActive }) => navLinkStyle(isActive)}
                onClick={mobile ? closeMobile : undefined}
                onMouseEnter={e => {
                  if (!e.currentTarget.style.background.includes("gradient"))
                    e.currentTarget.style.background = TOKEN.hoverBg;
                }}
                onMouseLeave={e => {
                  if (!e.currentTarget.style.background.includes("gradient"))
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {({ isActive }) => (
                  <>
                    <i className={`bi ${icon}`} style={{ fontSize: 15, flexShrink: 0 }} />
                    <span>{label}</span>
                    {isActive && (
                    <span style={{
                      marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                      background: "rgba(255,255,255,0.7)",
                      boxShadow: "0 0 6px rgba(255,255,255,0.6)",
                    }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ) : (
          <SidebarSkeleton />
        )}
      </nav>

      {/* ── User info strip ── */}
      <div style={{
        margin: "0 10px 8px",
        padding: "12px 14px",
        borderRadius: 14,
        background: "rgba(20,184,166,0.06)",
        border: "1px solid rgba(20,184,166,0.14)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: TOKEN.activeGrad,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(13,148,136,0.25)",
        }}>
          <i className="bi bi-person-fill" style={{ color: "white", fontSize: 13 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: "#0f2b27", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            My Account
          </p>
          <p style={{ margin: 0, fontSize: 10, color: "#5eada0", fontWeight: 500 }}>Active Session</p>
        </div>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#22c55e",
          boxShadow: "0 0 6px rgba(34,197,94,0.6)",
          flexShrink: 0,
        }} />
      </div>

      {/* ── Sign out ── */}
      <div style={{ padding: "0 10px 14px" }}>
        <button
          id="logout-btn"
          onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${TOKEN.redBdr}`,
            background: "transparent", color: TOKEN.red,
            fontSize: 13.5, fontWeight: 600, cursor: "pointer",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background   = TOKEN.redBg;
            e.currentTarget.style.borderColor  = "rgba(220,38,38,0.4)";
            e.currentTarget.style.boxShadow    = "0 2px 10px rgba(220,38,38,0.1)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = "transparent";
            e.currentTarget.style.borderColor = TOKEN.redBdr;
            e.currentTarget.style.boxShadow   = "none";
          }}
        >
          <i className="bi bi-box-arrow-left" style={{ fontSize: 14 }} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  // ─────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes dl-shimmer {
          0%   { background-position: -200% 0 }
          100% { background-position:  200% 0 }
        }
        @keyframes dl-fadeup {
          from { opacity: 0; transform: translateY(8px) }
          to   { opacity: 1; transform: translateY(0)   }
        }
        @keyframes dl-spin {
          to { transform: rotate(360deg) }
        }

        /* scrollbar */
        ::-webkit-scrollbar       { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(20,184,166,0.28); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(20,184,166,0.5); }

        /* desktop sidebar show/hide */
        @media (min-width: 1024px) {
          .dl-desktop-sidebar { display: flex !important; }
          .dl-mobile-topbar   { display: none  !important; }
        }
        @media (max-width: 1023px) {
          .dl-desktop-sidebar { display: none  !important; }
          .dl-mobile-topbar   { display: flex  !important; }
        }

        /* nav item active dot helper (nested NavLink hidden trick) */
        .dl-nav-active-dot { display: none; }
      `}</style>

      <div style={{
        display: "flex", height: "100vh", overflow: "hidden",
        background: TOKEN.pageBg,
        position: "relative",
      }}>
        <Blobs />

        {/* ══ Desktop sidebar ══════════════════════════════════════════ */}
        <aside
          ref={sidebarRef}
          className="dl-desktop-sidebar"
          style={{
            flexDirection: "column",
            width: 232, flexShrink: 0,
            background: TOKEN.sidebarBg,
            backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
            borderRight: `1.5px solid ${TOKEN.sidebarBdr}`,
            boxShadow: "4px 0 28px rgba(15,118,110,0.07)",
            position: "relative", zIndex: 10,
            opacity: 0, // anime will bring it in
          }}
        >
          <SidebarInner />
        </aside>

        {/* ══ Mobile overlay ═══════════════════════════════════════════ */}
        {sidebarOpen && (
          <div
            ref={overlayRef}
            style={{
              position: "fixed", inset: 0, zIndex: 50,
              background: "rgba(15,43,39,0.4)",
              backdropFilter: "blur(5px)",
              opacity: 0,
            }}
            onClick={closeMobile}
          >
            <aside
              className="dl-mob-sidebar"
              onClick={e => e.stopPropagation()}
              style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 240,
                display: "flex", flexDirection: "column",
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                borderRight: `1.5px solid ${TOKEN.sidebarBdr}`,
                boxShadow: "8px 0 36px rgba(15,118,110,0.14)",
                opacity: 0,
              }}
            >
              <SidebarInner mobile />
            </aside>
          </div>
        )}

        {/* ══ Main area ════════════════════════════════════════════════ */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          overflow: "hidden", position: "relative", zIndex: 1,
        }}>

          {/* Mobile topbar */}
          <header
            className="dl-mobile-topbar"
            style={{
              alignItems: "center", justifyContent: "space-between",
              padding: "10px 16px", flexShrink: 0,
              background: "rgba(255,255,255,0.76)",
              backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
              borderBottom: `1px solid rgba(20,184,166,0.15)`,
              boxShadow: "0 1px 14px rgba(15,118,110,0.07)",
              position: "relative", zIndex: 5,
            }}
          >
            {/* hamburger */}
            <button
              id="sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(20,184,166,0.08)",
                border: "1.5px solid rgba(20,184,166,0.2)",
                color: "#0d9488", cursor: "pointer", transition: "all 0.18s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(20,184,166,0.16)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(20,184,166,0.08)"}
            >
              <i className="bi bi-list" style={{ fontSize: 18 }} />
            </button>

            {/* centre logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9,
                background: TOKEN.activeGrad,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 3px 10px rgba(13,148,136,0.3)",
              }}>
                <i className="bi bi-activity" style={{ color: "white", fontSize: 12 }} />
              </div>
              <span style={{
                fontSize: 14, fontWeight: 900, letterSpacing: "-0.3px",
                background: "linear-gradient(135deg,#0f766e,#0ea5e9)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>AcnePilot</span>
            </div>

            {/* current page pill */}
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#0d9488",
              padding: "4px 12px", borderRadius: 20,
              background: "rgba(20,184,166,0.09)",
              border: "1.5px solid rgba(20,184,166,0.22)",
            }}>
              {currentLabel}
            </span>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, overflowY: "auto", position: "relative" }}>
            <div ref={outletRef} style={{ minHeight: "100%" }}>
              {pageLoading ? <PageSkeleton /> : <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
