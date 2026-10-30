import React from "react";

const TaskSkeleton = () => {
  return (
    <div
      aria-hidden="true"
      className="bg-surface-card border border-border-subtle rounded-xl p-4 flex items-start gap-4 motion-safe:animate-pulse"
    >
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-2" />
        <div className="h-3 bg-slate-800/60 rounded w-1/2 mb-3" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-slate-800 rounded-full" />
          <div className="h-5 w-14 bg-slate-800 rounded-full" />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 bg-slate-800 rounded-lg" />
        <div className="w-7 h-7 bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
};

export default TaskSkeleton;
