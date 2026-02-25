
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
  
  // Dynamic color based on "HP" percentage
  const barColor = colorClass || (percentage > 50 ? "bg-[#70c0a8]" : percentage > 20 ? "bg-[#f8d030]" : "bg-[#f08030]");

  return (
    <div className="w-full bg-[#f8f8d8] border-4 border-black p-2 pixel-shadow min-w-[200px]">
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-pixel text-[10px] text-black">{label}</span>
        <span className="font-pixel text-[8px] text-black">:L{level}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-pixel text-[8px] font-bold">HP</span>
        <div className="relative h-3 flex-1 border-2 border-black bg-[#404040] p-[2px]">
          <div 
            className={cn("h-full transition-all duration-700 ease-out", barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="text-right mt-1">
        <span className="font-pixel text-[6px] text-black">
          {currentXP}/{nextLevelXP}
        </span>
      </div>
    </div>
  );
}
