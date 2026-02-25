
export type PersonalityTone = 'serious' | 'smug' | 'funny';

export interface Rival {
  name: string;
  personality: PersonalityTone;
  spriteId: string;
  xp: number;
  level: number;
}

export interface User {
  name: string;
  xp: number;
  level: number;
  spriteId: string;
  streak: number;
}

export interface Task {
  id: string;
  title: string;
  type: 'binary' | 'timed';
  duration?: number; // minutes
  xpReward: number;
  completed: boolean;
  timeRemaining?: number; // seconds, for timers
  isTimerRunning?: boolean;
}

export interface GameState {
  user: User;
  rival: Rival;
  tasks: Task[];
  isFocusMode: boolean;
  lastActive: number; // timestamp
  dayStartedAt: number; // timestamp
}
