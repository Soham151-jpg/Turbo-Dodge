import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { GameState } from '../types';

interface MobileControlsProps {
  onSteerChange: (dir: number) => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onSteerChange,
  gameState,
  setGameState,
}) => {
  const [activeSteer, setActiveSteer] = useState<number>(0);

  useEffect(() => {
    onSteerChange(activeSteer);
  }, [activeSteer, onSteerChange]);

  if (gameState === GameState.START || gameState === GameState.GAMEOVER) {
    return (
      <div className="w-full max-w-[480px] mx-auto mt-2 px-2">
        <button
          onClick={() => setGameState(GameState.PLAY)}
          className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-neutral-950 font-bold font-mono text-lg rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition transform active:scale-98"
        >
          <Play className="w-5 h-5 fill-current" />
          {gameState === GameState.GAMEOVER ? 'RESTART GAME' : 'START TURBO DODGE'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] mx-auto mt-3 px-2 flex items-center justify-between gap-3 select-none">
      {/* LEFT STEER BUTTON */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          setActiveSteer(-1);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          setActiveSteer(0);
        }}
        onMouseDown={() => setActiveSteer(-1)}
        onMouseUp={() => setActiveSteer(0)}
        onMouseLeave={() => setActiveSteer(0)}
        className={`flex-1 py-4 rounded-2xl border-2 font-mono font-bold text-lg flex items-center justify-center gap-2 transition active:scale-95 shadow-xl ${
          activeSteer === -1
            ? 'bg-cyan-500 border-cyan-300 text-neutral-950 shadow-cyan-500/30'
            : 'bg-neutral-900/90 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
        }`}
      >
        <ArrowLeft className="w-6 h-6 stroke-[3]" />
        <span>LEFT</span>
      </button>

      {/* RIGHT STEER BUTTON */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          setActiveSteer(1);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          setActiveSteer(0);
        }}
        onMouseDown={() => setActiveSteer(1)}
        onMouseUp={() => setActiveSteer(0)}
        onMouseLeave={() => setActiveSteer(0)}
        className={`flex-1 py-4 rounded-2xl border-2 font-mono font-bold text-lg flex items-center justify-center gap-2 transition active:scale-95 shadow-xl ${
          activeSteer === 1
            ? 'bg-cyan-500 border-cyan-300 text-neutral-950 shadow-cyan-500/30'
            : 'bg-neutral-900/90 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
        }`}
      >
        <span>RIGHT</span>
        <ArrowRight className="w-6 h-6 stroke-[3]" />
      </button>
    </div>
  );
};
