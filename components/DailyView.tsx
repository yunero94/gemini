import React, { useMemo, useState } from 'react';
import { DayPlan, TaskPriority, Task, TaskType } from '../types';
import { TaskCard } from './TaskCard';
import { ProgressBar } from './ProgressBar';
import { Trophy, Zap, CalendarCheck, ChevronLeft, ChevronRight, Plus, X, Coffee, Sparkles, ChevronDown, Calendar, Dumbbell, Flame } from 'lucide-react';

interface DailyViewProps {
  dayPlan: DayPlan;
  dayIndex: number;
  totalDays: number;
  date: Date;
  startDate: number;
  daysPerWeek: number;
  categoryIcons?: Record<string, string>;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onUpdateTask: (dayIndex: number, taskId: string, newDescription: string) => void;
  onUpdatePriority: (dayIndex: number, taskId: string, newPriority: TaskPriority) => void;
  onAddTask: (dayIndex: number, task: Omit<Task, 'id' | 'completed'>) => void;
  onSelectDay: (index: number) => void;
  onNextDay: () => void;
  onPrevDay: () => void;
}

// Helper to calculate dates locally for the calendar picker
const getScheduledDate = (startDate: number, dayIndex: number, daysPerWeek: number): Date => {
  const start = new Date(startDate);
  const weekIndex = Math.floor(dayIndex / daysPerWeek);
  const dayInWeekIndex = dayIndex % daysPerWeek;
  
  // Weekly offset (7 days per full week block)
  const daysOffset = weekIndex * 7;
  
  // Distribute days roughly evenly across the week based on frequency
  let extraDays = 0;
  if (daysPerWeek === 1) extraDays = 0; // Mon
  else if (daysPerWeek === 2) extraDays = dayInWeekIndex * 3; // Mon, Thu
  else if (daysPerWeek === 3) extraDays = dayInWeekIndex * 2; // Mon, Wed, Fri
  else if (daysPerWeek === 4) extraDays = dayInWeekIndex + (dayInWeekIndex >= 2 ? 1 : 0); // Mon, Tue, Thu, Fri
  else if (daysPerWeek >= 5) extraDays = dayInWeekIndex; // Consecutive days
  
  const result = new Date(start);
  result.setDate(result.getDate() + daysOffset + extraDays);
  return result;
};

const STOIC_QUOTES = [
  "No man has the right to be an amateur in the matter of physical training. It is a shame for a man to grow old without seeing the beauty and strength of which his body is capable. — Socrates",
  "Difficulties strengthen the mind, as labor does the body. — Seneca",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
  "It is a rough road that leads to the heights of greatness. — Seneca",
  "The pain you feel today will be the strength you feel tomorrow.",
  "You have power over your mind — not outside events. Realize this, and you will find strength. — Marcus Aurelius",
  "Discipline is doing what needs to be done, even if you don't want to do it.",
  "The resistance that you fight physically in the gym and the resistance that you fight in life can only build a strong character. — Arnold Schwarzenegger",
  "Strength does not come from winning. Your struggles develop your strengths.",
  "If it is endurable, then endure it. Stop complaining. — Marcus Aurelius",
  "To be calm is the highest achievement of the self.",
  "The body should be treated rigorously, that it may not be disobedient to the mind. — Seneca",
  "Nothing great is created suddenly, any more than a bunch of grapes or a fig. — Epictetus",
  "Don't explain your philosophy. Embodiment is the only proof.",
  "Focus on what you can control. Your effort, your diet, your intensity.",
  "Sweat is the weeping of the weakness leaving the body.",
  "A gem cannot be polished without friction, nor a man perfected without trials. — Seneca",
  "First say to yourself what you would be; and then do what you have to do. — Epictetus",
  "The only easy day was yesterday.",
  "Your body is the slave of your mind. Master your mind.",
  "Endurance is one of the most difficult disciplines, but it is to the one who endures that the final victory comes. — Buddha",
  "Do not pray for an easy life, pray for the strength to endure a difficult one. — Bruce Lee",
  "Man conquers the world by conquering himself. — Zeno",
  "It is not death that a man should fear, but he should fear never beginning to live. — Marcus Aurelius",
  "Be stricter with yourself than you are with others.",
  "Progress is not achieved by luck or accident, but by working on yourself daily. — Epictetus",
  "Conquer yourself and you conquer the world.",
  "Pain is temporary. Quitting lasts forever.",
  "The mind is the limit. As long as the mind can envision the fact that you can do something, you can do it. — Arnold Schwarzenegger",
  "Mastery requires patience. Do the work."
];

