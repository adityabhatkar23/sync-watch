const Input = ({ label, placeholder, value, onChange, className = "" }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-ice-blue font-jetbrains text-xs uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="inline-block border-4 border-near-black bg-deep-navy pb-[8px]">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full block border-4 border-accent-white bg-white px-4 py-2 text-near-black font-jetbrains text-lg outline-none focus:bg-[#f0f9ff] transition-colors"
        />
      </div>
    </div>
  );
};
export default Input;