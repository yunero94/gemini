import React, { useMemo, useState } from 'react';
import { DayPlan, TaskPriority, Task, TaskType } from '../types';
import { TaskCard } from './TaskCard';
import { ProgressBar } from './ProgressBar';
import { Trophy, Zap, CalendarCheck, ChevronLeft, ChevronRight, Plus, X, Coffee, Sparkles } from 'lucide-react';

interface DailyViewProps {
  dayPlan: DayPlan;
  dayIndex: number;
  totalDays: number;
  date: Date;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onUpdateTask: (dayIndex: number, taskId: string, newDescription: string) => void;
  onUpdatePriority: (dayIndex: number, taskId: string, newPriority: TaskPriority) => void;
  onAddTask: (dayIndex: number, task: Omit<Task, 'id' | 'completed'>) => void;
  onNextDay: () => void;
  onPrevDay: () => void;
}

export const DailyView: React.FC<DailyViewProps> = ({ 
  dayPlan, 
  dayIndex, 
  totalDays,
  date,
  onToggleTask,
  onUpdateTask,
  onUpdatePriority,
  onAddTask,
  onNextDay,
  onPrevDay
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>(TaskType.WORKOUT);

  const completedCount = dayPlan.tasks.filter(t => t.completed).length;
  const totalCount = dayPlan.tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const celebrationMessage = useMemo(() => {
    const messages = [
        "You're crushing it! Keep this momentum going.",
        "Outstanding work. Your future self thanks you.",
        "Discipline is doing what needs to be done. Great job.",
        "Another day, another victory. Well done.",
        "You are unstoppable. Rest up for tomorrow!",
        "Consistency is key, and you nailed it today.",
        "Great session! You're getting stronger every day.",
        "That's how it's done! Precision and effort.",
        "Level up! You completed everything on the list.",
        "Fantastic effort. Enjoy your recovery."
    ];
    // Use dayIndex to pick a consistent message for the specific day
    return messages[dayIndex % messages.length];
  }, [dayIndex]);

  const handleSaveTask = () => {
    if (!newTaskText.trim()) return;
    onAddTask(dayIndex, {
      description: newTaskText,
      type: newTaskType,
      priority: 'medium'
    });
    setNewTaskText('');
    setIsAdding(false);
  };

  return (
    <div className="pb-32 space-y-8 animate-slide-up">
      {/* Date Navigation */}
      <div className="flex items-center justify-between px-2">
        <button 
            onClick={onPrevDay}
            disabled={dayIndex === 0}
            className="p-3 rounded-full hover:bg-surface-highlight disabled:opacity-0 transition-all text-zinc-400 hover:text-white"
        >
            <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-1">
                Day {dayIndex + 1} / {totalDays}
            </span>
            <span className="text-sm font-medium text-zinc-400">
                {/* Use dateStyle: 'full' to fully respect user's system date format settings */}
                {date.toLocaleDateString(undefined, { dateStyle: 'full' })}
            </span>
        </div>

        <button 
            onClick={onNextDay}
            disabled={dayIndex === totalDays - 1}
            className="p-3 rounded-full hover:bg-surface-highlight disabled:opacity-0 transition-all text-zinc-400 hover:text-white"
        >
            <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Hero Header */}
      <div className="relative px-2">
        <div className="absolute right-4 top-0 opacity-10 pointer-events-none">
             <h1 className="text-[8rem] font-black leading-none tracking-tighter text-white">
                {dayIndex + 1}
            </h1>
        </div>
        
        <div className="relative z-10">
            <h1 className="text-5xl font-black text-white tracking-tight mb-2 uppercase italic">
                {dayPlan.dayName}
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-highlight border border-zinc-700 text-zinc-300 text-xs font-bold tracking-wide uppercase">
                <Zap className="w-3 h-3 text-primary" fill="currentColor" />
                {dayPlan.focus}
            </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-surface p-6 rounded-3xl border border-zinc-800 relative overflow-hidden">
         <div className="flex justify-between items-end mb-4 relative z-10">
            <div>
                <p className="text-zinc-400 text-sm font-medium mb-1">Daily Completion</p>
                <p className="text-4xl font-bold text-white">{percentage}%</p>
            </div>
            {allDone && <div className="p-2 bg-primary rounded-full text-black animate-check-pop"><Trophy className="w-6 h-6" /></div>}
         </div>
         <ProgressBar current={completedCount} total={totalCount} heightClass="h-5" />
         
         {/* Background decoration */}
         <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
      </div>

      {/* Tip / Celebration */}
      <div className={`
        p-6 rounded-3xl border transition-all duration-500
        ${allDone 
            ? 'bg-primary text-black border-primary scale-[1.02] shadow-[0_10px_40px_-10px_rgba(190,242,100,0.5)]' 
            : 'bg-surface-highlight/30 border-zinc-800 text-zinc-300'
        }
      `}>
        <div className="flex gap-4 items-start">
            <div className={`p-3 rounded-xl ${allDone ? 'bg-black/10 text-black' : 'bg-black/20 text-primary'}`}>
                {allDone ? <CalendarCheck className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </div>
            <div>
                <h3 className={`font-bold text-lg mb-1 ${allDone ? 'text-black' : 'text-white'}`}>
                    {allDone ? "Day Complete!" : "Daily Insight"}
                </h3>
                <p className={`text-sm leading-relaxed ${allDone ? 'text-black/80 font-medium' : 'text-zinc-400'}`}>
                    {allDone ? celebrationMessage : dayPlan.dailyTip}
                </p>
            </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest px-2">Your Schedule</h3>
        {dayPlan.tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800/50 border-dashed group transition-all hover:bg-zinc-900/50 hover:border-zinc-700">
                <div className="relative mb-6 transition-transform duration-500 group-hover:scale-110">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <Coffee className="w-24 h-24 text-primary relative z-10 opacity-90" strokeWidth={1} />
                    <Sparkles className="w-8 h-8 text-secondary absolute -top-4 -right-4 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Rest & Recharge</h3>
                <p className="text-zinc-500 text-sm max-w-[260px] leading-relaxed">
                    No scheduled tasks for today. Enjoy your recovery or manually add a task below.
                </p>
            </div>
        ) : (
            <div className="grid gap-3">
                {dayPlan.tasks.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onToggle={(taskId) => onToggleTask(dayIndex, taskId)} 
                        onUpdate={(taskId, newVal) => onUpdateTask(dayIndex, taskId, newVal)}
                        onUpdatePriority={(taskId, newPriority) => onUpdatePriority(dayIndex, taskId, newPriority)}
                    />
                ))}
            </div>
        )}

        {/* Add Task Button / Form */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-4 rounded-3xl border border-dashed border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-zinc-900/50 transition-all flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide"
          >
            <Plus className="w-4 h-4" /> Add Custom Task
          </button>
        ) : (
          <div className="bg-surface p-4 rounded-3xl border border-zinc-700 animate-slide-up space-y-4">
             {/* Input */}
             <input 
                autoFocus
                type="text"
                placeholder="What needs to be done?"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                className="w-full bg-black/30 border border-zinc-800 rounded-xl p-3 text-white placeholder:text-zinc-600 focus:border-primary outline-none font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
             />
             
             {/* Type Selector */}
             <div className="grid grid-cols-2 gap-2">
                {Object.values(TaskType).map(t => (
                    <button
                        key={t}
                        onClick={() => setNewTaskType(t)}
                        className={`px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            newTaskType === t 
                            ? 'bg-primary text-black border-primary shadow-[0_0_10px_rgba(190,242,100,0.3)]' 
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'
                        }`}
                    >
                        {t}
                    </button>
                ))}
             </div>

             {/* Actions */}
             <div className="flex gap-2">
                <button 
                    onClick={handleSaveTask}
                    className="flex-1 bg-primary text-black font-bold py-3 rounded-xl text-sm"
                >
                    Save Task
                </button>
                <button 
                    onClick={() => { setIsAdding(false); setNewTaskText(''); }}
                    className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
                >
                    <X className="w-5 h-5" />
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};