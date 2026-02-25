"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Timer } from "lucide-react";
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
      "border-4 rounded-none transition-all duration-200",
      task.completed ? "bg-muted/50 border-muted opacity-60" : "border-black bg-white hover:translate-x-1 hover:translate-y-[-2px] pixel-shadow"
    )}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1 space-y-1">
          <h4 className={cn("font-pixel text-[10px] uppercase", task.completed && "line-through")}>
            {task.title}
          </h4>
          <div className="flex items-center gap-3 font-pixel text-[8px] uppercase text-muted-foreground">
            <span className="text-primary">+{task.xpReward} XP</span>
            {task.type === 'timed' && (
              <span className="flex items-center gap-1">
                <Timer className="w-2 h-2" />
                {task.duration}M
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!task.completed && (
            <Button 
              onClick={() => onComplete(task.id)}
              className="bg-accent hover:bg-accent/90 border-4 border-black h-10 px-4 font-pixel text-[8px] uppercase text-white rounded-none"
            >
              Finish
            </Button>
          )}

          {task.completed && (
            <CheckCircle2 className="w-6 h-6 text-primary" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
