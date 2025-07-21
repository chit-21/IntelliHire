import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'feedback' | 'retake' | 'create';
  size?: 'lg' | 'md' | 'sm';
}

const variantClasses = {
  default: 'bg-[hsl(142,71%,40%)] text-white hover:bg-white hover:text-[hsl(142,71%,40%)] hover:border-[hsl(142,71%,40%)] border-2 border-transparent',
  secondary: 'bg-white text-green-700 hover:bg-green-700 hover:text-white border-2 border-green-700',
  outline: 'border-2 border-[hsl(142,71%,40%)] text-[hsl(142,71%,40%)] bg-transparent hover:bg-[hsl(142,71%,40%)] hover:text-white',
  feedback: 'bg-success text-white hover:bg-white hover:text-success hover:border-success border-2 border-transparent',
  retake: 'bg-accent text-white hover:bg-white hover:text-accent hover:border-accent border-2 border-transparent',
  create: 'bg-green-700 text-white hover:bg-white hover:text-green-700 border-2 border-green-700',
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
        'transition-colors transition-transform duration-300 font-bold shadow focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60',
        'hover:scale-105 hover:shadow-xl',
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