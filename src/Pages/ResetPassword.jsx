import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { authAPI } from "../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = location.state?.email || "";

  const [form, setForm] = useState({ email: prefillEmail, otp: ["","","","","",""], newPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...form.otp];
    newOtp[index] = value.slice(-1);
    setForm(p => ({ ...p, otp: newOtp }));
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
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
    try {
      await authAPI.resetPassword({ email: form.email, otp: otpStr, newPassword: form.newPassword });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8"
      style={{ background: "linear-gradient(135deg, #0a0f0d 0%, #0d1f1a 40%, #0a1628 100%)" }}>
      <Toaster position="top-center" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.3) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-md mx-4">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
              <i className="bi bi-activity text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-black text-white">AcnePilot</h1>
          </div>
        </div>

        <div className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(20,184,166,0.2)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
          }}>
          <h2 className="text-xl font-bold text-white mb-2">Reset your password</h2>
          <p className="text-slate-400 text-sm mb-7">Enter the OTP from your email and choose a new password</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            {!prefillEmail && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <i className="bi bi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                  <input id="reset-email" type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={e => e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)"}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>
              </div>
            )}

            {/* OTP */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">6-Digit OTP</label>
              <div className="flex gap-2" onPaste={handleOtpPaste}>
                {form.otp.map((digit, i) => (
                  <input key={i} ref={el => inputRefs.current[i] = el}
                    id={`reset-otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className="w-10 h-12 text-center text-lg font-bold text-white rounded-xl focus:outline-none transition-all"
                    style={{
                      background: digit ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.06)",
                      border: digit ? "2px solid rgba(20,184,166,0.6)" : "1px solid rgba(255,255,255,0.1)"
                    }} />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <i className="bi bi-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input id="reset-newpassword" type={showPass ? "text" : "password"} value={form.newPassword}
                  onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={e => e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)"}
                  onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            <button id="reset-submit" type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300"
              style={{ 
                background: "linear-gradient(135deg, #0f766e, #14b8a6)", 
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                pointerEvents: loading ? "none" : "auto"
              }}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="text-center mt-5">
            <Link to="/login" className="text-slate-500 hover:text-slate-400 text-xs inline-flex items-center gap-1">
              <i className="bi bi-arrow-left text-xs"></i> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
