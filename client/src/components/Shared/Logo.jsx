const Logo = ({ collapsed }) => {
  return (
    <div className="flex items-center gap-3 p-5 md:border-b border-border-subtle">
      <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </div>
      {!collapsed && (
        <span className="text-lg font-bold text-text">TaskFlow</span>
      )}
    </div>
  );
};

export default Logo;
