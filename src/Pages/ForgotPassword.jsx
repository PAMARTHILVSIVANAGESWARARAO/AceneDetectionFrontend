import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { authAPI } from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email"); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
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
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.3)" }}>
              <i className={`bi ${sent ? "bi-check-circle" : "bi-key"} text-teal-400 text-2xl`}></i>
            </div>
          </div>

          {!sent ? (
            <>
              <h2 className="text-xl font-bold text-white mb-2 text-center">Forgot password?</h2>
              <p className="text-slate-400 text-sm text-center mb-7">
                Enter your email and we'll send you a reset OTP
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                  <div className="relative">
                    <i className="bi bi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                    <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all duration-200"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                </div>
                <button id="forgot-submit" type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Sending..." : "Send Reset OTP"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-3">Check your email</h2>
              <p className="text-slate-400 text-sm mb-6">
                If an account exists for <span className="text-teal-400">{email}</span>,
                we've sent a reset OTP. It expires in 5 minutes.
              </p>
              <button id="goto-reset" onClick={() => navigate("/reset-password", { state: { email } })}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
                Enter Reset OTP
              </button>
            </div>
          )}

          <div className="text-center mt-6">
            <Link to="/login" className="text-slate-500 hover:text-slate-400 text-xs transition-colors inline-flex items-center gap-1">
              <i className="bi bi-arrow-left text-xs"></i> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
