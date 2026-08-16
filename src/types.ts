export enum GameState {
  START = 'start',
  PLAY = 'play',
  GAMEOVER = 'gameover',
  PAUSED = 'paused'
}

export type EnemyVariantType = 'sedan' | 'truck' | 'bike';

export interface EnemyVariantConfig {
  w: number;
  h: number;
  speedMult: number;
  weight: number;
}

export const ENEMY_VARIANTS: Record<EnemyVariantType, EnemyVariantConfig> = {
  sedan: { w: 40, h: 72, speedMult: 1.0, weight: 0.65 },
  truck: { w: 54, h: 92, speedMult: 0.75, weight: 0.18 },
  bike:  { w: 24, h: 52, speedMult: 1.4, weight: 0.17 },
};

export type PowerUpType = 'shield' | 'slow';

export interface PowerUpConfig {
  type: PowerUpType;
  duration: number; // in frames (at 60fps)
  icon: string;
  color: string;
}

export const POWERUPS: Record<PowerUpType, PowerUpConfig> = {
  shield: { type: 'shield', duration: 300, icon: '🛡️', color: '#00d2e6' },
  slow:   { type: 'slow',   duration: 200, icon: '⏱️', color: '#ff8c00' },
};

export type ChassisType = 'sport' | 'f1' | 'truck' | 'supercar' | 'muscle' | 'hover';

export interface CarSoundProfile {
  engineName: string;
  hornName: string;
  sfxTag: string;
}

export interface CarSkin {
  id: string;
  name: string;
  price: number;
  description: string;
  chassisType: ChassisType;
  primaryColor: string;
  secondaryColor: string;
  windshieldColor: string;
  accentColor: string;
  glowColor: string;
  hasStripes?: boolean;
  hasSpoiler?: boolean;
  hasNeonGlow?: boolean;
  hasLightBar?: boolean;
  hasBlower?: boolean;
  handlingSpeed?: number;
  responsiveness?: number;
  bonusCoinMultiplier?: number;
  badge: string;
  category: 'Sport' | 'Formula' | 'Truck' | 'Supercar' | 'Muscle' | 'Special';
  soundProfile: CarSoundProfile;
}

