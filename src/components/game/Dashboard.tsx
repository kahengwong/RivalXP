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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateRivalActivityTaunt } from "@/ai/flows/rival-activity-taunts-flow";
import { rivalInactivityTaunts } from "@/ai/flows/rival-inactivity-taunts-flow";
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
  const [newTaskType, setNewTaskType] = useState<"binary" | "timed">("binary");
  const [newTaskDuration, setNewTaskDuration] = useState("30");
  const [taunt, setTaunt] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8 font-body">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Battle Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border-4 border-black bg-white pixel-shadow flex flex-col items-center gap-2">
            <Sprite spriteId="user" size={80} />
            <XPProgress 
              label={gameState.user.name} 
              currentXP={gameState.user.xp % XP_PER_LEVEL} 
              nextLevelXP={XP_PER_LEVEL}
              level={gameState.user.level}
            />
          </div>
          <div className="p-4 border-4 border-black bg-white pixel-shadow flex flex-col items-center gap-2">
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

        {/* Rival Dialogue Box */}
        {taunt && (
          <div className="relative p-6 border-4 border-black bg-white pixel-shadow">
            <div className="absolute -top-4 left-6 bg-black text-white px-2 font-pixel text-[8px] uppercase">
              {gameState.rival.name}
            </div>
            <p className="font-pixel text-[10px] leading-relaxed uppercase">"{taunt}"</p>
            <Button 
              size="sm" 
              variant="ghost" 
              className="absolute top-2 right-2 hover:bg-muted"
              onClick={() => setTaunt(null)}
            >
              ×
            </Button>
          </div>
        )}

        {/* Focus Mode */}
        {gameState.isFocusMode && (
          <div className="bg-primary text-white p-3 border-4 border-black font-pixel text-[10px] uppercase flex items-center justify-center gap-4">
            <Flame className="w-4 h-4" />
            Focus Active: Rival slowed
            <Flame className="w-4 h-4" />
          </div>
        )}

        {/* Quests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-pixel uppercase">Quest Log</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-white text-black font-pixel text-[10px] border-4 border-black hover:bg-muted pixel-shadow rounded-none">
                  <Plus className="w-4 h-4 mr-2" /> New Quest
                </Button>
              </DialogTrigger>
              <DialogContent className="border-4 border-black rounded-none font-pixel">
                <DialogHeader>
                  <DialogTitle className="text-sm uppercase">Select Quest</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label className="text-[8px] uppercase">Goal</Label>
                    <Input 
                      placeholder="QUEST TITLE" 
                      value={newTaskTitle} 
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="border-4 border-black rounded-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[8px] uppercase">Type</Label>
                      <Select value={newTaskType} onValueChange={(v: any) => setNewTaskType(v)}>
                        <SelectTrigger className="border-4 border-black rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-pixel text-[10px]">
                          <SelectItem value="binary">Battle</SelectItem>
                          <SelectItem value="timed">Training</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-primary text-white text-[10px] h-12 border-4 border-black rounded-none pixel-shadow"
                    onClick={addTask}
                  >
                    Set Quest
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {gameState.tasks.length === 0 ? (
              <div className="p-12 text-center border-4 border-black border-dashed bg-white/50">
                <p className="font-pixel text-[8px] uppercase text-muted-foreground tracking-tighter">Your rival is waiting... Add a quest!</p>
              </div>
            ) : (
              gameState.tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onComplete={completeTask}
                  onTimerToggle={() => {}} // Simplified for focus
                  onTimerReset={() => {}}
                />
              ))
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 text-[8px] font-pixel uppercase text-muted-foreground pt-12">
          <div className="flex items-center gap-1">
            <Moon className="w-3 h-3" /> Day End: 23:59
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Win Streak: {gameState.user.streak}
          </div>
        </div>

      </div>
    </div>
  );
}
