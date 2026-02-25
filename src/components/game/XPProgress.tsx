
"use client";

import { Progress } from "@/components/ui/progress";
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
      <div className="flex justify-between items-end">
        <span className="font-headline text-lg font-bold uppercase tracking-tight">{label}</span>
        <span className="text-sm font-medium">LVL {level} — {currentXP}/{nextLevelXP} XP</span>
      </div>
      <div className="relative h-6 w-full border-4 border-foreground overflow-hidden bg-background p-1">
        <div 
          className={cn("h-full transition-all duration-500 ease-out", colorClass || "bg-primary")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
