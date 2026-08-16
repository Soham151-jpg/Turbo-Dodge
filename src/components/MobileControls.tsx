import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Play, Volume2 } from 'lucide-react';
import { GameState, CAR_SKINS } from '../types';
import { soundEngine } from '../utils/audio';

interface MobileControlsProps {
  onSteerChange: (dir: number) => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  selectedCarId?: string;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onSteerChange,
  gameState,
  setGameState,
  selectedCarId = 'classic',
}) => {
  const [activeSteer, setActiveSteer] = useState<number>(0);
  const [isHonking, setIsHonking] = useState<boolean>(false);

  useEffect(() => {
    onSteerChange(activeSteer);
  }, [activeSteer, onSteerChange]);

  const handleHonk = () => {
    soundEngine.playCarHorn(selectedCarId);
    setIsHonking(true);
    setTimeout(() => setIsHonking(false), 300);
  };

  const currentSkin = CAR_SKINS.find((c) => c.id === selectedCarId) || CAR_SKINS[0];

  if (gameState === GameState.START || gameState === GameState.GAMEOVER) {
    return null;
  }

  return (
    <div className="w-full max-w-[480px] mx-auto mt-3 px-2 flex items-center justify-between gap-2.5 select-none touch-none">
      {/* LEFT STEER BUTTON */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setActiveSteer(-1);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
          setActiveSteer(0);
        }}
        onPointerCancel={() => setActiveSteer(0)}
        onPointerLeave={() => setActiveSteer(0)}
        className={`flex-1 py-4 rounded-2xl border-2 font-mono font-bold text-base sm:text-lg flex items-center justify-center gap-1.5 transition select-none touch-none active:scale-95 shadow-xl ${
          activeSteer === -1
            ? 'bg-cyan-500 border-cyan-300 text-neutral-950 shadow-cyan-500/30'
            : 'bg-neutral-900/90 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
        }`}
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
        <span>LEFT</span>
      </button>

      {/* HORN / REV BUTTON */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          handleHonk();
        }}
        className={`px-4 py-4 rounded-2xl border-2 font-mono font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 transition select-none touch-none active:scale-90 shadow-xl ${
          isHonking
            ? 'bg-yellow-400 border-yellow-300 text-neutral-950 shadow-yellow-500/40'
            : 'bg-neutral-900/90 border-yellow-500/40 text-yellow-400 hover:bg-neutral-800'
        }`}
        title={`Honk / Rev ${currentSkin.name}`}
      >
        <Volume2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isHonking ? 'animate-bounce' : ''}`} />
        <span className="text-[10px] tracking-tight whitespace-nowrap">HONK</span>
      </button>

      {/* RIGHT STEER BUTTON */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setActiveSteer(1);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
          setActiveSteer(0);
        }}
        onPointerCancel={() => setActiveSteer(0)}
        onPointerLeave={() => setActiveSteer(0)}
        className={`flex-1 py-4 rounded-2xl border-2 font-mono font-bold text-base sm:text-lg flex items-center justify-center gap-1.5 transition select-none touch-none active:scale-95 shadow-xl ${
          activeSteer === 1
            ? 'bg-cyan-500 border-cyan-300 text-neutral-950 shadow-cyan-500/30'
            : 'bg-neutral-900/90 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
        }`}
      >
        <span>RIGHT</span>
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
      </button>
    </div>
  );
};

