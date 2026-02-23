import React, { useState } from "react";


export const Login = ({ onComplete }) => {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [error, setError] = useState("");

  const handleAction = () => {
    const trimmedName = username.trim();
    
    if (!trimmedName) {
      setError("Username cannot be empty");
      return;
    }

    localStorage.setItem("username", trimmedName);
    setError(""); 
    if (onComplete) onComplete();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAction();
    }
  };

  return (
    <div className=" bg-near-black font-jetbrains text-white p-4">
      <div className="w-full max-w-md bg-[#121212] rounded-xl shadow-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-[#121212] border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-[15px]">
            <span className="text-emerald-400 font-bold">➜</span>
            <span className="text-[#9cdcfe]">identity-vault</span>
            <span className="text-white/40">on</span>
            <span className="text-[#ce9178]">auth-provider</span>
            <span className="text-white">:</span>
            <span className="text-blue-400">~</span>
            <span className="animate-pulse text-emerald-500">_</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <span className="text-ice-blue font-bold tracking-tighter shrink-0">
                {">"}
              </span>
              <div className="relative flex-1">
                <input
                  id="username"
                  type="text"
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full bg-transparent border-none text-ice-blue outline-none p-0 focus:ring-0 placeholder:text-white/10"
                  placeholder="enter username..."
                />
              </div>
              {username.length > 0 && (
                <button
                  onClick={handleAction}
                  className="text-[10px] text-ice-blue uppercase tracking-widest transition-colors font-bold"
                >
                  Enter
                </button>
              )}
            </div>
            <div className="h-4">
              {error && (
                <p className="text-[11px] text-red-400/80 italic animate-pulse">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};