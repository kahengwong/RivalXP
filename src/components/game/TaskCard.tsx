
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
      "border-4 rounded-none transition-all duration-100",
      task.completed ? "bg-muted/50 border-muted grayscale opacity-60" : "border-black bg-white hover:translate-x-1 pixel-shadow"
    )}>
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex-1">
          <h4 className={cn("font-pixel text-[10px] mb-1", task.completed && "line-through")}>
            {task.title}
          </h4>
          <span className="font-pixel text-[6px] text-[#70c0a8]">+{task.xpReward} XP</span>
        </div>

        <div>
          {!task.completed && (
            <Button 
              onClick={() => onComplete(task.id)}
              className="bg-white hover:bg-muted border-2 border-black h-8 px-2 font-pixel text-[8px] text-black rounded-none shadow-[2px_2px_0px_#000]"
            >
              FIGHT
            </Button>
          )}
          {task.completed && (
            <span className="font-pixel text-[8px] text-primary">WIN!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
