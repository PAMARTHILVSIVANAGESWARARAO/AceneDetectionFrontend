import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { authAPI } from "../services/api";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) navigate("/register");
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
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
    try {
      await authAPI.verifyOtp({ email, otp: code });
      toast.success("Account verified! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
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

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0f0d 0%, #0d1f1a 40%, #0a1628 100%)" }}>
      <Toaster position="top-center" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.3) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
              <i className="bi bi-activity text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">AcnePilot</h1>
          </div>
        </div>

        <div className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(20,184,166,0.2)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
          }}>
          {/* Email icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.3)" }}>
              <i className="bi bi-envelope-check text-teal-400 text-2xl"></i>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2 text-center">Check your email</h2>
          <p className="text-slate-400 text-sm text-center mb-2">
            We sent a 6-digit code to
          </p>
          <p className="text-teal-400 text-sm text-center font-medium mb-7 truncate">{email}</p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  id={`otp-digit-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-13 text-center text-xl font-bold text-white rounded-xl focus:outline-none transition-all duration-200"
                  style={{
                    background: digit ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.06)",
                    border: digit ? "2px solid rgba(20,184,166,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    caretColor: "#14b8a6"
                  }}
                />
              ))}
            </div>

            <button id="otp-submit" type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 mb-4"
              style={{ 
                background: "linear-gradient(135deg, #0f766e, #14b8a6)", 
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                pointerEvents: loading ? "none" : "auto"
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : "Verify Account"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Didn't receive the code?</p>
            <button id="resend-otp" onClick={(e) => { setResending(true); handleResend(e); }} disabled={resending || countdown > 0}
              className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
              style={{ 
                cursor: (resending || countdown > 0) ? "not-allowed" : "pointer",
                opacity: (resending || countdown > 0) ? 0.5 : 1,
                pointerEvents: (resending || countdown > 0) ? "none" : "auto"
              }}>
              {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/register" className="text-slate-500 hover:text-slate-400 text-xs transition-colors inline-flex items-center gap-1">
            <i className="bi bi-arrow-left text-xs"></i> Back to register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
