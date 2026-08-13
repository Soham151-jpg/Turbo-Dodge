import React, { useEffect, useRef, useState } from 'react';
import { GameState, ENEMY_VARIANTS, EnemyVariantType, POWERUPS, PowerUpType } from '../types';
import { soundEngine } from '../utils/audio';

const WIDTH = 480;
const HEIGHT = 700;

const ROAD_LEFT = 60;
const ROAD_RIGHT = WIDTH - 60;
const ROAD_W = ROAD_RIGHT - ROAD_LEFT;
const NUM_LANES = 3;
const LANE_W = Math.floor(ROAD_W / NUM_LANES);

const LANE_CENTERS = [
  ROAD_LEFT + LANE_W / 2,
  ROAD_LEFT + LANE_W + LANE_W / 2,
  ROAD_LEFT + LANE_W * 2 + LANE_W / 2,
];

const CAR_COLORS = [
  '#dc2828', // RED
  '#2878dc', // BLUE
  '#32c850', // GREEN
  '#ff8c00', // ORANGE
  '#00d2e6', // CYAN
  '#a03ce6', // PURPLE
];

const HITBOX_INSET_X = 0.10;
const HITBOX_INSET_Y = 0.06;

interface GameCanvasProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onStatsUpdate: (stats: {
    score: number;
    bestScore: number;
    level: number;
    lives: number;
    shieldActive: boolean;
    shieldTimer: number;
    slowActive: boolean;
    slowTimer: number;
  }) => void;
  steeringInput: number; // -1 for left, +1 for right, 0 for none
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  onStatsUpdate,
  steeringInput,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep references to keys held down
  const keysRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (gameState === GameState.PLAY) {
          setGameState(GameState.PAUSED);
        } else if (gameState === GameState.PAUSED) {
          setGameState(GameState.PLAY);
        }
      }

      if (e.key === 'Enter') {
        if (gameState === GameState.START || gameState === GameState.GAMEOVER) {
          soundEngine.playStart();
          setGameState(GameState.PLAY);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, setGameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Load best score from localStorage
    let bestScore = 0;
    try {
      const saved = localStorage.getItem('turbo_dodge_best_score');
      if (saved) bestScore = parseInt(saved, 10) || 0;
    } catch {
      bestScore = 0;
    }

    // Game Objects & State
    let roadOffset = 0;
    let score = 0;
    let level = 1;
    const baseSpeed = 4.0;
    let roadSpeed = baseSpeed;
    let spawnTimer = 0;
    let spawnInterval = 80;
    let scoreTimer = 0;
    let slowTimer = 0;
    let powerupTimer = 0;
    let powerupSpawnInterval = Math.floor(Math.random() * 180) + 300;

    // Player State
    const player = {
      w: 40,
      h: 72,
      x: LANE_CENTERS[1],
      y: HEIGHT - 130,
      speed: 6,
      lives: 3,
      invFrames: 0,
      shieldActive: false,
      shieldTimer: 0,
    };

    // Enemies
    interface EnemyItem {
      x: number;
      y: number;
      w: number;
      h: number;
      speed: number;
      color: string;
      variant: EnemyVariantType;
    }
    let enemies: EnemyItem[] = [];

    // Powerup Pickups
    interface PowerUpItem {
      x: number;
      y: number;
      size: number;
      type: PowerUpType;
      speed: number;
      pulse: number;
    }
    let powerups: PowerUpItem[] = [];

    // Particles
    interface SparkParticle {
      type: 'spark';
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
    }

    interface RingParticle {
      type: 'ring';
      x: number;
      y: number;
      radius: number;
      life: number;
      maxLife: number;
      color: string;
    }

    type GameParticle = SparkParticle | RingParticle;
    let particles: GameParticle[] = [];

    // Screen Shake
    let shakeTimer = 0;
    const shakeDuration = 15;
    const shakeIntensity = 8;

    const triggerShake = () => {
      shakeTimer = shakeDuration;
    };

    const getShakeOffset = (): { x: number; y: number } => {
      if (shakeTimer <= 0) return { x: 0, y: 0 };
      shakeTimer--;
      const decay = shakeTimer / shakeDuration;
      const currentInt = Math.max(1, Math.floor(shakeIntensity * decay));
      return {
        x: (Math.random() * 2 - 1) * currentInt,
        y: (Math.random() * 2 - 1) * currentInt,
      };
    };

    // Helper: Draw Rounded Rect
    const drawRoundedRect = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      color: string
    ) => {
      c.beginPath();
      c.fillStyle = color;
      c.roundRect(x, y, w, h, r);
      c.fill();
    };

    // Helper: Draw Car
    const drawCar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      w: number,
      h: number,
      color: string,
      facingDown: boolean = true
    ) => {
      // Body
      drawRoundedRect(c, cx - w / 2, cy - h / 2, w, h, 8, color);

      // Windshield
      const ww = w - 10;
      const wh = Math.floor(h / 4);
      const wy = cy - h / 2 + (facingDown ? h / 5 : h - h / 5 - wh);
      drawRoundedRect(c, cx - ww / 2, wy, ww, wh, 4, '#f0f0f0');

      // Wheels
      const wheelW = 9;
      const wheelH = 14;
      const offsets = [
        [-w / 2 - 2, -h / 3],
        [w / 2 - 7, -h / 3],
        [-w / 2 - 2, h / 3 - wheelH + 4],
        [w / 2 - 7, h / 3 - wheelH + 4],
      ];
      offsets.forEach(([ox, oy]) => {
        drawRoundedRect(c, cx + ox, cy + oy, wheelW, wheelH, 3, '#0a0a0a');
      });

      // Lights
      const lightColor = facingDown ? '#ffdc28' : '#dc2828';
      const headlightColor = facingDown ? '#dc2828' : '#ffdc28';

      // Primary Lights (Headlights or Taillights depending on orientation)
      for (const lx of [cx - w / 2 + 5, cx + w / 2 - 13]) {
        const ly = facingDown ? cy + h / 2 - 8 : cy - h / 2 + 3;
        drawRoundedRect(c, lx, ly, 8, 5, 2, lightColor);
      }

      // Secondary opposite lights
      for (const lx of [cx - w / 2 + 5, cx + w / 2 - 13]) {
        const ly = facingDown ? cy - h / 2 + 3 : cy + h / 2 - 8;
        drawRoundedRect(c, lx, ly, 8, 5, 2, headlightColor);
      }
    };

    // Rect collision detector with inset hitboxes
    const checkCollision = (
      r1: { x: number; y: number; w: number; h: number },
      r2: { x: number; y: number; w: number; h: number },
      inset1: boolean = true,
      inset2: boolean = true
    ) => {
      const pad1X = inset1 ? r1.w * HITBOX_INSET_X : 0;
      const pad1Y = inset1 ? r1.h * HITBOX_INSET_Y : 0;
      const rect1 = {
        left: r1.x - r1.w / 2 + pad1X,
        right: r1.x + r1.w / 2 - pad1X,
        top: r1.y - r1.h / 2 + pad1Y,
        bottom: r1.y + r1.h / 2 - pad1Y,
      };

      const pad2X = inset2 ? r2.w * HITBOX_INSET_X : 0;
      const pad2Y = inset2 ? r2.h * HITBOX_INSET_Y : 0;
      const rect2 = {
        left: r2.x - r2.w / 2 + pad2X,
        right: r2.x + r2.w / 2 - pad2X,
        top: r2.y - r2.h / 2 + pad2Y,
        bottom: r2.y + r2.h / 2 - pad2Y,
      };

      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    };

    // Main Game Loop
    const render = () => {
      // 1. UPDATE GAME LOGIC IF PLAYING
      if (gameState === GameState.PLAY) {
        // Player Input (Keyboard or Touch)
        let moveDir = 0;
        if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
          moveDir -= 1;
        }
        if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
          moveDir += 1;
        }
        if (steeringInput !== 0) {
          moveDir = steeringInput;
        }

        player.x += moveDir * player.speed;
        player.x = Math.max(ROAD_LEFT + player.w / 2, Math.min(ROAD_RIGHT - player.w / 2, player.x));

        // Invincibility & Shield Countdown
        if (player.invFrames > 0) player.invFrames--;
        if (player.shieldActive) {
          player.shieldTimer--;
          if (player.shieldTimer <= 0) player.shieldActive = false;
        }

        // Score & Level Progression
        scoreTimer++;
        if (scoreTimer >= 30) {
          score += 4;
          scoreTimer = 0;
        }

        level = 1 + Math.floor(score / 120);
        roadSpeed = baseSpeed + (level - 1) * 0.5;
        spawnInterval = Math.max(30, 80 - level * 4);

        // Slow Motion Factor
        const slowFactor = slowTimer > 0 ? 0.5 : 1.0;
        if (slowTimer > 0) slowTimer--;

        // Road Offset update
        const dashH = 40;
        const dashGap = 30;
        roadOffset = (roadOffset + roadSpeed * slowFactor) % (dashH + dashGap);

        // Spawn Enemies
        spawnTimer++;
        if (spawnTimer >= spawnInterval) {
          const lane = Math.floor(Math.random() * NUM_LANES);
          const variantKeys: EnemyVariantType[] = ['sedan', 'truck', 'bike'];
          const weights = [0.65, 0.18, 0.17];

          // Weighted variant picker
          let rand = Math.random();
          let chosenVariant: EnemyVariantType = 'sedan';
          for (let i = 0; i < weights.length; i++) {
            if (rand < weights[i]) {
              chosenVariant = variantKeys[i];
              break;
            }
            rand -= weights[i];
          }

          const vConfig = ENEMY_VARIANTS[chosenVariant];
          const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
          const spd = (roadSpeed + (Math.random() * 2.5 - 1.0)) * vConfig.speedMult * slowFactor;

          enemies.push({
            x: LANE_CENTERS[lane],
            y: -vConfig.h,
            w: vConfig.w,
            h: vConfig.h,
            speed: spd,
            color,
            variant: chosenVariant,
          });
          spawnTimer = 0;
        }

        // Spawn PowerUps
        powerupTimer++;
        if (powerupTimer >= powerupSpawnInterval) {
          const ptype: PowerUpType = Math.random() < 0.5 ? 'shield' : 'slow';
          const lane = Math.floor(Math.random() * NUM_LANES);
          powerups.push({
            x: LANE_CENTERS[lane],
            y: -34,
            size: 34,
            type: ptype,
            speed: roadSpeed * 0.8 * slowFactor,
            pulse: Math.random() * Math.PI * 2,
          });
          powerupTimer = 0;
          powerupSpawnInterval = Math.floor(Math.random() * 180) + 300;
        }

        // Update Enemies & Collisions
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          e.y += e.speed;

          // Offscreen check
          if (e.y > HEIGHT + e.h) {
            enemies.splice(i, 1);
            score += 8;
            continue;
          }

          // Player collision check
          if (checkCollision(player, e)) {
            // Check if player shield is active
            if (player.shieldActive) {
              player.shieldActive = false;
              player.shieldTimer = 0;
              enemies.splice(i, 1);
              soundEngine.playCrash();
              triggerShake();
              for (let p = 0; p < 20; p++) {
                particles.push({
                  type: 'spark',
                  x: player.x + (Math.random() * 40 - 20),
                  y: player.y + (Math.random() * 40 - 20),
                  vx: Math.random() * 8 - 4,
                  vy: Math.random() * 7 - 6,
                  life: Math.floor(Math.random() * 20) + 15,
                  maxLife: 35,
                  color: '#00d2e6',
                });
              }
            } else if (player.invFrames <= 0) {
              player.lives -= 1;
              player.invFrames = 90;
              soundEngine.playCrash();
              triggerShake();

              for (let p = 0; p < 35; p++) {
                particles.push({
                  type: 'spark',
                  x: player.x + (Math.random() * 40 - 20),
                  y: player.y + (Math.random() * 40 - 20),
                  vx: Math.random() * 8 - 4,
                  vy: Math.random() * 7 - 6,
                  life: Math.floor(Math.random() * 20) + 15,
                  maxLife: 35,
                  color: ['#ffdc28', '#ff8c00', '#dc2828', '#ffffff'][
                    Math.floor(Math.random() * 4)
                  ],
                });
              }

              enemies.splice(i, 1);

              if (player.lives <= 0) {
                if (score > bestScore) {
                  bestScore = score;
                  try {
                    localStorage.setItem('turbo_dodge_best_score', String(bestScore));
                  } catch {
                    // Ignore storage errors
                  }
                }
                setGameState(GameState.GAMEOVER);
              }
            }
          }
        }

        // Update Powerups & Collection
        for (let i = powerups.length - 1; i >= 0; i--) {
          const pu = powerups[i];
          pu.y += pu.speed;
          pu.pulse += 0.15;

          if (pu.y > HEIGHT + pu.size) {
            powerups.splice(i, 1);
            continue;
          }

          if (checkCollision(player, { x: pu.x, y: pu.y, w: pu.size, h: pu.size }, true, false)) {
            soundEngine.playPowerup();
            if (pu.type === 'shield') {
              player.shieldActive = true;
              player.shieldTimer = POWERUPS.shield.duration;
              particles.push({
                type: 'ring',
                x: player.x,
                y: player.y,
                radius: 5,
                life: 30,
                maxLife: 30,
                color: '#00d2e6',
              });
            } else if (pu.type === 'slow') {
              slowTimer = POWERUPS.slow.duration;
              particles.push({
                type: 'ring',
                x: player.x,
                y: player.y,
                radius: 5,
                life: 30,
                maxLife: 30,
                color: '#ff8c00',
              });
            }
            powerups.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life--;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }

          if (p.type === 'spark') {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3; // Gravity
          } else if (p.type === 'ring') {
            const progress = 1 - p.life / p.maxLife;
            p.radius = 8 + 45 * progress;
          }
        }

        // Sync HUD statistics with React state
        onStatsUpdate({
          score,
          bestScore,
          level,
          lives: player.lives,
          shieldActive: player.shieldActive,
          shieldTimer: player.shieldTimer,
          slowActive: slowTimer > 0,
          slowTimer,
        });
      }

      // 2. RENDERING CANVAS SCENE
      ctx.save();
      const shake = getShakeOffset();
      ctx.translate(shake.x, shake.y);

      // Background Fill
      ctx.fillStyle = '#141414';
      ctx.fillRect(-10, -10, WIDTH + 20, HEIGHT + 20);

      // Tarmac
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(ROAD_LEFT, 0, ROAD_W, HEIGHT);

      // Kerbs (White borders on sides)
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(ROAD_LEFT - 8, 0, 8, HEIGHT);
      ctx.fillRect(ROAD_RIGHT, 0, 8, HEIGHT);

      // Kerb red/white stripe detail
      const stripeH = 30;
      for (let y = -stripeH + (roadOffset % stripeH); y < HEIGHT; y += stripeH) {
        ctx.fillStyle = '#dc2828';
        ctx.fillRect(ROAD_LEFT - 8, y, 8, stripeH / 2);
        ctx.fillRect(ROAD_RIGHT, y, 8, stripeH / 2);
      }

      // Dashed Lane Dividers
      const dashH = 40;
      const dashGap = 30;
      const dashW = 6;
      ctx.fillStyle = '#3c3c3c';

      for (let i = 1; i < NUM_LANES; i++) {
        const x = ROAD_LEFT + i * LANE_W;
        let y = -dashGap + roadOffset - dashH;
        while (y < HEIGHT) {
          ctx.fillRect(x - dashW / 2, y, dashW, dashH);
          y += dashH + dashGap;
        }
      }

      // Draw Enemies
      enemies.forEach((e) => {
        drawCar(ctx, e.x, e.y, e.w, e.h, e.color, true);
      });

      // Draw PowerUps
      powerups.forEach((pu) => {
        const r = pu.size / 2 + Math.sin(pu.pulse) * 3;
        const color = pu.type === 'shield' ? '#00d2e6' : '#ff8c00';
        const label = pu.type === 'shield' ? 'S' : 'T';

        // Outer Glow Circle
        ctx.beginPath();
        ctx.fillStyle = '#1e1e1e';
        ctx.arc(pu.x, pu.y, r + 3, 0, Math.PI * 2);
        ctx.fill();

        // Ring
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.arc(pu.x, pu.y, r, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = color;
        ctx.font = 'bold 16px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, pu.x, pu.y);
      });

      // Draw Particles
      particles.forEach((p) => {
        if (p.type === 'spark') {
          const r = Math.max(1, Math.floor(p.life / 8));
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'ring') {
          const w = Math.max(1, Math.floor(4 * (p.life / p.maxLife)));
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = w;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Draw Player Car
      const shouldDrawPlayer = player.invFrames <= 0 || Math.floor(player.invFrames / 5) % 2 === 0;
      if (shouldDrawPlayer) {
        drawCar(ctx, player.x, player.y, player.w, player.h, '#32c850', false);

        // Active Shield Glow Aura
        if (player.shieldActive) {
          ctx.beginPath();
          ctx.strokeStyle = '#00d2e6';
          ctx.lineWidth = 3;
          ctx.arc(player.x, player.y, 55, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(0, 210, 230, 0.15)';
          ctx.fill();
        }
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, setGameState, steeringInput, onStatsUpdate]);

  return (
    <div className="relative w-full max-w-[480px] aspect-[480/700] mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-neutral-800 bg-neutral-900">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="w-full h-full block cursor-pointer touch-none"
      />
    </div>
  );
};
