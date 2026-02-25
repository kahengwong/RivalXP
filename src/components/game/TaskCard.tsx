
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play, Pause, RotateCcw, Timer } from "lucide-react";
import { Task } from "@/lib/game-types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onTimerToggle: (id: string) => void;
  onTimerReset: (id: string) => void;
}

export function TaskCard({ task, onComplete, onTimerToggle, onTimerReset }: TaskCardProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn(
      "border-2 transition-all duration-200",
      task.completed ? "bg-muted/50 border-muted opacity-60" : "border-foreground hover:translate-x-1 hover:translate-y-[-2px] pixel-shadow"
    )}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1 space-y-1">
          <h4 className={cn("font-headline font-bold text-lg", task.completed && "line-through")}>
            {task.title}
          </h4>
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="bg-secondary px-2 py-0.5 rounded text-primary">+{task.xpReward} XP</span>
            {task.type === 'timed' && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {task.duration} MIN
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task.type === 'timed' && !task.completed && (
            <>
              <div className="font-mono text-xl mr-2 tabular-nums">
                {formatTime(task.timeRemaining || 0)}
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onTimerToggle(task.id)}
                className="border-2 border-foreground h-10 w-10"
              >
                {task.isTimerRunning ? <Pause className="fill-current" /> : <Play className="fill-current" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onTimerReset(task.id)}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}

          {!task.completed && (task.type === 'binary' || (task.type === 'timed' && (task.timeRemaining || 0) <= 0)) && (
            <Button 
              onClick={() => onComplete(task.id)}
              className="bg-accent hover:bg-accent/90 border-2 border-foreground h-10 px-4 font-headline uppercase font-bold text-sm"
            >
              Complete
            </Button>
          )}

          {task.completed && (
            <CheckCircle2 className="w-8 h-8 text-primary" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
