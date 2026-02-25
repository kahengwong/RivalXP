
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/game-types";
import { cn } from "@/lib/utils";
import { Swords, Clock, Play, Pause, Heart } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onToggleTimer?: (id: string) => void;
}

export function TaskCard({ task, onComplete, onToggleTimer }: TaskCardProps) {
  const isTimed = task.durationMinutes !== undefined && task.durationMinutes > 0;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn(
      "border-[3px] rounded-none transition-all duration-200",
      task.completed ? "bg-muted/30 border-muted opacity-60" : "border-black bg-white hover:translate-x-1 pixel-shadow"
    )}>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn(
              "text-base md:text-xl font-bold uppercase truncate tracking-tight", 
              task.completed ? "line-through text-muted-foreground" : "text-black"
            )}>
              {task.title}
            </h4>
            {isTimed && !task.completed && (
               <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 border border-black rounded-none">
                 <Clock className="w-3 h-3 text-blue-600" />
                 <span className="font-mono text-[12px] font-bold">
                   {formatTime(task.remainingSeconds || 0)}
                 </span>
               </div>
            )}
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                <span className="font-pixel text-[10px] text-primary font-bold">{task.xpReward} HP</span>
             </div>
             {isTimed && !task.completed && (
               <span className="font-pixel text-[8px] text-muted-foreground uppercase">TIMED ENCOUNTER</span>
             )}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {!task.completed ? (
            <>
              {isTimed ? (
                <Button 
                  onClick={() => onToggleTimer?.(task.id)}
                  className={cn(
                    "border-[2px] border-black h-12 px-6 font-pixel text-[10px] rounded-none shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all",
                    task.isActive ? "bg-amber-400 hover:bg-amber-500 text-black" : "bg-blue-500 hover:bg-blue-600 text-white"
                  )}
                >
                  {task.isActive ? <Pause className="w-3 h-3 mr-2" /> : <Play className="w-3 h-3 mr-2" />}
                  {task.isActive ? "PAUSE" : "FIGHT"}
                </Button>
              ) : (
                <Button 
                  onClick={() => onComplete(task.id)}
                  className="bg-[#70c0a8] text-white hover:bg-[#5ea894] border-[2px] border-black h-12 px-6 font-pixel text-[10px] rounded-none shadow-[3px_3px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <Swords className="w-4 h-4 mr-2" />
                  BATTLE
                </Button>
              )}
            </>
          ) : (
            <div className="px-4 py-2 border-2 border-primary bg-primary/10 text-primary font-pixel text-[10px] rounded-none uppercase">
              DEFEATED
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
