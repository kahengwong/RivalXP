"use client";

import { useState, useEffect } from 'react';
import { Rival, Task, GameState } from "@/lib/game-types";
import { XPProgress } from "./XPProgress";
import { Sprite } from "./Sprite";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Zap, Trash2, Heart, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const XP_PER_LEVEL = 1000;
const RIVAL_BASE_XP_PER_MIN = 25; 
const FOCUS_MODE_RIVAL_MULTIPLIER = 0.2;

// Static taunts - no AI needed!
const TAUNTS = {
  serious: [
    "任务完成。但我的XP也在增长。",
    "不错的尝试。我不会落后的。",
    "哼，就这样而已吗？",
    "你在努力，我很欣赏。但我不会停。",
    "完成了？时间就是金钱，而你两者都在浪费。",
  ],
  smug: [
    "哇，你完成了一个任务？好棒棒哦～",
    "哦？终于搞定了一个？我都没注意到～",
    "嘿嘿，恭喜恭喜～我的XP可是还在涨呢～",
    "哎呀，你好努力哦～但好像还是比我慢呢～",
    "哇～你完成啦～我都不好意思了呢～",
  ],
  funny: [
    "哦哦！你完成任务啦！我的皮卡丘表示：",
    "恭喜恭喜！🎉 你的对手表示压力山大（并没有）",
    "哇！任务完成！我的皮卡丘在跳舞你也看到吧？",
    "哦哟！厉害哦～我假装很在意好了～",
    "太棒了！！！我的皮卡丘说：继续加油哦（才怪）",
  ],
};

function getRandomTaunt(personality: string): string {
  const options = TAUNTS[personality as keyof typeof TAUNTS] || TAUNTS.serious;
  return options[Math.floor(Math.random() * options.length)];
}

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
  const [taunt, setTaunt] = useState<string | null>(`野生的皮卡丘出现了！`);

  useEffect(() => {
    localStorage.setItem('rival_xp_state', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
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

  // Simple static taunt - no AI API call!
  const triggerTaunt = (title: string) => {
    const personality = gameState.rival.personality || 'smug';
    const newTaunt = getRandomTaunt(personality);
    setTaunt(newTaunt);
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
      <div className="w-full max-w-4xl space-y-4">
        
        {/* Battle Scene: Blue (Player/Squirtle) vs Yellow (Rival/Pikachu) */}
        <div className="relative aspect-[16/10] md:aspect-[21/9] bg-[#e0f8cf] border-[4px] border-black overflow-hidden pixel-shadow">
          <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] opacity-5" />
          
          {/* Rival HP (Top Left) - Yellow Side / Pikachu */}
          <div className="absolute top-2 left-2 md:top-6 md:left-6 z-10 scale-90 sm:scale-100 origin-top-left">
             <XPProgress 
                label={gameState.rival.name} 
                currentXP={Math.floor(gameState.rival.xp) % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.rival.level}
                colorClass="bg-accent"
              />
          </div>
          <div className="absolute top-[10%] right-[5%] md:right-[15%]">
            <Sprite spriteId="rival-pikachu" size={120} className="md:w-[180px]" />
          </div>

          {/* User HP (Bottom Right) - Blue Side / Squirtle */}
          <div className="absolute bottom-2 right-2 md:bottom-6 md:right-6 z-10 scale-90 sm:scale-100 origin-bottom-right">
             <XPProgress 
                label={gameState.user.name} 
                currentXP={gameState.user.xp % XP_PER_LEVEL} 
                nextLevelXP={XP_PER_LEVEL}
                level={gameState.user.level}
                colorClass="bg-[#70c0a8]"
              />
          </div>
          <div className="absolute bottom-[3%] left-[5%] md:left-[15%]">
            <Sprite spriteId="user-blastoise" size={140} className="md:w-[200px] transform scale-x-[-1]" />
          </div>

          {gameState.isFocusMode && (
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 border-2 border-black font-pixel text-[8px] md:text-[10px] animate-pulse z-20">
              FOCUS MODE ON
            </div>
          )}
        </div>

        {/* Dialogue Box */}
        <div className="dialogue-box min-h-[80px] flex items-center bg-white border-4 border-black p-4 relative">
          <p className="font-pixel text-[12px] md:text-[14px] leading-relaxed uppercase w-full pr-8">
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

        {/* Compact Add Task Box */}
        <div className="bg-white border-[4px] border-black p-4 pixel-shadow">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6 space-y-1.5">
              <Label className="font-pixel text-[10px] uppercase">新任务名称</Label>
              <Input 
                placeholder="例如：学习..." 
                value={newTaskTitle} 
                onChange={(e) => setNewTaskTitle(e.target.value.toUpperCase())}
                className="border-[3px] border-black rounded-none h-11 text-sm font-bold uppercase focus-visible:ring-0"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label className="font-pixel text-[10px] uppercase flex items-center gap-1"><Heart className="w-3 h-3 text-red-500" /> HP</Label>
              <Input 
                type="number"
                value={newTaskXP} 
                onChange={(e) => setNewTaskXP(e.target.value)}
                className="border-[3px] border-black rounded-none h-11 text-sm font-bold focus-visible:ring-0"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label className="font-pixel text-[10px] uppercase flex items-center gap-1"><Clock className="w-3 h-3 text-blue-500" /> 分钟</Label>
              <Input 
                type="number"
                value={newTaskDuration} 
                onChange={(e) => setNewTaskDuration(e.target.value)}
                className="border-[3px] border-black rounded-none h-11 text-sm font-bold focus-visible:ring-0"
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                className="w-full bg-black text-white h-11 rounded-none font-pixel text-[11px] uppercase hover:bg-black/90"
                onClick={addTask}
              >
                + 添加
              </Button>
            </div>
          </div>
        </div>

        {/* Quest Log */}
        <div className="space-y-3 pb-12">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h2 className="font-pixel text-[14px] flex items-center gap-2"> 
               <Zap className="w-4 h-4" /> 任务列表
            </h2>
            {completedCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCompletedTasks}
                className="border-2 border-black rounded-none font-pixel text-[9px] h-8 px-3 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-1" /> 清除
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {gameState.tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={completeTask} 
                onToggleTimer={toggleTaskTimer}
              />
            ))}
            {gameState.tasks.length === 0 && (
               <div className="p-10 border-2 border-black border-dashed text-center bg-white/40">
                <span className="font-pixel text-[11px] text-muted-foreground uppercase">暂无任务</span>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
