
"use client";

import { useState, useEffect } from 'react';
import { Rival, Task, GameState } from "@/lib/game-types";
import { XPProgress } from "./XPProgress";
import { Sprite } from "./Sprite";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { generateRivalActivityTaunt } from "@/ai/flows/rival-activity-taunts-flow";
import { useToast } from "@/hooks/use-toast";

const XP_PER_LEVEL = 1000;
const RIVAL_XP_INTERVAL_MS = 1000 * 60;
const RIVAL_BASE_XP_PER_MIN = 10;

export function Dashboard({ initialRival }: { initialRival: Rival }) {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rival_xp_state');
      if (saved) return JSON.parse(saved);
    }
    return {
      user: { name: "PLAYER", xp: 0, level: 1, spriteId: 'user-blastoise', streak: 0 },
      rival: { ...initialRival, spriteId: 'rival-pikachu' },
      tasks: [],
      isFocusMode: false,
      lastActive: Date.now(),
      dayStartedAt: new Date().setHours(0,0,0,0),
    };
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taunt, setTaunt] = useState<string | null>(`WILD ${initialRival.name.toUpperCase()} APPEARED!`);

  useEffect(() => {
    localStorage.setItem('rival_xp_state', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        const rivalGain = RIVAL_BASE_XP_PER_MIN;
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
      xpReward: 80,
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
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Battle Scene */}
        <div className="relative aspect-[21/9] bg-[#e0f8cf] border-[4px] border-black overflow-hidden pixel-shadow mb-6">
          {/* Rival Side (Top Right) */}
          <div className="absolute top-4 right-8 z-10">
             <XPProgress 
                label={gameState.rival.name} 
                currentXP={Math.floor(gameState.rival.xp) % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.rival.level}
                colorClass="bg-accent"
              />
          </div>
          <div className="absolute top-4 left-[25%] md:left-[40%]">
            <Sprite spriteId="rival-pikachu" size={160} />
          </div>

          {/* Player Side (Bottom Left) */}
          <div className="absolute bottom-4 left-8 z-10">
             <XPProgress 
                label={gameState.user.name} 
                currentXP={gameState.user.xp % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.user.level}
              />
          </div>
          <div className="absolute bottom-4 right-[25%] md:right-[40%]">
            <Sprite spriteId="user-blastoise" size={200} />
          </div>
        </div>

        {/* Dialogue Box */}
        <div className="dialogue-box min-h-[100px] flex items-center mb-6 bg-white border-4 border-black p-4 relative">
          <p className="font-pixel text-[13px] leading-relaxed uppercase w-full pr-8">
            {taunt || "WHAT WILL YOU DO?"}
          </p>
          {taunt && (
             <Button 
             variant="ghost" 
             size="sm"
             className="absolute bottom-2 right-2 animate-bounce p-0"
             onClick={() => setTaunt(null)}
           >
             <span className="font-pixel text-xl">▼</span>
           </Button>
          )}
        </div>

        {/* Quest Management */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
             <h2 className="font-pixel text-[12px] flex items-center gap-2 border-b-2 border-black pb-2">
                <Zap className="w-4 h-4" /> QUEST LOG
             </h2>
             <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {gameState.tasks.map(task => (
                  <TaskCard key={task.id} task={task} onComplete={completeTask} />
                ))}
                {gameState.tasks.length === 0 && (
                   <div className="p-12 border-2 border-black border-dashed text-center bg-white/40">
                    <span className="font-pixel text-[10px] text-muted-foreground uppercase">NO ACTIVE QUESTS</span>
                   </div>
                )}
             </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <h2 className="font-pixel text-[12px] border-b-2 border-black pb-2">ACTIONS</h2>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full h-16 bg-white text-black border-[3px] border-black hover:bg-muted pixel-shadow rounded-none font-pixel text-[12px] uppercase group">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> 
                  NEW QUEST
                </Button>
              </DialogTrigger>
              <DialogContent className="border-[4px] border-black rounded-none bg-white">
                <DialogHeader>
                  <DialogTitle className="font-pixel text-[14px] uppercase">NEW QUEST NAME</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input 
                    placeholder="ENTER TASK..." 
                    value={newTaskTitle} 
                    onChange={(e) => setNewTaskTitle(e.target.value.toUpperCase())}
                    className="border-[3px] border-black rounded-none h-12 text-lg font-bold"
                  />
                  <Button 
                    className="w-full bg-black text-white h-12 rounded-none font-pixel uppercase"
                    onClick={addTask}
                  >
                    ADD TO LOG
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="mt-auto bg-white border-[3px] border-black p-4 pixel-shadow space-y-3">
              <div className="flex items-center justify-between font-pixel text-[10px]">
                <span className="flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> STREAK</span>
                <span>{gameState.user.streak} DAYS</span>
              </div>
              <div className="h-[2px] bg-black/10 w-full" />
              <div className="font-pixel text-[9px] text-muted-foreground text-center uppercase">
                COMPLETE QUESTS TO GAIN XP AND LEVEL UP!
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
