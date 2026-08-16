import { PlayerProfile, ACHIEVEMENTS } from '../types';

export const SAVE_STORAGE_KEY = 'turbo_dodge_save_v3';

// Legacy keys for automatic migration & fallback dual-writing
const LEGACY_KEYS = {
  COINS: 'turbo_dodge_coins',
  BEST_SCORE: 'turbo_dodge_best_score',
  UNLOCKED_CARS: 'turbo_dodge_unlocked_cars',
  SELECTED_CAR: 'turbo_dodge_selected_car',
  GAMES_PLAYED: 'turbo_dodge_games_played',
  LIFETIME_COINS: 'turbo_dodge_lifetime_coins',
  CAMERA_MODE: 'turbo_dodge_camera_mode',
  MUTED: 'turbo_dodge_muted',
} as const;

export const DEFAULT_PROFILE: PlayerProfile = {
  totalCoins: 0,
  lifetimeCoins: 0,
  bestScore: 0,
  gamesPlayed: 0,
  totalNearMisses: 0,
  totalShieldsCollected: 0,
  totalSlowsCollected: 0,
  unlockedCars: ['classic'],
  selectedCarId: 'classic',
  unlockedAchievements: [],
  claimedAchievements: [],
  cameraMode: 'chase',
  audioMuted: false,
  lastSaved: Date.now(),
};

// In-Memory active working cache to prevent any read/write lag or iframe quota loss
let inMemoryProfile: PlayerProfile | null = null;

// Safe localStorage accessor wrapper
function safeStorageGet(key: string): string | null {
  try {
    return typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(key)
      : null;
  } catch (e) {
    console.warn(`Storage get error for key ${key}:`, e);
    return null;
  }
}

function safeStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(`Storage set error for key ${key}:`, e);
  }
}

class GameStorageManager {
  constructor() {
    this.init();
    this.setupAutoSaveHooks();
  }

  private init(): void {
    if (!inMemoryProfile) {
      inMemoryProfile = this.loadFromDisk();
    }
  }

