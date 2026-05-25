import React from 'react';
import { cn } from '@/src/utils/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, children, hoverable, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white border border-brand-border rounded-xl p-6 shadow-sm',
        hoverable && 'hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
