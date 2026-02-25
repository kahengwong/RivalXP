
"use client";

import { useState, useEffect } from 'react';
import { Rival, Task, GameState } from "@/lib/game-types";
import { XPProgress } from "./XPProgress";
import { Sprite } from "./Sprite";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Zap, Trash2, Heart, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateRivalActivityTaunt } from "@/ai/flows/rival-activity-taunts-flow";
import { useToast } from "@/hooks/use-toast";

const XP_PER_LEVEL = 1000;
const RIVAL_BASE_XP_PER_MIN = 25; // Rival gains XP over time
const FOCUS_MODE_RIVAL_MULTIPLIER = 0.2; // Rival slows down significantly during focus

export function Dashboard({ initialRival }: { initialRival: Rival }) {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rival_xp_state');
      if (saved) return JSON.parse(saved);
    }
    return {
      user: { name: "BLASTOISE", xp: 0, level: 1, spriteId: 'user-blastoise', streak: 0 },
      rival: { ...initialRival, name: "PIKACHU", spriteId: 'rival-pikachu' },
      tasks: [],
      isFocusMode: false,
      lastActive: Date.now(),
      dayStartedAt: new Date().setHours(0,0,0,0),
    };
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState("0");
  const [newTaskXP, setNewTaskXP] = useState("100");
  const [taunt, setTaunt] = useState<string | null>(`WILD ${initialRival.name.toUpperCase()} APPEARED!`);

  useEffect(() => {
    localStorage.setItem('rival_xp_state', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        // Check if Focus Mode (any timed task is active)
        const isAnyTaskActive = prev.tasks.some(t => t.isActive);
        const multiplier = isAnyTaskActive ? FOCUS_MODE_RIVAL_MULTIPLIER : 1.0;
        
        const rivalGain = (RIVAL_BASE_XP_PER_MIN / 60) * multiplier;
        const newRivalXp = prev.rival.xp + rivalGain;
        const newRivalLevel = Math.floor(newRivalXp / XP_PER_LEVEL) + 1;

        let completedTaskId: string | null = null;
        const updatedTasks = prev.tasks.map(task => {
          if (task.isActive && task.remainingSeconds !== undefined && task.remainingSeconds > 0) {
            const nextSec = task.remainingSeconds - 1;
            if (nextSec === 0) {
              completedTaskId = task.id;
              return { ...task, remainingSeconds: 0, isActive: false, completed: true };
            }
            return { ...task, remainingSeconds: nextSec };
          }
          return task;
        });

        let newUserXp = prev.user.xp;
        if (completedTaskId) {
          const finishedTask = updatedTasks.find(t => t.id === completedTaskId);
          if (finishedTask) {
            newUserXp += finishedTask.xpReward;
            triggerTaunt(finishedTask.title);
          }
        }

        return {
          ...prev,
          rival: { ...prev.rival, xp: newRivalXp, level: newRivalLevel },
          tasks: updatedTasks,
          user: { ...prev.user, xp: newUserXp, level: Math.floor(newUserXp / XP_PER_LEVEL) + 1 },
          isFocusMode: isAnyTaskActive
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerTaunt = async (title: string) => {
    try {
      const { taunt: t } = await generateRivalActivityTaunt({
        rivalPersonality: gameState.rival.personality,
        taskTitle: title
      });
      setTaunt(t);
    } catch (e) {
      console.error(e);
    }
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const duration = parseInt(newTaskDuration) || 0;
    const xp = parseInt(newTaskXP) || 100;
    
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      xpReward: xp,
      completed: false,
      durationMinutes: duration > 0 ? duration : undefined,
      remainingSeconds: duration > 0 ? duration * 60 : undefined,
      isActive: false,
    };

    setGameState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    setNewTaskTitle("");
    setNewTaskDuration("0");
    setNewTaskXP("100");
  };

  const completeTask = async (id: string) => {
    const task = gameState.tasks.find(t => t.id === id);
    if (!task || task.completed) return;

    setGameState(prev => {
      const newTasks = prev.tasks.map(t => t.id === id ? { ...t, completed: true, isActive: false } : t);
      const newUserXp = prev.user.xp + task.xpReward;
      return {
        ...prev,
        tasks: newTasks,
        user: { ...prev.user, xp: newUserXp, level: Math.floor(newUserXp / XP_PER_LEVEL) + 1 },
        lastActive: Date.now()
      };
    });

    triggerTaunt(task.title);
  };

  const toggleTaskTimer = (id: string) => {
    setGameState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t)
    }));
  };

  const clearCompletedTasks = () => {
    setGameState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => !t.completed)
    }));
  };

  const completedCount = gameState.tasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-[#f5f1f0] p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-3xl space-y-4">
        
        {/* Battle Scene */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] bg-[#e0f8cf] border-[4px] border-black overflow-hidden pixel-shadow">
          {/* Rival HP (Top Right) */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 scale-90 md:scale-100 origin-top-right">
             <XPProgress 
                label={gameState.rival.name} 
                currentXP={Math.floor(gameState.rival.xp) % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.rival.level}
                colorClass="bg-accent"
              />
          </div>
          <div className="absolute top-[15%] left-[15%] md:left-[35%]">
            <Sprite spriteId="rival-pikachu" size={100} />
          </div>

          {/* User HP (Bottom Left) */}
          <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-10 scale-90 md:scale-100 origin-bottom-left">
             <XPProgress 
                label={gameState.user.name} 
                currentXP={gameState.user.xp % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.user.level}
              />
          </div>
          <div className="absolute bottom-[15%] right-[15%] md:right-[35%]">
            <Sprite spriteId="user-blastoise" size={140} />
          </div>

          {gameState.isFocusMode && (
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 border-2 border-black font-pixel text-[8px] animate-pulse">
              FOCUS MODE ON
            </div>
          )}
        </div>

        {/* Dialogue Box */}
        <div className="dialogue-box min-h-[70px] flex items-center bg-white border-4 border-black p-4 relative">
          <p className="font-pixel text-[11px] md:text-[13px] leading-relaxed uppercase w-full pr-8">
            {taunt || "WHAT WILL YOU DO?"}
          </p>
          {taunt && (
             <Button 
             variant="ghost" 
             size="sm"
             className="absolute bottom-2 right-2 animate-bounce p-0 hover:bg-transparent"
             onClick={() => setTaunt(null)}
           >
             <span className="font-pixel text-xl">▼</span>
           </Button>
          )}
        </div>

        {/* Add Task Box - Compact and Inline */}
        <div className="bg-white border-[4px] border-black p-3 pixel-shadow">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-6 space-y-1">
              <Label className="font-pixel text-[9px] uppercase">New Quest Name</Label>
              <Input 
                placeholder="E.G. CODING..." 
                value={newTaskTitle} 
                onChange={(e) => setNewTaskTitle(e.target.value.toUpperCase())}
                className="border-[3px] border-black rounded-none h-10 text-sm font-bold uppercase focus-visible:ring-0"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <Label className="font-pixel text-[9px] uppercase flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" /> XP</Label>
              <Input 
                type="number"
                value={newTaskXP} 
                onChange={(e) => setNewTaskXP(e.target.value)}
                className="border-[3px] border-black rounded-none h-10 text-sm font-bold focus-visible:ring-0"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <Label className="font-pixel text-[9px] uppercase flex items-center gap-1"><Clock className="w-3 h-3 text-blue-500" /> MIN</Label>
              <Input 
                type="number"
                value={newTaskDuration} 
                onChange={(e) => setNewTaskDuration(e.target.value)}
                className="border-[3px] border-black rounded-none h-10 text-sm font-bold focus-visible:ring-0"
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                className="w-full bg-black text-white h-10 rounded-none font-pixel text-[10px] uppercase hover:bg-black/90"
                onClick={addTask}
              >
                + ADD
              </Button>
            </div>
          </div>
        </div>

        {/* Quest Log */}
        <div className="space-y-3 pb-12">
          <div className="flex items-center justify-between border-b-2 border-black pb-1">
            <h2 className="font-pixel text-[12px] flex items-center gap-2">
               <Zap className="w-4 h-4" /> QUEST LOG
            </h2>
            {completedCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCompletedTasks}
                className="border-2 border-black rounded-none font-pixel text-[8px] h-7 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-1" /> CLEAR
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            {gameState.tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={completeTask} 
                onToggleTimer={toggleTaskTimer}
              />
            ))}
            {gameState.tasks.length === 0 && (
               <div className="p-8 border-2 border-black border-dashed text-center bg-white/40">
                <span className="font-pixel text-[10px] text-muted-foreground uppercase">NO ACTIVE QUESTS</span>
               </div>
            )}
          </div>
        </div>

      </div>

      {/* Stats Overlay */}
      <div className="fixed bottom-4 right-4 bg-white border-[3px] border-black p-3 pixel-shadow hidden md:block">
        <div className="flex items-center gap-4 font-pixel text-[10px] uppercase">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" /> 
            <span>STREAK: {gameState.user.streak} DAYS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
