import React from 'react';

export interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className }) => (
  <div className={`w-full bg-muted rounded-full h-2 ${className || ''}`}>
    <div
      className="bg-primary h-2 rounded-full transition-all duration-500"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

export default Progress; 