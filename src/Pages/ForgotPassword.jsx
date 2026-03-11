import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { authAPI } from "../services/api";
import DoctorImage from "../assets/ForgotPassword.png";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Poppins', sans-serif; background: #ffffff; }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes docFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    40%       { transform: translateY(-14px) rotate(1deg); }
    70%       { transform: translateY(-6px) rotate(-0.4deg); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(0.88); opacity: 0.5; }
    70%  { transform: scale(1.22); opacity: 0; }
    100% { transform: scale(0.88); opacity: 0; }
  }
  @keyframes subtleFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }

  /* ── Input ── */
  .fp-input {
    width: 100%;
    padding: 14px 16px 14px 44px;
    border-radius: 14px;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    color: #0f172a;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .fp-input:focus {
    border-color: #14b8a6;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(20,184,166,0.12);
  }
  .fp-input::placeholder { color: #94a3b8; font-weight: 400; }

  /* ── Submit button ── */
  .fp-submit-btn {
    width: 100%;
    padding: 15px;
    border-radius: 14px;
    border: none;
    background: linear-gradient(135deg, #0f766e 0%, #14b8a6 55%, #2dd4bf 100%);
    color: #fff;
    font-size: 15px;
    font-weight: 800;
    font-family: 'Poppins', sans-serif;
    letter-spacing: 0.4px;
    cursor: pointer;
    box-shadow: 0 8px 28px rgba(20,184,166,0.38);
    transition: box-shadow .25s, transform .15s, opacity .2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
  }
  .fp-submit-btn:hover:not(:disabled) {
    box-shadow: 0 12px 38px rgba(20,184,166,0.52);
    transform: translateY(-2px);
  }
  .fp-submit-btn:active:not(:disabled) { transform: scale(0.97); }
  .fp-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── Secondary button (Enter Reset OTP) ── */
  .fp-secondary-btn {
    width: 100%;
    padding: 15px;
    border-radius: 14px;
    border: 1.5px solid #14b8a6;
    background: transparent;
    color: #0f766e;
    font-size: 15px;
    font-weight: 800;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: background .2s, box-shadow .2s, transform .15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
  }
  .fp-secondary-btn:hover {
    background: #f0fdfb;
    box-shadow: 0 4px 16px rgba(20,184,166,0.18);
    transform: translateY(-1px);
  }

  /* ── Back link ── */
  .fp-back-link {
    font-family: 'Poppins', sans-serif;
    font-size: 12.5px;
    color: #94a3b8;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: color .2s;
  }
  .fp-back-link:hover { color: #0f766e; }

  /* ── Pulse rings ── */
  .fp-pulse-r1 {
    position: absolute; inset: -16px; border-radius: 50%;
    border: 2px solid rgba(20,184,166,0.3);
    animation: pulseRing 3s ease-out infinite;
    pointer-events: none;
  }
  .fp-pulse-r2 {
    position: absolute; inset: -36px; border-radius: 50%;
    border: 1.5px solid rgba(20,184,166,0.15);
    animation: pulseRing 3s ease-out infinite 1.1s;
    pointer-events: none;
  }
  .fp-pulse-r3 {
    position: absolute; inset: -58px; border-radius: 50%;
    border: 1px solid rgba(20,184,166,0.08);
    animation: pulseRing 3s ease-out infinite 2.2s;
    pointer-events: none;
  }

  /* ── Doctor float ── */
  .fp-doc-float { animation: docFloat 4s ease-in-out infinite; }

  /* ── Skeleton shimmer ── */
  .fp-sk {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 10px;
  }

  /* ── Animated items ── */
  .fp-item { opacity: 0; }

  /* ── Success badge float ── */
  .fp-success-icon { animation: subtleFloat 2.8s ease-in-out infinite; }

  /* ── Decorative dots ── */
  .fp-dot-grid {
    position: fixed; inset: 0; pointer-events: none; opacity: 0.04;
    background-image: radial-gradient(circle, #0f766e 1px, transparent 1px);
    background-size: 24px 24px;
  }

  /* ── Subtle top teal bar ── */
  .fp-top-bar {
    position: fixed; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #0f766e, #14b8a6, #2dd4bf);
    z-index: 100;
  }

  /* ── Responsive ── */
  @media (max-width: 520px) {
    .fp-content { padding: 0 20px !important; }
    .fp-doc-circle { width: 160px !important; height: 160px !important; }
    .fp-doc-img { width: 180px !important; height: 180px !important; }
  }
`;

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
const Sk = ({ w = "100%", h = 14, r = 8, mb = 0 }) => (
  <div className="fp-sk" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
);

const FormSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
    {/* Doctor circle */}
    <Sk w={180} h={180} r={90} mb={32} />
    {/* Heading */}
    <Sk w={240} h={32} r={8} mb={10} />
    <Sk w={300} h={14} r={6} mb={6} />
    <Sk w={220} h={14} r={6} mb={36} />
    {/* Label */}
    <div style={{ width: "100%", marginBottom: 16 }}>
      <Sk w={110} h={12} r={6} mb={8} />
      <Sk w="100%" h={52} r={14} />
    </div>
    {/* Button */}
    <Sk w="100%" h={52} r={14} mb={20} />
    {/* Back link */}
    <Sk w={100} h={12} r={6} />
  </div>
);

/* ─────────────────────────────────────────────
   FORGOT PASSWORD COMPONENT
───────────────────────────────────────────── */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady]     = useState(false);
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [focused, setFocused] = useState(false);

  /* Inject CSS */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  /* Skeleton delay */
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 950);
    return () => clearTimeout(t);
  }, []);

  /* Anime.js entrance */
  useEffect(() => {
    if (!ready) return;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js";
    s.onload = () => {
      const anime = window.anime;
      anime({ targets: ".fp-doc-wrap", opacity: [0,1], scale: [0.76,1],   duration: 900, easing: "easeOutBack" });
      anime({ targets: ".fp-item",     opacity: [0,1], translateY: [22,0], delay: anime.stagger(70, { start: 300 }), duration: 500, easing: "easeOutCubic" });
    };
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch(_) {} };
  }, [ready]);

  /* Re-animate on sent state change */
  useEffect(() => {
    if (!sent || !window.anime) return;
    window.anime({ targets: ".fp-item", opacity: [0,1], translateY: [18,0], delay: window.anime.stagger(60, { start: 100 }), duration: 450, easing: "easeOutCubic" });
    window.anime({ targets: ".fp-success-icon", scale: [0.5,1], opacity: [0,1], duration: 700, easing: "easeOutBack" });
  }, [sent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email"); return; }
    setLoading(true);
    if (window.anime) window.anime({ targets: "#fp-submit", scale: [1, 0.96, 1], duration: 260, easing: "easeInOutQuad" });
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  /* ── RENDER ── */
  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: { borderRadius: 12, background: "#134e4a", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 13 },
      }} />

      {/* Top teal progress bar */}
      <div className="fp-top-bar" />

      {/* Dot grid */}
      <div className="fp-dot-grid" />

      {/* ── Full page white background ── */}
      <div style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif",
        padding: "60px 24px 48px",
      }}>

        {/* Subtle teal glow — top left */}
        <div style={{
          position: "fixed", top: "-8%", left: "-6%",
          width: 420, height: 420, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)",
          filter: "blur(50px)", pointerEvents: "none",
        }} />
        {/* Subtle teal glow — bottom right */}
        <div style={{
          position: "fixed", bottom: "-10%", right: "-8%",
          width: 380, height: 380, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)",
          filter: "blur(50px)", pointerEvents: "none",
        }} />

        {/* ── Content ── */}
        <div
          className="fp-content"
          style={{
            position: "relative", zIndex: 2,
            width: "100%", maxWidth: 440,
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <div className="fp-item" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #0f766e, #14b8a6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 20px rgba(20,184,166,0.35)",
            }}>
              <i className="bi bi-activity" style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", fontFamily: "'Poppins',sans-serif", lineHeight: 1.1 }}>AcnePilot</div>
              <div style={{ fontSize: 9.5, color: "#64748b", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", fontFamily: "'Poppins',sans-serif" }}>Personalised Skincare AI</div>
            </div>
          </div>

          {!ready ? (
            <FormSkeleton />
          ) : (
            <>
              {/* ── Doctor image ── */}
              <div className="fp-doc-wrap" style={{ position: "relative", display: "inline-block", marginBottom: 28, opacity: 0 }}>
                <div className="fp-pulse-r1" />
                <div className="fp-pulse-r2" />
                <div className="fp-pulse-r3" />
                <div
                  className="fp-doc-circle"
                  style={{
                    width: 185, height: 185, borderRadius: "50%",
                    background: "linear-gradient(135deg, #f0fdfb 0%, #ccfbf1 60%, #99f6e4 100%)",
                    display: "flex", alignItems: "flex-end", justifyContent: "center",
                    boxShadow: "0 12px 44px rgba(20,184,166,0.18), 0 2px 0 rgba(255,255,255,0.9) inset",
                    border: "2.5px solid rgba(20,184,166,0.15)",
                    position: "relative", zIndex: 2,
                    overflow: "hidden",
                  }}
                >
                  <div className="fp-doc-float">
                    <img
                      src={DoctorImage}
                      alt="Forgot password doctor"
                      className="fp-doc-img"
                      style={{
                        width: 200, height: 200,
                        objectFit: "contain",
                        objectPosition: "center bottom",
                        display: "block",
                        filter: "drop-shadow(0 8px 18px rgba(15,118,110,0.18))",
                      }}
                    />
                  </div>
                </div>
              </div>

              {!sent ? (
                /* ──────── REQUEST FORM ──────── */
                <>
                  <div className="fp-item" style={{ marginBottom: 8 }}>
                    <h1 style={{ fontSize: 30, fontWeight: 900, color: "#0f172a", fontFamily: "'Poppins',sans-serif", lineHeight: 1.2, letterSpacing: "-0.4px" }}>
                      Forgot password?
                    </h1>
                  </div>

                  <div className="fp-item" style={{ marginBottom: 6 }}>
                    {/* Teal divider */}
                    <div style={{ width: 40, height: 3, borderRadius: 99, background: "linear-gradient(90deg,#14b8a6,#2dd4bf)", margin: "0 auto" }} />
                  </div>

                  <div className="fp-item" style={{ marginBottom: 36 }}>
                    <p style={{ fontSize: 14.5, color: "#64748b", fontWeight: 500, fontFamily: "'Poppins',sans-serif", lineHeight: 1.65, maxWidth: 340 }}>
                      No worries! Enter your email address and we'll send you a reset OTP right away.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    {/* Email field */}
                    <div className="fp-item" style={{ marginBottom: 18, textAlign: "left" }}>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#0f766e", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "'Poppins',sans-serif" }}>
                        Email address
                      </label>
                      <div style={{ position: "relative" }}>
                        <i className="bi bi-envelope-fill" style={{
                          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                          color: focused ? "#14b8a6" : "#94a3b8", fontSize: 15,
                          transition: "color .2s",
                        }} />
                        <input
                          id="forgot-email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="fp-input"
                          style={{ borderColor: focused ? "#14b8a6" : "#e2e8f0" }}
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="fp-item" style={{ marginBottom: 24 }}>
                      <button id="fp-submit" type="submit" className="fp-submit-btn" disabled={loading}>
                        {loading ? (
                          <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin .85s linear infinite" }}>
                              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                              <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            Sending OTP…
                          </>
                        ) : (
                          <>
                            Send Reset OTP
                            <i className="bi bi-send-fill" style={{ fontSize: 15 }} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Back to login */}
                  <div className="fp-item">
                    <Link to="/login" className="fp-back-link">
                      <i className="bi bi-arrow-left" style={{ fontSize: 12 }} /> Back to login
                    </Link>
                  </div>
                </>
              ) : (
                /* ──────── SUCCESS STATE ──────── */
                <>
                  {/* Success icon */}
                  <div className="fp-item fp-success-icon" style={{ marginBottom: 16 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      background: "linear-gradient(135deg, #ccfbf1, #99f6e4)",
                      border: "2px solid rgba(20,184,166,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 8px 24px rgba(20,184,166,0.2)",
                      margin: "0 auto",
                    }}>
                      <i className="bi bi-envelope-check-fill" style={{ fontSize: 26, color: "#0f766e" }} />
                    </div>
                  </div>

                  <div className="fp-item" style={{ marginBottom: 8 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", fontFamily: "'Poppins',sans-serif", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
                      Check your email
                    </h1>
                  </div>

                  <div className="fp-item" style={{ marginBottom: 6 }}>
                    <div style={{ width: 40, height: 3, borderRadius: 99, background: "linear-gradient(90deg,#14b8a6,#2dd4bf)", margin: "0 auto" }} />
                  </div>

                  <div className="fp-item" style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 14.5, color: "#64748b", fontWeight: 500, fontFamily: "'Poppins',sans-serif", lineHeight: 1.65 }}>
                      If an account exists for
                    </p>
                  </div>

                  <div className="fp-item" style={{ marginBottom: 16 }}>
                    <span style={{
                      fontSize: 13.5, fontWeight: 800, color: "#0f766e",
                      fontFamily: "'Poppins',sans-serif",
                      background: "linear-gradient(90deg, #ccfbf1, #e0fdf9)",
                      padding: "6px 18px", borderRadius: 22,
                      border: "1.5px solid #99f6e4",
                      display: "inline-block",
                      maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      boxShadow: "0 2px 10px rgba(20,184,166,0.12)",
                    }}>
                      {email}
                    </span>
                  </div>

                  <div className="fp-item" style={{ marginBottom: 32 }}>
                    <p style={{ fontSize: 13.5, color: "#94a3b8", fontWeight: 500, fontFamily: "'Poppins',sans-serif", lineHeight: 1.65 }}>
                      We've sent a reset OTP.{" "}
                      <span style={{ color: "#ef4444", fontWeight: 700 }}>Expires in 5 minutes.</span>
                    </p>
                  </div>

                  {/* Enter OTP button */}
                  <div className="fp-item" style={{ width: "100%", marginBottom: 14 }}>
                    <button
                      id="goto-reset"
                      className="fp-submit-btn"
                      onClick={() => navigate("/reset-password", { state: { email } })}
                    >
                      Enter Reset OTP
                      <i className="bi bi-key-fill" style={{ fontSize: 16 }} />
                    </button>
                  </div>

                  

                  {/* Back to login */}
                  <div className="fp-item">
                    <Link to="/login" className="fp-back-link">
                      <i className="bi bi-arrow-left" style={{ fontSize: 12 }} /> Back to login
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;