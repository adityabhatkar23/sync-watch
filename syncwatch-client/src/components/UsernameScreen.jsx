import React, { useState } from "react";
import Logo from "./Logo";
import { Login } from "./Login";
export const UsernameScreen = ({onLogin,onRegister}) => {
  
  return (
    <div className="h-screen w-screen flex items-center justify-center lg:flex-row flex-col bg-near-black  gap-8 p-8">
      <Logo />
      <Login onLogin={onLogin} onRegister={onRegister} />
    </div>
  );
};
