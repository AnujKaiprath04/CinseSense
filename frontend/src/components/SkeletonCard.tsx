import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-darkCard rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg flex flex-col h-[380px] animate-pulse">
      {/* Poster placeholder */}
      <div className="h-[220px] w-full skeleton-shimmer" />
      {/* Content placeholder */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 w-3/4 skeleton-shimmer rounded" />
          <div className="h-3 w-1/2 skeleton-shimmer rounded" />
        </div>
        <div className="h-12 w-full skeleton-shimmer rounded-xl" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 w-1/3 skeleton-shimmer rounded" />
          <div className="h-8 w-8 skeleton-shimmer rounded-lg" />
        </div>
      </div>
    </div>
  );
};
