"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/game-types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onTimerToggle: (id: string) => void;
  onTimerReset: (id: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  return (
    <Card className={cn(
      "border-[3px] rounded-none transition-all duration-200",
      task.completed ? "bg-muted/40 border-muted opacity-60" : "border-black bg-white hover:translate-x-1 pixel-shadow"
    )}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <h4 className={cn(
            "text-base font-bold mb-1 uppercase tracking-tight", 
            task.completed ? "line-through text-muted-foreground" : "text-black"
          )}>
            {task.title}
          </h4>
          <span className="font-pixel text-[10px] text-[#2d7d65]">+{task.xpReward} XP</span>
        </div>

        <div>
          {!task.completed && (
            <Button 
              onClick={() => onComplete(task.id)}
              className="bg-primary text-white hover:bg-primary/90 border-[2px] border-black h-10 px-6 font-pixel text-[10px] rounded-none shadow-[3px_3px_0px_#000]"
            >
              FIGHT
            </Button>
          )}
          {task.completed && (
            <span className="font-pixel text-[12px] text-primary font-bold">CLEAR!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}