import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { authAPI } from "../services/api";
import DoctorImage from "../assets/otpVerfication.png";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Poppins', sans-serif; overflow-x: hidden; }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes docFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    40%       { transform: translateY(-16px) rotate(1deg); }
    70%       { transform: translateY(-7px) rotate(-0.4deg); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(0.86); opacity: 0.55; }
    70%  { transform: scale(1.25); opacity: 0; }
    100% { transform: scale(0.86); opacity: 0; }
  }
  @keyframes blobDrift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(28px, -32px) scale(1.07); }
    66%       { transform: translate(-20px, 16px) scale(0.95); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── OTP digit inputs ── */
  .otp-digit {
    width: 68px;
    height: 76px;
    text-align: center;
    font-size: 28px;
    font-weight: 800;
    font-family: 'Poppins', sans-serif;
    color: #0f172a;
    background: rgba(255,255,255,0.65);
    border: 2px solid rgba(20,184,166,0.3);
    border-radius: 18px;
    outline: none;
    caret-color: #14b8a6;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(15,118,110,0.08);
    transition: border-color .2s, box-shadow .2s, background .2s, transform .15s;
  }
  .otp-digit:focus {
    border-color: #14b8a6;
    background: rgba(255,255,255,0.92);
    box-shadow: 0 0 0 5px rgba(20,184,166,0.18), 0 6px 24px rgba(15,118,110,0.12);
    transform: scale(1.08) translateY(-2px);
  }
  .otp-digit.filled {
    border-color: #0d9488;
    background: rgba(204,251,241,0.75);
    color: #0f766e;
    box-shadow: 0 6px 20px rgba(20,184,166,0.22);
  }

  /* ── Submit button ── */
  .otp-submit-btn {
    padding: 16px 56px;
    border-radius: 16px;
    border: none;
    background: linear-gradient(135deg, #0f766e 0%, #14b8a6 55%, #2dd4bf 100%);
    color: #fff;
    font-size: 15.5px;
    font-weight: 800;
    font-family: 'Poppins', sans-serif;
    letter-spacing: 0.5px;
    cursor: pointer;
    box-shadow: 0 10px 32px rgba(20,184,166,0.45);
    transition: box-shadow .25s, transform .15s, opacity .2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 260px;
  }
  .otp-submit-btn:hover:not(:disabled) {
    box-shadow: 0 14px 42px rgba(20,184,166,0.58);
    transform: translateY(-2px);
  }
  .otp-submit-btn:active:not(:disabled) { transform: scale(0.97); }
  .otp-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  /* ── Resend button ── */
  .otp-resend-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: #0f766e;
    border-bottom: 2px solid rgba(20,184,166,0.5);
    padding-bottom: 1px;
    transition: color .2s, border-color .2s;
  }
  .otp-resend-btn:hover:not(:disabled) { color: #0d9488; border-color: #0d9488; }
  .otp-resend-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Pulse rings around doctor ── */
  .otp-pulse-r1 {
    position: absolute; inset: -18px; border-radius: 50%;
    border: 2px solid rgba(20,184,166,0.35);
    animation: pulseRing 3.2s ease-out infinite;
    pointer-events: none;
  }
  .otp-pulse-r2 {
    position: absolute; inset: -40px; border-radius: 50%;
    border: 1.5px solid rgba(20,184,166,0.18);
    animation: pulseRing 3.2s ease-out infinite 1.1s;
    pointer-events: none;
  }
  .otp-pulse-r3 {
    position: absolute; inset: -64px; border-radius: 50%;
    border: 1px solid rgba(20,184,166,0.09);
    animation: pulseRing 3.2s ease-out infinite 2.2s;
    pointer-events: none;
  }

  /* ── Doctor float ── */
  .otp-doc-float { animation: docFloat 4.2s ease-in-out infinite; }

  /* ── Skeleton shimmer ── */
  .otp-sk {
    background: linear-gradient(90deg, rgba(255,255,255,0.4) 25%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.4) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 12px;
  }

  /* ── Animated items ── */
  .otp-item { opacity: 0; }

  /* ── Blob bg ── */
  .otp-blob {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    animation: blobDrift 12s ease-in-out infinite;
  }

  /* ── Progress bar ── */
  .otp-progress-track {
    width: 320px;
    max-width: 100%;
    height: 5px;
    background: rgba(255,255,255,0.4);
    border-radius: 99px;
    overflow: hidden;
  }
  .otp-progress-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #0f766e, #2dd4bf);
    transition: width .35s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 0 10px rgba(20,184,166,0.6);
  }

  /* ── Divider ── */
  .otp-divider {
    width: 40px; height: 3px; border-radius: 99px;
    background: linear-gradient(90deg, #14b8a6, #2dd4bf);
    margin: 0 auto;
  }

  /* ── Back link ── */
  .otp-back-link {
    font-family: 'Poppins', sans-serif;
    font-size: 12.5px;
    color: rgba(15,118,110,0.7);
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: color .2s;
  }
  .otp-back-link:hover { color: #0f766e; }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .otp-digit { width: 50px; height: 58px; font-size: 22px; border-radius: 14px; }
    .otp-digits-row { gap: 8px !important; }
    .otp-submit-btn { min-width: 200px; padding: 14px 32px; }
    .otp-progress-track { width: 260px; }
  }
  @media (max-width: 400px) {
    .otp-digit { width: 44px; height: 52px; font-size: 20px; }
    .otp-digits-row { gap: 6px !important; }
  }
`;

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
const Sk = ({ w, h, r = 10, mb = 0, style = {} }) => (
  <div className="otp-sk" style={{ width: w, height: h, borderRadius: r, marginBottom: mb, ...style }} />
);

const OtpSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, width: "100%" }}>
    {/* Doctor circle */}
    <Sk w={180} h={180} r={90} mb={32} />
    {/* Title */}
    <Sk w={220} h={28} r={8} mb={12} />
    {/* Subtitle */}
    <Sk w={280} h={14} r={6} mb={6} />
    {/* Email pill */}
    <Sk w={200} h={30} r={20} mb={32} />
    {/* Progress bar */}
    <Sk w={320} h={5} r={99} mb={28} />
    {/* OTP boxes */}
    <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
      {[0,1,2,3,4,5].map(i => <Sk key={i} w={68} h={76} r={18} />)}
    </div>
    {/* Button */}
    <Sk w={260} h={54} r={16} mb={28} />
    {/* Resend */}
    <Sk w={170} h={14} r={6} mb={8} />
    <Sk w={110} h={14} r={6} mb={28} />
    {/* Back */}
    <Sk w={120} h={12} r={6} />
  </div>
);

/* ─────────────────────────────────────────────
   VERIFY OTP COMPONENT
───────────────────────────────────────────── */
const VerifyOtp = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const email     = location.state?.email || "";

  const [ready, setReady]         = useState(false);
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  /* Inject CSS */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  /* Guard */
  useEffect(() => {
    if (!email) navigate("/register");
    inputRefs.current[0]?.focus();
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
      anime({ targets: ".otp-doc-wrap", opacity: [0,1], scale: [0.75,1],   duration: 900, easing: "easeOutBack" });
      anime({
        targets: ".otp-item",
        opacity: [0,1],
        translateY: [26,0],
        delay: anime.stagger(65, { start: 350 }),
        duration: 520,
        easing: "easeOutCubic",
      });
    };
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch(_) {} };
  }, [ready]);

  /* Countdown */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  /* Handlers */
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (window.anime && value) {
      window.anime({ targets: `#otp-digit-${index}`, scale: [1.14, 1], duration: 200, easing: "easeOutBack" });
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setOtp([...text.split(""), ...Array(6 - text.length).fill("")]);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { toast.error("Please enter all 6 digits"); return; }
    setLoading(true);
    if (window.anime) window.anime({ targets: "#otp-submit", scale: [1, 0.96, 1], duration: 260, easing: "easeInOutQuad" });
    try {
      await authAPI.verifyOtp({ email, otp: code });
      toast.success("Account verified! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      if (window.anime) {
        window.anime({ targets: ".otp-digits-row", translateX: [-10, 10, -8, 8, -4, 0], duration: 430, easing: "easeInOutSine" });
      }
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await authAPI.resendOtp({ email });
      toast.success("New OTP sent to your email");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend failed");
    } finally {
      setResending(false);
    }
  };

  const filledCount = otp.filter(Boolean).length;
  const progressPct = (filledCount / 6) * 100;

  /* ── RENDER ── */
  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: { borderRadius: 12, background: "#134e4a", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 13 },
      }} />

      {/* ── Full-viewport page ── */}
      <div style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #e4fcf7 0%, #ccfbf1 25%, #99f6e4 58%, #5eead4 85%, #2dd4bf 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif",
        padding: "48px 24px",
      }}>

        {/* ── Background blobs ── */}
        <div className="otp-blob" style={{ width: 600, height: 600, background: "rgba(255,255,255,0.22)", filter: "blur(80px)", top: "-18%", left: "-14%", animationDelay: "0s" }} />
        <div className="otp-blob" style={{ width: 440, height: 440, background: "rgba(15,118,110,0.1)",   filter: "blur(70px)", bottom: "-14%", right: "-12%", animationDelay: "4s" }} />
        <div className="otp-blob" style={{ width: 300, height: 300, background: "rgba(255,255,255,0.18)", filter: "blur(60px)", top: "50%",   left: "68%",   animationDelay: "8s" }} />
        <div className="otp-blob" style={{ width: 220, height: 220, background: "rgba(45,212,191,0.15)",  filter: "blur(55px)", top: "8%",    right: "6%",   animationDelay: "2s" }} />

        {/* ── Subtle dot pattern ── */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.12,
          backgroundImage: "radial-gradient(circle, rgba(15,118,110,0.5) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* ── All content — no card wrapper ── */}
        <div style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>

          {/* ── Logo ── */}
          <div className="otp-item" style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 36 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 13,
              background: "linear-gradient(135deg, #0f766e, #14b8a6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 22px rgba(15,118,110,0.35)",
            }}>
              <i className="bi bi-activity" style={{ color: "#fff", fontSize: 21 }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 21, fontWeight: 900, color: "#0f172a", fontFamily: "'Poppins',sans-serif", lineHeight: 1.1 }}>AcnePilot</div>
              <div style={{ fontSize: 9.5, color: "#0f766e", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", fontFamily: "'Poppins',sans-serif", opacity: 0.8 }}>Personalised Skincare AI</div>
            </div>
          </div>

          {/* ── Doctor image ── */}
          {ready ? (
            <div
              className="otp-doc-wrap"
              style={{ position: "relative", display: "inline-block", marginBottom: 30, opacity: 0 }}
            >
              <div className="otp-pulse-r1" />
              <div className="otp-pulse-r2" />
              <div className="otp-pulse-r3" />
              {/* Frosted circle behind image */}
              <div style={{
                width: 180, height: 180, borderRadius: "50%",
                background: "rgba(255,255,255,0.35)",
                backdropFilter: "blur(16px)",
                border: "2.5px solid rgba(255,255,255,0.6)",
                boxShadow: "0 16px 48px rgba(15,118,110,0.2), 0 2px 0 rgba(255,255,255,0.8) inset",
                display: "flex", alignItems: "flex-end", justifyContent: "center",
                overflow: "hidden",
                position: "relative", zIndex: 2,
              }}>
                <div className="otp-doc-float">
                  <img
                    src={DoctorImage}
                    alt="Verification doctor"
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: "contain",
                      objectPosition: "center bottom",
                      display: "block",
                      filter: "drop-shadow(0 8px 20px rgba(15,118,110,0.2))",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Sk w={180} h={180} r={90} mb={30} />
          )}

          {/* ── Heading ── */}
          <div className="otp-item" style={{ marginBottom: 6 }}>
            <h1 style={{
              fontSize: 32, fontWeight: 900, color: "#0f172a",
              fontFamily: "'Poppins',sans-serif", lineHeight: 1.15,
              letterSpacing: "-0.5px",
            }}>
              Check your email
            </h1>
          </div>

          <div className="otp-item" style={{ marginBottom: 12 }}>
            <div className="otp-divider" />
          </div>

          <div className="otp-item" style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 14.5, color: "#1e4e45", fontWeight: 500, fontFamily: "'Poppins',sans-serif", lineHeight: 1.6 }}>
              Please enter the 6-digit verification code we sent to
            </p>
          </div>

          <div className="otp-item" style={{ marginBottom: 32 }}>
            <span style={{
              fontSize: 13.5, fontWeight: 800, color: "#0f766e",
              fontFamily: "'Poppins',sans-serif",
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(8px)",
              padding: "6px 20px",
              borderRadius: 24,
              border: "1.5px solid rgba(255,255,255,0.75)",
              display: "inline-block",
              maxWidth: "100%",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              boxShadow: "0 3px 12px rgba(15,118,110,0.1)",
            }}>
              {email}
            </span>
          </div>

          {/* ── Progress bar ── */}
          <div className="otp-item" style={{ marginBottom: 24 }}>
            <div className="otp-progress-track">
              <div className="otp-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* ── OTP digits ── */}
          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              className="otp-digits-row otp-item"
              onPaste={handlePaste}
              style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16, width: "100%" }}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-digit-${i}`}
                  ref={el => (inputRefs.current[i] = el)}
                  className={`otp-digit${digit ? " filled" : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                />
              ))}
            </div>

            {/* Hint */}
            <div className="otp-item" style={{ marginBottom: 28 }}>
              <span style={{
                fontSize: 12.5, fontWeight: 600,
                color: filledCount === 6 ? "#0f766e" : "rgba(15,78,74,0.6)",
                fontFamily: "'Poppins',sans-serif",
                transition: "color .3s",
              }}>
                {filledCount === 0
                  ? "Type each digit in the boxes above"
                  : filledCount < 6
                  ? `${6 - filledCount} more digit${6 - filledCount > 1 ? "s" : ""} to go…`
                  : "✓ All set — tap verify to continue!"}
              </span>
            </div>

            {/* Submit */}
            <div className="otp-item" style={{ marginBottom: 32 }}>
              <button id="otp-submit" type="submit" className="otp-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "spin .85s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Verifying…
                  </>
                ) : (
                  <>
                    Confirm
                    <i className="bi bi-shield-check-fill" style={{ fontSize: 18 }} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ── Resend ── */}
          <div className="otp-item" style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 13.5, color: "rgba(15,78,74,0.65)", fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>
              Didn't get the email?{" "}
              {countdown > 0 ? (
                <span style={{ fontWeight: 700, color: "#0f766e" }}>
                  Resend in <span style={{
                    background: "rgba(255,255,255,0.5)",
                    padding: "1px 8px", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.7)",
                  }}>{countdown}s</span>
                </span>
              ) : (
                <button id="resend-otp" className="otp-resend-btn" onClick={handleResend} disabled={resending}>
                  {resending ? "Sending…" : "Resend"}
                </button>
              )}
            </p>
          </div>

          {/* ── Back link ── */}
          <div className="otp-item">
            <Link to="/register" className="otp-back-link">
              <i className="bi bi-arrow-left" style={{ fontSize: 12 }} /> back
            </Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default VerifyOtp;