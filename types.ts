
export enum TaskType {
  WORKOUT = 'WORKOUT',
  NUTRITION = 'NUTRITION',
  MINDSET = 'MINDSET',
  HYDRATION = 'HYDRATION'
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  description: string;
  type: TaskType;
  completed: boolean;
  priority: TaskPriority;
}

export interface DayPlan {
  dayName: string; // e.g., "Monday" or "Day 1"
  focus: string;   // e.g., "Upper Body Strength"
  dailyTip?: string; // Short motivational message
  tasks: Task[];
}

export interface UserProfile {
  name: string;
  gender: 'Male' | 'Female';
  birthYear: number;
  country: string;
  goal: string; // e.g., "Weight Loss", "Muscle Gain"
  level: string; // e.g., "Beginner", "Advanced"
  daysPerWeek: number;
}

export interface Program {
  id: string;
  createdAt: number;
  userProfile: UserProfile;
  schedule: DayPlan[];
}

// Types for Gemini Response (User input agnostic, strict output)
export interface GeminiTaskResponse {
  description: string;
  category: string; // 'workout', 'nutrition', 'mindset'
}

export interface GeminiDayResponse {
  day: string;
  focus: string;
  dailyTip: string;
  tasks: GeminiTaskResponse[];
}
