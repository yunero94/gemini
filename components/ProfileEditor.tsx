import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';
import { X, Trash2, Save } from 'lucide-react';

interface ProfileEditorProps {
  currentProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
  onDeletePlan: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ currentProfile, onSave, onCancel, onDeletePlan }) => {
  const [profile, setProfile] = useState<UserProfile>(currentProfile);

  const handleChange = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Disallow starting with non-letters if not empty
    if (val.length > 0 && !/^[a-zA-Z]/.test(val)) return;
    
    // Capitalize first letter
    const formatted = val.length > 0 
        ? val.charAt(0).toUpperCase() + val.slice(1) 
        : val;
        
    handleChange('name', formatted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/90 backdrop-blur-sm animate-slide-up">
      <div className="bg-background w-full max-w-md sm:rounded-[2rem] rounded-t-[2rem] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-wide">Monthly Plan Settings</h2>
          <button 
            onClick={onCancel}
            className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-zinc-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-8 overflow-y-auto no-scrollbar">
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={handleNameChange}
              className="w-full bg-surface border border-zinc-800 rounded-2xl p-4 text-white focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Main Goal</label>
            <select
              value={profile.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
              className="w-full bg-surface border border-zinc-800 rounded-2xl p-4 text-white focus:border-primary outline-none transition-all appearance-none"
            >
              {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Fitness Level</label>
            <select
              value={profile.level}
              onChange={(e) => handleChange('level', e.target.value)}
              className="w-full bg-surface border border-zinc-800 rounded-2xl p-4 text-white focus:border-primary outline-none transition-all appearance-none"
            >
              {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Weekly Frequency</label>
            <p className="text-xs text-zinc-600 mb-2">Days per week you will workout this month.</p>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  onClick={() => handleChange('daysPerWeek', d)}
                  className={`flex-1 py-3 rounded-xl border transition-all font-bold text-sm ${
                    profile.daysPerWeek === d
                      ? 'bg-primary text-black border-primary'
                      : 'bg-surface border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 space-y-3">
          <Button fullWidth onClick={() => onSave(profile)}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
          
          <Button fullWidth variant="danger" onClick={onDeletePlan}>
            <Trash2 className="w-4 h-4" /> Delete Monthly Plan
          </Button>
        </div>
      </div>
    </div>
  );
};