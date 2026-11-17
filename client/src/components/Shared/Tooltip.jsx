import React, { useEffect, useState } from "react";

// A short label for an icon-only button, shown on hover and on keyboard focus.
// Pass the button's aria-label as `text`. The label itself is aria-hidden, so
// screen readers read the aria-label once instead of both.
//
// `className` replaces the wrapper's default classes. Keep it positioned
// (relative or absolute), because the label is placed against it.
const Tooltip = ({
  text,
  children,
  side = "top",
  className = "relative inline-flex",
  style,
}) => {
  // Hover and focus are tracked separately, so the label stays while either
  // one is still active (e.g. the mouse leaves a button you tabbed to).
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  // Escape hides the label until the mouse or focus comes back.
  const [isDismissed, setIsDismissed] = useState(false);
  const isVisible = (isHovered || isFocused) && !isDismissed;

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsDismissed(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsDismissed(false);
  };

  const handleFocus = (event) => {
    // Only keyboard focus counts. Clicking a button focuses it too, and the
    // label shouldn't stay after the mouse has moved away.
    if (!event.target.matches(":focus-visible")) return;
    setIsFocused(true);
    setIsDismissed(false);
  };

  const handleBlur = (event) => {
    // Only count it as leaving when focus moves outside the wrapper.
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsFocused(false);
    }
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  };

  return (
    <span
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}

      {isVisible && (
        <span
          aria-hidden="true"
          className={`absolute z-50 whitespace-nowrap pointer-events-none rounded-md border border-border bg-surface-raised px-2 py-1 text-xs text-text shadow-lg ${
            positionClasses[side] || positionClasses.top
          }`}
        >
          {text}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