  private setupAutoSaveHooks(): void {
    if (typeof window === 'undefined') return;

    // Immediately flush in-memory data on window blur, visibility change, beforeunload, pagehide
    const flushSave = () => {
      if (inMemoryProfile) {
        this.writeToDisk(inMemoryProfile);
      }
    };

    window.addEventListener('beforeunload', flushSave);
    window.addEventListener('pagehide', flushSave);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushSave();
      }
    });
  }

  private loadFromDisk(): PlayerProfile {
    try {
      // 1. Try primary unified JSON store (v3)
      const rawV3 = safeStorageGet(SAVE_STORAGE_KEY);
      if (rawV3) {
        const parsed = JSON.parse(rawV3);
        if (parsed && typeof parsed === 'object') {
          return this.sanitizeProfile({
            ...DEFAULT_PROFILE,
            ...parsed,
          });
        }
      }

      // 2. Try migration from legacy individual keys
      const savedCoins = safeStorageGet(LEGACY_KEYS.COINS);
      const savedBest = safeStorageGet(LEGACY_KEYS.BEST_SCORE);
      const savedUnlocked = safeStorageGet(LEGACY_KEYS.UNLOCKED_CARS);
      const savedCar = safeStorageGet(LEGACY_KEYS.SELECTED_CAR);
      const savedGames = safeStorageGet(LEGACY_KEYS.GAMES_PLAYED);
      const savedLifetime = safeStorageGet(LEGACY_KEYS.LIFETIME_COINS);
      const savedCam = safeStorageGet(LEGACY_KEYS.CAMERA_MODE);
      const savedMute = safeStorageGet(LEGACY_KEYS.MUTED);

      let unlockedCars: string[] = DEFAULT_PROFILE.unlockedCars;
      if (savedUnlocked) {
        try {
          const parsed = JSON.parse(savedUnlocked);
          if (Array.isArray(parsed) && parsed.length > 0) {
            unlockedCars = parsed;
          }
        } catch {}
      }

      const coins = savedCoins ? Math.max(0, parseInt(savedCoins, 10) || 0) : DEFAULT_PROFILE.totalCoins;
      const lifetime = savedLifetime ? Math.max(coins, parseInt(savedLifetime, 10) || 0) : coins;
      const best = savedBest ? Math.max(0, parseInt(savedBest, 10) || 0) : DEFAULT_PROFILE.bestScore;
      const games = savedGames ? parseInt(savedGames, 10) || 0 : DEFAULT_PROFILE.gamesPlayed;

      const profile: PlayerProfile = {
        totalCoins: coins,
        lifetimeCoins: lifetime,
        bestScore: best,
        gamesPlayed: games,
        totalNearMisses: 0,
        totalShieldsCollected: 0,
        totalSlowsCollected: 0,
        unlockedCars,
        selectedCarId: savedCar || DEFAULT_PROFILE.selectedCarId,
        unlockedAchievements: [],
        claimedAchievements: [],
        cameraMode: (savedCam === 'hood' || savedCam === 'retro' || savedCam === 'chase') ? savedCam : DEFAULT_PROFILE.cameraMode,
        audioMuted: savedMute === 'true',
        lastSaved: Date.now(),
      };

      // Perform initial check on achievements for legacy users
      this.evaluateAchievements(profile);

      // Save migrated data to primary v3 store immediately
      this.writeToDisk(profile);

      return profile;
    } catch (e) {
      console.warn('Failed to load profile from disk, fallback to default:', e);
      return { ...DEFAULT_PROFILE };
    }
  }

  private sanitizeProfile(data: Partial<PlayerProfile>): PlayerProfile {
    const unlocked = Array.isArray(data.unlockedCars) && data.unlockedCars.length > 0
      ? Array.from(new Set(['classic', ...data.unlockedCars]))
      : ['classic'];

    const totalCoins = typeof data.totalCoins === 'number' && !isNaN(data.totalCoins)
      ? Math.max(0, Math.floor(data.totalCoins))
      : 0;

    const lifetimeCoins = typeof data.lifetimeCoins === 'number' && !isNaN(data.lifetimeCoins)
      ? Math.max(totalCoins, Math.floor(data.lifetimeCoins))
      : totalCoins;

    const bestScore = typeof data.bestScore === 'number' && !isNaN(data.bestScore)
      ? Math.max(0, Math.floor(data.bestScore))
      : 0;

    const gamesPlayed = typeof data.gamesPlayed === 'number' && !isNaN(data.gamesPlayed)
      ? Math.max(0, Math.floor(data.gamesPlayed))
      : 0;

    const cameraMode = (data.cameraMode === 'hood' || data.cameraMode === 'retro' || data.cameraMode === 'chase')
      ? data.cameraMode
      : 'chase';

    const unlockedAchievements = Array.isArray(data.unlockedAchievements)
      ? Array.from(new Set(data.unlockedAchievements))
      : [];

    const claimedAchievements = Array.isArray(data.claimedAchievements)
      ? Array.from(new Set(data.claimedAchievements))
      : [];

    return {
      totalCoins,
      lifetimeCoins,
      bestScore,
      gamesPlayed,
      totalNearMisses: Math.max(0, data.totalNearMisses || 0),
      totalShieldsCollected: Math.max(0, data.totalShieldsCollected || 0),
      totalSlowsCollected: Math.max(0, data.totalSlowsCollected || 0),
      unlockedCars: unlocked,
      selectedCarId: data.selectedCarId && unlocked.includes(data.selectedCarId) ? data.selectedCarId : 'classic',
      unlockedAchievements,
      claimedAchievements,
      cameraMode,
      audioMuted: Boolean(data.audioMuted),
      lastSaved: Date.now(),
    };
  }

  private writeToDisk(profile: PlayerProfile): void {
    try {
      profile.lastSaved = Date.now();
      const jsonStr = JSON.stringify(profile);

      // Primary v3 Store
      safeStorageSet(SAVE_STORAGE_KEY, jsonStr);

      // Fallback dual-write for legacy key compatibility
      safeStorageSet(LEGACY_KEYS.COINS, String(profile.totalCoins));
      safeStorageSet(LEGACY_KEYS.LIFETIME_COINS, String(profile.lifetimeCoins));
      safeStorageSet(LEGACY_KEYS.BEST_SCORE, String(profile.bestScore));
      safeStorageSet(LEGACY_KEYS.GAMES_PLAYED, String(profile.gamesPlayed));
      safeStorageSet(LEGACY_KEYS.UNLOCKED_CARS, JSON.stringify(profile.unlockedCars));
      safeStorageSet(LEGACY_KEYS.SELECTED_CAR, profile.selectedCarId);
      safeStorageSet(LEGACY_KEYS.CAMERA_MODE, profile.cameraMode);
      safeStorageSet(LEGACY_KEYS.MUTED, String(profile.audioMuted));
    } catch (e) {
      console.warn('Error writing save profile to disk:', e);
    }
  }

  // Evaluate and update any achievements that are met
  public evaluateAchievements(profile: PlayerProfile): string[] {
    const newlyUnlocked: string[] = [];

    ACHIEVEMENTS.forEach((ach) => {
      if (profile.unlockedAchievements.includes(ach.id)) return;

      let isUnlocked = false;
      switch (ach.id) {
        case 'first_race':
          isUnlocked = profile.gamesPlayed >= 1;
          break;
        case 'veteran_racer':
          isUnlocked = profile.gamesPlayed >= 10;
          break;
        case 'coins_50':
          isUnlocked = profile.lifetimeCoins >= 50;
          break;
        case 'coins_200':
          isUnlocked = profile.lifetimeCoins >= 200;
          break;
        case 'score_1000':
          isUnlocked = profile.bestScore >= 1000;
          break;
        case 'score_3000':
          isUnlocked = profile.bestScore >= 3000;
          break;
        case 'score_5000':
          isUnlocked = profile.bestScore >= 5000;
          break;
        case 'near_miss_25':
          isUnlocked = profile.totalNearMisses >= 25;
          break;
        case 'shields_10':
          isUnlocked = profile.totalShieldsCollected >= 10;
          break;
        case 'slows_10':
          isUnlocked = profile.totalSlowsCollected >= 10;
          break;
        case 'cars_3':
          isUnlocked = profile.unlockedCars.length >= 3;
          break;
        case 'cars_6':
          isUnlocked = profile.unlockedCars.length >= 6;
          break;
        default:
          break;
      }

      if (isUnlocked) {
        profile.unlockedAchievements.push(ach.id);
        newlyUnlocked.push(ach.id);
      }
    });

    return newlyUnlocked;
  }

  // --- PUBLIC API ---

  public getProfile(): PlayerProfile {
    if (!inMemoryProfile) {
      inMemoryProfile = this.loadFromDisk();
    }
    return { ...inMemoryProfile };
  }

  public saveProfile(updates: Partial<PlayerProfile>): PlayerProfile {
    const current = this.getProfile();
    const updated = this.sanitizeProfile({
      ...current,
      ...updates,
    });

    this.evaluateAchievements(updated);
    inMemoryProfile = updated;
    this.writeToDisk(updated);

    return { ...updated };
  }

  public addCoins(amount: number): number {
    if (amount <= 0) return this.getProfile().totalCoins;
    const current = this.getProfile();
    current.totalCoins += amount;
    current.lifetimeCoins += amount;
    this.evaluateAchievements(current);
    inMemoryProfile = current;
    this.writeToDisk(current);
    return current.totalCoins;
  }

  public saveCoins(coins: number): void {
    const current = this.getProfile();
    current.totalCoins = Math.max(0, Math.floor(coins));
    inMemoryProfile = current;
    this.writeToDisk(current);
  }

  public spendCoins(amount: number): boolean {
    const current = this.getProfile();
    if (current.totalCoins < amount) return false;
    current.totalCoins -= amount;
    inMemoryProfile = current;
    this.writeToDisk(current);
    return true;
  }

  public saveBestScore(score: number): number {
    const current = this.getProfile();
    if (score > current.bestScore) {
      current.bestScore = Math.floor(score);
      this.evaluateAchievements(current);
      inMemoryProfile = current;
      this.writeToDisk(current);
      return current.bestScore;
    }
    return current.bestScore;
  }

  public saveUnlockedCars(unlockedCars: string[]): void {
    const current = this.getProfile();
    current.unlockedCars = Array.from(new Set(['classic', ...unlockedCars]));
    this.evaluateAchievements(current);
    inMemoryProfile = current;
    this.writeToDisk(current);
  }

  public saveSelectedCar(carId: string): void {
    const current = this.getProfile();
    current.selectedCarId = carId;
    inMemoryProfile = current;
    this.writeToDisk(current);
  }

  public saveCameraMode(mode: 'chase' | 'hood' | 'retro'): void {
    const current = this.getProfile();
    current.cameraMode = mode;
    inMemoryProfile = current;
    this.writeToDisk(current);
  }

  public incrementGamesPlayed(): number {
    const current = this.getProfile();
    current.gamesPlayed += 1;
    this.evaluateAchievements(current);
    inMemoryProfile = current;
    this.writeToDisk(current);
    return current.gamesPlayed;
  }

  public recordNearMiss(): number {
    const current = this.getProfile();
    current.totalNearMisses += 1;
    this.evaluateAchievements(current);
    inMemoryProfile = current;
    this.writeToDisk(current);
    return current.totalNearMisses;
  }

  public recordShieldCollected(): number {
    const current = this.getProfile();
    current.totalShieldsCollected += 1;
    this.evaluateAchievements(current);
    inMemoryProfile = current;
    this.writeToDisk(current);
    return current.totalShieldsCollected;
  }

  public recordSlowCollected(): number {
    const current = this.getProfile();
    current.totalSlowsCollected += 1;
    this.evaluateAchievements(current);
    inMemoryProfile = current;
    this.writeToDisk(current);
    return current.totalSlowsCollected;
  }

  public claimAchievement(achId: string): { success: boolean; reward: number; totalCoins: number } {
    const current = this.getProfile();
    const ach = ACHIEVEMENTS.find((a) => a.id === achId);

    if (!ach || !current.unlockedAchievements.includes(achId) || current.claimedAchievements.includes(achId)) {
      return { success: false, reward: 0, totalCoins: current.totalCoins };
    }

    current.claimedAchievements.push(achId);
    current.totalCoins += ach.rewardCoins;
    current.lifetimeCoins += ach.rewardCoins;

    inMemoryProfile = current;
    this.writeToDisk(current);

    return { success: true, reward: ach.rewardCoins, totalCoins: current.totalCoins };
  }

  public resetProgress(): PlayerProfile {
    inMemoryProfile = { ...DEFAULT_PROFILE, lastSaved: Date.now() };
    this.writeToDisk(inMemoryProfile);
    return { ...inMemoryProfile };
  }
}

export const gameStorage = new GameStorageManager();
