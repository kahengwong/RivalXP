
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Rival, User, Task, GameState } from "@/lib/game-types";
import { XPProgress } from "./XPProgress";
import { Sprite } from "./Sprite";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Flame, Moon, Timer, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateRivalActivityTaunt } from "@/ai/flows/rival-activity-taunts-flow";
import { rivalInactivityTaunts } from "@/ai/flows/rival-inactivity-taunts-flow";
import { useToast } from "@/hooks/use-toast";

const XP_PER_LEVEL = 1000;
const RIVAL_XP_INTERVAL_MS = 1000 * 60; // 1 minute checks
const RIVAL_BASE_XP_PER_MIN = 1; // 1 XP every minute base

export function Dashboard({ initialRival }: { initialRival: Rival }) {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rival_xp_state');
      if (saved) return JSON.parse(saved);
    }
    return {
      user: { name: "Player", xp: 100, level: 1, spriteId: 'hero', streak: 0 },
      rival: initialRival,
      tasks: [],
      isFocusMode: false,
      lastActive: Date.now(),
      dayStartedAt: new Date().setHours(0,0,0,0),
    };
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<"binary" | "timed">("binary");
  const [newTaskDuration, setNewTaskDuration] = useState("30");
  const [taunt, setTaunt] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('rival_xp_state', JSON.stringify(gameState));
  }, [gameState]);

  // Rival XP Passive Gain
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        const rivalGain = prev.isFocusMode ? RIVAL_BASE_XP_PER_MIN * 0.2 : RIVAL_BASE_XP_PER_MIN;
        const newRivalXp = prev.rival.xp + rivalGain;
        const newRivalLevel = Math.floor(newRivalXp / XP_PER_LEVEL) + 1;
        
        return {
          ...prev,
          rival: {
            ...prev.rival,
            xp: newRivalXp,
            level: newRivalLevel
          }
        };
      });
    }, RIVAL_XP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  // Task Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        const updatedTasks = prev.tasks.map(t => {
          if (t.isTimerRunning && (t.timeRemaining || 0) > 0) {
            return { ...t, timeRemaining: (t.timeRemaining || 0) - 1 };
          }
          if (t.isTimerRunning && (t.timeRemaining || 0) === 0) {
            return { ...t, isTimerRunning: false };
          }
          return t;
        });
        return { ...prev, tasks: updatedTasks };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic Taunts (Inactivity)
  useEffect(() => {
    const checkInactivity = async () => {
      const inactiveMins = Math.floor((Date.now() - gameState.lastActive) / 60000);
      if (inactiveMins >= 15 && inactiveMins % 15 === 0) {
        try {
          const response = await rivalInactivityTaunts({
            inactivityDurationMinutes: inactiveMins,
            rivalPersonalityTone: gameState.rival.personality,
            userName: gameState.user.name,
            rivalName: gameState.rival.name
          });
          setTaunt(response);
        } catch (e) {
          console.error("Taunt failed", e);
        }
      }
    };
    const interval = setInterval(checkInactivity, 60000);
    return () => clearInterval(interval);
  }, [gameState.lastActive, gameState.rival, gameState.user]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      type: newTaskType,
      duration: newTaskType === 'timed' ? parseInt(newTaskDuration) : undefined,
      xpReward: newTaskType === 'timed' ? parseInt(newTaskDuration) * 2 : 50,
      completed: false,
      timeRemaining: newTaskType === 'timed' ? parseInt(newTaskDuration) * 60 : undefined,
      isTimerRunning: false,
    };
    setGameState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    setNewTaskTitle("");
  };

  const completeTask = async (id: string) => {
    const task = gameState.tasks.find(t => t.id === id);
    if (!task) return;

    setGameState(prev => {
      const newTasks = prev.tasks.map(t => t.id === id ? { ...t, completed: true } : t);
      const newUserXp = prev.user.xp + task.xpReward;
      const newUserLevel = Math.floor(newUserXp / XP_PER_LEVEL) + 1;
      return {
        ...prev,
        tasks: newTasks,
        user: { ...prev.user, xp: newUserXp, level: newUserLevel },
        lastActive: Date.now()
      };
    });

    // Generate activity taunt
    try {
      const { taunt: t } = await generateRivalActivityTaunt({
        rivalPersonality: gameState.rival.personality,
        taskTitle: task.title
      });
      setTaunt(t);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTimer = (id: string) => {
    setGameState(prev => {
      const tasks = prev.tasks.map(t => {
        if (t.id === id) return { ...t, isTimerRunning: !t.isTimerRunning };
        return { ...t, isTimerRunning: false }; // Only one timer at a time
      });
      const isRunning = tasks.find(t => t.id === id)?.isTimerRunning;
      return { ...prev, tasks, isFocusMode: !!isRunning, lastActive: Date.now() };
    });
  };

  const resetTimer = (id: string) => {
    setGameState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, timeRemaining: (t.duration || 0) * 60, isTimerRunning: false } : t)
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex gap-4 items-center p-4 border-4 border-foreground pixel-shadow bg-card">
            <Sprite spriteId="user" size={80} />
            <XPProgress 
              label={gameState.user.name} 
              currentXP={gameState.user.xp % XP_PER_LEVEL} 
              nextLevelXP={XP_PER_LEVEL}
              level={gameState.user.level}
            />
          </div>
          <div className="flex gap-4 items-center p-4 border-4 border-foreground pixel-shadow bg-card">
            <Sprite spriteId="rival" size={80} />
            <XPProgress 
              label={gameState.rival.name} 
              currentXP={Math.floor(gameState.rival.xp) % XP_PER_LEVEL} 
              nextLevelXP={XP_PER_LEVEL}
              level={gameState.rival.level}
              colorClass="bg-accent"
            />
          </div>
        </div>

        {/* Rival Chat / Taunt */}
        {taunt && (
          <div className="relative p-6 border-4 border-foreground bg-accent text-white pixel-shadow animate-in slide-in-from-top duration-300">
            <p className="font-headline text-lg italic">"{taunt}"</p>
            <Button 
              size="sm" 
              variant="ghost" 
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={() => setTaunt(null)}
            >
              ×
            </Button>
          </div>
        )}

        {/* Focus Mode Indicator */}
        {gameState.isFocusMode && (
          <div className="bg-primary text-white p-3 border-4 border-foreground text-center font-headline uppercase flex items-center justify-center gap-4 animate-pulse-subtle">
            <Flame className="w-6 h-6 fill-current" />
            Focus Mode Active — Rival XP Growth Slowed 80%
            <Flame className="w-6 h-6 fill-current" />
          </div>
        )}

        {/* Task Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-headline uppercase">Daily Quests</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-foreground text-background font-headline border-2 border-foreground hover:bg-muted pixel-shadow">
                  <Plus className="w-5 h-5 mr-2" /> Add Quest
                </Button>
              </DialogTrigger>
              <DialogContent className="border-4 border-foreground pixel-shadow font-body">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl uppercase">Create New Quest</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label className="font-headline uppercase text-xs">Quest Title</Label>
                    <Input 
                      placeholder="e.g. Study Calculus" 
                      value={newTaskTitle} 
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="border-2 border-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-headline uppercase text-xs">Type</Label>
                      <Select value={newTaskType} onValueChange={(v: any) => setNewTaskType(v)}>
                        <SelectTrigger className="border-2 border-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="binary">Binary (Done/Not)</SelectItem>
                          <SelectItem value="timed">Timed Session</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newTaskType === 'timed' && (
                      <div className="space-y-2">
                        <Label className="font-headline uppercase text-xs">Minutes</Label>
                        <Input 
                          type="number" 
                          value={newTaskDuration} 
                          onChange={(e) => setNewTaskDuration(e.target.value)}
                          className="border-2 border-foreground"
                        />
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full bg-primary font-headline uppercase text-xl h-14 border-2 border-foreground pixel-shadow"
                    onClick={addTask}
                  >
                    Confirm Quest
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {gameState.tasks.length === 0 ? (
              <div className="p-12 text-center border-4 border-dashed border-muted rounded-xl">
                <p className="text-muted-foreground font-headline uppercase">No active quests. The rival is pulling ahead...</p>
              </div>
            ) : (
              gameState.tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onComplete={completeTask}
                  onTimerToggle={toggleTimer}
                  onTimerReset={resetTimer}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-center gap-8 text-xs font-semibold uppercase text-muted-foreground pt-12">
          <div className="flex items-center gap-1">
            <Moon className="w-4 h-4" /> Day Ends: 11:59 PM
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4" /> Streak: {gameState.user.streak} Days
          </div>
        </div>

      </div>
    </div>
  );
}
