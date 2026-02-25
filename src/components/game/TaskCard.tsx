

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/game-types";
import { cn } from "@/lib/utils";
import { Swords } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  return (
    <Card className={cn(
      "border-[3px] rounded-none transition-all duration-200",
      task.completed ? "bg-muted/30 border-muted opacity-60" : "border-black bg-white hover:translate-x-1 pixel-shadow"
    )}>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "text-base md:text-lg font-bold uppercase truncate", 
            task.completed ? "line-through text-muted-foreground" : "text-black"
          )}>
            {task.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
             <span className="font-pixel text-[9px] text-primary font-bold">+{task.xpReward} XP</span>
          </div>
        </div>

        <div className="shrink-0">
          {!task.completed ? (
            <Button 
              onClick={() => onComplete(task.id)}
              className="bg-[#70c0a8] text-white hover:bg-[#5ea894] border-[2px] border-black h-10 px-4 font-pixel text-[10px] rounded-none shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <Swords className="w-3 h-3 mr-2" />
              FIGHT
            </Button>
          ) : (
            <div className="px-3 py-2 border-2 border-primary bg-primary/10 text-primary font-pixel text-[10px] rounded-none">
              CLEAR!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

    