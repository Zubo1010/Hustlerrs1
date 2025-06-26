import React from 'react';

export default function LoadingSpinner({ size = 'medium', color = 'blue' }) {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    gray: 'border-gray-600'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          animate-spin rounded-full
          ${sizeClasses[size] || sizeClasses.medium}
          ${colorClasses[color] || colorClasses.blue}
          border-t-transparent
        `}
      />
    </div>
  );
}
