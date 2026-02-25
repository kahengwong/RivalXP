
"use client";

import { useState, useEffect } from 'react';
import { Rival, Task, GameState } from "@/lib/game-types";
import { XPProgress } from "./XPProgress";
import { Sprite } from "./Sprite";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Zap, Clock, Heart, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateRivalActivityTaunt } from "@/ai/flows/rival-activity-taunts-flow";
import { useToast } from "@/hooks/use-toast";

const XP_PER_LEVEL = 1000;
const RIVAL_BASE_XP_PER_MIN = 15;

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

  // Persistence
  useEffect(() => {
    localStorage.setItem('rival_xp_state', JSON.stringify(gameState));
  }, [gameState]);

  // Global Timer for Active Tasks & Rival Passive Gain
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        // Rival Passive XP Gain
        const rivalGain = RIVAL_BASE_XP_PER_MIN / 60;
        const newRivalXp = prev.rival.xp + rivalGain;
        const newRivalLevel = Math.floor(newRivalXp / XP_PER_LEVEL) + 1;

        // Timer Tick for Active Tasks
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
          const finishedTask = prev.tasks.find(t => t.id === completedTaskId);
          if (finishedTask) {
            newUserXp += finishedTask.xpReward;
            triggerTaunt(finishedTask.title);
          }
        }

        return {
          ...prev,
          rival: { ...prev.rival, xp: newRivalXp, level: newRivalLevel },
          tasks: updatedTasks,
          user: { ...prev.user, xp: newUserXp, level: Math.floor(newUserXp / XP_PER_LEVEL) + 1 }
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState.rival.personality]);

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
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Battle Scene */}
        <div className="relative aspect-[21/9] bg-[#e0f8cf] border-[4px] border-black overflow-hidden pixel-shadow mb-6">
          <div className="absolute top-4 right-8 z-10 scale-90 md:scale-100">
             <XPProgress 
                label={gameState.rival.name} 
                currentXP={Math.floor(gameState.rival.xp) % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.rival.level}
                colorClass="bg-accent"
              />
          </div>
          <div className="absolute top-4 left-[40%]">
            <Sprite spriteId="rival-pikachu" size={120} />
          </div>

          <div className="absolute bottom-4 left-8 z-10 scale-90 md:scale-100">
             <XPProgress 
                label={gameState.user.name} 
                currentXP={gameState.user.xp % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.user.level}
              />
          </div>
          <div className="absolute bottom-4 right-[40%]">
            <Sprite spriteId="user-blastoise" size={160} />
          </div>
        </div>

        {/* Dialogue Box */}
        <div className="dialogue-box min-h-[100px] flex items-center mb-6 bg-white border-4 border-black p-5 relative">
          <p className="font-pixel text-[12px] leading-relaxed uppercase w-full pr-8">
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

        {/* Quest Management */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
             <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h2 className="font-pixel text-[12px] flex items-center gap-2">
                   <Zap className="w-4 h-4" /> QUEST LOG
                </h2>
                {completedCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearCompletedTasks}
                    className="border-2 border-black rounded-none font-pixel text-[8px] h-8 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> CLEAR DEFEATED
                  </Button>
                )}
             </div>
             <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                {gameState.tasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onComplete={completeTask} 
                    onToggleTimer={toggleTaskTimer}
                  />
                ))}
                {gameState.tasks.length === 0 && (
                   <div className="p-12 border-2 border-black border-dashed text-center bg-white/40">
                    <span className="font-pixel text-[10px] text-muted-foreground uppercase">NO ACTIVE QUESTS</span>
                   </div>
                )}
             </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <h2 className="font-pixel text-[12px] border-b-2 border-black pb-2 uppercase">New Quest</h2>
            
            <div className="bg-white border-[4px] border-black p-6 pixel-shadow space-y-4">
              <div className="space-y-2">
                <Label className="font-pixel text-[10px] uppercase">Task Name</Label>
                <Input 
                  placeholder="E.G. STUDY..." 
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value.toUpperCase())}
                  className="border-[3px] border-black rounded-none h-12 text-lg font-bold uppercase focus-visible:ring-0"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-pixel text-[10px] flex items-center gap-1 uppercase">
                    <Heart className="w-3 h-3 text-red-500" /> HP (XP)
                  </Label>
                  <Input 
                    type="number"
                    value={newTaskXP} 
                    onChange={(e) => setNewTaskXP(e.target.value)}
                    className="border-[3px] border-black rounded-none h-12 text-lg font-bold focus-visible:ring-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-pixel text-[10px] flex items-center gap-1 uppercase">
                    <Clock className="w-3 h-3 text-blue-500" /> MINS
                  </Label>
                  <Input 
                    type="number"
                    value={newTaskDuration} 
                    onChange={(e) => setNewTaskDuration(e.target.value)}
                    className="border-[3px] border-black rounded-none h-12 text-lg font-bold focus-visible:ring-0"
                  />
                </div>
              </div>

              <p className="text-[9px] font-pixel text-muted-foreground uppercase leading-tight">
                * MINS = 0 FOR INSTANT BATTLE
              </p>

              <Button 
                className="w-full bg-black text-white h-14 rounded-none font-pixel uppercase mt-2 hover:bg-black/90 active:scale-95 transition-transform"
                onClick={addTask}
              >
                <Plus className="w-4 h-4 mr-2" /> ADD TO LOG
              </Button>
            </div>

            <div className="bg-white border-[3px] border-black p-4 pixel-shadow space-y-3">
              <div className="flex items-center justify-between font-pixel text-[10px]">
                <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> STREAK</span>
                <span>{gameState.user.streak} DAYS</span>
              </div>
              <div className="h-[2px] bg-black/10 w-full" />
              <div className="font-pixel text-[9px] text-muted-foreground text-center uppercase leading-normal">
                Defeat high HP quests to level up faster!
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
