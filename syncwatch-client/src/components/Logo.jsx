import React from 'react';

const LogoBlock = ({ text }) => {
  return (
    <div 
      className="
        pixel-font pixel-3d-shadow 
        text-[clamp(3rem,15vw,8.5rem)] leading-none uppercase 
        tracking-[-6px] md:tracking-[-6px]
      "
      data-text={text}
    >
      {text}
    </div>
  );
};

export default function Logo() {
  return (
    <div className="bg-near-black overflow-hidden p-4">
      <div className="flex flex-col gap-10 md:gap-6 select-none">
        <LogoBlock text="SYNC" />
        <LogoBlock text="WATCH" />
      </div>
    </div>
  );
}