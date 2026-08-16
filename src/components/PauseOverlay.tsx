import React from 'react';
import { GameState } from '../types';
import { Play, Home, Coins } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PauseOverlayProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  sessionCoins?: number;
  totalCoins?: number;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  setGameState,
  sessionCoins = 0,
  totalCoins = 0,
}) => {
  const handleQuit = () => {
    soundEngine.stopEngine();
    setGameState(GameState.START);
  };

  const handleResume = () => {
    soundEngine.startEngine();
    setGameState(GameState.PLAY);
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center font-mono select-none">
      <div className="w-full max-w-xs space-y-3.5 bg-neutral-900/90 p-5 rounded-2xl border border-neutral-800 shadow-2xl">
        <h2 className="text-3xl font-black text-yellow-400 tracking-widest drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]">
          PAUSED
        </h2>

        {/* Coins indicator */}
        <div className="py-2 px-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-400">Coins Saved:</span>
          <span className="flex items-center gap-1 text-yellow-400 font-bold">
            <Coins className="w-3.5 h-3.5" />
            <span>{totalCoins} (+{sessionCoins} this run)</span>
          </span>
        </div>

        <p className="text-xs text-neutral-400">
          Press <span className="text-yellow-400 font-bold">SPACE</span> or tap below to resume
        </p>

        <div className="space-y-2 pt-1">
          <button
            onClick={handleResume}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-neutral-950 font-bold text-sm rounded-xl shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME RACE</span>
          </button>

          <button
            onClick={handleQuit}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs rounded-xl border border-neutral-700 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>SAVE &amp; QUIT TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};

