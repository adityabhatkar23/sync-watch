import React, { useState } from "react";

export const Login = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState("login"); 
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("all fields are required");
      return;
    }
    if (mode === "register" && !username.trim()) {
      setError("username cannot be empty");
      return;
    }
    if (password.length < 6) {
      setError("password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await onLogin(email.trim(), password);
      } else {
        await onRegister(email.trim(), username.trim(), password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAction();
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
    setEmail("");
    setUsername("");
    setPassword("");
  };

  return (
    <div className="w-full max-w-md bg-near-black border-4 border-accent-white shadow-[10px_10px_0px_#0f3460] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b-4 border-accent-white">
        <div className="w-4 h-4 rounded-none border-2 border-black bg-[#ff5f56]"></div>
        <div className="w-4 h-4 rounded-none border-2 border-black bg-[#ffbd2e]"></div>
        <div className="w-4 h-4 rounded-none border-2 border-black bg-[#27c93f]"></div>
        <span className="ml-2 text-[11px] text-ice-blue font-mono font-black uppercase tracking-widest">
          SYNC-WATCH {mode === "login" ? "LOGIN" : "REGISTER"}
        </span>
      </div>

      <div className="p-6 space-y-6 font-jetbrains">
        <div className="bg-black/40 p-3 border-2 border-black">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-emerald-400 font-black">➜</span>
            <span className="text-[#9cdcfe] font-bold">identity-vault</span>
            <span className="text-white/40 italic">on</span>
            <span className="text-[#ce9178]">auth-provider</span>
            <span className="text-blue-400 font-bold">~</span>
            <span className="text-white/40 ml-auto text-[11px] italic">
              {mode === "login" ? "$ ./login.sh" : "$ ./register.sh"}
            </span>
          </div>
        </div>

        <div className="space-y-4">

          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold shrink-0 text-xs w-20 text-right">
              email
            </span>
            <span className="text-ice-blue font-bold shrink-0">{">"}</span>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
              placeholder="you@example.com"
              className="flex-1 bg-transparent border-none text-ice-blue outline-none p-0 focus:ring-0 placeholder:text-white/10 text-sm"
            />
          </div>

          {mode === "register" && (
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold shrink-0 text-xs w-20 text-right">
                username
              </span>
              <span className="text-ice-blue font-bold shrink-0">{">"}</span>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck="false"
                placeholder="pick a display name"
                className="flex-1 bg-transparent border-none text-ice-blue outline-none p-0 focus:ring-0 placeholder:text-white/10 text-sm"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold shrink-0 text-xs w-20 text-right">
              password
            </span>
            <span className="text-ice-blue font-bold shrink-0">{">"}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="min. 6 characters"
              className="flex-1 bg-transparent border-none text-ice-blue outline-none p-0 focus:ring-0 placeholder:text-white/10 text-sm"
            />
          </div>

          <div className="h-4">
            {error && (
              <p className="text-[11px] text-red-400/80 italic animate-pulse">
                ✗ {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={toggleMode}
              className="text-[11px] text-white/30 hover:text-white/60 transition-colors italic"
            >
              {mode === "login"
                ? "no account? register →"
                : "have an account? login →"}
            </button>

            <button
              onClick={handleAction}
              disabled={loading || !email || !password}
              className="text-[10px] text-ice-blue uppercase tracking-widest font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? "wait..." : mode === "login" ? "[ login ]" : "[ register ]"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};