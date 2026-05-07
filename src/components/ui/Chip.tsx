import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChipProps {
  variant?: 'orange' | 'win' | 'loss' | 'be' | 'buy' | 'sell';
  withDot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  orange: 'bg-[rgba(243,108,0,.12)] text-accent border border-[rgba(243,108,0,.3)]',
  win:    'bg-[rgba(16,185,129,.12)] text-[#34D399] border border-[rgba(16,185,129,.25)]',
  loss:   'bg-[rgba(239,68,68,.12)] text-[#F87171] border border-[rgba(239,68,68,.25)]',
  be:     'bg-elevated text-txt-2 border border-border',
  buy:    'bg-[rgba(16,185,129,.12)] text-[#34D399] border border-[rgba(16,185,129,.25)]',
  sell:   'bg-[rgba(239,68,68,.12)] text-[#F87171] border border-[rgba(239,68,68,.25)]',
};

const dotColors = {
  orange: 'bg-accent',
  win:    'bg-[#10B981]',
  loss:   'bg-[#EF4444]',
  be:     'bg-txt-2',
  buy:    'bg-[#10B981]',
  sell:   'bg-[#EF4444]',
};

export const Chip: React.FC<ChipProps> = ({ 
  variant = 'be', 
  withDot = false, 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase',
      variantStyles[variant],
      className
    )}>
      {withDot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          dotColors[variant]
        )} />
      )}
      {children}
    </div>
  );
};
