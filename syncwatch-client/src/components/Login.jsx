import React, { useState } from "react";

export const Login = ({ onComplete }) => {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "",
  );
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
    <div className="w-full max-w-md bg-near-black border-4 border-accent-white shadow-[10px_10px_0px_#0f3460] overflow-hidden ">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b-4 border-accent-white">
        <div className="w-4 h-4 rounded-none border-2 border-black bg-[#ff5f56]"></div>
        <div className="w-4 h-4 rounded-none border-2 border-black bg-[#ffbd2e]"></div>
        <div className="w-4 h-4 rounded-none border-2 border-black bg-[#27c93f]"></div>
        <span className="ml-2 text-[11px] text-ice-blue font-mono font-black uppercase tracking-widest">
          SYNC-WATCH USERNAME
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
          </div>
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
  );
};