export const CAR_SKINS: CarSkin[] = [
  // --- CLASSIC & SPORT ---
  {
    id: 'classic',
    name: 'Classic Neon',
    price: 0,
    description: 'The standard emerald track racer. Agile, reliable, and well-balanced.',
    chassisType: 'sport',
    primaryColor: '#22c55e',
    secondaryColor: '#15803d',
    windshieldColor: '#e0f2fe',
    accentColor: '#4ade80',
    glowColor: '#22c55e',
    badge: 'DEFAULT',
    category: 'Sport',
    soundProfile: {
      engineName: '2.0L Twin-Cam Sport Engine',
      hornName: 'Dual-Chirp Road Horn',
      sfxTag: '🔊 Twin-Cam Rev',
    },
  },
  {
    id: 'crimson_viper',
    name: 'Crimson Viper',
    price: 50,
    description: 'Fiery racing red sports coupe with high-contrast dual racing stripes.',
    chassisType: 'sport',
    primaryColor: '#ef4444',
    secondaryColor: '#991b1b',
    windshieldColor: '#f1f5f9',
    accentColor: '#ffffff',
    glowColor: '#ef4444',
    hasStripes: true,
    hasSpoiler: true,
    badge: 'SPORT',
    category: 'Sport',
    soundProfile: {
      engineName: 'High-Revving Turbo I4 + Backfire',
      hornName: 'Italian Sport Horn & Crackle',
      sfxTag: '🔊 Turbo Pop',
    },
  },
  {
    id: 'cyber_phantom',
    name: 'Cyber Phantom',
    price: 120,
    description: 'Stealth matte black chassis featuring cyan neon aero ground effects.',
    chassisType: 'sport',
    primaryColor: '#171717',
    secondaryColor: '#00e5ff',
    windshieldColor: '#00e5ff',
    accentColor: '#00e5ff',
    glowColor: '#00e5ff',
    hasNeonGlow: true,
    badge: 'CYBER',
    category: 'Sport',
    soundProfile: {
      engineName: 'Synthwave Electric Turbo Drive',
      hornName: 'Digital Laser Pulse & Sub-Drop',
      sfxTag: '🔊 Cyber Synth',
    },
  },
  {
    id: 'solar_flare',
    name: 'Solar Flare',
    price: 200,
    description: 'Radiant molten gold bodywork forged in high-octane championship heat.',
    chassisType: 'sport',
    primaryColor: '#eab308',
    secondaryColor: '#ca8a04',
    windshieldColor: '#fef08a',
    accentColor: '#f97316',
    glowColor: '#eab308',
    hasStripes: true,
    hasSpoiler: true,
    badge: 'ELITE',
    category: 'Sport',
    soundProfile: {
      engineName: 'High-Compression Golden V6',
      hornName: 'Brassy Dual Fanfare & Turbo Whistle',
      sfxTag: '🔊 Gold Fanfare',
    },
  },

  // --- FORMULA 1 / OPEN WHEEL ---
  {
    id: 'apex_gp_f1',
    name: 'Apex Grand Prix F1',
    price: 90,
    description: 'Precision open-wheel formula racer with multi-tier carbon front wings & halo cockpit.',
    chassisType: 'f1',
    primaryColor: '#06b6d4',
    secondaryColor: '#083344',
    windshieldColor: '#22d3ee',
    accentColor: '#facc15',
    glowColor: '#06b6d4',
    hasSpoiler: true,
    badge: 'FORMULA 1',
    category: 'Formula',
    soundProfile: {
      engineName: '18,000 RPM Screaming V10 F1 Engine',
      hornName: 'Pit-Lane Blip & Paddle Upshift Burps',
      sfxTag: '🔊 Screaming V10',
    },
  },
  {
    id: 'scuderia_fire_f1',
    name: 'Scuderia Red Arrow',
    price: 240,
    description: 'Italian racing red open-wheel champion car. Features ultra-responsive Formula steering and high-downforce aero.',
    chassisType: 'f1',
    primaryColor: '#dc2626',
    secondaryColor: '#1e1b4b',
    windshieldColor: '#fef08a',
    accentColor: '#ffffff',
    glowColor: '#dc2626',
    hasStripes: true,
    hasSpoiler: true,
    handlingSpeed: 23.5,
    responsiveness: 0.28,
    bonusCoinMultiplier: 1.25,
    badge: 'F1 CHAMPION',
    category: 'Formula',
    soundProfile: {
      engineName: 'Monza Championship V12 Roar',
      hornName: 'Iconic Grand Prix Race Horn & Pit Blip',
      sfxTag: '🔊 Italian V12',
    },
  },
  {
    id: 'silver_bullet_f1',
    name: 'Silver Arrow F1',
    price: 340,
    description: 'Aerodynamic brushed titanium chassis engineered for maximum straight-line velocity.',
    chassisType: 'f1',
    primaryColor: '#e2e8f0',
    secondaryColor: '#0f172a',
    windshieldColor: '#38bdf8',
    accentColor: '#06b6d4',
    glowColor: '#38bdf8',
    hasSpoiler: true,
    hasNeonGlow: true,
    badge: 'PRO F1',
    category: 'Formula',
    soundProfile: {
      engineName: 'Turbo-Hybrid V6 + Electric MGU-K Whine',
      hornName: 'Telemetry Chirps & Kinetic Boost Discharge',
      sfxTag: '🔊 Hybrid Whine',
    },
  },

  // --- HEAVY ARMORED & OFF-ROAD TRUCKS ---
  {
    id: 'titan_truck',
    name: 'Titan Heavy Hauler',
    price: 130,
    description: 'Reinforced heavy steel truck with heavy-duty front bullbar and knobby tires.',
    chassisType: 'truck',
    primaryColor: '#ea580c',
    secondaryColor: '#292524',
    windshieldColor: '#93c5fd',
    accentColor: '#facc15',
    glowColor: '#ea580c',
    hasLightBar: true,
    badge: 'HEAVY TRUCK',
    category: 'Truck',
    soundProfile: {
      engineName: '15.0L Heavy Turbo-Diesel V8 Chug',
      hornName: 'Massive Booming Freight Air Horn & Airbrake Purge',
      sfxTag: '🔊 Air Horn Blast',
    },
  },
  {
    id: 'mammoth_4x4',
    name: 'Mammoth 4x4 Off-Roader',
    price: 270,
    description: 'Monster off-road truck with quad roof foglamps, dual exhaust stacks, and steel rollbars.',
    chassisType: 'truck',
    primaryColor: '#15803d',
    secondaryColor: '#1c1917',
    windshieldColor: '#fef08a',
    accentColor: '#84cc16',
    glowColor: '#22c55e',
    hasLightBar: true,
    hasNeonGlow: true,
    badge: '4x4 MONSTER',
    category: 'Truck',
    soundProfile: {
      engineName: 'Monster 4x4 Turbo Diesel Rumble',
      hornName: 'Dual Train-Style Air Horn Blast',
      sfxTag: '🔊 Train Horn',
    },
  },
  {
    id: 'cyber_armored_truck',
    name: 'Cyber Titan Truck',
    price: 380,
    description: 'Geometric angular stainless steel cyberpunk truck with full-width laser light bar.',
    chassisType: 'truck',
    primaryColor: '#64748b',
    secondaryColor: '#0f172a',
    windshieldColor: '#38bdf8',
    accentColor: '#06b6d4',
    glowColor: '#06b6d4',
    hasLightBar: true,
    hasNeonGlow: true,
    badge: 'CYBER TRUCK',
    category: 'Truck',
    soundProfile: {
      engineName: 'Heavy Electromagnetic Servo Turbine',
      hornName: 'Industrial Sonic Blast & Hydraulic Clamp Release',
      sfxTag: '🔊 Heavy Servo',
    },
  },

  // --- V8 MUSCLE CARS ---
  {
    id: 'v8_blower_eliminator',
    name: 'V8 Blower Eliminator',
    price: 175,
    description: 'American classic muscle car with a chrome dual-port supercharger blower popping through the hood.',
    chassisType: 'muscle',
    primaryColor: '#7c3aed',
    secondaryColor: '#1e1b4b',
    windshieldColor: '#e2e8f0',
    accentColor: '#facc15',
    glowColor: '#a855f7',
    hasStripes: true,
    hasSpoiler: true,
    hasBlower: true,
    badge: 'V8 MUSCLE',
    category: 'Muscle',
    soundProfile: {
      engineName: '427 Supercharged V8 with Roots Blower Whine',
      hornName: 'V8 Throttle Stomp, Supercharger Whine & Backfire Gunfire',
      sfxTag: '🔊 Roots Blower',
    },
  },
  {
    id: 'road_warrior_muscle',
    name: 'Road Warrior Muscle',
    price: 310,
    description: 'Midnight matte muscle car with twin hood scoops, wide drag slicks, and dual exhaust roar.',
    chassisType: 'muscle',
    primaryColor: '#18181b',
    secondaryColor: '#e11d48',
    windshieldColor: '#fda4af',
    accentColor: '#f43f5e',
    glowColor: '#e11d48',
    hasStripes: true,
    hasBlower: true,
    hasNeonGlow: true,
    badge: 'V8 BEAST',
    category: 'Muscle',
    soundProfile: {
      engineName: 'Straight-Pipe Dragstrip 502 Big Block V8',
      hornName: 'Vintage Dual Muscle Horn & Asphalt Burnout Squeal',
      sfxTag: '🔊 Big Block V8',
    },
  },

  // --- EXOTIC SUPERCARS & HYPERCARS ---
  {
    id: 'venom_supercar',
    name: 'Venom GT Supercar',
    price: 290,
    description: 'Twin-turbo track supercar with aggressive side air scoops and high-downforce GT carbon wing.',
    chassisType: 'supercar',
    primaryColor: '#0284c7',
    secondaryColor: '#082f49',
    windshieldColor: '#bae6fd',
    accentColor: '#38bdf8',
    glowColor: '#0ea5e9',
    hasSpoiler: true,
    badge: 'SUPERCAR',
    category: 'Supercar',
    soundProfile: {
      engineName: 'Twin-Turbo V8 with Signature Wastegate Flutter',
      hornName: 'Turbo Blow-Off Flutter ("stututu") & High-Speed Horn',
      sfxTag: '🔊 Turbo Flutter',
    },
  },
  {
    id: 'ghost_hypercar',
    name: 'Ghost Hypercar',
    price: 420,
    description: 'Glacier white widebody hypercar with exposed mid-engine glass canopy and violet active aero.',
    chassisType: 'supercar',
    primaryColor: '#f8fafc',
    secondaryColor: '#a855f7',
    windshieldColor: '#c084fc',
    accentColor: '#9333ea',
    glowColor: '#c084fc',
    hasSpoiler: true,
    hasNeonGlow: true,
    badge: 'HYPERCAR',
    category: 'Supercar',
    soundProfile: {
      engineName: 'Quad-Turbo 8.0L W16 Titanium Exhaust',
      hornName: 'Laser-Sharp Hypercar Dual Tone & Titanium Exhaust Surge',
      sfxTag: '🔊 W16 Hypercar',
    },
  },
  {
    id: 'galactic_void',
    name: 'Galactic Void Supercar',
    price: 520,
    description: 'Cosmic deep violet carbon fiber body infused with hyperdrive diffusers & vortex generators.',
    chassisType: 'supercar',
    primaryColor: '#7e22ce',
    secondaryColor: '#ec4899',
    windshieldColor: '#f472b6',
    accentColor: '#f43f5e',
    glowColor: '#ec4899',
    hasStripes: true,
    hasSpoiler: true,
    hasNeonGlow: true,
    badge: 'LEGENDARY HYPERCAR',
    category: 'Supercar',
    soundProfile: {
      engineName: 'Hyperdrive Void-Vortex Fusion Core',
      hornName: 'Spatial Dark-Matter Warp Sweep Horn',
      sfxTag: '🔊 Void Warp',
    },
  },

  // --- FUTURISTIC HOVERCRAFTS ---
  {
    id: 'orbital_hover_speeder',
    name: 'Orbital Ion Speeder',
    price: 650,
    description: 'Mag-lev anti-gravity hovercraft with quad ion repulsor rings and zero tire friction.',
    chassisType: 'hover',
    primaryColor: '#042f2e',
    secondaryColor: '#14b8a6',
    windshieldColor: '#5eead4',
    accentColor: '#2dd4bf',
    glowColor: '#14b8a6',
    hasNeonGlow: true,
    badge: 'HOVER SPEEDS',
    category: 'Special',
    soundProfile: {
      engineName: 'Zero-Gravity Mag-Lev Ion Repulsor Stream',
      hornName: 'Electromagnetic Ion Blast & Sci-Fi Warp Whistle',
      sfxTag: '🔊 Ion Repulsor',
    },
  },
  {
    id: 'phoenix_quantum_speeder',
    name: 'Phoenix Quantum Hover',
    price: 800,
    description: 'Futuristic solar-quantum hover racer propelled by dual plasma thrusters and quantum repulsors.',
    chassisType: 'hover',
    primaryColor: '#450a0a',
    secondaryColor: '#f97316',
    windshieldColor: '#fde047',
    accentColor: '#fb923c',
    glowColor: '#f97316',
    hasNeonGlow: true,
    badge: 'QUANTUM SPECIAL',
    category: 'Special',
    soundProfile: {
      engineName: 'Quantum Solar Plasma Fusion Thruster',
      hornName: 'Tachyon Laser Surge & Solar Quantum Pulse',
      sfxTag: '🔊 Quantum Laser',
    },
  },
];

