import React from 'react';

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className="flex justify-center items-center py-4">
      <div className={`${sizeClasses[size]} rounded-full border-t-transparent border-primary animate-spin`}></div>
    </div>
  );
}