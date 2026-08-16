import { useState, useCallback, useEffect } from 'react';
import { GameState, GameStats, CarSkin, CAR_SKINS } from './types';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { MobileControls } from './components/MobileControls';
import { StartOverlay } from './components/StartOverlay';
import { GameOverOverlay } from './components/GameOverOverlay';
import { PauseOverlay } from './components/PauseOverlay';
import { ShopModal } from './components/ShopModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { soundEngine } from './utils/audio';
import { gameStorage } from './utils/storage';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [steeringInput, setSteeringInput] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getMuted());
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);

  // Load persistent profile from storage
  const [profile, setProfile] = useState(() => gameStorage.getProfile());
  const [totalCoins, setTotalCoins] = useState<number>(() => profile.totalCoins);
  const [unlockedCars, setUnlockedCars] = useState<string[]>(() => profile.unlockedCars);
  const [selectedCarId, setSelectedCarId] = useState<string>(() => profile.selectedCarId);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    bestScore: profile.bestScore,
    level: 1,
    lives: 3,
    shieldActive: false,
    shieldTimer: 0,
    slowActive: false,
    slowTimer: 0,
    sessionCoins: 0,
    totalCoins: profile.totalCoins,
    selectedCarId: profile.selectedCarId,
  });

  // Sync state whenever totalCoins or selectedCarId changes
  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      totalCoins,
      selectedCarId,
    }));
  }, [totalCoins, selectedCarId]);

  const handleStatsUpdate = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  const handleBuyCar = (car: CarSkin) => {
    if (totalCoins < car.price) return;
    const newTotal = totalCoins - car.price;
    const newUnlocked = [...unlockedCars, car.id];

    setTotalCoins(newTotal);
    setUnlockedCars(newUnlocked);
    setSelectedCarId(car.id);

    gameStorage.saveCoins(newTotal);
    gameStorage.saveUnlockedCars(newUnlocked);
    gameStorage.saveSelectedCar(car.id);

    soundEngine.playPurchase();
  };

  const handleSelectCar = (carId: string) => {
    setSelectedCarId(carId);
    gameStorage.saveSelectedCar(carId);
    soundEngine.playCoin();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-1.5 sm:p-3 font-mono select-none overflow-x-hidden">
      {/* App Outer Container */}
      <div className="w-full max-w-[460px] flex flex-col items-center justify-center my-auto">
        {/* Top Header & HUD */}
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-900 mb-1.5">
          <HUD
            stats={{ ...stats, totalCoins }}
            gameState={gameState}
            setGameState={setGameState}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            onOpenShop={() => setIsShopOpen(true)}
          />
        </div>

        {/* Game Canvas Container with Overlays */}
        <div className="relative w-full">
          <GameCanvas
            gameState={gameState}
            setGameState={setGameState}
            onStatsUpdate={handleStatsUpdate}
            steeringInput={steeringInput}
            selectedCarId={selectedCarId}
            totalCoins={totalCoins}
            setTotalCoins={setTotalCoins}
          />

          {/* Overlays */}
          {gameState === GameState.START && (
            <StartOverlay
              setGameState={setGameState}
              onOpenShop={() => setIsShopOpen(true)}
              totalCoins={totalCoins}
              selectedCarId={selectedCarId}
            />
          )}

          {gameState === GameState.GAMEOVER && (
            <GameOverOverlay
              stats={{ ...stats, totalCoins }}
              setGameState={setGameState}
              onOpenShop={() => setIsShopOpen(true)}
            />
          )}

          {gameState === GameState.PAUSED && (
            <PauseOverlay
              setGameState={setGameState}
              sessionCoins={stats.sessionCoins}
              totalCoins={totalCoins}
            />
          )}
        </div>

        {/* On-Screen Mobile Touch Controls */}
        <MobileControls
          onSteerChange={setSteeringInput}
          gameState={gameState}
          setGameState={setGameState}
          selectedCarId={selectedCarId}
        />

        {/* Garage & Shop Modal */}
        <ShopModal
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          totalCoins={totalCoins}
          unlockedCars={unlockedCars}
          selectedCarId={selectedCarId}
          onBuyCar={handleBuyCar}
          onSelectCar={handleSelectCar}
        />

        {/* Android PWA Installation Banner */}
        <PwaInstallBanner />
      </div>

      {/* Footer info */}
      <footer className="mt-3 text-[11px] text-neutral-500 font-sans text-center">
        Turbo Dodge Arcade • Progress Automatically Saved
      </footer>
    </div>
  );
}