export interface Particle {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  update(): boolean;
  draw(ctx: CanvasRenderingContext2D): void;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  rewardCoins: number;
  category: 'score' | 'coins' | 'garage' | 'skill' | 'general';
}

export interface PlayerProfile {
  totalCoins: number;
  lifetimeCoins: number;
  bestScore: number;
  gamesPlayed: number;
  totalNearMisses: number;
  totalShieldsCollected: number;
  totalSlowsCollected: number;
  unlockedCars: string[];
  selectedCarId: string;
  unlockedAchievements: string[];
  claimedAchievements: string[];
  cameraMode: 'chase' | 'hood' | 'retro';
  audioMuted: boolean;
  lastSaved?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_race',
    title: 'First Ignition',
    description: 'Start and complete your very first highway race.',
    icon: '🏎️',
    target: 1,
    rewardCoins: 25,
    category: 'general',
  },
  {
    id: 'veteran_racer',
    title: 'Highway Veteran',
    description: 'Play 10 total race sessions.',
    icon: '🏁',
    target: 10,
    rewardCoins: 100,
    category: 'general',
  },
  {
    id: 'coins_50',
    title: 'Coin Collector',
    description: 'Collect a lifetime total of 50 gold coins.',
    icon: '🪙',
    target: 50,
    rewardCoins: 50,
    category: 'coins',
  },
  {
    id: 'coins_200',
    title: 'Gold Vault',
    description: 'Collect a lifetime total of 200 gold coins.',
    icon: '💰',
    target: 200,
    rewardCoins: 150,
    category: 'coins',
  },
  {
    id: 'score_1000',
    title: 'Speedy Cruiser',
    description: 'Reach 1,000 points in a single race.',
    icon: '⚡',
    target: 1000,
    rewardCoins: 50,
    category: 'score',
  },
  {
    id: 'score_3000',
    title: 'Highway Menace',
    description: 'Reach 3,000 points in a single race.',
    icon: '🔥',
    target: 3000,
    rewardCoins: 150,
    category: 'score',
  },
  {
    id: 'score_5000',
    title: 'Arcade Legend',
    description: 'Reach 5,000 points in a single race.',
    icon: '👑',
    target: 5000,
    rewardCoins: 300,
    category: 'score',
  },
  {
    id: 'near_miss_25',
    title: 'Danger Zone',
    description: 'Perform 25 high-speed close pass near misses.',
    icon: '🎯',
    target: 25,
    rewardCoins: 75,
    category: 'skill',
  },
  {
    id: 'shields_10',
    title: 'Shield Master',
    description: 'Collect 10 kinetic shield power-ups.',
    icon: '🛡️',
    target: 10,
    rewardCoins: 50,
    category: 'skill',
  },
  {
    id: 'slows_10',
    title: 'Chrono Bender',
    description: 'Collect 10 chrono slow-mo warps.',
    icon: '⏱️',
    target: 10,
    rewardCoins: 50,
    category: 'skill',
  },
  {
    id: 'cars_3',
    title: 'Car Enthusiast',
    description: 'Unlock 3 vehicles in your garage.',
    icon: '🚘',
    target: 3,
    rewardCoins: 100,
    category: 'garage',
  },
  {
    id: 'cars_6',
    title: 'Garage Tycoon',
    description: 'Unlock 6 vehicles in your garage.',
    icon: '🌟',
    target: 6,
    rewardCoins: 250,
    category: 'garage',
  },
];

export interface GameStats {
  score: number;
  bestScore: number;
  level: number;
  lives: number;
  shieldActive: boolean;
  shieldTimer: number;
  slowActive: boolean;
  slowTimer: number;
  sessionCoins: number;
  totalCoins: number;
  selectedCarId: string;
}

