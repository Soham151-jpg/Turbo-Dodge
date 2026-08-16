import React from 'react';
import { GameStats, GameState, POWERUPS } from '../types';
import { Volume2, VolumeX, Pause, Play, Heart, Coins, ShoppingBag, Trophy } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HUDProps {
  stats: GameStats;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onOpenShop: () => void;
  onOpenAchievements: () => void;
  unclaimedAchievementsCount?: number;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  gameState,
  setGameState,
  isMuted,
  setIsMuted,
  onOpenShop,
  onOpenAchievements,
  unclaimedAchievementsCount = 0,
}) => {
  const toggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const togglePause = () => {
    if (gameState === GameState.PLAY) {
      setGameState(GameState.PAUSED);
    } else if (gameState === GameState.PAUSED) {
      setGameState(GameState.PLAY);
    }
  };

  const formatScore = (num: number) => String(num).padStart(5, '0');

  const shieldPct = Math.round((stats.shieldTimer / POWERUPS.shield.duration) * 100);
  const slowPct = Math.round((stats.slowTimer / POWERUPS.slow.duration) * 100);

  return (
    <div className="w-full bg-neutral-950/90 backdrop-blur border-b border-neutral-800 px-3 py-2 text-white font-mono flex items-center justify-between shadow-lg">
      {/* Score & Coins */}
      <div className="flex flex-col">
        <span className="text-sm sm:text-base font-bold text-white tracking-wider">
          Score <span className="text-yellow-400">{formatScore(stats.score)}</span>
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">
            Best <span className="text-neutral-200">{formatScore(stats.bestScore)}</span>
          </span>
          <span className="flex items-center gap-1 text-yellow-300 font-bold bg-yellow-950/60 border border-yellow-500/30 px-1.5 py-0.2 rounded-md">
            <Coins className="w-3 h-3 text-yellow-400" />
            <span>{stats.totalCoins || 0}</span>
          </span>
        </div>
      </div>

      {/* Level & Power-up Status */}
      <div className="flex flex-col items-center">
        <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs sm:text-sm font-bold px-2 py-0.5 rounded-md">
          Lv {stats.level}
        </div>
        <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs">
          {stats.shieldActive && (
            <span className="text-cyan-400 font-bold bg-cyan-950/80 border border-cyan-800/80 px-1.5 rounded animate-pulse">
              🛡️ {shieldPct}%
            </span>
          )}
          {stats.slowActive && (
            <span className="text-orange-400 font-bold bg-orange-950/80 border border-orange-800/80 px-1.5 rounded animate-pulse">
              ⏱️ {slowPct}%
            </span>
          )}
        </div>
      </div>

      {/* Health Hearts, Achievements, Shop & Quick Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-0.5 mr-0.5">
          {[0, 1, 2].map((idx) => (
            <Heart
              key={idx}
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                idx < stats.lives
                  ? 'text-red-500 fill-red-500 scale-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                  : 'text-neutral-700 fill-neutral-800 scale-90'
              }`}
            />
          ))}
        </div>

        {/* Achievements Button */}
        <button
          onClick={onOpenAchievements}
          className="relative p-1.5 rounded-lg bg-neutral-900 border border-amber-500/40 hover:border-amber-400 text-yellow-400 hover:text-yellow-300 transition active:scale-95 flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.15)] cursor-pointer"
          title="Open Achievements & Lifetime Stats"
        >
          <Trophy className="w-4 h-4" />
          {unclaimedAchievementsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-neutral-950 animate-ping" />
          )}
        </button>

        {/* Garage / Shop Button */}
        <button
          onClick={onOpenShop}
          className="p-1.5 rounded-lg bg-neutral-900 border border-yellow-500/40 hover:border-yellow-400 text-yellow-400 hover:text-yellow-300 transition active:scale-95 flex items-center gap-1 shadow-[0_0_8px_rgba(234,179,8,0.15)] cursor-pointer"
          title="Open Car Garage & Shop"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleMute}
          className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Pause Button */}
        {gameState === GameState.PLAY || gameState === GameState.PAUSED ? (
          <button
            onClick={togglePause}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-yellow-400 hover:text-yellow-300 transition active:scale-95 cursor-pointer"
            title="Pause Game"
          >
            {gameState === GameState.PAUSED ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        ) : null}
      </div>
    </div>
  );
};
