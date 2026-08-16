import React, { useState } from 'react';
import { CAR_SKINS, CarSkin } from '../types';
import { X, Check, Lock, Coins, Sparkles, Volume2, Music } from 'lucide-react';
import { VehicleSprite } from './VehicleSprite';
import { soundEngine } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCoins: number;
  unlockedCars: string[];
  selectedCarId: string;
  onBuyCar: (skin: CarSkin) => void;
  onSelectCar: (skinId: string) => void;
}

type FilterCategory = 'All' | 'Sport' | 'Formula' | 'Truck' | 'Muscle' | 'Supercar' | 'Special';

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  totalCoins,
  unlockedCars,
  selectedCarId,
  onBuyCar,
  onSelectCar,
}) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All');
  const [playingCarId, setPlayingCarId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: { id: FilterCategory; label: string; icon: string }[] = [
    { id: 'All', label: 'All Rides', icon: '🏁' },
    { id: 'Formula', label: 'F1 Formula', icon: '🏎️' },
    { id: 'Truck', label: 'Heavy Trucks', icon: '🚚' },
    { id: 'Supercar', label: 'Supercars', icon: '⚡' },
    { id: 'Muscle', label: 'V8 Muscle', icon: '🔥' },
    { id: 'Special', label: 'Hovercrafts', icon: '🚀' },
    { id: 'Sport', label: 'Classic Sport', icon: '🚗' },
  ];

  const handleTestSound = (carId: string) => {
    soundEngine.playCarSignature(carId);
    setPlayingCarId(carId);
    setTimeout(() => {
      setPlayingCarId((prev) => (prev === carId ? null : prev));
    }, 600);
  };

  const handleEquip = (carId: string) => {
    soundEngine.playCarSignature(carId);
    onSelectCar(carId);
  };

  const filteredCars = activeCategory === 'All'
    ? CAR_SKINS
    : CAR_SKINS.filter((c) => c.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-mono select-none">
      <div className="relative w-full max-w-2xl bg-neutral-900 border-2 border-neutral-700 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏎️</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wider flex items-center gap-1.5">
                GARAGE &amp; CUSTOM SOUNDS
              </h2>
              <p className="text-[11px] text-neutral-400">
                Each vehicle features custom synthesized engine roars, horns &amp; sound effects
              </p>
            </div>
          </div>

          {/* Coins Balance & Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-950/70 border border-yellow-500/50 rounded-xl shadow-[0_0_12px_rgba(234,179,8,0.25)]">
              <Coins className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-sm font-black text-yellow-300 tracking-wider">
                {totalCoins}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition active:scale-95"
              title="Close Garage"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-3 py-2 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const count = cat.id === 'All'
              ? CAR_SKINS.length
              : CAR_SKINS.filter((c) => c.category === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-yellow-400 text-neutral-950 shadow-md shadow-yellow-500/20'
                    : 'bg-neutral-800/70 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded ${isActive ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-900 text-neutral-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Car Catalog */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredCars.map((car) => {
              const isUnlocked = unlockedCars.includes(car.id);
              const isSelected = selectedCarId === car.id;
              const canAfford = totalCoins >= car.price;
              const isPlayingThisSound = playingCarId === car.id;

              return (
                <div
                  key={car.id}
                  className={`relative p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-neutral-800/95 to-neutral-900/95 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                      : isUnlocked
                      ? 'bg-neutral-900/80 border-neutral-700 hover:border-neutral-500'
                      : 'bg-neutral-950/70 border-neutral-800/80 opacity-90'
                  }`}
                >
                  {/* Top Badge & Name */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 uppercase tracking-wider">
                          {car.badge}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-semibold uppercase">
                          {car.chassisType.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white mt-1">{car.name}</h3>
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md animate-pulse">
                        <Check className="w-3 h-3" /> EQUIPPED
                      </span>
                    )}
                  </div>

                  {/* Visual Multi-Chassis Car Preview */}
                  <div className="relative w-full h-28 bg-neutral-950/90 rounded-xl border border-neutral-800/90 flex items-center justify-center overflow-hidden my-2 group">
                    {/* Road Markings in Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-15">
                      <div className="w-1 h-full bg-white border-dashed border-r border-neutral-500" />
                    </div>

                    {/* Ground Grid Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:12px_12px]" />

                    {/* Distinctive Vehicle Sprite */}
                    <VehicleSprite skin={car} size="md" animated={true} />

                    {/* Sound Test Overlay Chip */}
                    <button
                      onClick={() => handleTestSound(car.id)}
                      className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow-lg backdrop-blur-sm ${
                        isPlayingThisSound
                          ? 'bg-yellow-400 text-neutral-950 ring-2 ring-yellow-300 animate-bounce'
                          : 'bg-neutral-900/90 hover:bg-neutral-800 text-yellow-400 border border-yellow-500/40'
                      }`}
                      title="Test Car Sound Effect"
                    >
                      <Volume2 className={`w-3 h-3 ${isPlayingThisSound ? 'animate-spin' : ''}`} />
                      <span>{isPlayingThisSound ? 'PLAYING...' : 'TEST SOUND'}</span>
                    </button>
                  </div>

                  {/* Sound Profile Box */}
                  <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-lg p-2 mb-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-neutral-400 flex items-center gap-1">
                        <Music className="w-3 h-3 text-cyan-400" /> Engine:
                      </span>
                      <span className="text-neutral-200 font-semibold truncate max-w-[170px]">
                        {car.soundProfile.engineName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-neutral-400 flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-yellow-400" /> Horn / SFX:
                      </span>
                      <span className="text-yellow-400 font-semibold truncate max-w-[170px]">
                        {car.soundProfile.hornName}
                      </span>
                    </div>
                  </div>

                  {/* Lore & Description */}
                  <p className="text-[11px] text-neutral-400 mb-2 leading-relaxed">
                    {car.description}
                  </p>

                  {/* Special Handling Mechanics Badge */}
                  {car.handlingSpeed && (
                    <div className="mb-2.5 px-2 py-1 bg-red-950/40 border border-red-500/30 rounded-lg flex items-center justify-between text-[10px]">
                      <span className="text-red-400 font-bold">🏎️ F1 SPECS:</span>
                      <span className="text-red-200">
                        Steer: {car.handlingSpeed} m/s • Response: +{Math.round((car.responsiveness || 0.18) * 100)}% • Coins: +25%
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-auto space-y-1.5">
                    {isSelected ? (
                      <button
                        onClick={() => handleTestSound(car.id)}
                        className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>HONK / REV EQUIPPED CAR</span>
                      </button>
                    ) : isUnlocked ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleTestSound(car.id)}
                          className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-yellow-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95"
                          title="Preview Engine Sound"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEquip(car.id)}
                          className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-neutral-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-md shadow-cyan-500/20"
                        >
                          <span>EQUIP VEHICLE</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleTestSound(car.id)}
                          className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-yellow-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95"
                          title="Preview Engine Sound"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onBuyCar(car)}
                          disabled={!canAfford}
                          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                            canAfford
                              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-neutral-950 shadow-lg shadow-yellow-500/25 active:scale-95'
                              : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? (
                            <>
                              <Coins className="w-3.5 h-3.5" />
                              <span>UNLOCK ({car.price} 🪙)</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>{car.price} COINS ({car.price - totalCoins} MORE)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Tap &quot;TEST SOUND&quot; to hear unique engine roars &amp; horns</span>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition"
          >
            Close Showroom
          </button>
        </div>
      </div>
    </div>
  );
};

