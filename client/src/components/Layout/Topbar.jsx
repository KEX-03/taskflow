import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import Logo from "../Shared/Logo.jsx";
import Sidebar from "./Sidebar.jsx";

const Topbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <>
      <header className="relative z-50 flex h-12 w-full items-center justify-between border-b border-border-subtle bg-surface-card pr-3 md:hidden">
        <Logo collapsed={false} />

        <button
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg
            text-text-secondary hover:text-white hover:bg-surface-raised"
        >
          {isMenuOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="fixed left-0 top-12 bottom-0 right-0 z-40 overflow-y-auto bg-black/60 backdrop-blur-xs md:hidden"
          onClick={(e) => e.target === e.currentTarget && setIsMenuOpen(false)}
        >
          <Sidebar mobileOpen />
        </div>
      )}
    </>
  );
};

export default Topbar;
