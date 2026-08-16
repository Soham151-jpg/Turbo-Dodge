export interface PlayerProfile {
  totalCoins: number;
  bestScore: number;
  unlockedCars: string[];
  selectedCarId: string;
  gamesPlayed: number;
  totalCoinsCollected: number;
  cameraMode: 'chase' | 'hood' | 'retro';
}

const STORAGE_KEYS = {
  COINS: 'turbo_dodge_coins',
  BEST_SCORE: 'turbo_dodge_best_score',
  UNLOCKED_CARS: 'turbo_dodge_unlocked_cars',
  SELECTED_CAR: 'turbo_dodge_selected_car',
  GAMES_PLAYED: 'turbo_dodge_games_played',
  LIFETIME_COINS: 'turbo_dodge_lifetime_coins',
  CAMERA_MODE: 'turbo_dodge_camera_mode',
} as const;

const DEFAULT_PROFILE: PlayerProfile = {
  totalCoins: 0,
  bestScore: 0,
  unlockedCars: ['classic'],
  selectedCarId: 'classic',
  gamesPlayed: 0,
  totalCoinsCollected: 0,
  cameraMode: 'chase',
};

export const gameStorage = {
  getProfile(): PlayerProfile {
    try {
      const savedCoins = localStorage.getItem(STORAGE_KEYS.COINS);
      const savedBest = localStorage.getItem(STORAGE_KEYS.BEST_SCORE);
      const savedUnlocked = localStorage.getItem(STORAGE_KEYS.UNLOCKED_CARS);
      const savedCar = localStorage.getItem(STORAGE_KEYS.SELECTED_CAR);
      const savedGames = localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED);
      const savedLifetime = localStorage.getItem(STORAGE_KEYS.LIFETIME_COINS);
      const savedCam = localStorage.getItem(STORAGE_KEYS.CAMERA_MODE);

      let unlockedCars: string[] = DEFAULT_PROFILE.unlockedCars;
      if (savedUnlocked) {
        try {
          const parsed = JSON.parse(savedUnlocked);
          if (Array.isArray(parsed) && parsed.length > 0) {
            unlockedCars = parsed;
          }
        } catch {
          // ignore
        }
      }

      return {
        totalCoins: savedCoins ? Math.max(0, parseInt(savedCoins, 10) || 0) : DEFAULT_PROFILE.totalCoins,
        bestScore: savedBest ? Math.max(0, parseInt(savedBest, 10) || 0) : DEFAULT_PROFILE.bestScore,
        unlockedCars,
        selectedCarId: savedCar || DEFAULT_PROFILE.selectedCarId,
        gamesPlayed: savedGames ? parseInt(savedGames, 10) || 0 : DEFAULT_PROFILE.gamesPlayed,
        totalCoinsCollected: savedLifetime ? parseInt(savedLifetime, 10) || 0 : DEFAULT_PROFILE.totalCoinsCollected,
        cameraMode: (savedCam === 'hood' || savedCam === 'retro' || savedCam === 'chase') ? savedCam : DEFAULT_PROFILE.cameraMode,
      };
    } catch (e) {
      console.warn('LocalStorage unavailable, using fallback state:', e);
      return { ...DEFAULT_PROFILE };
    }
  },

  saveCoins(coins: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COINS, String(Math.max(0, Math.floor(coins))));
    } catch (e) {
      console.warn('Error saving coins to localStorage:', e);
    }
  },

  addCoins(amount: number): number {
    try {
      const profile = this.getProfile();
      const newTotal = profile.totalCoins + Math.max(0, amount);
      const newLifetime = profile.totalCoinsCollected + Math.max(0, amount);
      localStorage.setItem(STORAGE_KEYS.COINS, String(newTotal));
      localStorage.setItem(STORAGE_KEYS.LIFETIME_COINS, String(newLifetime));
      return newTotal;
    } catch {
      return 0;
    }
  },

  saveBestScore(score: number): number {
    try {
      const profile = this.getProfile();
      if (score > profile.bestScore) {
        localStorage.setItem(STORAGE_KEYS.BEST_SCORE, String(score));
        return score;
      }
      return profile.bestScore;
    } catch {
      return score;
    }
  },

  saveUnlockedCars(unlockedCars: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_CARS, JSON.stringify(unlockedCars));
    } catch (e) {
      console.warn('Error saving unlocked cars:', e);
    }
  },

  saveSelectedCar(carId: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_CAR, carId);
    } catch (e) {
      console.warn('Error saving selected car:', e);
    }
  },

  saveCameraMode(mode: 'chase' | 'hood' | 'retro'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMERA_MODE, mode);
    } catch (e) {
      console.warn('Error saving camera mode:', e);
    }
  },

  incrementGamesPlayed(): number {
    try {
      const profile = this.getProfile();
      const updated = profile.gamesPlayed + 1;
      localStorage.setItem(STORAGE_KEYS.GAMES_PLAYED, String(updated));
      return updated;
    } catch {
      return 1;
    }
  },
};
