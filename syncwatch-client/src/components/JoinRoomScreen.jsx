import React, { useState } from "react";
import Logo from "./Logo";

export const JoinRoomScreen = ({ roomId, setRoomId, onJoin }) => (
  <div className="h-screen w-screen flex items-center justify-center lg:flex-row flex-col bg-near-black  gap-8 font-jetbrains text-accent-white">
    <Logo />

    <div className=" flex flex-col items-center justify-center h-64 w-64 gap-12">
      <h2>Join or Create Room</h2>
      <input
        type="text"
        value={roomId}
        placeholder="Enter Room ID"
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button className="bg-zinc-900 rounded-2xl p-4 cursor-pointer" onClick={() => onJoin(roomId)}>Enter Room</button>
    </div>
  </div>
);
