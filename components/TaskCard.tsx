import React, { useState } from 'react';
import { Task, TaskType, TaskPriority } from '../types';
import { Check, Dumbbell, Apple, Brain, Droplets, Pencil, Flag } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, newDescription: string) => void;
  onUpdatePriority: (id: string, newPriority: TaskPriority) => void;
  customIcon?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onUpdate, onUpdatePriority, customIcon }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.description);

  const getCategoryColor = (type: TaskType) => {
    switch (type) {
      case TaskType.WORKOUT: return 'text-orange-400';
      case TaskType.NUTRITION: return 'text-primary'; // Green
      case TaskType.HYDRATION: return 'text-blue-400';
      case TaskType.MINDSET: return 'text-purple-400';
      default: return 'text-zinc-400';
    }
  };

  const getIcon = (type: TaskType) => {
    if (customIcon) {
        return <img src={customIcon} alt={type} className="w-full h-full object-cover rounded-xl" />;
    }

    const cls = `w-5 h-5 ${getCategoryColor(type)}`;
    switch (type) {
      case TaskType.WORKOUT: return <Dumbbell className={cls} />;
      case TaskType.NUTRITION: return <Apple className={cls} />;
      case TaskType.HYDRATION: return <Droplets className={cls} />;
      case TaskType.MINDSET: return <Brain className={cls} />;
      default: return <div className={`w-2 h-2 rounded-full bg-zinc-500`} />;
    }
  };

  const getPriorityColor = (priority: TaskPriority = 'medium') => {
    switch(priority) {
        case 'high': return 'text-rose-500 fill-rose-500/20';
        case 'medium': return 'text-primary fill-primary/20';
        case 'low': return 'text-zinc-600 fill-transparent';
        default: return 'text-primary';
    }
  };

  const cyclePriority = (e: React.MouseEvent) => {
    e.stopPropagation();
    const priorities: TaskPriority[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(task.priority || 'medium');
    const nextIndex = (currentIndex + 1) % priorities.length;
    onUpdatePriority(task.id, priorities[nextIndex]);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdate(task.id, editValue.trim());
    } else {
      setEditValue(task.description); // Revert if empty
    }
    setIsEditing(false);
  };

  return (
    <div 
      onClick={() => { if (!isEditing) onToggle(task.id); }}
      className={`
        group relative flex items-start gap-5 p-5 rounded-3xl border cursor-pointer 
        transition-all duration-300
        ${task.completed 
          ? 'bg-zinc-900/40 border-zinc-800/50 opacity-60' 
          : 'bg-surface border-zinc-800 hover:border-primary/30 hover:bg-surface-highlight'
        }
      `}
    >
      {/* Checkbox UI */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-1
        ${task.completed 
          ? 'bg-primary border-primary text-black scale-100' 
          : 'border-zinc-600 bg-transparent group-hover:border-primary/50'
        }
      `}>
        <Check 
            key={task.completed ? 'completed' : 'pending'}
            className={`w-5 h-5 ${task.completed ? 'animate-check-pop' : 'scale-0 opacity-0'}`} 
            strokeWidth={3} 
        />
      </div>
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <textarea 
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
               if(e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSave();
               }
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-b border-primary outline-none text-white text-base font-medium py-1 resize-none"
            rows={2}
          />
        ) : (
          <div className="flex items-start justify-between gap-2">
            <p className={`
              text-base font-medium transition-all duration-300 break-words whitespace-pre-wrap pr-2
              ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-100'}
            `}>
              {task.description}
            </p>
            {!task.completed && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-zinc-500 hover:text-primary transition-all rounded shrink-0"
                aria-label="Edit task"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
        )}
        
        <p className="text-xs text-zinc-500 font-medium tracking-wider uppercase mt-0.5 flex items-center gap-2">
          {task.type}
        </p>
      </div>

      <div className="flex flex-col gap-2 items-center shrink-0">
        {/* Category Indicator */}
        <div className={`
            w-10 h-10 rounded-2xl flex items-center justify-center bg-black/40 border border-zinc-800 overflow-hidden p-0.5
        `}>
            {getIcon(task.type)}
        </div>

        {/* Priority Indicator */}
        <button 
            onClick={cyclePriority}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            title={`Priority: ${task.priority || 'medium'}`}
        >
            <Flag className={`w-4 h-4 transition-colors duration-300 ${getPriorityColor(task.priority)}`} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};