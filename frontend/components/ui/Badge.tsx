import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'lime' | 'dark';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'slate',
  size = 'sm',
  children,
  ...props
}) => {
  const variants = {
    slate: 'bg-[#ECE8E0] text-[#222220] border-[#D3CCC0]',
    blue: 'bg-[#111111] text-[#F4F1EA] border-[#111111]',
    emerald: 'bg-[#C7F000] text-[#111111] border-[#111111] font-bold',
    amber: 'bg-[#FFF7D6] text-[#7A5A00] border-[#E0BC38]',
    rose: 'bg-[#FFF0ED] text-[#C4381F] border-[#FF654A]',
    purple: 'bg-[#F0EDFF] text-[#5031DE] border-[#7657FF]/40',
    lime: 'bg-[#C7F000] text-[#111111] border-[#111111] font-bold',
    dark: 'bg-[#111111] text-[#F4F1EA] border-[#111111]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[9px] font-display font-bold uppercase tracking-[0.15em]',
    md: 'px-2.5 py-1 text-[11px] font-display font-bold uppercase tracking-[0.12em]',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center border font-mono select-none transition-colors',
          variants[variant],
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};

