import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { authAPI } from "../services/api";
import DoctorImage from "../assets/ResetPassword.png";

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
    70%       { transform: translateY(-5px) rotate(-0.4deg); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(0.88); opacity: 0.5; }
    70%  { transform: scale(1.22); opacity: 0; }
    100% { transform: scale(0.88); opacity: 0; }
  }

  /* ── Base input shared style ── */
  .rp-input {
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
  .rp-input:focus {
    border-color: #14b8a6;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(20,184,166,0.12);
  }
  .rp-input::placeholder { color: #94a3b8; font-weight: 400; }
  .rp-input.pr { padding-right: 46px; }

  /* ── OTP digit inputs ── */
  .rp-otp-digit {
    width: 60px;
    height: 68px;
    text-align: center;
    font-size: 24px;
    font-weight: 800;
    font-family: 'Poppins', sans-serif;
    color: #0f172a;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    outline: none;
    caret-color: #14b8a6;
    transition: border-color .2s, box-shadow .2s, background .2s, transform .15s;
  }
  .rp-otp-digit:focus {
    border-color: #14b8a6;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(20,184,166,0.12);
    transform: scale(1.06);
  }
  .rp-otp-digit.filled {
    border-color: #0d9488;
    background: linear-gradient(135deg, #f0fdfb, #ccfbf1);
    color: #0f766e;
    box-shadow: 0 4px 12px rgba(20,184,166,0.18);
  }

  /* ── Submit button ── */
  .rp-submit-btn {
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
  .rp-submit-btn:hover:not(:disabled) {
    box-shadow: 0 12px 38px rgba(20,184,166,0.52);
    transform: translateY(-2px);
  }
  .rp-submit-btn:active:not(:disabled) { transform: scale(0.97); }
  .rp-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── Password strength bar ── */
  .rp-str-bar {
    flex: 1; height: 4px; border-radius: 4px;
    transition: background .3s;
  }

  /* ── Back link ── */
  .rp-back-link {
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
  .rp-back-link:hover { color: #0f766e; }

  /* ── Pulse rings ── */
  .rp-pulse-r1 {
    position: absolute; inset: -16px; border-radius: 50%;
    border: 2px solid rgba(20,184,166,0.3);
    animation: pulseRing 3s ease-out infinite;
    pointer-events: none;
  }
  .rp-pulse-r2 {
    position: absolute; inset: -36px; border-radius: 50%;
    border: 1.5px solid rgba(20,184,166,0.15);
    animation: pulseRing 3s ease-out infinite 1.1s;
    pointer-events: none;
  }
  .rp-pulse-r3 {
    position: absolute; inset: -58px; border-radius: 50%;
    border: 1px solid rgba(20,184,166,0.07);
    animation: pulseRing 3s ease-out infinite 2.2s;
    pointer-events: none;
  }

  /* ── Doctor float ── */
  .rp-doc-float { animation: docFloat 4s ease-in-out infinite; }

  /* ── Skeleton ── */
  .rp-sk {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 10px;
  }

  /* ── Animated items ── */
  .rp-item { opacity: 0; }

  /* ── Top bar ── */
  .rp-top-bar {
    position: fixed; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #0f766e, #14b8a6, #2dd4bf);
    z-index: 100;
  }

  /* ── Dot grid ── */
  .rp-dot-grid {
    position: fixed; inset: 0; pointer-events: none; opacity: 0.04;
    background-image: radial-gradient(circle, #0f766e 1px, transparent 1px);
    background-size: 24px 24px;
  }

  /* ── Label style ── */
  .rp-label {
    display: block;
    font-size: 12.5px;
    font-weight: 700;
    color: #0f766e;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Poppins', sans-serif;
  }

  /* ── Responsive ── */
  @media (max-width: 520px) {
    .rp-content   { padding: 0 18px !important; }
    .rp-doc-circle{ width: 155px !important; height: 155px !important; }
    .rp-doc-img   { width: 175px !important; height: 175px !important; }
    .rp-otp-digit { width: 46px; height: 54px; font-size: 20px; border-radius: 11px; }
    .rp-otp-row   { gap: 7px !important; }
  }
  @media (max-width: 400px) {
    .rp-otp-digit { width: 40px; height: 48px; font-size: 18px; }
    .rp-otp-row   { gap: 5px !important; }
  }
`;

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
const Sk = ({ w = "100%", h = 14, r = 8, mb = 0 }) => (
  <div className="rp-sk" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
);

const FormSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
    <Sk w={175} h={175} r={88} mb={28} />
    <Sk w={260} h={30} r={8}  mb={10} />
    <Sk w={320} h={14} r={6}  mb={36} />
    {/* OTP boxes */}
    <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
      {[0,1,2,3,4,5].map(i => <Sk key={i} w={60} h={68} r={14} />)}
    </div>
    {/* Password field */}
    <div style={{ width: "100%", marginBottom: 16 }}>
      <Sk w={100} h={12} r={6} mb={8} />
      <Sk w="100%" h={52} r={14} />
    </div>
    {/* Strength bar */}
    <div style={{ display: "flex", gap: 4, width: "100%", marginBottom: 24 }}>
      {[0,1,2,3].map(i => <Sk key={i} style={{ flex: 1 }} h={4} r={4} />)}
    </div>
    {/* Submit */}
    <Sk w="100%" h={52} r={14} mb={20} />
    <Sk w={100} h={12} r={6} />
  </div>
);

/* ─────────────────────────────────────────────
   RESET PASSWORD COMPONENT
───────────────────────────────────────────── */
const ResetPassword = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const prefillEmail = location.state?.email || "";

  const [ready, setReady]     = useState(false);
  const [form, setForm]       = useState({
    email:       prefillEmail,
    otp:         ["","","","","",""],
    newPassword: "",
  });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [focused, setFocused]     = useState("");
  const inputRefs = useRef([]);

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
      anime({ targets: ".rp-doc-wrap", opacity: [0,1], scale: [0.76,1],   duration: 900, easing: "easeOutBack" });
      anime({ targets: ".rp-item",     opacity: [0,1], translateY: [22,0], delay: anime.stagger(65, { start: 320 }), duration: 510, easing: "easeOutCubic" });
    };
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch(_) {} };
  }, [ready]);

  /* OTP handlers */
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...form.otp];
    newOtp[index] = value.slice(-1);
    setForm(p => ({ ...p, otp: newOtp }));
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (window.anime && value) {
      window.anime({ targets: `#rp-otp-${index}`, scale: [1.14, 1], duration: 200, easing: "easeOutBack" });
    }
  };

  const handleOtpKey = (index, e) => {
    if (e.key === "Backspace" && !form.otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setForm(p => ({ ...p, otp: [...text.split(""), ...Array(6 - text.length).fill("")] }));
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  /* Password strength */
  const strLevel = pw => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)         s++;
    if (/[A-Z]/.test(pw))       s++;
    if (/[0-9]/.test(pw))       s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  };
  const str  = strLevel(form.newPassword);
  const strM = [null,
    { c: "#ef4444", l: "Weak"   },
    { c: "#f59e0b", l: "Fair"   },
    { c: "#22c55e", l: "Good"   },
    { c: "#0d9488", l: "Strong" },
  ];

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpStr = form.otp.join("");
    if (!form.email || otpStr.length < 6 || !form.newPassword) {
      toast.error("All fields are required"); return;
    }
    if (form.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters"); return;
    }
    setLoading(true);
    if (window.anime) window.anime({ targets: "#rp-submit", scale: [1, 0.96, 1], duration: 260, easing: "easeInOutQuad" });
    try {
      await authAPI.resetPassword({ email: form.email, otp: otpStr, newPassword: form.newPassword });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      if (window.anime) {
        window.anime({ targets: ".rp-otp-row", translateX: [-9, 9, -7, 7, -4, 0], duration: 420, easing: "easeInOutSine" });
      }
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const filledOtp = form.otp.filter(Boolean).length;
  const ib = field => focused === field ? "#14b8a6" : "#e2e8f0";

  /* ── RENDER ── */
  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: { borderRadius: 12, background: "#134e4a", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 13 },
      }} />

      <div className="rp-top-bar" />
      <div className="rp-dot-grid" />

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
        padding: "64px 24px 48px",
      }}>
        {/* Subtle corner glows */}
        <div style={{ position: "fixed", top: "-8%", right: "-6%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: "-10%", left: "-8%",  width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

        {/* ── Content ── */}
        <div
          className="rp-content"
          style={{
            position: "relative", zIndex: 2,
            width: "100%", maxWidth: 460,
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <div className="rp-item" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
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
              {/* Doctor image */}
              <div className="rp-doc-wrap" style={{ position: "relative", display: "inline-block", marginBottom: 26, opacity: 0 }}>
                <div className="rp-pulse-r1" />
                <div className="rp-pulse-r2" />
                <div className="rp-pulse-r3" />
                <div
                  className="rp-doc-circle"
                  style={{
                    width: 180, height: 180, borderRadius: "50%",
                    background: "linear-gradient(135deg, #f0fdfb 0%, #ccfbf1 60%, #99f6e4 100%)",
                    display: "flex", alignItems: "flex-end", justifyContent: "center",
                    boxShadow: "0 12px 44px rgba(20,184,166,0.18), 0 2px 0 rgba(255,255,255,0.9) inset",
                    border: "2.5px solid rgba(20,184,166,0.14)",
                    position: "relative", zIndex: 2,
                    overflow: "hidden",
                  }}
                >
                  <div className="rp-doc-float">
                    <img
                      src={DoctorImage}
                      alt="Reset password"
                      className="rp-doc-img"
                      style={{
                        width: 195, height: 195,
                        objectFit: "contain",
                        objectPosition: "center bottom",
                        display: "block",
                        filter: "drop-shadow(0 8px 18px rgba(15,118,110,0.18))",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="rp-item" style={{ marginBottom: 8 }}>
                <h1 style={{ fontSize: 30, fontWeight: 900, color: "#0f172a", fontFamily: "'Poppins',sans-serif", lineHeight: 1.2, letterSpacing: "-0.4px" }}>
                  Reset your password
                </h1>
              </div>

              <div className="rp-item" style={{ marginBottom: 6 }}>
                <div style={{ width: 40, height: 3, borderRadius: 99, background: "linear-gradient(90deg,#14b8a6,#2dd4bf)", margin: "0 auto" }} />
              </div>

              <div className="rp-item" style={{ marginBottom: 32 }}>
                <p style={{ fontSize: 14.5, color: "#64748b", fontWeight: 500, fontFamily: "'Poppins',sans-serif", lineHeight: 1.65 }}>
                  Enter the OTP sent to your email and choose a new password.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ width: "100%" }}>

                {/* Email (only if not pre-filled) */}
                {!prefillEmail && (
                  <div className="rp-item" style={{ marginBottom: 18, textAlign: "left" }}>
                    <label className="rp-label">Email address</label>
                    <div style={{ position: "relative" }}>
                      <i className="bi bi-envelope-fill" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focused === "email" ? "#14b8a6" : "#94a3b8", fontSize: 15, transition: "color .2s" }} />
                      <input
                        id="reset-email"
                        type="email"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="you@example.com"
                        className="rp-input"
                        style={{ borderColor: ib("email") }}
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused("")}
                      />
                    </div>
                  </div>
                )}

                {/* Pre-filled email pill */}
                {prefillEmail && (
                  <div className="rp-item" style={{ marginBottom: 22 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 800, color: "#0f766e",
                      fontFamily: "'Poppins',sans-serif",
                      background: "linear-gradient(90deg, #ccfbf1, #e0fdf9)",
                      padding: "6px 18px", borderRadius: 22,
                      border: "1.5px solid #99f6e4",
                      display: "inline-block",
                      maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      boxShadow: "0 2px 10px rgba(20,184,166,0.12)",
                    }}>
                      {prefillEmail}
                    </span>
                  </div>
                )}

                {/* OTP */}
                <div className="rp-item" style={{ marginBottom: 24, textAlign: "left" }}>
                  <label className="rp-label">6-Digit OTP</label>
                  {/* Progress bar */}
                  <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                    {[0,1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < filledOtp ? "#14b8a6" : "#e2e8f0", transition: "background .2s", boxShadow: i < filledOtp ? "0 0 5px rgba(20,184,166,0.4)" : "none" }} />
                    ))}
                  </div>
                  <div
                    className="rp-otp-row"
                    onPaste={handleOtpPaste}
                    style={{ display: "flex", gap: 9, justifyContent: "center" }}
                  >
                    {form.otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`rp-otp-${i}`}
                        ref={el => (inputRefs.current[i] = el)}
                        className={`rp-otp-digit${digit ? " filled" : ""}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                      />
                    ))}
                  </div>
                </div>

                {/* New Password */}
                <div className="rp-item" style={{ marginBottom: 10, textAlign: "left" }}>
                  <label className="rp-label">New Password</label>
                  <div style={{ position: "relative" }}>
                    <i className="bi bi-lock-fill" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focused === "password" ? "#14b8a6" : "#94a3b8", fontSize: 15, transition: "color .2s" }} />
                    <input
                      id="reset-newpassword"
                      type={showPass ? "text" : "password"}
                      value={form.newPassword}
                      onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Min. 8 characters"
                      className="rp-input pr"
                      style={{ borderColor: ib("password") }}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused("")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#14b8a6", fontSize: 15, display: "flex", alignItems: "center" }}
                    >
                      <i className={`bi ${showPass ? "bi-eye-slash-fill" : "bi-eye-fill"}`} />
                    </button>
                  </div>
                </div>

                {/* Strength bar */}
                {form.newPassword && (
                  <div className="rp-item" style={{ marginBottom: 24, textAlign: "left" }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} className="rp-str-bar" style={{ background: i <= str ? strM[str]?.c : "#e2e8f0" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: strM[str]?.c, fontFamily: "'Poppins',sans-serif" }}>
                      {strM[str]?.l}
                    </span>
                  </div>
                )}

                {!form.newPassword && <div style={{ marginBottom: 24 }} />}

                {/* Submit */}
                <div className="rp-item" style={{ marginBottom: 24 }}>
                  <button id="rp-submit" type="submit" className="rp-submit-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin .85s linear infinite" }}>
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                          <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Resetting password…
                      </>
                    ) : (
                      <>
                        Reset Password
                        <i className="bi bi-check-circle-fill" style={{ fontSize: 16 }} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Back to login */}
              <div className="rp-item">
                <Link to="/login" className="rp-back-link">
                  <i className="bi bi-arrow-left" style={{ fontSize: 12 }} /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;