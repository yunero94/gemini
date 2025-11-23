
import React, { useEffect, useState } from 'react';
import { Badge } from '../types';
import { Trophy, Zap, Crown, Flag, Dumbbell, Flame } from 'lucide-react';

interface BadgePopupProps {
  badge: Badge;
  onClose: () => void;
}

export const BadgePopup: React.FC<BadgePopupProps> = ({ badge, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slight delay for animation entrance
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto close after 4 seconds
    const closeTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500); // Wait for exit animation
    }, 4000);

    return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
    };
  }, [onClose]);

  const IconComponent = () => {
    const props = { className: "w-12 h-12 text-black", strokeWidth: 1.5 };
    switch(badge.icon) {
        case 'Zap': return <Zap {...props} />;
        case 'Flag': return <Flag {...props} />;
        case 'Crown': return <Crown {...props} />;
        case 'Trophy': return <Trophy {...props} />;
        case 'Dumbbell': return <Dumbbell {...props} />;
        case 'Flame': return <Flame {...props} />;
        default: return <Trophy {...props} />;
    }
  };

  return (
    <div className={`
        fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-6
    `}>
        <div className={`
            relative bg-zinc-900 border-2 border-primary rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(255,85,0,0.4)]
            transform transition-all duration-500 flex flex-col items-center text-center overflow-hidden
            ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-90'}
        `}>
            {/* Background effects */}
            <div className="absolute inset-0 bg-primary/10" />
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/30 blur-3xl rounded-full animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/30 blur-3xl rounded-full" />

            <div className="relative z-10 mb-6 bg-primary p-6 rounded-full shadow-[0_0_30px_rgba(255,85,0,0.6)] animate-check-pop">
                <IconComponent />
            </div>

            <h2 className="relative z-10 text-xs font-black text-primary uppercase tracking-widest mb-2">Badge Unlocked</h2>
            <h3 className="relative z-10 text-3xl font-black text-white italic uppercase tracking-tight mb-2">{badge.name}</h3>
            <p className="relative z-10 text-zinc-400 font-medium">{badge.description}</p>
        </div>
    </div>
  );
};
