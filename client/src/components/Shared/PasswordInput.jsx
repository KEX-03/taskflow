
import React, { useState } from "react";

const PasswordInput = ({
  name,
  value,
  onChange,
  placeholder = "Enter password",
  hasError = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 pr-12 text-sm rounded-lg transition-colors ${
          hasError ? "border-red-500 ring-1 ring-red-500" : ""
        }`}
      />

      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-white transition-colors"
      >
        {isVisible ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 002.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 9 4 10 7-0.4 1.2-1.3 2.5-2.6 3.5" />
            <path d="M6.2 6.2C3.9 7.5 2.5 9.5 2 12c1 3 5 7 10 7 1 0 2-.2 2.9-.5" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
