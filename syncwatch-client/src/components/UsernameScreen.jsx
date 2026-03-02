import React, { useState } from "react";
import Logo from "./Logo";
import { Login } from "./Login";
export const UsernameScreen = ({ onComplete }) => {
  const [name, setName] = useState(localStorage.getItem("username") || "");

  return (
    <div className="h-screen w-screen flex items-center justify-center lg:flex-row flex-col bg-near-black  gap-8 p-8">
      <Logo />
      <Login onComplete={onComplete}/>
    </div>
  );
};
