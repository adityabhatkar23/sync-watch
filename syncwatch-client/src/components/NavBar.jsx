import React, { useState } from "react";
import {
  Share2,
  LogOut,
  FileVideo,
  Star,
  User,
  Activity,
  CheckCircle2,
} from "lucide-react";

const Navbar = ({ roomId, isHost, onLeave, onFileChange }) => {
  const [statusMsg, setStatusMsg] = useState("");

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?room=${roomId}`);
    setStatusMsg("Link copied!");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  return (
    <div className="bg-near-black flex flex-col items-center justify-start p-8 font-black">
      <div
        className={`fixed top-6 transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) z-50 ${
          statusMsg ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0"
        }`}
      >
        <div className="bg-ice-blue border-4 border-near-black px-6 py-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
          <CheckCircle2 size={18} strokeWidth={4} className="text-near-black" />
          <span className="uppercase text-xs tracking-tight text-near-black">
            {statusMsg}
          </span>
        </div>
      </div>

      <nav className="w-full max-w-6xl flex flex-wrap bg-accent-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] divide-x-0 md:divide-x-4 divide-black overflow-hidden">

        <div className="bg-accent-white flex-1 min-w-[180px] px-4 py-2 flex items-center gap-3 border-b-4 md:border-b-0 border-black">
          <div className="bg-near-black border-[3px] border-black p-1.5 shadow-[3px_3px_0px_0px_#000000]">
            <Activity size={18} strokeWidth={3} className="text-ice-blue" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase text-near-black opacity-60 leading-none">
              Room
            </span>
            <span className="text-lg tracking-tighter text-near-black uppercase leading-tight truncate">
              {roomId}
            </span>
          </div>
        </div>

        <div className="bg-ice-blue px-4 py-2 flex items-center justify-center border-b-4 md:border-b-0 border-black">
          <div
            className={`flex items-center gap-2 px-3 py-1 border-[3px] border-black shadow-[3px_3px_0px_0px_#000000] transition-all ${
              isHost
                ? "bg-accent-white text-near-black"
                : "bg-near-black text-ice-blue"
            }`}
          >
            {isHost ? (
              <Star size={14} fill="currentColor" />
            ) : (
              <User size={14} />
            )}
            <span className="uppercase text-[10px] tracking-widest">
              {isHost ? "Host" : "Viewer"}
            </span>
          </div>
        </div>

        <div className="bg-accent-white flex-1 min-w-[220px] px-4 py-2 flex items-center border-b-4 md:border-b-0 border-black">
          <label className="w-full cursor-pointer group flex items-center justify-between gap-3 bg-white border-[3px] border-black px-3 py-1.5 shadow-[3px_3px_0px_0px_#000000] hover:translate-x-px hover:translate-y-1px hover:shadow-none transition-all active:bg-ice-blue">
            <span className="text-xs uppercase flex items-center gap-2 text-near-black">
              <FileVideo size={16} strokeWidth={3} className="text-[#FF6B6B]" />
              Media
            </span>
            <input
              type="file"
              accept="video/*"
              onChange={onFileChange}
              className="hidden"
            />
            <div className="text-[9px] bg-near-black text-white px-2 py-0.5">
              LOAD
            </div>
          </label>
        </div>

        <button
          onClick={copyLink}
          className="bg-[#FF6B6B] text-accent-white px-6 py-2 flex items-center justify-center gap-2 hover:bg-near-black hover:text-[#FF6B6B] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none border-b-4 md:border-b-0 border-black group"
        >
          <Share2
            size={20}
            strokeWidth={3}
            className="group-hover:rotate-12 transition-transform"
          />
          <span className="uppercase text-xs hidden lg:block">Invite</span>
        </button>

        <button
          onClick={onLeave}
          className="bg-near-black text-accent-white px-6 py-2 flex items-center justify-center gap-2 hover:bg-[#FF6B6B] transition-all active:translate-x-1 active:translate-y-1"
        >
          <LogOut size={20} strokeWidth={3} />
          <span className="uppercase text-xs hidden lg:block">Leave</span>
        </button>
      </nav>
    </div>
  );
};

export default Navbar;
