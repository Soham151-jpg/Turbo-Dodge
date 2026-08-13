import React from 'react';
import { GameState } from '../types';
import { Play } from 'lucide-react';

interface PauseOverlayProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ setGameState }) => {
  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center font-mono select-none">
      <div className="max-w-xs space-y-4">
        <h2 className="text-4xl font-black text-yellow-400 tracking-widest drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]">
          PAUSED
        </h2>
        <p className="text-sm text-neutral-300">
          Press <span className="text-yellow-400 font-bold">SPACE</span> or tap below to resume
        </p>
        <button
          onClick={() => setGameState(GameState.PLAY)}
          className="mt-2 px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold text-base rounded-xl shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>RESUME</span>
        </button>
      </div>
    </div>
  );
};
