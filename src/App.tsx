import { useState, useCallback } from 'react';
import { GameState, GameStats } from './types';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { MobileControls } from './components/MobileControls';
import { StartOverlay } from './components/StartOverlay';
import { GameOverOverlay } from './components/GameOverOverlay';
import { PauseOverlay } from './components/PauseOverlay';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { soundEngine } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [steeringInput, setSteeringInput] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getMuted());

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    bestScore: 0,
    level: 1,
    lives: 3,
    shieldActive: false,
    shieldTimer: 0,
    slowActive: false,
    slowTimer: 0,
  });

  const handleStatsUpdate = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-between p-2 sm:p-4 font-mono select-none overflow-x-hidden">
      {/* App Outer Container */}
      <div className="w-full max-w-[480px] flex flex-col items-center flex-1 justify-center">
        {/* Top Header & HUD */}
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-900 mb-2">
          <HUD
            stats={stats}
            gameState={gameState}
            setGameState={setGameState}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        </div>

        {/* Game Canvas Container with Overlays */}
        <div className="relative w-full">
          <GameCanvas
            gameState={gameState}
            setGameState={setGameState}
            onStatsUpdate={handleStatsUpdate}
            steeringInput={steeringInput}
          />

          {/* Overlays */}
          {gameState === GameState.START && (
            <StartOverlay setGameState={setGameState} />
          )}

          {gameState === GameState.GAMEOVER && (
            <GameOverOverlay stats={stats} setGameState={setGameState} />
          )}

          {gameState === GameState.PAUSED && (
            <PauseOverlay setGameState={setGameState} />
          )}
        </div>

        {/* On-Screen Mobile Touch Controls */}
        <MobileControls
          onSteerChange={setSteeringInput}
          gameState={gameState}
          setGameState={setGameState}
        />

        {/* Android PWA Installation Banner */}
        <PwaInstallBanner />
      </div>

      {/* Footer info */}
      <footer className="mt-3 text-[11px] text-neutral-500 font-sans text-center">
        Turbo Dodge Arcade • Built for Web &amp; Mobile
      </footer>
    </div>
  );
}
