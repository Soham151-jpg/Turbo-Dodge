import React from 'react';
import { GameState, CAR_SKINS } from '../types';
import { Play, Shield, Timer, Keyboard, ShoppingBag, Coins, Trophy } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { gameStorage } from '../utils/storage';
import { VehicleSprite } from './VehicleSprite';

interface StartOverlayProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onOpenShop: () => void;
  totalCoins: number;
  selectedCarId: string;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({
  setGameState,
  onOpenShop,
  totalCoins,
  selectedCarId,
}) => {
  const profile = gameStorage.getProfile();
  const handleStart = () => {
    soundEngine.playStart();
    setGameState(GameState.PLAY);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const equippedCar = CAR_SKINS.find((c) => c.id === selectedCarId) || CAR_SKINS[0];

  return (
    <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-3 text-center select-none font-mono overflow-y-auto">
      <div className="w-full max-w-[340px] flex flex-col items-center gap-2.5 my-auto">
        {/* Title Header */}
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold mb-1 tracking-widest uppercase">
            Retro Arcade Racer
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
              TURBO
            </span>
            <span className="text-2xl font-extrabold tracking-widest text-white drop-shadow-md">
              DODGE
            </span>
          </div>
        </div>

        {/* Hero Car Card */}
        <div className="relative p-2.5 bg-neutral-900/95 rounded-xl border border-neutral-800 w-full flex flex-col items-center shadow-xl">
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase tracking-wide truncate max-w-[180px]">
              {equippedCar.badge} • {equippedCar.name}
            </span>
            <div className="flex items-center gap-1 text-xs font-black text-yellow-400 shrink-0">
              <Coins className="w-3.5 h-3.5" />
              <span>{totalCoins}</span>
            </div>
          </div>

          {/* Rendered Vehicle Sprite */}
          <div className="py-1 flex items-center justify-center">
            <VehicleSprite skin={equippedCar} size="md" animated={true} />
          </div>

          {/* Quick Buttons: Sound test & Garage */}
          <div className="mt-1 w-full flex gap-1.5">
            <button
              onClick={() => soundEngine.playCarSignature(equippedCar.id)}
              className="py-1.5 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-yellow-500/30 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95 shadow-md"
              title={`Test ${equippedCar.name} Sound Effect`}
            >
              <span>🔊</span>
              <span>REV</span>
            </button>
            <button
              onClick={onOpenShop}
              className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-yellow-400 hover:text-yellow-300 border border-yellow-500/30 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>GARAGE &amp; SHOP</span>
            </button>
          </div>
        </div>

        {/* High Score & Bank Pill */}
        <div className="w-full grid grid-cols-2 gap-2 text-xs">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Best
            </span>
            <span className="font-bold text-yellow-400">{profile.bestScore}</span>
          </div>
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
              <Coins className="w-3.5 h-3.5 text-yellow-400" /> Bank
            </span>
            <span className="font-bold text-white">{totalCoins}</span>
          </div>
        </div>

        {/* PRIMARY START BUTTON - Centered & Prominent */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 active:scale-95 text-neutral-950 font-black text-base rounded-xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START RACE (ENTER / SPACE)</span>
        </button>

        {/* Controls & Powerups mini footer */}
        <div className="grid grid-cols-2 gap-1.5 w-full text-[10px] text-neutral-300">
          <div className="py-1 px-2 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center gap-1 justify-center">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>Shield (S)</span>
          </div>
          <div className="py-1 px-2 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center gap-1 justify-center">
            <Timer className="w-3 h-3 text-orange-400" />
            <span>Slow-Mo (T)</span>
          </div>
        </div>

        <p className="flex items-center justify-center gap-1 text-[11px] text-neutral-400">
          <Keyboard className="w-3.5 h-3.5 text-yellow-400" />
          <span>Steer: Arrow Keys or A / D</span>
        </p>
      </div>
    </div>
  );
};


