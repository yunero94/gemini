
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';
import { Target, Activity, ArrowRight, CalendarRange, User, ChevronLeft } from 'lucide-react';
import { CountrySelect } from './CountrySelect';
import { YearSelect } from './YearSelect';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  isLoading: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isLoading }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    gender: '' as any, // Initialize empty to force selection
    birthYear: new Date().getFullYear() - 25, 
    country: '',
    goal: '',
    level: '' as any, // Initialize empty to force selection
    daysPerWeek: 3
  });

  const totalSteps = 7;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete(profile);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
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

  // Logic to determine if we can proceed via the minimalist Next button
  const isNextDisabled = () => {
    switch(step) {
      case 1: return !profile.name.trim();
      case 2: return !profile.gender; // Require gender selection
      case 3: return !profile.birthYear || profile.birthYear < 1920 || profile.birthYear > new Date().getFullYear();
      case 4: return !profile.country.trim();
      case 5: return !profile.goal; // Require goal selection
      case 6: return !profile.level; // Require level selection
      case 7: return true; // Hide/Disable on last step (Generate button is main CTA)
      default: return true;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 py-8 flex flex-col h-[90vh] justify-center">
      <div className="mb-4 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 text-primary mb-6">
            <Activity className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">
          GrindFit
        </h1>
        <p className="text-zinc-500 font-medium">Monthly Fitness Planner</p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="animate-slide-up space-y-8">
            <div className="text-center">
              <p className="text-zinc-500 text-sm">What should we call you?</p>
            </div>
            <input
              type="text"
              value={profile.name}
              onChange={handleNameChange}
              placeholder=""
              className="w-full bg-transparent border-b-2 border-zinc-700 p-4 text-center text-2xl font-bold text-white focus:border-primary outline-none transition-colors placeholder:text-zinc-800"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && !isNextDisabled() && handleNext()}
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

        {/* Step 2: Gender */}
        {step === 2 && (
          <div className="animate-slide-up space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Biological Profile</h2>
              <p className="text-zinc-500 text-sm">Helps tailor physiology & intensity.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Male', 'Female'].map((g) => (
                <button
                  key={g}
                  onClick={() => updateProfile('gender', g)}
                  className={`
                    p-8 rounded-3xl border flex flex-col items-center gap-4 transition-all duration-300
                    ${profile.gender === g 
                      ? 'bg-primary border-primary text-black' 
                      : 'bg-surface border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }
                  `}
                >
                  <User className="w-8 h-8" strokeWidth={1.5} />
                  <span className="font-bold text-lg">{g}</span>
                </button>
              ))}
            </div>
            
            <Button 
              fullWidth 
              onClick={handleNext}
              disabled={!profile.gender}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 3: Birth Year */}
        {step === 3 && (
          <div className="animate-slide-up space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Year of Birth</h2>
              <p className="text-zinc-500 text-sm">To calculate age-appropriate metrics.</p>
            </div>
            
            <YearSelect 
              value={profile.birthYear}
              onChange={(y) => updateProfile('birthYear', y)}
            />
            
            <Button 
              fullWidth 
              onClick={handleNext}
              disabled={!profile.birthYear || profile.birthYear < 1920 || profile.birthYear > new Date().getFullYear()}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 4: Country */}
        {step === 4 && (
          <div className="animate-slide-up space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Location</h2>
              <p className="text-zinc-500 text-sm">Where are you training?</p>
            </div>
            
            <CountrySelect 
              value={profile.country}
              onChange={(c) => updateProfile('country', c)}
            />
            
            <Button 
              fullWidth 
              onClick={handleNext}
              disabled={!profile.country.trim()}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 5: Goal */}
        {step === 5 && (
          <div className="animate-slide-up space-y-6">
             <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Main Objective</h2>
              <p className="text-zinc-500 text-sm">Target for the next 30 days.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility'].map((g) => (
                <button
                  key={g}
                  onClick={() => updateProfile('goal', g)}
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

            <Button 
              fullWidth 
              onClick={handleNext}
              disabled={!profile.goal}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 6: Level */}
        {step === 6 && (
          <div className="animate-slide-up space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Experience Level</h2>
              <p className="text-zinc-500 text-sm">Be honest for best results.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                <button
                  key={l}
                  onClick={() => updateProfile('level', l)}
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

            <Button 
              fullWidth 
              onClick={handleNext}
              disabled={!profile.level}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

         {/* Step 7: Duration */}
         {step === 7 && (
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
                     ? 'border-primary bg-primary text-black scale-110 shadow-[0_0_20px_rgba(255,85,0,0.4)]' 
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
      
      {/* Navigation Footer */}
      <div className="mt-auto pt-6 flex items-center justify-between">
        {/* Back Button */}
        <button 
          onClick={handleBack}
          disabled={step === 1}
          className={`
            w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center transition-all duration-300
            ${step === 1 
              ? 'opacity-0 pointer-events-none' 
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600'
            }
          `}
          aria-label="Previous step"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const i = idx + 1;
            return (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-6 bg-primary' : 'w-2 bg-zinc-800'}`} 
              />
            );
          })}
        </div>

        {/* Spacer for Balance */}
        <div className="w-12 h-12" />
      </div>

    </div>
  );
};
