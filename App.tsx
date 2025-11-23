import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateFitnessPlan, generateCategoryIcon } from './services/geminiService';
import { Program, UserProfile, DayPlan, Task, TaskType, GeminiTaskResponse, TaskPriority } from './types';
import { Onboarding } from './components/Onboarding';
import { DailyView } from './components/DailyView';
import { Overview } from './components/Overview';
import { ProfileEditor } from './components/ProfileEditor';
import { LayoutList, CalendarDays, Settings, Loader2, Activity } from 'lucide-react';

const STORAGE_KEY = 'grindfit_program_v1';
const ICONS_STORAGE_KEY = 'grindfit_icons_v1';

// Helper to calculate the scheduled date for a specific day index
const getScheduledDate = (startDate: number, dayIndex: number, daysPerWeek: number): Date => {
  const start = new Date(startDate);
  const weekIndex = Math.floor(dayIndex / daysPerWeek);
  const dayInWeekIndex = dayIndex % daysPerWeek;
  
  // Weekly offset (7 days per full week block)
  const daysOffset = weekIndex * 7;
  
  // Distribute days roughly evenly across the week based on frequency
  // This logic mimics standard workout splits (e.g. Mon/Wed/Fri for 3 days)
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

const App: React.FC = () => {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'daily' | 'overview'>('daily');
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // State for generated category icons
  const [categoryIcons, setCategoryIcons] = useState<Record<string, string>>({});
  const generatingIconsRef = useRef(false);

  useEffect(() => {
    // Load Program
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedProgram = JSON.parse(saved);
        if (!parsedProgram.createdAt) parsedProgram.createdAt = Date.now();
        parsedProgram.schedule.forEach((day: DayPlan) => {
            day.tasks.forEach((task: any) => {
                if (!task.priority) task.priority = 'medium';
            });
        });
        setProgram(parsedProgram);
      } catch (e) {
        console.error("Failed to parse saved program", e);
      }
    }

    // Load Icons
    const savedIcons = localStorage.getItem(ICONS_STORAGE_KEY);
    if (savedIcons) {
      setCategoryIcons(JSON.parse(savedIcons));
    } else {
      // Trigger generation if not present
      generateIcons();
    }
  }, []);

  const generateIcons = async () => {
    if (generatingIconsRef.current) return;
    generatingIconsRef.current = true;
    
    const types = [TaskType.WORKOUT, TaskType.NUTRITION, TaskType.MINDSET, TaskType.HYDRATION];
    const newIcons: Record<string, string> = {};
    
    // Generate sequentially to avoid rate limits or overwhelming the client
    for (const t of types) {
        try {
            const icon = await generateCategoryIcon(t);
            if (icon) {
                newIcons[t] = icon;
                // Update state progressively
                setCategoryIcons(prev => {
                    const next = { ...prev, [t]: icon };
                    localStorage.setItem(ICONS_STORAGE_KEY, JSON.stringify(next));
                    return next;
                });
            }
        } catch (e) {
            console.error(`Error generating icon for ${t}`, e);
        }
    }
    generatingIconsRef.current = false;
  };

  useEffect(() => {
    if (program) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(program));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [program]);

  const mapGeminiCategoryToTaskType = (cat: string): TaskType => {
    const lower = cat.toLowerCase();
    if (lower.includes('workout')) return TaskType.WORKOUT;
    if (lower.includes('nutrition')) return TaskType.NUTRITION;
    if (lower.includes('mindset')) return TaskType.MINDSET;
    if (lower.includes('hydra')) return TaskType.HYDRATION;
    return TaskType.WORKOUT;
  };

  const handleGenerateProgram = async (profile: UserProfile) => {
    setLoading(true);
    try {
      const geminiResponse = await generateFitnessPlan(profile);
      
      const schedule: DayPlan[] = geminiResponse.map((dayRes, index) => ({
        dayName: dayRes.day || `Day ${index + 1}`,
        focus: dayRes.focus,
        dailyTip: dayRes.dailyTip || "Small progress is still progress.",
        tasks: dayRes.tasks.map((t: GeminiTaskResponse) => ({
          id: Math.random().toString(36).substr(2, 9),
          description: t.description,
          type: mapGeminiCategoryToTaskType(t.category),
          completed: false,
          priority: 'medium'
        }))
      }));

      const newProgram: Program = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        userProfile: profile,
        schedule: schedule
      };

      setProgram(newProgram);
      setCurrentDayIndex(0);
      setView('daily');
      setShowSettings(false);
    } catch (error) {
      alert("Failed to generate program. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    if (!program) return;

    const structuralChanges = 
      updatedProfile.goal !== program.userProfile.goal ||
      updatedProfile.level !== program.userProfile.level ||
      updatedProfile.daysPerWeek !== program.userProfile.daysPerWeek;

    if (structuralChanges) {
      if (window.confirm("Changing goal, level, or frequency will regenerate your 4-week plan. Current progress will be lost. Continue?")) {
        await handleGenerateProgram(updatedProfile);
      }
    } else {
      setProgram(prev => prev ? ({ ...prev, userProfile: updatedProfile }) : null);
      setShowSettings(false);
    }
  };

  const toggleTask = useCallback((dayIndex: number, taskId: string) => {
    setProgram(prev => {
      if (!prev) return null;
      const newSchedule = [...prev.schedule];
      const day = newSchedule[dayIndex];
      const taskIndex = day.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex > -1) {
        const updatedTask = { ...day.tasks[taskIndex], completed: !day.tasks[taskIndex].completed };
        const updatedTasks = [...day.tasks];
        updatedTasks[taskIndex] = updatedTask;
        newSchedule[dayIndex] = { ...day, tasks: updatedTasks };
      }
      
      return { ...prev, schedule: newSchedule };
    });
  }, []);

  const updateTaskDescription = useCallback((dayIndex: number, taskId: string, newDescription: string) => {
    setProgram(prev => {
      if (!prev) return null;
      const newSchedule = [...prev.schedule];
      const day = newSchedule[dayIndex];
      const taskIndex = day.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex > -1) {
        const updatedTask = { ...day.tasks[taskIndex], description: newDescription };
        const updatedTasks = [...day.tasks];
        updatedTasks[taskIndex] = updatedTask;
        newSchedule[dayIndex] = { ...day, tasks: updatedTasks };
      }
      
      return { ...prev, schedule: newSchedule };
    });
  }, []);

  const updateTaskPriority = useCallback((dayIndex: number, taskId: string, newPriority: TaskPriority) => {
    setProgram(prev => {
      if (!prev) return null;
      const newSchedule = [...prev.schedule];
      const day = newSchedule[dayIndex];
      const taskIndex = day.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex > -1) {
        const updatedTask = { ...day.tasks[taskIndex], priority: newPriority };
        const updatedTasks = [...day.tasks];
        updatedTasks[taskIndex] = updatedTask;
        newSchedule[dayIndex] = { ...day, tasks: updatedTasks };
      }
      
      return { ...prev, schedule: newSchedule };
    });
  }, []);

  const handleDeleteTask = useCallback((dayIndex: number, taskId: string) => {
    setProgram(prev => {
      if (!prev) return null;
      const newSchedule = [...prev.schedule];
      const day = newSchedule[dayIndex];
      const updatedTasks = day.tasks.filter(t => t.id !== taskId);
      newSchedule[dayIndex] = { ...day, tasks: updatedTasks };
      return { ...prev, schedule: newSchedule };
    });
  }, []);

  const handleAddTask = useCallback((dayIndex: number, taskData: Omit<Task, 'id' | 'completed'>) => {
    setProgram(prev => {
      if (!prev) return null;
      const newSchedule = [...prev.schedule];
      const day = newSchedule[dayIndex];
      
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        completed: false,
        ...taskData
      };
      
      const updatedTasks = [...day.tasks, newTask];
      newSchedule[dayIndex] = { ...day, tasks: updatedTasks };
      
      return { ...prev, schedule: newSchedule };
    });
  }, []);

  const handleReorderTasks = useCallback((dayIndex: number, newTasks: Task[]) => {
    setProgram(prev => {
      if (!prev) return null;
      const newSchedule = [...prev.schedule];
      newSchedule[dayIndex] = { ...newSchedule[dayIndex], tasks: newTasks };
      return { ...prev, schedule: newSchedule };
    });
  }, []);

  const handleReset = () => {
    if(window.confirm("Delete your monthly plan and start over?")) {
      setProgram(null);
      setView('daily');
      setShowSettings(false);
    }
  };

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Onboarding onComplete={handleGenerateProgram} isLoading={loading} />
      </div>
    );
  }

  // Calculate the date for the current view
  const currentViewDate = getScheduledDate(
    program.createdAt, 
    currentDayIndex, 
    program.userProfile.daysPerWeek
  );

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col max-w-md mx-auto relative border-x border-zinc-900 shadow-2xl">
      
      {loading && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md p-8 text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Designing Month Plan</h2>
          <p className="text-zinc-500">Creating 4 weeks of tailored content...</p>
        </div>
      )}

      {showSettings && (
        <ProfileEditor 
          currentProfile={program.userProfile}
          onSave={handleUpdateProfile}
          onCancel={() => setShowSettings(false)}
          onDeletePlan={handleReset}
        />
      )}

      {/* Header */}
      <header className="px-6 py-5 flex justify-between items-center sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,85,0,0.3)]">
                <Activity className="w-5 h-5" strokeWidth={3} />
            </div>
            <div>
                <h1 className="text-sm font-black tracking-wide uppercase text-white">GrindFit</h1>
            </div>
        </div>
        <button 
          onClick={() => setShowSettings(true)} 
          className="p-2.5 text-zinc-400 hover:text-white hover:bg-surface-highlight rounded-full transition-all border border-transparent hover:border-zinc-700"
        >
            <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
        {view === 'daily' ? (
          <DailyView 
            dayPlan={program.schedule[currentDayIndex]}
            dayIndex={currentDayIndex}
            totalDays={program.schedule.length}
            date={currentViewDate}
            startDate={program.createdAt}
            daysPerWeek={program.userProfile.daysPerWeek}
            categoryIcons={categoryIcons}
            onToggleTask={toggleTask}
            onUpdateTask={updateTaskDescription}
            onUpdatePriority={updateTaskPriority}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onReorderTasks={handleReorderTasks}
            onSelectDay={setCurrentDayIndex}
            onNextDay={() => setCurrentDayIndex(prev => Math.min(prev + 1, program.schedule.length - 1))}
            onPrevDay={() => setCurrentDayIndex(prev => Math.max(prev - 1, 0))}
          />
        ) : (
          <Overview 
            schedule={program.schedule}
            daysPerWeek={program.userProfile.daysPerWeek}
            currentDayIndex={currentDayIndex}
            onSelectDay={(idx) => {
              setCurrentDayIndex(idx);
              setView('daily');
            }}
          />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-none">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full p-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] flex items-center gap-2 pointer-events-auto">
            <button 
            onClick={() => setView('daily')}
            className={`
                px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300
                ${view === 'daily' 
                    ? 'bg-primary text-black font-bold shadow-[0_0_20px_-5px_rgba(255,85,0,0.5)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-surface-highlight'
                }
            `}
            >
            <LayoutList className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider font-bold">Day</span>
            </button>
            
            <button 
            onClick={() => setView('overview')}
            className={`
                px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300
                ${view === 'overview' 
                    ? 'bg-primary text-black font-bold shadow-[0_0_20px_-5px_rgba(255,85,0,0.5)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-surface-highlight'
                }
            `}
            >
            <CalendarDays className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider font-bold">Month</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default App;