import React from 'react';
import { GameState } from '../types';
import { Play, Shield, Timer, Keyboard, Smartphone } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface StartOverlayProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({ setGameState }) => {
  const handleStart = () => {
    soundEngine.playStart();
    setGameState(GameState.PLAY);
  };

  return (
    <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md z-20 flex flex-col items-center justify-between p-6 text-center select-none font-mono">
      {/* Title Header */}
      <div className="mt-4 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold mb-3 tracking-widest uppercase">
          Retro Arcade Racer
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
          TURBO
        </h1>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-white drop-shadow-md">
          DODGE
        </h2>
      </div>

      {/* Hero Visual & Instructions */}
      <div className="my-auto flex flex-col items-center max-w-xs space-y-4">
        {/* Animated Pixel Car graphic */}
        <div className="relative w-16 h-28 bg-emerald-500 rounded-xl border-2 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex flex-col items-center justify-between p-2 animate-bounce">
          {/* Windshield */}
          <div className="w-10 h-6 bg-neutral-100 rounded-md border border-neutral-300" />
          {/* Headlights */}
          <div className="flex justify-between w-full px-1">
            <div className="w-2.5 h-1.5 bg-yellow-300 rounded-sm" />
            <div className="w-2.5 h-1.5 bg-yellow-300 rounded-sm" />
          </div>
        </div>

        {/* Features badges */}
        <div className="grid grid-cols-2 gap-2 w-full text-xs text-neutral-300">
          <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-1.5 justify-center">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Shield (S)</span>
          </div>
          <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-1.5 justify-center">
            <Timer className="w-4 h-4 text-orange-400" />
            <span>Slow-Mo (T)</span>
          </div>
        </div>

        <div className="text-xs text-neutral-400 space-y-1">
          <p className="flex items-center justify-center gap-1 text-neutral-300">
            <Keyboard className="w-3.5 h-3.5 text-yellow-400" />
            <span>Desktop: Arrow Keys / A-D / Enter</span>
          </p>
          <p className="flex items-center justify-center gap-1 text-neutral-300">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mobile: Left/Right On-Screen Buttons</span>
          </p>
        </div>
      </div>

      {/* Start Button */}
      <div className="w-full mb-2">
        <button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 active:scale-98 text-neutral-950 font-black text-xl rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>PRESS ENTER TO START</span>
        </button>
      </div>
    </div>
  );
};
