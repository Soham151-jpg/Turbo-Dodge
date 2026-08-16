import React from 'react';
import { GameState, GameStats, CAR_SKINS } from '../types';
import { RotateCcw, Trophy, Sparkles, Coins, ShoppingBag } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { VehicleSprite } from './VehicleSprite';

interface GameOverOverlayProps {
  stats: GameStats;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onOpenShop: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  stats,
  setGameState,
  onOpenShop,
}) => {
  const isNewHigh = stats.score >= stats.bestScore && stats.score > 0;
  const equippedCar = CAR_SKINS.find((c) => c.id === stats.selectedCarId) || CAR_SKINS[0];

  const handleRestart = () => {
    soundEngine.playStart();
    setGameState(GameState.PLAY);
  };

  const formatScore = (num: number) => String(num).padStart(5, '0');

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col items-center justify-center p-4 text-center font-mono select-none overflow-y-auto">
      <div className="w-full max-w-xs space-y-3 my-auto">
        {/* Game Over Title */}
        <h2 className="text-3xl sm:text-4xl font-black text-red-500 tracking-wider drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
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
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5 space-y-2 shadow-2xl">
          <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-1.5">
            <span className="text-neutral-400">Score</span>
            <span className="text-xl font-bold text-white tracking-widest">
              {formatScore(stats.score)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-1.5">
            <span className="text-neutral-400 flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" /> Best
            </span>
            <span className="text-xl font-bold text-yellow-400 tracking-widest">
              {formatScore(stats.bestScore)}
            </span>
          </div>

          {/* Coins Earned */}
          <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-1.5">
            <span className="text-yellow-400 flex items-center gap-1">
              <Coins className="w-4 h-4" /> Coins Picked
            </span>
            <span className="text-base font-bold text-yellow-300">
              +{stats.sessionCoins || 0} 🪙
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-neutral-400 pt-0.5">
            <span>Total Bank</span>
            <span className="text-neutral-200 font-bold">{stats.totalCoins || 0} Coins</span>
          </div>
        </div>

        {/* Equipped Vehicle Showcase */}
        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-2 flex items-center justify-between px-3">
          <div className="text-left flex items-center gap-2">
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Raced with</span>
              <span className="text-xs font-black text-white">{equippedCar.name}</span>
            </div>
            <button
              onClick={() => soundEngine.playCarSignature(equippedCar.id)}
              className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-yellow-400 border border-yellow-500/30 text-[10px] font-bold flex items-center gap-0.5 transition active:scale-95"
              title="Play Engine Sound"
            >
              <span>🔊</span>
            </button>
          </div>
          <div className="scale-75 origin-right">
            <VehicleSprite skin={equippedCar} size="sm" />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleRestart}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-neutral-950 font-black text-base rounded-2xl shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>PLAY AGAIN</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setGameState(GameState.START)}
              className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
            >
              <span>MAIN MENU</span>
            </button>
            <button
              onClick={onOpenShop}
              className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-yellow-400 border border-yellow-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>GARAGE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

