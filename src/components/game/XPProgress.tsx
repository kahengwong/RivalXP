
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
    <div className="w-[140px] xs:w-[180px] md:w-[220px] bg-[#fcfce0] border-[2px] md:border-[3px] border-black p-2 md:p-3 pixel-shadow">
      <div className="flex justify-between items-end mb-1 md:mb-2">
        <span className="font-pixel text-[8px] md:text-[10px] lg:text-[12px] uppercase text-black truncate max-w-[60%]">{label}</span>
        <span className="font-pixel text-[8px] md:text-[10px] text-black">Lv{level}</span>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        <span className="font-pixel text-[8px] md:text-[10px] font-bold text-[#f08030]">HP</span>
        <div className="relative h-3 md:h-4 flex-1 border-[2px] border-black bg-[#404040] p-[1px] md:p-[2px] rounded-sm">
          <div 
            className={cn("h-full transition-all duration-700 ease-out rounded-xs", barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="text-right mt-1 hidden xs:block">
        <span className="font-mono text-[8px] md:text-[10px] font-bold text-black tabular-nums">
          {currentXP}/{nextLevelXP}
        </span>
      </div>
    </div>
  );
}
