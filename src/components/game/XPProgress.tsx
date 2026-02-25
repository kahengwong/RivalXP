
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
  
  // 模拟宝可梦经典的 HP 颜色变化：绿色 > 黄色 > 橙色
  const barColor = colorClass || (percentage > 50 ? "bg-[#70c0a8]" : percentage > 20 ? "bg-[#f8d030]" : "bg-[#f08030]");

  return (
    <div className="w-[160px] sm:w-[180px] md:w-[220px] bg-[#f8f8d8] border-[3px] border-black p-2 pixel-shadow">
      <div className="flex justify-between items-end mb-1">
        <span className="font-pixel text-[10px] md:text-[12px] uppercase text-black truncate max-w-[70%] tracking-tighter">
          {label}
        </span>
        <span className="font-pixel text-[10px] md:text-[12px] text-black">Lv{level}</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <span className="font-pixel text-[9px] md:text-[10px] font-bold text-[#f08030] leading-none">HP</span>
        <div className="relative h-3 flex-1 border-[2.5px] border-black bg-[#404040] p-[1px]">
          <div 
            className={cn("h-full transition-all duration-700 ease-out", barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      <div className="text-right mt-1">
        <span className="font-mono text-[10px] md:text-[12px] font-bold text-black tabular-nums">
          {Math.floor(currentXP)} / {nextLevelXP}
        </span>
      </div>
    </div>
  );
}
