const Card = ({ children, title, className = "" }) => {
  return (
    <div className={`inline-block w-full border-4 border-near-black bg-deep-navy pb-[12px] pr-[12px] ${className}`}>
      <div className="border-4 border-accent-white bg-near-black p-6 -mt-[4px] -ml-[4px]">
        {title && (
          <h2 className="text-ice-blue font-jetbrains text-lg uppercase tracking-widest mb-6 border-b-4 border-deep-navy pb-2">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Card;