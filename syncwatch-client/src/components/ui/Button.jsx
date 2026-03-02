const Button = ({ variant = "primary", children, onClick, className = "" }) => {
  const variantStyles = {
    primary: {
      base: "bg-deep-navy focus:ring-ice-blue",
      face: "bg-ice-blue border-accent-white text-near-black",
    },
    secondary: {
      base: "bg-ice-blue focus:ring-ice-blue",
      face: "bg-deep-navy border-accent-white text-accent-white",
    },
  };

  const styles = variantStyles[variant] || variantStyles.primary;

  return (
    <div
      className={`
        inline-block
        cursor-pointer 
        select-none 
        border-4 border-near-black
        pb-[10px] 
        transition-all duration-100 ease-in-out 
        active:pb-0 
        active:mb-[10px] 
        active:translate-y-[10px]
        focus:outline-none focus:ring-2
        ${styles.base}
        ${className}
      `}
      role="button"
      tabIndex="0"
      onClick={onClick}
    >
      <div
        className={`block border-4 px-[12px] py-[6px] ${styles.face} flex items-center justify-center`}
      >
        <span className="font-jetbrains text-[1rem] tracking-[1px] font-bold uppercase">
          {children}
        </span>
      </div>
    </div>
  );
};

export default Button;
