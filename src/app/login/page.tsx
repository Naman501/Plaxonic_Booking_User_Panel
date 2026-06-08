"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!employeeId || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      await api.post("/auth/login", { employeeId, password });
      toast.success("Welcome");

      // ✅ Read params passed from homepage and forward to dashboard
      // const roomId   = searchParams.get("roomId")   || "";
      // const from     = searchParams.get("from")     || "";
      // const to       = searchParams.get("to")       || "";
      // const roomName = searchParams.get("roomName") || "";

      // const params = new URLSearchParams();
      // if (roomId)   params.set("roomId",   roomId);
      // if (from)     params.set("from",     from);
      // if (to)       params.set("to",       to);
      // if (roomName) params.set("roomName", roomName);

      // const redirectTo = params.toString()
      //   ? `/dashboard?${params.toString()}`
      //   : "/dashboard";

      // router.push(redirectTo);
      router.push('/');
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500&display=swap');
        .login-root { font-family: 'DM Sans', sans-serif; min-height: 100vh; display: flex; overflow: hidden; }
        .login-panel-left { flex: 1; background: linear-gradient(160deg, #0C447C 0%, #042C53 100%); display: flex; flex-direction: column; justify-content: space-between; padding: 3rem; position: relative; overflow: hidden; }
        .login-panel-left::before { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='%23ffffff' fill-opacity='0.05'/%3E%3C/svg%3E"); }
        .circle-deco { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.07); }
        .login-panel-right { width: 480px; background: #F7F8FA; display: flex; align-items: center; justify-content: center; padding: 3rem 2.5rem; }
        .login-form-card { width: 100%; max-width: 380px; }
        .field-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #6B7280; margin-bottom: 7px; }
        .field-wrap { border: 0.5px solid #D1D5DB; border-radius: 10px; background: #fff; display: flex; align-items: center; gap: 10px; padding: 0 14px; height: 50px; transition: border-color 0.2s, box-shadow 0.2s; }
        .field-wrap:focus-within { border-color: #378ADD; box-shadow: 0 0 0 3px rgba(55,138,221,0.13); }
        .field-wrap input { border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #111; width: 100%; outline: none; }
        .field-wrap input::placeholder { color: #9CA3AF; }
        .toggle-pw { background: none; border: none; cursor: pointer; padding: 0; color: #9CA3AF; display: flex; align-items: center; transition: color 0.2s; }
        .toggle-pw:hover { color: #378ADD; }
        .login-btn { width: 100%; height: 50px; background: #185FA5; color: #fff; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; letter-spacing: 0.02em; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s, transform 0.15s; margin-top: 8px; }
        .login-btn:hover:not(:disabled) { background: #0C447C; transform: translateY(-1px); }
        .login-btn:active:not(:disabled) { transform: scale(0.98); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .login-panel-left { display: none; } .login-panel-right { width: 100%; background: #fff; } }
      `}</style>

      <div className="login-root">

        {/* ── Left Panel ── */}
        <div className="login-panel-left">
          <div className="circle-deco" style={{ width: 400, height: 400, bottom: -120, left: -120 }} />
          <div className="circle-deco" style={{ width: 240, height: 240, bottom: 20, left: 20 }} />
          <div className="circle-deco" style={{ width: 120, height: 120, top: 60, right: -40 }} />

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: 36, height: 36,
                background: "rgba(255,255,255,0.12)",
                border: "0.5px solid rgba(255,255,255,0.25)",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span style={{ color: "#fff", fontWeight: 500, fontSize: "15px", letterSpacing: "0.02em" }}>
                Plaxonic Technologies
              </span>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <span style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.1)",
              border: "0.5px solid rgba(255,255,255,0.18)",
              color: "#85B7EB", fontSize: "10px", letterSpacing: "0.14em",
              textTransform: "uppercase", padding: "4px 14px",
              borderRadius: "20px", marginBottom: "1.25rem",
            }}>
              Staff Portal
            </span>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "clamp(32px, 4vw, 44px)", color: "#fff",
              margin: "0 0 1rem", lineHeight: 1.15,
            }}>
              Manage your<br />
              <em style={{ fontStyle: "italic" }}>property with ease</em>
            </h2>
            <p style={{ color: "#85B7EB", fontSize: "14px", fontWeight: 300, lineHeight: 1.7, maxWidth: "300px" }}>
              Access bookings, rooms, and guest records from a single, unified dashboard.
            </p>
          </div>

          <div style={{ position: "relative", display: "flex", gap: "2rem" }}>
            {[["Bookings", "Managed"], ["Rooms", "Available"], ["Staff", "Online"]].map(([val, label]) => (
              <div key={label}>
                <div style={{ color: "#fff", fontSize: "18px", fontWeight: 500 }}>{val}</div>
                <div style={{ color: "#85B7EB", fontSize: "12px", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="login-panel-right">
          <motion.div
            className="login-form-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div style={{ marginBottom: "2.25rem" }}>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
                fontSize: "34px", margin: "0 0 6px", lineHeight: 1.1, color: "#0D1117",
              }}>
                Welcome back
              </h1>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0, fontWeight: 300 }}>
                Sign in to your staff account to continue.
              </p>
            </div>

            {/* Employee ID */}
            <div style={{ marginBottom: "1rem" }}>
              <label className="field-label">Employee ID</label>
              <div className="field-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-4 0v2"/>
                  <line x1="12" y1="12" x2="12" y2="16"/>
                </svg>
                <input
                  placeholder="e.g. EMP-00123"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
                <label className="field-label" style={{ margin: 0 }}>Password</label>
                <a href="#" style={{ fontSize: "12px", color: "#378ADD", textDecoration: "none" }}>
                  Forgot password?
                </a>
              </div>
              <div className="field-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoComplete="current-password"
                />
                <button
                  className="toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button className="login-btn" onClick={handleLogin} disabled={loading}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round"
                    style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}