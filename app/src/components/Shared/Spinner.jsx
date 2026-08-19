import React from "react";

const Spinner = ({ fullPage = false, size = "md" }) => {
  const sizes = { sm: "w-4 h-4 border-2", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-3" };

  const spinner = (
    <div className={`${sizes[size]} border-slate-700 border-t-primary-500 rounded-full animate-spin`} />
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        {spinner}
      </div>
    );
  }
  return spinner;
};

export default Spinner;
