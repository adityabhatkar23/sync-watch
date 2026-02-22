import React, { useState } from "react";
export const UsernameScreen = ({ onComplete }) => {
  const [name, setName] = useState(localStorage.getItem("username") || "");

  return (
    <div style={{ padding: "40px" }}>
      <h2>Enter Username</h2>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Your name" 
      />
      <button onClick={() => {
        if (!name.trim()) return;
        localStorage.setItem("username", name.trim());
        onComplete();
      }}>Continue</button>
    </div>
  );
};