import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'feedback' | 'retake' | 'create';
  size?: 'lg' | 'md' | 'sm';
}

const variantClasses = {
  default: 'bg-[hsl(142,71%,40%)] text-white hover:bg-[hsl(142,71%,35%)]', // mid green
  secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
  outline: 'border border-border text-foreground bg-transparent hover:bg-muted',
  feedback: 'bg-success text-success-foreground hover:bg-success/90',
  retake: 'bg-accent text-accent-foreground hover:bg-accent/80',
  create: 'bg-primary text-primary-foreground hover:bg-primary/80',
};

const sizeClasses = {
  lg: 'px-8 py-4 text-lg rounded-xl',
  md: 'px-6 py-3 text-base rounded-lg',
  sm: 'px-4 py-2 text-sm rounded',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'transition-colors font-bold shadow focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export default Button; 