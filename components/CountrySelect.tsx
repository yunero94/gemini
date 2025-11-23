import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Globe, X, MapPin } from 'lucide-react';
import { COUNTRIES } from '../data/countries';

interface CountrySelectProps {
  value: string;
  onChange: (country: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  variant?: 'minimal' | 'box';
}

export const CountrySelect: React.FC<CountrySelectProps> = ({ 
  value, 
  onChange, 
  placeholder = "Select Country",
  variant = 'minimal'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      setSearch("");
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    if (!search) return COUNTRIES;
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const selectedCountry = COUNTRIES.find(c => c.name === value);

  const handleSelect = (countryName: string) => {
    onChange(countryName);
    setIsOpen(false);
  };

  const isMinimal = variant === 'minimal';

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className={`
            w-full group relative flex items-center transition-all duration-300 outline-none
            ${isMinimal 
                ? 'justify-center border-b-2 border-zinc-700 hover:border-primary p-4 gap-3' 
                : 'justify-between bg-surface border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600'
            }
        `}
      >
        {isMinimal ? (
            // Minimal Centered Layout (Onboarding)
            <div className="flex items-center gap-3">
                 {selectedCountry ? (
                    <>
                        <span className="text-3xl sm:text-4xl drop-shadow-sm">{selectedCountry.flag}</span>
                        <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{selectedCountry.name}</span>
                    </>
                 ) : (
                    <span className="text-2xl font-bold text-zinc-600">{placeholder}</span>
                 )}
                 <ChevronDown className={`w-5 h-5 text-zinc-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
        ) : (
            // Box Layout (Settings / Profile Editor)
            <>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl shadow-inner group-hover:bg-zinc-700 transition-colors">
                        {selectedCountry ? selectedCountry.flag : <Globe className="w-5 h-5 text-zinc-500" />}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {selectedCountry ? "Location" : "Select"}
                        </span>
                        <span className={`text-base font-bold ${selectedCountry ? 'text-white' : 'text-zinc-500'}`}>
                            {selectedCountry ? selectedCountry.name : placeholder}
                        </span>
                    </div>
                </div>
                <div className={`p-2 rounded-full border border-zinc-700 bg-zinc-900 group-hover:border-zinc-500 transition-colors`}>
                    <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                </div>
            </>
        )}
      </button>

      {/* Centered Floating Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal Content - Smaller and Centered */}
            <div className="relative w-full max-w-xs bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl flex flex-col h-[50vh] animate-slide-up overflow-hidden">
                
                {/* Header / Search */}
                <div className="p-4 border-b border-zinc-800 bg-zinc-900 z-10 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Select Region</span>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/40 border border-zinc-700 rounded-xl py-2 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:border-primary outline-none text-sm font-bold transition-colors"
                        />
                    </div>
                </div>

                {/* Country List */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {filteredCountries.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                            {filteredCountries.map((country) => {
                                const isSelected = value === country.name;
                                return (
                                    <button
                                        key={country.code}
                                        onClick={() => handleSelect(country.name)}
                                        className={`
                                            w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                                            ${isSelected 
                                                ? 'bg-primary text-black' 
                                                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{country.flag}</span>
                                            <span className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-zinc-300 group-hover:text-white'}`}>
                                                {country.name}
                                            </span>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-zinc-600 text-sm font-medium">
                            <p>No matches</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </>
  );
};