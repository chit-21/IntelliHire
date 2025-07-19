import React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

const variantClasses = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border text-foreground bg-transparent',
};

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => (
  <span
    className={clsx(
      'inline-block px-3 py-1 rounded-full text-xs font-semibold',
      variantClasses[variant],
      className
    )}
    {...props}
  />
);

export default Badge; 