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
  
  // Classic Pokemon HP colors: Green > 50%, Yellow > 20%, Red <= 20%
  const barColor = colorClass || (percentage > 50 ? "bg-[#70c0a8]" : percentage > 20 ? "bg-[#f8d030]" : "bg-[#f08030]");

  return (
    <div className="w-full bg-[#fcfce0] border-[3px] border-black p-3 pixel-shadow min-w-[220px]">
      <div className="flex justify-between items-end mb-2">
        <span className="font-pixel text-[12px] uppercase text-black">{label}</span>
        <span className="font-pixel text-[10px] text-black">Lv{level}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-pixel text-[10px] font-bold text-[#f08030]">HP</span>
        <div className="relative h-4 flex-1 border-[2px] border-black bg-[#404040] p-[2px] rounded-sm">
          <div 
            className={cn("h-full transition-all duration-700 ease-out rounded-xs", barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="text-right mt-1">
        <span className="font-mono text-[10px] font-bold text-black tabular-nums">
          {currentXP} / {nextLevelXP}
        </span>
      </div>
    </div>
  );
}