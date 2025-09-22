"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ShineBorderProps {
  borderWidth?: number;
  duration?: number;
  color?: string[];
  className?: string;
  children?: React.ReactNode;
}

export function ShineBorder({
  borderWidth = 2,
  duration = 12,
  color = ["#F0E7CC", "#E9F8D8", "#FFFFFF"],
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        className
      )}
    >
      {/* Borde animado que gira */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from 0deg, ${color[0]}, ${color[1]}, ${color[2]}, ${color[0]})`,
          animation: `spin ${duration}s linear infinite`,
          padding: `${borderWidth}px`,
        }}
      >
        {/* Máscara interior para crear el efecto de borde */}
        <div className="w-full h-full rounded-2xl bg-black" />
      </div>
      
      {/* Contenido del botón que NO gira */}
      <div className="relative z-10 m-[2px] rounded-2xl bg-black/80 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}