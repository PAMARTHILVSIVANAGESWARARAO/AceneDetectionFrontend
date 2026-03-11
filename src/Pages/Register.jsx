import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { authAPI } from "../services/api";
import DoctorImage from "../assets/Register.png";

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
  @keyframes badgePop {
    0%   { transform: scale(0) rotate(-6deg); opacity: 0; }
    65%  { transform: scale(1.1) rotate(2deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  /* ── Input ── */
  .reg-input {
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
  .reg-input:focus {
    border-color: #14b8a6;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(20,184,166,0.14);
  }
  .reg-input::placeholder { color: #94a3b8; font-weight: 500; }
  .reg-input.pr { padding-right: 70px; }

  /* ── Submit ── */
  .reg-submit-btn {
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
  .reg-submit-btn:hover:not(:disabled) {
    box-shadow: 0 10px 34px rgba(20,184,166,0.54);
    transform: translateY(-1px);
  }
  .reg-submit-btn:active:not(:disabled) { transform: scale(0.97); }
  .reg-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  /* ── Login link ── */
  .reg-login-link {
    color: #0f766e;
    font-weight: 800;
    text-decoration: none;
    border-bottom: 2px solid #99f6e4;
    padding-bottom: 1px;
    transition: color .2s, border-color .2s;
  }
  .reg-login-link:hover { color: #0d9488; border-color: #0d9488; }

  /* ── Animation entry ── */
  .form-item { opacity: 0; }

  /* ── Doctor float ── */
  .doc-float { animation: docFloat 3.8s ease-in-out infinite; }

  /* ── Pulse rings ── */
  .pulse-r1 {
    position: absolute; inset: -18px; border-radius: 50%;
    border: 2px solid rgba(20,184,166,0.4);
    animation: pulseRing 2.6s ease-out infinite;
    pointer-events: none;
  }
  .pulse-r2 {
    position: absolute; inset: -36px; border-radius: 50%;
    border: 2px solid rgba(20,184,166,0.22);
    animation: pulseRing 2.6s ease-out infinite 0.9s;
    pointer-events: none;
  }

  /* ── Badge cards ── */
  .badge-card {
    position: absolute;
    background: rgba(255,255,255,0.87);
    backdrop-filter: blur(12px);
    border-radius: 14px;
    padding: 10px 15px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 28px rgba(15,118,110,0.18);
    opacity: 0;
    animation: badgePop .6s cubic-bezier(.34,1.56,.64,1) forwards;
    z-index: 6;
    white-space: nowrap;
  }

  /* ── Deco rings ── */
  .deco-ring {
    position: absolute; border-radius: 50%;
    border: 1.5px solid rgba(20,184,166,0.25);
    pointer-events: none;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .reg-right-panel { display: none !important; }
    .reg-left-panel  { flex: none !important; width: 100% !important; min-height: 100vh; }
  }
  @media (max-width: 480px) {
    .reg-left-panel { padding: 32px 22px !important; }
  }
`;

/* ─────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────── */
const Sk = ({ w = "100%", h = 46, r = 12, mb = 0 }) => (
  <div style={{
    width: w, height: h, borderRadius: r, marginBottom: mb,
    background: "linear-gradient(90deg,#d0f4ef 25%,#a5e9e1 50%,#d0f4ef 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s ease-in-out infinite",
  }} />
);

const FormSkeleton = () => (
  <div style={{ paddingTop: 4 }}>
    {[0, 1, 2, 3].map(i => (
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
   REGISTER COMPONENT
───────────────────────────────────────────── */
const Register = () => {
  const navigate = useNavigate();
  const [ready, setReady]           = useState(false);
  const [formData, setFormData]     = useState({ username: "", email: "", password: "", retype_password: "" });
  const [showPass, setShowPass]     = useState(false);
  const [showRetype, setShowRetype] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [focused, setFocused]       = useState("");
  const leftRef  = useRef(null);
  const rightRef = useRef(null);

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
      anime({ targets: leftRef.current,  opacity: [0,1], translateX: [-65,0], duration: 720, easing: "easeOutExpo" });
      anime({ targets: rightRef.current, opacity: [0,1], translateX: [80,0],  duration: 720, easing: "easeOutExpo" });
      anime({ targets: ".form-item",     opacity: [0,1], translateY: [22,0],  delay: anime.stagger(85, { start: 250 }), duration: 460, easing: "easeOutCubic" });
      anime({ targets: ".deco-ring",     opacity: [0,1], scale: [0.5,1],      delay: anime.stagger(130, { start: 400 }), duration: 900, easing: "easeOutBack" });
    };
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch(_) {} };
  }, [ready]);

  /* Helpers */
  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.retype_password) return "All fields are required";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    if (formData.password !== formData.retype_password) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    if (window.anime) window.anime({ targets: "#reg-submit", scale: [1, 0.95, 1], duration: 260, easing: "easeInOutQuad" });
    try {
      await authAPI.register(formData);
      toast.success("OTP sent to your email!");
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* Password strength */
  const strLevel = pw => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  };
  const str  = strLevel(formData.password);
  const strM = [null,
    { c: "#ef4444", l: "Weak" },
    { c: "#f59e0b", l: "Fair" },
    { c: "#22c55e", l: "Good" },
    { c: "#0d9488", l: "Strong" },
  ];

  /* Border helpers */
  const ib = field => focused === field ? "#14b8a6" : "#b2e8e2";
  const confirmBorder = () => {
    if (!formData.retype_password) return focused === "confirm" ? "#14b8a6" : "#b2e8e2";
    return formData.password === formData.retype_password ? "#14b8a6" : "#ef4444";
  };
  const confirmShadow = () => {
    if (!formData.retype_password) return focused === "confirm" ? "0 0 0 4px rgba(20,184,166,0.14)" : "none";
    return formData.password === formData.retype_password
      ? "0 0 0 4px rgba(20,184,166,0.14)"
      : "0 0 0 4px rgba(239,68,68,0.1)";
  };

  /* ── RENDER ── */
  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: { borderRadius: 12, background: "#134e4a", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 13 },
      }} />

      <div style={{ minHeight: "100vh", display: "flex", background: "#f0fdfb", overflow: "hidden", fontFamily: "'Poppins',sans-serif" }}>

        {/* ══════════════════ LEFT PANEL ══════════════════ */}
        <div
          ref={leftRef}
          className="reg-left-panel"
          style={{
            flex: "0 0 480px",
            background: "#ffffff",
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "52px 52px",
            position: "relative", zIndex: 2,
            boxShadow: "4px 0 48px rgba(15,118,110,0.07)",
            opacity: 0, overflowY: "auto",
          }}
        >
          {/* Logo */}
          <div className="form-item" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
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
          <div className="form-item" style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: 27, fontWeight: 900, color: "#0f172a", fontFamily: "'Poppins',sans-serif", lineHeight: 1.2, marginBottom: 5 }}>
              Create your account
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>
              Free forever — no credit card required ✨
            </p>
          </div>

          {/* Form / Skeleton */}
          {!ready ? <FormSkeleton /> : (
            <form onSubmit={handleSubmit} autoComplete="off">

              {/* Username */}
              <div className="form-item" style={{ marginBottom: 17 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#0f766e", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.4, fontFamily: "'Poppins',sans-serif" }}>
                  Username
                </label>
                <div style={{ position: "relative" }}>
                  <i className="bi bi-person-fill" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#14b8a6", fontSize: 16 }} />
                  <input id="reg-username" className="reg-input" type="text" name="username"
                    value={formData.username} onChange={handleChange} placeholder="john_doe" autoComplete="username"
                    style={{ borderColor: ib("username") }}
                    onFocus={() => setFocused("username")} onBlur={() => setFocused("")} />
                </div>
              </div>

              {/* Email */}
              <div className="form-item" style={{ marginBottom: 17 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#0f766e", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.4, fontFamily: "'Poppins',sans-serif" }}>
                  Email address
                </label>
                <div style={{ position: "relative" }}>
                  <i className="bi bi-envelope-fill" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#14b8a6", fontSize: 15 }} />
                  <input id="reg-email" className="reg-input" type="email" name="email"
                    value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email"
                    style={{ borderColor: ib("email") }}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
                </div>
              </div>

              {/* Password */}
              <div className="form-item" style={{ marginBottom: 17 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#0f766e", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.4, fontFamily: "'Poppins',sans-serif" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <i className="bi bi-lock-fill" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#14b8a6", fontSize: 15 }} />
                  <input id="reg-password" className="reg-input pr" type={showPass ? "text" : "password"} name="password"
                    value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" autoComplete="new-password"
                    style={{ borderColor: ib("password") }}
                    onFocus={() => setFocused("password")} onBlur={() => setFocused("")} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#14b8a6", fontSize: 15, display: "flex", alignItems: "center" }}>
                    <i className={`bi ${showPass ? "bi-eye-slash-fill" : "bi-eye-fill"}`} />
                  </button>
                </div>
                {/* Strength bar */}
                {formData.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= str ? strM[str]?.c : "#d1faf5", transition: "background .3s" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: strM[str]?.c, fontFamily: "'Poppins',sans-serif" }}>{strM[str]?.l}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-item" style={{ marginBottom: 26 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#0f766e", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.4, fontFamily: "'Poppins',sans-serif" }}>
                  Confirm password
                </label>
                <div style={{ position: "relative" }}>
                  <i className="bi bi-shield-lock-fill" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#14b8a6", fontSize: 15 }} />
                  <input id="reg-retype-password" className="reg-input pr" type={showRetype ? "text" : "password"} name="retype_password"
                    value={formData.retype_password} onChange={handleChange} placeholder="Repeat password" autoComplete="new-password"
                    style={{ borderColor: confirmBorder(), boxShadow: confirmShadow() }}
                    onFocus={() => setFocused("confirm")} onBlur={() => setFocused("")} />
                  <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 4 }}>
                    {formData.retype_password && (
                      <i className={`bi ${formData.password === formData.retype_password ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}
                        style={{ fontSize: 15, color: formData.password === formData.retype_password ? "#14b8a6" : "#ef4444" }} />
                    )}
                    <button type="button" onClick={() => setShowRetype(p => !p)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#14b8a6", fontSize: 15, display: "flex", alignItems: "center" }}>
                      <i className={`bi ${showRetype ? "bi-eye-slash-fill" : "bi-eye-fill"}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="form-item">
                <button id="reg-submit" type="submit" className="reg-submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin .85s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <i className="bi bi-arrow-right-short" style={{ fontSize: 20 }} />
                    </>
                  )}
                </button>
              </div>

              {/* Already have account */}
              <div className="form-item" style={{ textAlign: "center", marginTop: 20 }}>
                <p style={{ fontSize: 13.5, color: "#64748b", fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>
                  Already have an account?{" "}
                  <Link to="/login" className="reg-login-link">Login here</Link>
                </p>
              </div>

            </form>
          )}
        </div>

        {/* ══════════════════ RIGHT PANEL ══════════════════ */}
        <div
          ref={rightRef}
          className="reg-right-panel"
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
          {/* Concentric decorative rings — like the reference image */}
          {[520, 380, 250].map((size, i) => (
            <div key={i} className="deco-ring" style={{ width: size, height: size }} />
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
              <div className="pulse-r1" />
              <div className="pulse-r2" />
              <div className="doc-float">
                <img
                  src={DoctorImage}
                  alt="Doctor holding registration card"
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
              Your skincare, elevated.
            </h3>
            <p style={{ fontSize: 13.5, color: "#0f766e", maxWidth: 290, margin: "0 auto", lineHeight: 1.75, fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>
              AI-powered acne tracking & personalised treatment recommendations — built just for you.
            </p>
          </div>

          

        </div>
        {/* END RIGHT PANEL */}

      </div>
    </>
  );
};

export default Register;