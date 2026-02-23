import React, { useState } from "react";
import Logo from "./Logo";

export const JoinRoomScreen = ({ roomId, setRoomId, onJoin }) => (
  <div className="h-screen w-screen flex items-center justify-center lg:flex-row flex-col bg-near-black  gap-8 font-jetbrains text-accent-white">
    <Logo />

    <h2>Join or Create Room</h2>
    <input
      type="text"
      value={roomId}
      placeholder="Enter Room ID"
      onChange={(e) => setRoomId(e.target.value)}
    />
    <button onClick={() => onJoin(roomId)}>Enter Room</button>
  </div>
);
