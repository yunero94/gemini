
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar, X, Check } from 'lucide-react';

interface YearSelectProps {
  value: number;
  onChange: (year: number) => void;
  variant?: 'minimal' | 'box';
}

export const YearSelect: React.FC<YearSelectProps> = ({ 
  value, 
  onChange,
  variant = 'minimal'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedRef = useRef<HTMLButtonElement>(null);
  
  // Generate years: From (Current Year - 5) down to 1920
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 5 - i); 

  useEffect(() => {
     if (isOpen) {
       document.body.style.overflow = 'hidden';
       // Scroll to selected year if possible
       setTimeout(() => {
         selectedRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
       }, 100);
     } else {
       document.body.style.overflow = '';
     }
     return () => { document.body.style.overflow = ''; };
   }, [isOpen]);

  const handleSelect = (y: number) => {
    onChange(y);
    setIsOpen(false);
  };
  
  const isMinimal = variant === 'minimal';

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
           w-full group relative flex items-center transition-all duration-300 outline-none
           ${isMinimal 
               ? 'justify-center border-b-2 border-zinc-700 hover:border-primary p-4 gap-3' 
               : 'justify-between bg-surface border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600'
           }
        `}
      >
        {isMinimal ? (
            <div className="flex items-center gap-3">
                 <span className={`text-4xl font-bold transition-colors ${value ? 'text-white' : 'text-zinc-600'}`}>
                    {value || 'YYYY'}
                 </span>
                 <ChevronDown className={`w-5 h-5 text-zinc-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
        ) : (
             <>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl shadow-inner group-hover:bg-zinc-700 transition-colors">
                        <Calendar className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            Birth Year
                        </span>
                        <span className={`text-base font-bold ${value ? 'text-white' : 'text-zinc-500'}`}>
                            {value || "Select"}
                        </span>
                    </div>
                </div>
                 <div className={`p-2 rounded-full border border-zinc-700 bg-zinc-900 group-hover:border-zinc-500 transition-colors`}>
                    <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                </div>
            </>
        )}
      </button>

      {/* Centered Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
                onClick={() => setIsOpen(false)}
            />
            <div className="relative w-full max-w-xs bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl flex flex-col max-h-[50vh] animate-slide-up overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 bg-zinc-900 z-10 flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Select Year</span>
                     <button 
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-1">
                        {years.map(year => (
                            <button
                                key={year}
                                ref={value === year ? selectedRef : null}
                                onClick={() => handleSelect(year)}
                                className={`
                                    w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200
                                    ${value === year
                                        ? 'bg-primary text-black font-bold' 
                                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                    }
                                `}
                            >
                                <span className="text-lg">{year}</span>
                                {value === year && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
};
