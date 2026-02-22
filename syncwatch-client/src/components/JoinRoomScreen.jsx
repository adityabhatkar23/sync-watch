import React, { useState } from "react";
export const JoinRoomScreen = ({ roomId, setRoomId, onJoin }) => (
  <div style={{ padding: "40px" }}>
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