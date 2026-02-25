"use client";

import { cn } from "@/lib/utils";

interface XPProgressProps {
  label: string;
  currentXP: number;
  nextLevelXP: number;
  colorClass?: string;
  level: number;
}

export function XPProgress({ label, currentXP, nextLevelXP, colorClass, level }: XPProgressProps) {
  const percentage = Math.min(100, (currentXP / nextLevelXP) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end px-1">
        <span className="font-pixel text-[10px] uppercase tracking-tighter">{label}</span>
        <span className="font-pixel text-[8px]">L:{level}</span>
      </div>
      <div className="relative h-5 w-full border-4 border-black bg-white p-0.5 overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-700 ease-out", colorClass || "bg-primary")}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-end px-2 pointer-events-none">
           <span className="font-pixel text-[6px] mix-blend-difference text-white">
            {currentXP}/{nextLevelXP}
           </span>
        </div>
      </div>
    </div>
  );
}
