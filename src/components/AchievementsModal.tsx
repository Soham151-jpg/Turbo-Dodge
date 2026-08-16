import React, { useState } from 'react';
import { PlayerProfile, ACHIEVEMENTS, Achievement } from '../types';
import { gameStorage } from '../utils/storage';
import { soundEngine } from '../utils/audio';
import {
  Trophy,
  X,
  CheckCircle2,
  Lock,
  Coins,
  Sparkles,
  Flame,
  Shield,
  Timer,
  Car,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onProfileUpdate: (updatedProfile: PlayerProfile) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const getProgress = (ach: Achievement): { current: number; max: number; pct: number } => {
    let current = 0;
    switch (ach.id) {
      case 'first_race':
      case 'veteran_racer':
        current = profile.gamesPlayed;
        break;
      case 'coins_50':
      case 'coins_200':
        current = profile.lifetimeCoins;
        break;
      case 'score_1000':
      case 'score_3000':
      case 'score_5000':
        current = profile.bestScore;
        break;
      case 'near_miss_25':
        current = profile.totalNearMisses;
        break;
      case 'shields_10':
        current = profile.totalShieldsCollected;
        break;
      case 'slows_10':
        current = profile.totalSlowsCollected;
        break;
      case 'cars_3':
      case 'cars_6':
        current = profile.unlockedCars.length;
        break;
      default:
        current = 0;
    }
    const max = ach.target;
    const pct = Math.min(100, Math.floor((current / max) * 100));
    return { current, max, pct };
  };

  const handleClaim = (achId: string) => {
    const res = gameStorage.claimAchievement(achId);
    if (res.success) {
      soundEngine.playPurchase();
      const updated = gameStorage.getProfile();
      onProfileUpdate(updated);
    }
  };

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    const fresh = gameStorage.resetProgress();
    onProfileUpdate(fresh);
    setResetConfirm(false);
    soundEngine.playCoin();
  };

  const filteredAchievements = ACHIEVEMENTS.filter((ach) => {
    const isUnlocked = profile.unlockedAchievements.includes(ach.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  const unlockedCount = profile.unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const totalClaimable = ACHIEVEMENTS.filter(
    (a) => profile.unlockedAchievements.includes(a.id) && !profile.claimedAchievements.includes(a.id)
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none font-mono">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-yellow-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                <span>ACHIEVEMENTS &amp; STATS</span>
                {totalClaimable > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-yellow-400 text-neutral-950 text-[10px] font-bold animate-pulse">
                    {totalClaimable} CLAIMABLE!
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Unlocked: <span className="text-yellow-400 font-bold">{unlockedCount}</span> / {totalCount} completed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lifetime Stats Strip */}
        <div className="px-4 py-2.5 bg-neutral-950/50 border-b border-neutral-800/80 grid grid-cols-4 gap-1 text-center text-[10px]">
          <div className="bg-neutral-900/90 rounded-lg p-1.5 border border-neutral-800">
            <div className="text-neutral-400">Races</div>
            <div className="text-xs font-bold text-white">{profile.gamesPlayed}</div>
          </div>
          <div className="bg-neutral-900/90 rounded-lg p-1.5 border border-neutral-800">
            <div className="text-neutral-400">Best Score</div>
            <div className="text-xs font-bold text-yellow-400">{profile.bestScore}</div>
          </div>
          <div className="bg-neutral-900/90 rounded-lg p-1.5 border border-neutral-800">
            <div className="text-neutral-400">Lifetime Coins</div>
            <div className="text-xs font-bold text-yellow-300">{profile.lifetimeCoins}</div>
          </div>
          <div className="bg-neutral-900/90 rounded-lg p-1.5 border border-neutral-800">
            <div className="text-neutral-400">Near Misses</div>
            <div className="text-xs font-bold text-cyan-400">{profile.totalNearMisses}</div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex gap-1.5">
            {(['all', 'unlocked', 'locked'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                  filter === tab
                    ? 'bg-yellow-500 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-bold">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400">{profile.totalCoins}</span>
          </span>
        </div>

        {/* Achievement List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[50vh]">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No achievements found under this filter.
            </div>
          ) : (
            filteredAchievements.map((ach) => {
              const isUnlocked = profile.unlockedAchievements.includes(ach.id);
              const isClaimed = profile.claimedAchievements.includes(ach.id);
              const { current, max, pct } = getProgress(ach);

              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isUnlocked
                      ? 'bg-neutral-950/80 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                      : 'bg-neutral-950/40 border-neutral-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {/* Icon */}
                      <div
                        className={`text-xl p-2 rounded-xl shrink-0 flex items-center justify-center ${
                          isUnlocked
                            ? 'bg-amber-500/20 border border-amber-500/40'
                            : 'bg-neutral-800 border border-neutral-700 grayscale'
                        }`}
                      >
                        <span>{ach.icon}</span>
                      </div>

                      {/* Info & Progress */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                            {ach.title}
                          </h3>
                          {isUnlocked && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                          {ach.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-2 w-full">
                          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                            <span>Progress</span>
                            <span className="font-bold text-neutral-300">
                              {current} / {max} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isUnlocked ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-neutral-600'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reward / Action */}
                    <div className="flex flex-col items-end shrink-0 pl-1">
                      {isUnlocked && !isClaimed ? (
                        <button
                          onClick={() => handleClaim(ach.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-neutral-950 text-[11px] font-black flex items-center gap-1 shadow-md animate-bounce cursor-pointer active:scale-95"
                        >
                          <Coins className="w-3 h-3" />
                          <span>CLAIM +{ach.rewardCoins}</span>
                        </button>
                      ) : isClaimed ? (
                        <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950/60 border border-emerald-800 rounded-md">
                          CLAIMED ✓
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500 px-2 py-0.5 bg-neutral-800/80 rounded-md">
                          <Lock className="w-3 h-3" />
                          <span>+{ach.rewardCoins} 🪙</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Storage Notice & Reset */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-1 text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Progress automatically saved permanently</span>
          </div>

          <button
            onClick={handleReset}
            className={`text-[10px] font-bold px-2 py-1 rounded transition cursor-pointer ${
              resetConfirm
                ? 'bg-red-600 text-white animate-pulse'
                : 'text-neutral-500 hover:text-red-400'
            }`}
          >
            {resetConfirm ? 'CONFIRM RESET DATA?' : 'Reset All Progress'}
          </button>
        </div>
      </div>
    </div>
  );
};
