import React, { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: "bi-house", end: true },
  { to: "/dashboard/treatment", label: "Treatment Plan", icon: "bi-clipboard2-pulse" },
  { to: "/dashboard/history", label: "Progress", icon: "bi-graph-up-arrow" },
  { to: "/dashboard/profile", label: "Profile", icon: "bi-person-circle" },
];

const DashboardLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navLinkStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
    background: isActive ? "rgba(20,184,166,0.15)" : "transparent",
    border: isActive ? "1px solid rgba(20,184,166,0.25)" : "1px solid transparent",
    textDecoration: "none",
    transition: "all 0.2s ease",
    cursor: "pointer",
  });

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
            <i className="bi bi-activity text-white text-sm"></i>
          </div>
          <div>
            <h1 className="text-base font-black text-white leading-none">AcnePilot</h1>
            <p className="text-xs mt-0.5" style={{ color: "rgba(20,184,166,0.7)" }}>AI Dermatology</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => navLinkStyle(isActive)}
            onMouseEnter={(e) => {
              if (!e.currentTarget.style.background.includes("0.15"))
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.style.background.includes("0.15"))
                e.currentTarget.style.background = "transparent";
            }}>
            <i className={`bi ${icon} text-base flex-shrink-0`}></i>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <button id="logout-btn" onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
          style={{ color: "rgba(239,68,68,0.8)", border: "1px solid rgba(239,68,68,0.15)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(239,68,68,0.8)"; }}>
          <i className="bi bi-box-arrow-left"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0f0d 0%, #0d1f1a 50%, #0a1628 100%)" }}>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.06)"
        }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full"
            style={{
              background: "rgba(10,20,20,0.98)",
              backdropFilter: "blur(20px)",
              borderRight: "1px solid rgba(255,255,255,0.08)"
            }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <button id="sidebar-toggle" onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <i className="bi bi-list text-lg"></i>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
              <i className="bi bi-activity text-white text-xs"></i>
            </div>
            <span className="text-white font-bold text-sm">AcnePilot</span>
          </div>
          <div className="w-9" />
        </header>

        {/* Dot grid ambient */}
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.4) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
