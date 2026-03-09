import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { authAPI } from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", retype_password: ""
  });
  const [showPass, setShowPass] = useState(false);
  const [showRetypePass, setShowRetypePass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.retype_password)
      return "All fields are required";
    if (formData.password.length < 8)
      return "Password must be at least 8 characters";
    if (formData.password !== formData.retype_password)
      return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      await authAPI.register(formData);
      toast.success("OTP sent to your email!");
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const strengthLevel = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  };

  const strength = strengthLevel(formData.password);
  const strengthColors = ["", "#ef4444", "#f59e0b", "#22c55e", "#14b8a6"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)"
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10"
      style={{ background: "linear-gradient(135deg, #0a0f0d 0%, #0d1f1a 40%, #0a1628 100%)" }}>
      <Toaster position="top-center" />

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.3) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}>
              <i className="bi bi-activity text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">AcnePilot</h1>
          </div>
          <p className="text-slate-400 text-sm">Start your personalized skincare journey</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(20,184,166,0.2)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(20,184,166,0.1)"
          }}>
          <h2 className="text-xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-slate-400 text-sm mb-7">Free forever — no credit card required</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <i className="bi bi-person absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input id="reg-username" type="text" name="username" value={formData.username}
                  onChange={handleChange} placeholder="john_doe" autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <i className="bi bi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input id="reg-email" type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="you@example.com" autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <i className="bi bi-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input id="reg-password" type={showPass ? "text" : "password"} name="password"
                  value={formData.password} onChange={handleChange} placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
              {/* Strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthColors[strength] : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            {/* Retype Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
              <div className="relative">
                <i className="bi bi-lock-fill absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input id="reg-retype-password" type={showRetypePass ? "text" : "password"} name="retype_password"
                  value={formData.retype_password} onChange={handleChange} placeholder="Repeat password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition-all duration-200"
                  style={{
                    ...inputStyle,
                    ...(formData.retype_password && {
                      borderColor: formData.password === formData.retype_password
                        ? "rgba(20,184,166,0.5)" : "rgba(239,68,68,0.5)"
                    })
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(20,184,166,0.6)"}
                  onBlur={(e) => e.currentTarget.style.borderColor =
                    formData.retype_password
                      ? formData.password === formData.retype_password ? "rgba(20,184,166,0.5)" : "rgba(239,68,68,0.5)"
                      : "rgba(255,255,255,0.1)"
                  } />
                <button type="button" onClick={() => setShowRetypePass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <i className={`bi ${showRetypePass ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button id="reg-submit" type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)", opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
        <div className="text-center mt-6">
          <Link to="/" className="text-slate-500 hover:text-slate-400 text-xs transition-colors inline-flex items-center gap-1">
            <i className="bi bi-arrow-left text-xs"></i> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;