import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { authAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DoctorImage from "../assets/Login.png";

/* ─────────────────────────────────────────────
   GLOBAL STYLES (injected once at mount)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes docFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-16px) rotate(0.8deg); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(0.9);  opacity: 0.55; }
    70%  { transform: scale(1.15); opacity: 0; }
    100% { transform: scale(0.9);  opacity: 0; }
  }

  /* ── Input ── */
  .login-input {
    width: 100%;
    padding: 12px 14px 12px 42px;
    border-radius: 12px;
    border: 1.5px solid #b2e8e2;
    background: #f0fdfb;
    color: #134e4a;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .login-input:focus {
    border-color: #14b8a6;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(20,184,166,0.14);
  }
  .login-input::placeholder { color: #94a3b8; font-weight: 500; }
  .login-input.pr { padding-right: 46px; }

  /* ── Submit ── */
  .login-submit-btn {
    width: 100%;
    padding: 14px;
    border-radius: 14px;
    border: none;
    background: linear-gradient(135deg, #0f766e 0%, #14b8a6 55%, #2dd4bf 100%);
    color: #fff;
    font-size: 15px;
    font-weight: 800;
    font-family: 'Poppins', sans-serif;
    letter-spacing: 0.4px;
    cursor: pointer;
    box-shadow: 0 6px 24px rgba(20,184,166,0.4);
    transition: box-shadow .25s, transform .15s, opacity .2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .login-submit-btn:hover:not(:disabled) {
    box-shadow: 0 10px 34px rgba(20,184,166,0.54);
    transform: translateY(-1px);
  }
  .login-submit-btn:active:not(:disabled) { transform: scale(0.97); }
  .login-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  /* ── Register link ── */
  .login-register-link {
    color: #0f766e;
    font-weight: 800;
    text-decoration: none;
    border-bottom: 2px solid #99f6e4;
    padding-bottom: 1px;
    transition: color .2s, border-color .2s;
  }
  .login-register-link:hover { color: #0d9488; border-color: #0d9488; }

  /* ── Forgot link ── */
  .login-forgot-link {
    color: #14b8a6;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
    text-decoration: none;
    transition: color .2s;
  }
  .login-forgot-link:hover { color: #0d9488; }

  /* ── Animation entry ── */
  .login-form-item { opacity: 0; }

  /* ── Doctor float ── */
  .login-doc-float { animation: docFloat 3.8s ease-in-out infinite; }

  /* ── Pulse rings ── */
  .login-pulse-r1 {
    position: absolute; inset: -18px; border-radius: 50%;
    border: 2px solid rgba(20,184,166,0.4);
    animation: pulseRing 2.6s ease-out infinite;
    pointer-events: none;
  }
  .login-pulse-r2 {
    position: absolute; inset: -36px; border-radius: 50%;
    border: 2px solid rgba(20,184,166,0.22);
    animation: pulseRing 2.6s ease-out infinite 0.9s;
    pointer-events: none;
  }

  /* ── Deco rings ── */
  .login-deco-ring {
    position: absolute; border-radius: 50%;
    border: 1.5px solid rgba(20,184,166,0.25);
    pointer-events: none;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
  }

  /* ── Skeleton shimmer ── */
  .login-sk {
    background: linear-gradient(90deg,#d0f4ef 25%,#a5e9e1 50%,#d0f4ef 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .login-left-panel  { display: none !important; }
    .login-right-panel { flex: none !important; width: 100% !important; min-height: 100vh; }
  }
  @media (max-width: 480px) {
    .login-right-panel { padding: 32px 22px !important; }
  }
`;

/* ─────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────── */
const Sk = ({ w = "100%", h = 46, r = 12, mb = 0 }) => (
  <div className="login-sk" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
);

const FormSkeleton = () => (
  <div style={{ paddingTop: 4 }}>
    {[0, 1].map(i => (
      <div key={i} style={{ marginBottom: 18 }}>
        <Sk w={88} h={12} r={6} mb={7} />
        <Sk h={46} />
      </div>
    ))}
    <Sk h={52} r={14} mb={18} />
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Sk w={210} h={14} r={6} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   LOGIN COMPONENT
───────────────────────────────────────────── */
const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [ready, setReady]       = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState("");

  const leftRef  = useRef(null);
  const rightRef = useRef(null);

  const from = location.state?.from?.pathname || "/dashboard";

  /* Inject global CSS */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  /* Skeleton → real form */
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 950);
    return () => clearTimeout(t);
  }, []);

  /* Anime.js entrance after skeleton resolves */
  useEffect(() => {
    if (!ready) return;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js";
    s.onload = () => {
      const anime = window.anime;
      anime({ targets: leftRef.current,       opacity: [0,1], translateX: [-80,0], duration: 720, easing: "easeOutExpo" });
      anime({ targets: rightRef.current,      opacity: [0,1], translateX: [65,0],  duration: 720, easing: "easeOutExpo" });
      anime({ targets: ".login-form-item",    opacity: [0,1], translateY: [22,0],  delay: anime.stagger(85, { start: 250 }), duration: 460, easing: "easeOutCubic" });
      anime({ targets: ".login-deco-ring",    opacity: [0,1], scale: [0.5,1],      delay: anime.stagger(130, { start: 400 }), duration: 900, easing: "easeOutBack" });
    };
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch(_) {} };
  }, [ready]);

  /* Helpers */
  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(formData);
      const { token } = res.data;
      login(token);
      toast.success("Welcome back!");

      let dest = "/dashboard";
      try {
        const sRes = await userAPI.getUserStatus();
        sessionStorage.setItem("acnepilot_status_cache", JSON.stringify(sRes.data));
        const lastRoute = localStorage.getItem("acnepilot_last_route");
        if (!sRes.data.questionnaire_completed) {
          dest = "/onboarding/questionnaire";
        } else if (!sRes.data.acne_analysis_completed) {
          dest = "/onboarding/upload";
        } else if (lastRoute) {
          dest = lastRoute;
        }
        localStorage.removeItem("acnepilot_last_route");
      } catch (_) {}

      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* Border helpers */
  const ib = field => focused === field ? "#14b8a6" : "#b2e8e2";

  /* ── RENDER ── */
  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: { borderRadius: 12, background: "#134e4a", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 13 },
      }} />

      <div style={{ minHeight: "100vh", display: "flex", background: "#f0fdfb", overflow: "hidden", fontFamily: "'Poppins',sans-serif" }}>

        {/* ══════════════════ LEFT PANEL — Image ══════════════════ */}
        <div
          ref={leftRef}
          className="login-left-panel"
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "linear-gradient(150deg, #ccfbf1 0%, #99f6e4 50%, #5eead4 100%)",
            opacity: 0,
          }}
        >
          {/* Concentric decorative rings */}
          {[520, 380, 250].map((size, i) => (
            <div key={i} className="login-deco-ring" style={{ width: size, height: size }} />
          ))}

          {/* Soft radial glow */}
          <div style={{
            position: "absolute",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 68%)",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            filter: "blur(32px)",
            pointerEvents: "none",
          }} />

          {/* Doctor image */}
          <div style={{ position: "relative", zIndex: 4 }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div className="login-pulse-r1" />
              <div className="login-pulse-r2" />
              <div className="login-doc-float">
                <img
                  src={DoctorImage}
                  alt="Doctor"
                  style={{
                    width: 270,
                    height: "auto",
                    objectFit: "contain",
                    display: "block",
                    position: "relative", zIndex: 3,
                    filter: "drop-shadow(0 24px 40px rgba(15,118,110,0.28))",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Caption */}
          <div style={{ position: "relative", zIndex: 4, textAlign: "center", marginTop: 24, padding: "0 44px" }}>
            <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 800, color: "#134e4a", marginBottom: 8 }}>
              Welcome back!
            </h3>
            <p style={{ fontSize: 13.5, color: "#0f766e", maxWidth: 290, margin: "0 auto", lineHeight: 1.75, fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>
              Continue your personalised acne care journey — your skin is in good hands.
            </p>
          </div>
        </div>
        {/* END LEFT PANEL */}

        {/* ══════════════════ RIGHT PANEL — Form ══════════════════ */}
        <div
          ref={rightRef}
          className="login-right-panel"
          style={{
            flex: "0 0 480px",
            background: "#ffffff",
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "52px 52px",
            position: "relative", zIndex: 2,
            boxShadow: "-4px 0 48px rgba(15,118,110,0.07)",
            opacity: 0, overflowY: "auto",
          }}
        >
          {/* Logo */}
          <div className="login-form-item" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: "linear-gradient(135deg,#0f766e,#14b8a6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(20,184,166,0.4)", flexShrink: 0,
            }}>
              <i className="bi bi-activity" style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 21, fontWeight: 900, color: "#0f172a", fontFamily: "'Poppins',sans-serif", lineHeight: 1.1 }}>
                AcnePilot
              </div>
              <div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "'Poppins',sans-serif" }}>
                Personalised Skincare AI
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="login-form-item" style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: 27, fontWeight: 900, color: "#0f172a", fontFamily: "'Poppins',sans-serif", lineHeight: 1.2, marginBottom: 5 }}>
              Sign in to your account
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>
              Continue your treatment journey 🌿
            </p>
          </div>

          {/* Form / Skeleton */}
          {!ready ? <FormSkeleton /> : (
            <form onSubmit={handleSubmit} autoComplete="off">

              {/* Email */}
              <div className="login-form-item" style={{ marginBottom: 17 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#0f766e", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.4, fontFamily: "'Poppins',sans-serif" }}>
                  Email address
                </label>
                <div style={{ position: "relative" }}>
                  <i className="bi bi-envelope-fill" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#14b8a6", fontSize: 15 }} />
                  <input
                    id="login-email"
                    className="login-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    style={{ borderColor: ib("email") }}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-form-item" style={{ marginBottom: 26 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f766e", textTransform: "uppercase", letterSpacing: 0.4, fontFamily: "'Poppins',sans-serif" }}>
                    Password
                  </label>
                  <Link to="/forgot-password" className="login-forgot-link">
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <i className="bi bi-lock-fill" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#14b8a6", fontSize: 15 }} />
                  <input
                    id="login-password"
                    className="login-input pr"
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{ borderColor: ib("password") }}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#14b8a6", fontSize: 15, display: "flex", alignItems: "center" }}
                  >
                    <i className={`bi ${showPass ? "bi-eye-slash-fill" : "bi-eye-fill"}`} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="login-form-item">
                <button id="login-submit" type="submit" className="login-submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin .85s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <i className="bi bi-arrow-right-short" style={{ fontSize: 20 }} />
                    </>
                  )}
                </button>
              </div>

              {/* Don't have account */}
              <div className="login-form-item" style={{ textAlign: "center", marginTop: 20 }}>
                <p style={{ fontSize: 13.5, color: "#64748b", fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>
                  Don't have an account?{" "}
                  <Link to="/register" className="login-register-link">Create one free</Link>
                </p>
              </div>

              {/* Back to home */}
              <div className="login-form-item" style={{ textAlign: "center", marginTop: 12 }}>
                <Link to="/" style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, fontFamily: "'Poppins',sans-serif", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, transition: "color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#64748b"}
                  onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                >
                  <i className="bi bi-arrow-left" style={{ fontSize: 11 }} /> Back to home
                </Link>
              </div>

            </form>
          )}
        </div>
        {/* END RIGHT PANEL */}

      </div>
    </>
  );
};

export default Login;