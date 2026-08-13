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

export interface Particle {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  update(): boolean;
  draw(ctx: CanvasRenderingContext2D): void;
}

export interface GameStats {
  score: number;
  bestScore: number;
  level: number;
  lives: number;
  shieldActive: boolean;
  shieldTimer: number;
  slowActive: boolean;
  slowTimer: number;
}
