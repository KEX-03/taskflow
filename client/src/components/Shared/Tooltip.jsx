import React, { useEffect, useState } from "react";

const Tooltip = ({ text, children, side = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible]);

  const handleBlur = (event) => {
    // Hide only when focus moves outside the wrapper.
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsVisible(false);
    }
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={handleBlur}
    >
      {children}

      {isVisible && (
        <span
          aria-hidden="true"
          className={`absolute z-50 whitespace-nowrap pointer-events-none rounded-md border border-border bg-surface-raised px-2 py-1 text-xs text-text shadow-lg ${positionClasses[side] || positionClasses.top
            }`}
        >
          {text}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
