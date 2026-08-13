import React from 'react';
import { GameState, GameStats } from '../types';
import { RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface GameOverOverlayProps {
  stats: GameStats;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ stats, setGameState }) => {
  const isNewHigh = stats.score >= stats.bestScore && stats.score > 0;

  const handleRestart = () => {
    soundEngine.playStart();
    setGameState(GameState.PLAY);
  };

  const formatScore = (num: number) => String(num).padStart(5, '0');

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center font-mono select-none">
      <div className="w-full max-w-xs space-y-5">
        {/* Game Over Title */}
        <h2 className="text-4xl font-black text-red-500 tracking-wider drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
          GAME OVER
        </h2>

        {/* New Best Banner */}
        {isNewHigh && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>NEW BEST SCORE!</span>
          </div>
        )}

        {/* Score Breakdown Card */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-2xl">
          <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
            <span className="text-neutral-400">Score</span>
            <span className="text-xl font-bold text-white tracking-widest">
              {formatScore(stats.score)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-400 flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" /> Best
            </span>
            <span className="text-xl font-bold text-yellow-400 tracking-widest">
              {formatScore(stats.bestScore)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-neutral-400 pt-1">
            <span>Level Reached</span>
            <span className="text-neutral-200 font-bold">Lv {stats.level}</span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={handleRestart}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-neutral-950 font-black text-lg rounded-2xl shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>RESTART GAME</span>
        </button>
      </div>
    </div>
  );
};
