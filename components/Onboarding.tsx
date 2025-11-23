import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';
import { Target, Activity, ArrowRight, CalendarRange } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  isLoading: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isLoading }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    goal: '',
    level: 'Beginner',
    daysPerWeek: 3
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else onComplete(profile);
  };

  const updateProfile = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Disallow starting with non-letters if the string is not empty
    if (val.length > 0 && !/^[a-zA-Z]/.test(val)) return;
    
    // Capitalize first letter
    const formatted = val.length > 0 
        ? val.charAt(0).toUpperCase() + val.slice(1) 
        : val;
    
    updateProfile('name', formatted);
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 py-12 flex flex-col h-[90vh] justify-center">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 text-primary mb-6">
            <Activity className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">
          FitTrack AI
        </h1>
        <p className="text-zinc-500 font-medium">Monthly Precision Planner</p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="animate-slide-up space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Identify Yourself</h2>
              <p className="text-zinc-500 text-sm">What should we call you?</p>
            </div>
            <input
              type="text"
              value={profile.name}
              onChange={handleNameChange}
              placeholder="Name"
              className="w-full bg-transparent border-b-2 border-zinc-700 p-4 text-center text-2xl font-bold text-white focus:border-primary outline-none transition-colors placeholder:text-zinc-800"
              autoFocus
            />
            <Button 
              fullWidth 
              onClick={handleNext}
              disabled={!profile.name.trim()}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="animate-slide-up space-y-6">
             <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Main Objective</h2>
              <p className="text-zinc-500 text-sm">Target for the next 30 days.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility'].map((g) => (
                <button
                  key={g}
                  onClick={() => { updateProfile('goal', g); handleNext(); }}
                  className={`p-5 rounded-3xl border text-left transition-all duration-300 group ${
                    profile.goal === g 
                      ? 'border-primary bg-primary text-black font-bold' 
                      : 'border-zinc-800 bg-surface text-zinc-400 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  <span className="flex justify-between items-center">
                    {g}
                    {profile.goal === g && <Target className="w-5 h-5" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Level */}
        {step === 3 && (
          <div className="animate-slide-up space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Experience Level</h2>
              <p className="text-zinc-500 text-sm">Be honest for best results.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                <button
                  key={l}
                  onClick={() => { updateProfile('level', l); handleNext(); }}
                  className={`p-5 rounded-3xl border text-left transition-all duration-300 ${
                    profile.level === l
                      ? 'border-primary bg-primary text-black font-bold' 
                      : 'border-zinc-800 bg-surface text-zinc-400 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

         {/* Step 4: Duration */}
         {step === 4 && (
          <div className="animate-slide-up space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Commitment</h2>
              <p className="text-zinc-500 text-sm">Workouts per week (for 4 weeks).</p>
            </div>
            
            <div className="flex justify-center gap-3">
              {[3, 4, 5, 6].map((d) => (
                 <button
                 key={d}
                 onClick={() => updateProfile('daysPerWeek', d)}
                 className={`w-14 h-14 rounded-2xl border-2 font-black text-xl transition-all duration-300 flex items-center justify-center ${
                   profile.daysPerWeek === d
                     ? 'border-primary bg-primary text-black scale-110 shadow-[0_0_20px_rgba(190,242,100,0.4)]' 
                     : 'border-zinc-800 bg-surface text-zinc-600 hover:border-zinc-600 hover:text-white'
                 }`}
               >
                 {d}
               </button>
              ))}
            </div>

            <Button 
              fullWidth 
              onClick={handleNext}
              loading={isLoading}
              className="mt-8"
            >
              Generate Month Plan <CalendarRange className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-center gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-primary' : 'w-2 bg-zinc-800'}`} 
          />
        ))}
      </div>
    </div>
  );
};