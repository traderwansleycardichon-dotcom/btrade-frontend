import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LiveDotProps {
  color?: 'orange' | 'green' | 'red';
  className?: string;
}

export const LiveDot: React.FC<LiveDotProps> = ({ color = 'orange', className }) => {
  const colorClasses = {
    orange: 'bg-accent shadow-[0_0_8px_rgba(243,108,0,0.5)] animate-pulse-dot',
    green:  'bg-win shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    red:    'bg-loss shadow-[0_0_8px_rgba(239,68,68,0.5)]',
  };

  return (
    <span className={cn(
      'inline-block w-2 h-2 rounded-full',
      colorClasses[color],
      className
    )} />
  );
};
