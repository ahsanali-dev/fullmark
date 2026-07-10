import React from 'react';

export const Skeleton = ({ className = '', variant = 'text', width, height }) => {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const getVariantClasses = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full';
      case 'card':
        return 'rounded-[2rem]';
      case 'text':
      default:
        return 'rounded-md';
    }
  };

  return (
    <div
      className={`animate-pulse bg-gray-800/60 dark:bg-gray-700/40 ${getVariantClasses()} ${className}`}
      style={style}
    />
  );
};

export const CardSkeleton = () => (
  <div className="p-5 rounded-[2rem] bg-[#0c0d19]/40 border border-gray-800/80 flex flex-col gap-4 animate-pulse">
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" width="48px" height="48px" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton variant="text" width="60%" height="16px" />
        <Skeleton variant="text" width="40%" height="12px" />
      </div>
    </div>
    <div className="border-t border-gray-800/40 pt-3 mt-1 flex flex-col gap-3">
      <div className="flex justify-between">
        <Skeleton variant="text" width="30%" height="12px" />
        <Skeleton variant="text" width="30%" height="12px" />
      </div>
      <Skeleton variant="text" width="100%" height="8px" className="rounded-full" />
      <Skeleton variant="text" width="100%" height="36px" className="rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0c0d19]/40 border border-gray-800/80 animate-pulse">
    <div className="flex items-center gap-4 flex-1">
      <Skeleton variant="circle" width="40px" height="40px" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton variant="text" width="40%" height="16px" />
        <Skeleton variant="text" width="25%" height="12px" />
      </div>
    </div>
    <div className="flex flex-col items-end gap-2">
      <Skeleton variant="text" width="60px" height="18px" />
      <Skeleton variant="text" width="80px" height="18px" className="rounded-full" />
    </div>
  </div>
);

export default Skeleton;
