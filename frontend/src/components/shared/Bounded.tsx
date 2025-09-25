"use client";

import { cn } from "@/lib/utils";

interface BoundedProps {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
}

export const Bounded = ({ children, center = true, className }: BoundedProps) => {
  return (
    <div
      className={cn(
        "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
        center && "text-center",
        className
      )}
    >
      {children}
    </div>
  );
};