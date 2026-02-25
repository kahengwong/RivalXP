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
import { generateRivalActivityTaunt } from "@/ai/flows/rival-activity-taunts-flow";
import { useToast } from "@/hooks/use-toast";

const XP_PER_LEVEL = 1000;
const RIVAL_XP_INTERVAL_MS = 1000 * 60;
const RIVAL_BASE_XP_PER_MIN = 8;

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
      title: newTaskTitle,
      type: 'binary',
      xpReward: 50,
      completed: false,
    };
    setGameState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    setNewTaskTitle("");
  };

  const completeTask = async (id: string) => {
    const task = gameState.tasks.find(t => t.id === id);
    if (!task || task.completed) return;

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
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Battle Scene - Clearer and Larger */}
        <div className="relative aspect-[16/9] bg-[#e0f8cf] border-[4px] border-black overflow-hidden shadow-2xl mb-4">
          {/* Rival Side */}
          <div className="absolute top-6 right-6">
             <XPProgress 
                label={gameState.rival.name} 
                currentXP={Math.floor(gameState.rival.xp) % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.rival.level}
                colorClass="bg-accent"
              />
          </div>
          <div className="absolute top-16 left-20">
            <Sprite spriteId="rival" size={180} />
          </div>

          {/* Player Side */}
          <div className="absolute bottom-16 right-20">
            <Sprite spriteId="user" size={180} />
          </div>
          <div className="absolute bottom-6 left-6">
             <XPProgress 
                label={gameState.user.name} 
                currentXP={gameState.user.xp % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.user.level}
              />
          </div>
        </div>

        {/* Dialogue Box - Readable Font */}
        <div className="dialogue-box min-h-[120px] flex items-center mb-6">
          <p className="font-pixel text-[14px] leading-relaxed w-full uppercase">
            {taunt || "WHAT WILL YOU DO?"}
          </p>
          {taunt && (
             <Button 
             variant="ghost" 
             size="sm"
             className="absolute bottom-4 right-4 animate-bounce"
             onClick={() => setTaunt(null)}
           >
             <span className="font-pixel text-xl">▼</span>
           </Button>
          )}
        </div>

        {/* Action Menu - Clean Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <h2 className="font-pixel text-[12px] mb-4 text-black border-b-2 border-black pb-2">QUEST LOG</h2>
             <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
                {gameState.tasks.map(task => (
                  <TaskCard key={task.id} task={task} onComplete={completeTask} onTimerToggle={() => {}} onTimerReset={() => {}} />
                ))}
                {gameState.tasks.length === 0 && (
                   <div className="p-8 border-2 border-black border-dashed text-center bg-white/40">
                    <span className="font-pixel text-[10px] text-muted-foreground">LOG IS EMPTY</span>
                   </div>
                )}
             </div>
          </div>

          <div className="space-y-6 flex flex-col">
            <h2 className="font-pixel text-[12px] mb-4 text-black border-b-2 border-black pb-2">COMMANDS</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full h-20 bg-white text-black border-[3px] border-black hover:bg-muted pixel-shadow rounded-none font-pixel text-[14px]">
                  + NEW QUEST
                </Button>
              </DialogTrigger>
              <DialogContent className="border-[4px] border-black rounded-none">
                <DialogHeader>
                  <DialogTitle className="font-pixel text-[14px]">ENTER QUEST NAME</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-6">
                  <Input 
                    placeholder="E.G. GYM BATTLE" 
                    value={newTaskTitle} 
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="border-[3px] border-black rounded-none h-14 text-lg font-bold"
                  />
                  <Button 
                    className="w-full bg-black text-white h-14 rounded-none font-pixel"
                    onClick={addTask}
                  >
                    CONFIRM
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="mt-auto grid grid-cols-2 gap-4 bg-white/50 p-4 border-[3px] border-black pixel-shadow">
              <div className="flex items-center gap-2 font-pixel text-[10px]"><Trophy className="w-5 h-5" /> STREAK: {gameState.user.streak}</div>
              <div className="flex items-center gap-2 font-pixel text-[10px] text-right justify-end"><Moon className="w-5 h-5" /> 23:59</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}