export const DailyView: React.FC<DailyViewProps> = ({ 
  dayPlan, 
  dayIndex, 
  totalDays,
  date,
  startDate,
  daysPerWeek,
  categoryIcons,
  onToggleTask,
  onUpdateTask,
  onUpdatePriority,
  onAddTask,
  onSelectDay,
  onNextDay,
  onPrevDay
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    return messages[dayIndex % messages.length];
  }, [dayIndex]);

  // Use the curated Stoic quotes list instead of the generic dailyTip
  const dailyMotivation = useMemo(() => {
    return STOIC_QUOTES[dayIndex % STOIC_QUOTES.length];
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

  const totalWeeks = Math.ceil(totalDays / daysPerWeek);
  const weeksArray = Array.from({ length: totalWeeks }, (_, i) => i);

  return (
    <div className="pb-32 space-y-8 animate-slide-up relative">
      
      {/* Date Navigation / Picker Header */}
      <div className="flex items-center justify-between px-2 relative z-20">
        <button 
            onClick={onPrevDay}
            disabled={dayIndex === 0}
            className="p-3 rounded-full hover:bg-surface-highlight disabled:opacity-0 transition-all text-zinc-400 hover:text-white"
        >
            <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button 
            onClick={() => setShowDatePicker(true)}
            className="flex flex-col items-center group p-2 rounded-2xl hover:bg-zinc-900 transition-colors"
        >
            <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-1">
                Day {dayIndex + 1} / {totalDays}
            </span>
            <div className="flex items-center gap-1.5 text-zinc-300 group-hover:text-white transition-colors">
                <span className="text-sm font-bold">
                    {date.toLocaleDateString(undefined, { dateStyle: 'full' })}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
            </div>
        </button>

        <button 
            onClick={onNextDay}
            disabled={dayIndex === totalDays - 1}
            className="p-3 rounded-full hover:bg-surface-highlight disabled:opacity-0 transition-all text-zinc-400 hover:text-white"
        >
            <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Date Picker Overlay */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md animate-slide-up overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-bold text-white tracking-wide uppercase">Select Day</span>
                </div>
                <button 
                    onClick={() => setShowDatePicker(false)}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {weeksArray.map(weekIdx => (
                    <div key={weekIdx} className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest px-2">
                                Week {weekIdx + 1}
                            </span>
                            <div className="h-px bg-zinc-900 flex-1" />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {Array.from({ length: daysPerWeek }).map((_, i) => {
                                const dIdx = weekIdx * daysPerWeek + i;
                                if (dIdx >= totalDays) return null;
                                
                                const dDate = getScheduledDate(startDate, dIdx, daysPerWeek);
                                const isCurrent = dIdx === dayIndex;
                                const isPast = dIdx < dayIndex;
                                
                                return (
                                    <button
                                        key={dIdx}
                                        onClick={() => {
                                            onSelectDay(dIdx);
                                            setShowDatePicker(false);
                                        }}
                                        className={`
                                            relative flex flex-col items-start justify-between p-3 h-20 rounded-2xl border text-left transition-all
                                            ${isCurrent 
                                                ? 'bg-primary border-primary text-black shadow-[0_0_20px_-5px_rgba(190,242,100,0.5)]' 
                                                : isPast 
                                                    ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                                                    : 'bg-surface border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-surface-highlight'
                                            }
                                        `}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Day {dIdx + 1}</span>
                                        <span className={`text-xs font-bold ${isCurrent ? 'text-black' : 'text-white'}`}>
                                            {dDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                                        </span>
                                        
                                        {isCurrent && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-black animate-pulse" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-transparent border border-white/5 p-6 shadow-xl">
        {/* Shaded Athlete/Logo Watermark */}
        <div className="absolute -right-8 -bottom-12 opacity-[0.03] pointer-events-none rotate-[-15deg]">
             <Dumbbell className="w-64 h-64 text-white" strokeWidth={1.5} />
        </div>
        
        <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 uppercase italic leading-[0.9]">
                {dayPlan.dayName}
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-bold tracking-wide uppercase backdrop-blur-md">
                <Zap className="w-3 h-3 text-primary" fill="currentColor" />
                {dayPlan.focus}
            </div>
        </div>
      </div>

      {/* Motivation / Celebration (MOVED UP) */}
      <div className={`
        p-6 rounded-3xl border transition-all duration-500
        ${allDone 
            ? 'bg-primary text-black border-primary scale-[1.02] shadow-[0_10px_40px_-10px_rgba(190,242,100,0.5)]' 
            : 'bg-surface-highlight/30 border-zinc-800 text-zinc-300'
        }
      `}>
        <div className="flex gap-4 items-start">
            <div className={`p-3 rounded-xl ${allDone ? 'bg-black/10 text-black' : 'bg-black/20 text-primary'}`}>
                {allDone ? <CalendarCheck className="w-6 h-6" /> : <Flame className="w-6 h-6" />}
            </div>
            <div>
                <h3 className={`font-bold text-lg mb-1 ${allDone ? 'text-black' : 'text-white'}`}>
                    {allDone ? "Day Complete!" : "Daily Motivation"}
                </h3>
                <p className={`text-sm leading-relaxed ${allDone ? 'text-black/80 font-medium' : 'text-zinc-400 italic'}`}>
                    {allDone ? celebrationMessage : `"${dailyMotivation}"`}
                </p>
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
                        customIcon={categoryIcons?.[task.type]}
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