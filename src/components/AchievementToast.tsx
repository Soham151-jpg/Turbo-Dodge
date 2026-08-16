import React, { useEffect } from 'react';
import { Achievement } from '../types';
import { Trophy, Sparkles, Coins } from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
}) => {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="bg-neutral-900/95 border-2 border-yellow-500/80 rounded-2xl p-3 shadow-[0_0_25px_rgba(234,179,8,0.35)] backdrop-blur-md flex items-center justify-between gap-2.5 font-mono text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-yellow-500/20 border border-yellow-500/50 text-2xl shrink-0 flex items-center justify-center">
            {achievement.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>Achievement Unlocked!</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white truncate">
              {achievement.title}
            </h4>
            <p className="text-[10px] text-neutral-300 line-clamp-1">
              {achievement.description}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end">
          <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-0.5 bg-yellow-950/80 border border-yellow-500/40 px-2 py-0.5 rounded-md">
            <Coins className="w-3 h-3" /> +{achievement.rewardCoins}
          </span>
        </div>
      </div>
    </div>
  );
};
