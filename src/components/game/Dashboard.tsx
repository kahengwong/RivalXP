
"use client";

import { useState, useEffect } from 'react';
import { Rival, Task, GameState } from "@/lib/game-types";
import { XPProgress } from "./XPProgress";
import { Sprite } from "./Sprite";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Flame, Moon, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateRivalActivityTaunt } from "@/ai/flows/rival-activity-taunts-flow";
import { useToast } from "@/hooks/use-toast";

const XP_PER_LEVEL = 1000;
const RIVAL_XP_INTERVAL_MS = 1000 * 60;
const RIVAL_BASE_XP_PER_MIN = 5;

export function Dashboard({ initialRival }: { initialRival: Rival }) {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rival_xp_state');
      if (saved) return JSON.parse(saved);
    }
    return {
      user: { name: "PLAYER", xp: 100, level: 1, spriteId: 'hero', streak: 0 },
      rival: initialRival,
      tasks: [],
      isFocusMode: false,
      lastActive: Date.now(),
      dayStartedAt: new Date().setHours(0,0,0,0),
    };
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taunt, setTaunt] = useState<string | null>(`I'M ${gameState.rival.name}! PREPARE TO LOSE!`);

  useEffect(() => {
    localStorage.setItem('rival_xp_state', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        const rivalGain = prev.isFocusMode ? RIVAL_BASE_XP_PER_MIN * 0.2 : RIVAL_BASE_XP_PER_MIN;
        const newRivalXp = prev.rival.xp + rivalGain;
        const newRivalLevel = Math.floor(newRivalXp / XP_PER_LEVEL) + 1;
        
        return {
          ...prev,
          rival: { ...prev.rival, xp: newRivalXp, level: newRivalLevel }
        };
      });
    }, RIVAL_XP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle.toUpperCase(),
      type: 'binary',
      xpReward: 50,
      completed: false,
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

  return (
    <div className="min-h-screen bg-[#c8c8c8] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Battle Scene */}
        <div className="relative aspect-video bg-[#e0f8cf] border-[6px] border-black overflow-hidden pixel-shadow mb-8">
          {/* Rival Side */}
          <div className="absolute top-4 right-4 text-right">
             <XPProgress 
                label={gameState.rival.name} 
                currentXP={Math.floor(gameState.rival.xp) % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.rival.level}
                colorClass="bg-accent"
              />
          </div>
          <div className="absolute top-12 left-12">
            <Sprite spriteId="rival" size={140} />
          </div>

          {/* Player Side */}
          <div className="absolute bottom-12 right-12">
            <Sprite spriteId="user" size={140} />
          </div>
          <div className="absolute bottom-4 left-4">
             <XPProgress 
                label={gameState.user.name} 
                currentXP={gameState.user.xp % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.user.level}
              />
          </div>
        </div>

        {/* Dialogue Box */}
        <div className="dialogue-box min-h-[100px] flex items-center mb-6">
          <p className="font-pixel text-[12px] leading-relaxed w-full">
            {taunt || "WHAT WILL YOU DO?"}
          </p>
          {taunt && (
             <Button 
             variant="ghost" 
             size="sm"
             className="absolute bottom-2 right-2 animate-bounce"
             onClick={() => setTaunt(null)}
           >
             ▼
           </Button>
          )}
        </div>

        {/* Action Menu */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
             <h2 className="font-pixel text-[10px] mb-2 text-black">QUEST LOG</h2>
             <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
                {gameState.tasks.map(task => (
                  <TaskCard key={task.id} task={task} onComplete={completeTask} onTimerToggle={() => {}} onTimerReset={() => {}} />
                ))}
                {gameState.tasks.length === 0 && (
                   <div className="p-4 border-4 border-black border-dashed text-center bg-white/50">
                    <span className="font-pixel text-[8px] text-muted-foreground">EMPTY LOG</span>
                   </div>
                )}
             </div>
          </div>

          <div className="space-y-4 flex flex-col">
            <h2 className="font-pixel text-[10px] mb-2 text-black">ACTIONS</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full h-16 bg-white text-black border-4 border-black hover:bg-muted pixel-shadow rounded-none">
                  NEW QUEST
                </Button>
              </DialogTrigger>
              <DialogContent className="border-[6px] border-black rounded-none">
                <DialogHeader>
                  <DialogTitle className="font-pixel text-[12px]">CHOOSE QUEST</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input 
                    placeholder="TASK NAME" 
                    value={newTaskTitle} 
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="border-4 border-black rounded-none h-12"
                  />
                  <Button 
                    className="w-full bg-black text-white h-12 rounded-none"
                    onClick={addTask}
                  >
                    ADD TO LOG
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="mt-auto grid grid-cols-2 gap-2 text-[8px] font-pixel text-muted-foreground bg-white/30 p-2 border-2 border-black border-dashed">
              <div className="flex items-center gap-1"><Trophy className="w-3 h-3" /> STREAK: {gameState.user.streak}</div>
              <div className="flex items-center gap-1"><Moon className="w-3 h-3" /> 23:59</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
