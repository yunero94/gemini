import React from 'react';
import { DayPlan } from '../types';
import { ChevronRight, ArrowRight, Activity, BarChart, CalendarRange } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface OverviewProps {
  schedule: DayPlan[];
  daysPerWeek: number;
  onSelectDay: (index: number) => void;
  currentDayIndex: number;
}

export const Overview: React.FC<OverviewProps> = ({ schedule, daysPerWeek, onSelectDay, currentDayIndex }) => {
  const totalTasks = schedule.reduce((acc, day) => acc + day.tasks.length, 0);
  const completedTasks = schedule.reduce((acc, day) => acc + day.tasks.filter(t => t.completed).length, 0);
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="pb-32 space-y-8 animate-slide-up">
      <div className="px-2">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Monthly<br/>Blueprint</h2>
          <p className="text-zinc-400 text-sm">Your 4-week transformation roadmap.</p>
      </div>
      
      {/* Stats Card */}
      <div className="bg-surface-highlight p-6 rounded-[2rem] border border-zinc-700 relative overflow-hidden mx-1">
        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                <Activity className="w-6 h-6 text-primary" />
            </div>
            <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Month Progress</p>
                <p className="text-3xl font-black text-white">{overallPercentage}%</p>
            </div>
        </div>
        <ProgressBar current={completedTasks} total={totalTasks} heightClass="h-6" />
        <div className="mt-4 flex justify-between text-xs text-zinc-500 font-medium">
            <span>WEEK 1</span>
            <span>WEEK 4</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        <div className="grid gap-4">
        {schedule.map((day, idx) => {
          const dayCompletedTasks = day.tasks.filter(t => t.completed).length;
          const dayTotalTasks = day.tasks.length;
          const dayPercent = dayTotalTasks > 0 ? Math.round((dayCompletedTasks / dayTotalTasks) * 100) : 0;
          const isDayCompleted = dayTotalTasks > 0 && dayCompletedTasks === dayTotalTasks;
          const isCurrent = idx === currentDayIndex;
          
          // Logic to determine week breaks
          const isNewWeek = idx % daysPerWeek === 0;
          const weekNum = Math.floor(idx / daysPerWeek) + 1;

          return (
            <React.Fragment key={idx}>
              {isNewWeek && (
                <div className={`flex items-center gap-3 px-2 ${idx > 0 ? 'mt-6' : ''}`}>
                    <div className="h-px flex-1 bg-zinc-800" />
                    <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        Week {weekNum}
                    </span>
                    <div className="h-px flex-1 bg-zinc-800" />
                </div>
              )}

              <button
                onClick={() => onSelectDay(idx)}
                className={`
                  w-full text-left p-5 rounded-3xl border transition-all duration-300 group relative overflow-hidden
                  ${isCurrent 
                    ? 'bg-zinc-900 border-primary/50 shadow-[0_0_30px_-10px_rgba(190,242,100,0.15)]' 
                    : 'bg-surface border-zinc-800 hover:bg-surface-highlight'
                  }
                `}
              >
                {/* Vertical Status Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${isCurrent ? 'bg-primary' : isDayCompleted ? 'bg-zinc-700' : 'bg-transparent'}`} />

                <div className="flex justify-between items-center pl-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                          <span className={`text-xs font-black tracking-widest uppercase ${isCurrent ? 'text-primary' : 'text-zinc-500'}`}>
                              Day {idx + 1}
                          </span>
                          {isDayCompleted && (
                              <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-400">DONE</span>
                          )}
                    </div>
                    <p className="text-lg font-bold text-white mb-3 line-clamp-1">{day.focus}</p>
                    
                    {/* Mini stats */}
                    <div className="flex items-center gap-3 text-xs font-medium text-zinc-500">
                          <BarChart className="w-3 h-3" />
                          <span>{dayCompletedTasks}/{dayTotalTasks} Tasks</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                      {/* Radial Progress Mini */}
                      <div className="relative w-10 h-10 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                              <path className={`${isCurrent ? 'text-primary' : isDayCompleted ? 'text-white' : 'text-zinc-600'}`} strokeDasharray={`${dayPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                          </svg>
                          <span className="absolute text-[8px] font-bold text-white">{dayPercent}%</span>
                      </div>
                      
                      <div className={`p-2 rounded-full transition-colors ${isCurrent ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-400 group-hover:text-white'}`}>
                          <ArrowRight className="w-4 h-4" />
                      </div>
                  </div>
                </div>
              </button>
            </React.Fragment>
          );
        })}
        </div>
      </div>
    </div>
  );
};