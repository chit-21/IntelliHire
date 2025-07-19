import React from 'react';
import clsx from 'clsx';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={clsx('bg-card text-card-foreground rounded-2xl shadow-card border border-border', className)} {...props} />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={clsx('p-6 border-b border-border rounded-t-2xl', className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={clsx('text-xl font-bold', className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={clsx('p-6', className)} {...props} />
); 