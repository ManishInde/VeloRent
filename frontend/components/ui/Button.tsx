import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-display uppercase tracking-wider text-xs font-bold transition-all duration-150 rounded-none focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#C7F000] text-[#111111] hover:bg-[#B5DC00] active:bg-[#A3C600] border border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
      secondary:
        'bg-[#111111] text-[#F4F1EA] hover:bg-[#222220] active:bg-[#000000] border border-[#111111]',
      outline:
        'bg-transparent text-[#111111] hover:bg-[#111111] hover:text-[#F4F1EA] active:bg-[#222220] border border-[#111111]',
      danger:
        'bg-[#FF654A] text-white hover:bg-[#E54F35] active:bg-[#CC3C24] border border-[#111111]',
      ghost:
        'bg-transparent text-[#111111] hover:bg-[#ECE8E0] active:bg-[#E4DFD5] border border-transparent',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[11px] gap-1.5 font-bold tracking-wider',
      md: 'px-4 py-2 text-xs gap-2 font-bold tracking-wider',
      lg: 'px-6 py-3 text-sm gap-2.5 font-extrabold tracking-widest',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
