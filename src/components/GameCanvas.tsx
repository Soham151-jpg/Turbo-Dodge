import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  GameState,
  EnemyVariantType,
  ENEMY_VARIANTS,
  POWERUPS,
  PowerUpType,
  CAR_SKINS,
  CarSkin,
} from '../types';
import { soundEngine } from '../utils/audio';
import { gameStorage } from '../utils/storage';
import {
  createPlayerVehicle3D,
  createTrafficVehicle3D,
  createCoin3D,
  createPowerUp3D,
  Vehicle3DInstance,
} from '../utils/vehicle3D';
import { Camera, Eye } from 'lucide-react';

const ROAD_WIDTH = 14;
const LANE_CENTERS_3D = [-4.5, 0, 4.5];
const NUM_LANES = 3;

const CAR_COLORS = [
  '#dc2626', // Red
  '#2563eb', // Blue
  '#16a34a', // Green
  '#ea580c', // Orange
  '#06b6d4', // Cyan
  '#9333ea', // Purple
  '#facc15', // Yellow
];

export type CameraViewMode = 'chase' | 'hood' | 'retro';

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
    sessionCoins: number;
    totalCoins: number;
    selectedCarId: string;
  }) => void;
  steeringInput: number; // -1 (left) to 1 (right)
  selectedCarId: string;
  totalCoins: number;
  setTotalCoins: React.Dispatch<React.SetStateAction<number>>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  onStatsUpdate,
  steeringInput,
  selectedCarId,
  totalCoins,
  setTotalCoins,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const totalCoinsRef = useRef<number>(totalCoins);
  totalCoinsRef.current = totalCoins;

  const steeringInputRef = useRef<number>(steeringInput);
  steeringInputRef.current = steeringInput;

  const selectedCarRef = useRef<string>(selectedCarId);
  selectedCarRef.current = selectedCarId;

  const [camMode, setCamMode] = useState<CameraViewMode>(() => gameStorage.getProfile().cameraMode);
  const camModeRef = useRef<CameraViewMode>(camMode);
  camModeRef.current = camMode;

  // Toggle Camera
  const cycleCamera = () => {
    const modes: CameraViewMode[] = ['chase', 'hood', 'retro'];
    const nextIdx = (modes.indexOf(camModeRef.current) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setCamMode(nextMode);
    camModeRef.current = nextMode;
    gameStorage.saveCameraMode(nextMode);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (gameState === GameState.PLAY) {
          soundEngine.stopEngine();
          setGameState(GameState.PAUSED);
        } else if (gameState === GameState.PAUSED) {
          soundEngine.startEngine(selectedCarRef.current);
          setGameState(GameState.PLAY);
        }
      }

      if (e.key === 'c' || e.key === 'C') {
        cycleCamera();
      }

      if (e.key === 'h' || e.key === 'H') {
        if (gameState === GameState.PLAY) {
          soundEngine.playCarHorn(selectedCarRef.current);
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
      soundEngine.stopEngine();
    };
  }, [gameState, setGameState]);

  // Main 3D Engine initialization & loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 480;
    let height = container.clientHeight || 680;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060810);
    scene.fog = new THREE.FogExp2(0x070914, 0.0075);

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 600);
    camera.up.set(0, 1, 0); // Explicit upright vector
    camera.position.set(0, 5.5, -9.5);
    camera.lookAt(0, 1.5, 8.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0x2d3748, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x93c5fd, 2.2);
    dirLight.position.set(15, 30, -20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -10;
    scene.add(dirLight);

    // --- 3D ENVIRONMENT / SKYBOX & CITY HORIZON ---
    const skyGroup = new THREE.Group();
    scene.add(skyGroup);

    // Glowing Synthwave Sun / Moon in distant horizon
    const sunGeo = new THREE.SphereGeometry(18, 24, 16);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      fog: false,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(0, 22, 280);
    skyGroup.add(sunMesh);

    // Distant Neon Grid Horizon Mountains
    const mountainGeo = new THREE.ConeGeometry(35, 45, 4);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.9,
      wireframe: false,
    });
    for (let m = -3; m <= 3; m++) {
      if (m === 0) continue;
      const mMesh = new THREE.Mesh(mountainGeo, mountainMat);
      mMesh.position.set(m * 65, 12, 240 + Math.abs(m) * 15);
      mMesh.scale.set(1.4, 1, 1.4);
      skyGroup.add(mMesh);
    }

    // Distant 3D Skyscrapers on highway sides
    const buildings: THREE.Mesh[] = [];
    const bGeo = new THREE.BoxGeometry(8, 30, 8);
    const bMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.7,
    });
    for (let b = 0; b < 18; b++) {
      const side = b % 2 === 0 ? -1 : 1;
      const bMesh = new THREE.Mesh(bGeo, bMat);
      const bHeight = 15 + Math.random() * 35;
      bMesh.scale.set(1 + Math.random() * 0.8, bHeight / 30, 1 + Math.random() * 0.8);
      bMesh.position.set(
        side * (16 + Math.random() * 22),
        bHeight / 2 - 2,
        (Math.floor(b / 2) * 28) - 20
      );
      scene.add(bMesh);
      buildings.push(bMesh);
    }

    // --- 3D HIGHWAY / ROAD TRACK ---
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    // Main Asphalt Surface
    const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, 400, 1, 1);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x171717,
      roughness: 0.85,
      metalness: 0.15,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.position.set(0, 0, 150);
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    // Shoulder Curbs with Rumble Strips
    const curbGeo = new THREE.BoxGeometry(0.8, 0.25, 400);
    const curbMatL = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
    const curbL = new THREE.Mesh(curbGeo, curbMatL);
    curbL.position.set(-ROAD_WIDTH / 2 - 0.4, 0.1, 150);
    const curbR = new THREE.Mesh(curbGeo, curbMatL);
    curbR.position.set(ROAD_WIDTH / 2 + 0.4, 0.1, 150);
    roadGroup.add(curbL, curbR);

    // Glowing Neon Guardrails
    const railGeo = new THREE.BoxGeometry(0.3, 0.6, 400);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.2,
    });
    const railL = new THREE.Mesh(railGeo, railMat);
    railL.position.set(-ROAD_WIDTH / 2 - 0.9, 0.4, 150);
    const railR = new THREE.Mesh(railGeo, railMat);
    railR.position.set(ROAD_WIDTH / 2 + 0.9, 0.4, 150);
    roadGroup.add(railL, railR);

    // Dashed White Lane Strips
    const laneStripes: THREE.Mesh[] = [];
    const stripeGeo = new THREE.PlaneGeometry(0.35, 4.0);
    stripeGeo.rotateX(-Math.PI / 2);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let l = 0; l < 2; l++) {
      const lx = l === 0 ? -ROAD_WIDTH / 6 : ROAD_WIDTH / 6;
      for (let z = -30; z < 320; z += 9) {
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(lx, 0.02, z);
        roadGroup.add(stripe);
        laneStripes.push(stripe);
      }
    }

    // Street Lamps passing along the side
    const streetLamps: THREE.Group[] = [];
    const lampPoleGeo = new THREE.CylinderGeometry(0.12, 0.15, 6, 8);
    const lampArmGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    lampArmGeo.rotateZ(Math.PI / 2);
    const lampLightGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const lampLightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let i = 0; i < 10; i++) {
      const lampGroup = new THREE.Group();
      const pole = new THREE.Mesh(lampPoleGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
      pole.position.y = 3;

      const arm = new THREE.Mesh(lampArmGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
      arm.position.set(-1.2, 5.8, 0);

      const lightOrb = new THREE.Mesh(lampLightGeo, lampLightMat);
      lightOrb.position.set(-2.4, 5.6, 0);

      lampGroup.add(pole, arm, lightOrb);
      lampGroup.position.set(-ROAD_WIDTH / 2 - 2.5, 0, i * 32);
      scene.add(lampGroup);
      streetLamps.push(lampGroup);
    }

    // --- GAME ENGINE STATE ---
    let bestScore = gameStorage.getProfile().bestScore;
    let score = 0;
    let sessionCoins = 0;
    let level = 1;
    const baseSpeed = 40.0;
    let roadSpeed = baseSpeed;
    let spawnTimer = 0;
    let spawnInterval = 1.3;
    let slowTimer = 0;
    let powerupTimer = 0;
    let powerupSpawnInterval = 6.5;
    let coinTimer = 0;
    let coinSpawnInterval = 1.6;

    // Player 3D Vehicle
    let currentCarSkin = CAR_SKINS.find((c) => c.id === selectedCarRef.current) || CAR_SKINS[0];
    let player3D: Vehicle3DInstance = createPlayerVehicle3D(currentCarSkin);
    scene.add(player3D.mesh);

    const player = {
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      maxSpeed: currentCarSkin.handlingSpeed || 18.0,
      responsiveness: currentCarSkin.responsiveness || 0.18,
      coinMult: currentCarSkin.bonusCoinMultiplier || 1.0,
      lives: 3,
      invFrames: 0,
      shieldActive: false,
      shieldTimer: 0,
      roll: 0,
    };

    // Obstacles, Pickups & Particle systems
    interface Enemy3D {
      instance: Vehicle3DInstance;
      x: number;
      z: number;
      speed: number;
      variant: EnemyVariantType;
      nearMissed?: boolean;
      lane: number;
    }
    let enemies3D: Enemy3D[] = [];

    interface Coin3DItem {
      mesh: THREE.Mesh;
      x: number;
      z: number;
      speed: number;
    }
    let coins3D: Coin3DItem[] = [];

    interface PowerUp3DItem {
      group: THREE.Group;
      x: number;
      z: number;
      type: PowerUpType;
      speed: number;
    }
    let powerups3D: PowerUp3DItem[] = [];

    // 3D Particles
    interface Particle3D {
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
    }
    let particles3D: Particle3D[] = [];

    // 3D Text Floating Sprites
    interface TextSprite3D {
      sprite: THREE.Sprite;
      texture: THREE.CanvasTexture;
      life: number;
      maxLife: number;
      vy: number;
    }
    let textSprites3D: TextSprite3D[] = [];

    function createFloatingText3D(text: string, x: number, y: number, z: number, color: string = '#38bdf8') {
      try {
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 256;
        textCanvas.height = 64;
        const tctx = textCanvas.getContext('2d');
        if (tctx) {
          tctx.font = 'bold 28px monospace';
          tctx.fillStyle = color;
          tctx.textAlign = 'center';
          tctx.shadowColor = '#000000';
          tctx.shadowBlur = 6;
          tctx.fillText(text, 128, 42);
        }
        const texture = new THREE.CanvasTexture(textCanvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(4.5, 1.1, 1);
        sprite.position.set(x, y + 2.5, z);
        scene.add(sprite);
        textSprites3D.push({ sprite, texture, life: 35, maxLife: 35, vy: 0.08 });
      } catch {
        // Fallback gracefully without throwing
      }
    }

    // Spark Burst
    const sparkGeo = new THREE.SphereGeometry(0.12, 6, 6);
    function createSparkBurst(x: number, y: number, z: number, count: number = 16, color: number = 0xfacc15) {
      const sparkMat = new THREE.MeshBasicMaterial({ color });
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(sparkGeo, sparkMat);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        particles3D.push({
          mesh,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 7 + 2,
          vz: (Math.random() - 0.5) * 8,
          life: 25,
          maxLife: 25,
        });
      }
    }

    // --- GAME LIFECYCLE RESTART & RESPAWN ---
    function resetGame() {
      score = 0;
      sessionCoins = 0;
      level = 1;
      roadSpeed = baseSpeed;
      player.x = 0;
      player.vx = 0;
      player.lives = 3;
      player.invFrames = 0;
      player.shieldActive = false;
      player.shieldTimer = 0;
      slowTimer = 0;
      gameStorage.incrementGamesPlayed();

      // Clear existing 3D items
      enemies3D.forEach((e) => scene.remove(e.instance.mesh));
      enemies3D = [];
      coins3D.forEach((c) => scene.remove(c.mesh));
      coins3D = [];
      powerups3D.forEach((p) => scene.remove(p.group));
      powerups3D = [];
      particles3D.forEach((p) => scene.remove(p.mesh));
      particles3D = [];
      textSprites3D.forEach((t) => {
        scene.remove(t.sprite);
        t.texture.dispose();
      });
      textSprites3D = [];

      soundEngine.startEngine(selectedCarRef.current);
    }

    let lastTime = performance.now();
    let animFrameId: number;
    let cameraShake = 0;

    // --- MAIN ANIMATION / RENDER LOOP ---
    const animate = (currentTime: number) => {
      animFrameId = requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.08);
      lastTime = currentTime;

      // Handle Skin Updates
      if (selectedCarRef.current !== currentCarSkin.id) {
        currentCarSkin = CAR_SKINS.find((c) => c.id === selectedCarRef.current) || CAR_SKINS[0];
        scene.remove(player3D.mesh);
        player3D = createPlayerVehicle3D(currentCarSkin);
        scene.add(player3D.mesh);
      }

      // Handle Engine Audio Speed Modulation
      if (gameState === GameState.PLAY) {
        soundEngine.updateSpeed(roadSpeed / baseSpeed);
      }

      // --- GAMEPLAY UPDATE WHEN PLAYING ---
      if (gameState === GameState.PLAY) {
        // Scoring & Level progression
        score += Math.round(dt * 60);
        if (score > bestScore) {
          bestScore = gameStorage.saveBestScore(score);
        }
        level = Math.floor(score / 500) + 1;
        const targetSpeed = baseSpeed + (level - 1) * 3.5;
        roadSpeed = targetSpeed;

        // Slow Time Powerup
        if (slowTimer > 0) {
          slowTimer -= dt * 60;
          roadSpeed *= 0.55;
          if (slowTimer <= 0) soundEngine.playPowerupEnd();
        }

        // Shield Powerup
        if (player.shieldActive) {
          player.shieldTimer -= dt * 60;
          if (player.shieldTimer <= 0) {
            player.shieldActive = false;
            soundEngine.playPowerupEnd();
          }
        }
        if (player.invFrames > 0) player.invFrames--;

        // Player Steering Control:
        // Steer intention: -1 for Left, +1 for Right
        let steerDir = 0;
        if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) steerDir -= 1;
        if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) steerDir += 1;
        if (steeringInputRef.current !== 0) steerDir = steeringInputRef.current;

        // In 3D camera perspective (facing +Z, with +Y Up):
        // Visual Left = +X axis, Visual Right = -X axis.
        // Thus steering Left (-1) moves car toward +X (screen Left), and Right (+1) moves toward -X (screen Right).
        const steerForce = -steerDir * player.maxSpeed;
        player.vx += (steerForce - player.vx) * player.responsiveness;
        player.x += player.vx * dt;

        // Boundary Clamp
        const maxBoundary = ROAD_WIDTH / 2 - 1.2;
        if (player.x < -maxBoundary) {
          player.x = -maxBoundary;
          player.vx = 0;
        } else if (player.x > maxBoundary) {
          player.x = maxBoundary;
          player.vx = 0;
        }

        // Dynamic 3D Body Roll & Tilting
        const targetRoll = (-player.vx / player.maxSpeed) * 0.16;
        player.roll += (targetRoll - player.roll) * 0.2;
        player3D.mesh.position.set(player.x, player3D.isHover ? 0.4 + Math.sin(currentTime * 0.006) * 0.15 : 0, 0);
        player3D.mesh.rotation.set(0, 0, player.roll);
        player3D.mesh.rotation.y = (player.vx / player.maxSpeed) * 0.08;

        // Animate Wheels / Thrusters
        if (!player3D.isHover) {
          player3D.wheels.forEach((w) => {
            w.rotation.x -= roadSpeed * dt * 1.8;
          });
        }

        // Shield Mesh Animation
        if (player3D.shieldMesh) {
          player3D.shieldMesh.visible = player.shieldActive;
          if (player.shieldActive) {
            player3D.shieldMesh.rotation.y += dt * 3;
            player3D.shieldMesh.rotation.x += dt * 2;
          }
        }

        // Invulnerability Blink
        player3D.mesh.visible = player.invFrames <= 0 || Math.floor(player.invFrames / 4) % 2 === 0;

        // --- SCROLLING TRACK & ROADSIDE OBJECTS ---
        const moveDist = roadSpeed * dt;

        // Move Lane Stripes
        laneStripes.forEach((stripe) => {
          stripe.position.z -= moveDist;
          if (stripe.position.z < -30) stripe.position.z += 350;
        });

        // Move Streetlamps
        streetLamps.forEach((lamp) => {
          lamp.position.z -= moveDist;
          if (lamp.position.z < -40) lamp.position.z += 320;
        });

        // Move Distant Buildings
        buildings.forEach((b) => {
          b.position.z -= moveDist * 0.4;
          if (b.position.z < -40) b.position.z += 280;
        });

        // --- SPAWN ENEMY TRAFFIC ---
        spawnTimer -= dt;
        if (spawnTimer <= 0 && enemies3D.length < 5) {
          spawnTimer = Math.max(0.65, spawnInterval - level * 0.05 + Math.random() * 0.4);
          const laneIdx = Math.floor(Math.random() * NUM_LANES);
          const laneX = LANE_CENTERS_3D[laneIdx];

          const variants: EnemyVariantType[] = ['sedan', 'sedan', 'truck', 'bike'];
          const chosenVariant = variants[Math.floor(Math.random() * variants.length)];
          const chosenColor = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];

          const enemyInstance = createTrafficVehicle3D(chosenVariant, chosenColor);
          enemyInstance.mesh.position.set(laneX, 0, 180 + Math.random() * 30);
          scene.add(enemyInstance.mesh);

          const varConfig = ENEMY_VARIANTS[chosenVariant];
          enemies3D.push({
            instance: enemyInstance,
            x: laneX,
            z: enemyInstance.mesh.position.z,
            speed: roadSpeed * 0.65 * varConfig.speedMult,
            variant: chosenVariant,
            lane: laneIdx,
          });
        }

        // --- SPAWN COINS ---
        coinTimer -= dt;
        if (coinTimer <= 0) {
          coinTimer = coinSpawnInterval + Math.random() * 0.6;
          const laneX = LANE_CENTERS_3D[Math.floor(Math.random() * NUM_LANES)] + (Math.random() - 0.5) * 1.5;
          const coinMesh = createCoin3D();
          coinMesh.position.set(laneX, 0.7, 180);
          scene.add(coinMesh);
          coins3D.push({ mesh: coinMesh, x: laneX, z: 180, speed: roadSpeed });
        }

        // --- SPAWN POWERUPS ---
        powerupTimer -= dt;
        if (powerupTimer <= 0) {
          powerupTimer = powerupSpawnInterval + Math.random() * 4.0;
          const laneX = LANE_CENTERS_3D[Math.floor(Math.random() * NUM_LANES)];
          const type: PowerUpType = Math.random() < 0.5 ? 'shield' : 'slow';
          const pGroup = createPowerUp3D(type);
          pGroup.position.set(laneX, 1.2, 190);
          scene.add(pGroup);
          powerups3D.push({ group: pGroup, x: laneX, z: 190, type, speed: roadSpeed });
        }

        // --- UPDATE & COLLIDE ENEMY TRAFFIC ---
        for (let i = enemies3D.length - 1; i >= 0; i--) {
          const e = enemies3D[i];
          e.z -= (roadSpeed - e.speed) * dt;
          e.instance.mesh.position.z = e.z;

          // Rotate wheels
          e.instance.wheels.forEach((w) => {
            w.rotation.x -= e.speed * dt * 1.5;
          });

          // Near Miss Detection in 3D (+25 pts)
          const dx = Math.abs(player.x - e.x);
          const dz = Math.abs(e.z);
          if (!e.nearMissed && dx < 2.4 && dx > 1.2 && dz < 2.8) {
            e.nearMissed = true;
            score += 25;
            cameraShake = 0.35;
            soundEngine.playNearMiss(selectedCarRef.current);
            createFloatingText3D('+25 NEAR MISS!', player.x, 1.2, 0, '#38bdf8');
          }

          // Crash Collision Check
          const hitWidth = e.variant === 'truck' ? 2.2 : e.variant === 'bike' ? 1.0 : 1.8;
          const hitLength = e.variant === 'truck' ? 3.8 : 3.2;

          if (player.invFrames <= 0 && dx < hitWidth && dz < hitLength) {
            cameraShake = 0.8;
            createSparkBurst(player.x, 1.0, e.z, 24, 0xef4444);

            if (player.shieldActive) {
              player.shieldActive = false;
              player.invFrames = 40;
              soundEngine.playShieldBreak();
              createFloatingText3D('SHIELD DEFLECTED!', player.x, 1.5, 0, '#00e5ff');
              scene.remove(e.instance.mesh);
              enemies3D.splice(i, 1);
              continue;
            } else {
              player.lives--;
              player.invFrames = 75;
              const isGameOver = player.lives <= 0;
              soundEngine.playCrash(selectedCarRef.current, isGameOver);

              if (isGameOver) {
                // Game Over
                setGameState(GameState.GAMEOVER);
                soundEngine.stopEngine();
                if (score > bestScore) {
                  bestScore = gameStorage.saveBestScore(score);
                }
                return;
              }
            }
          }

          // Remove off-screen traffic
          if (e.z < -25) {
            scene.remove(e.instance.mesh);
            enemies3D.splice(i, 1);
          }
        }

        // --- UPDATE & COLLECT COINS ---
        for (let i = coins3D.length - 1; i >= 0; i--) {
          const c = coins3D[i];
          c.z -= roadSpeed * dt;
          c.mesh.position.z = c.z;
          c.mesh.rotation.z += dt * 4;
          c.mesh.position.y = 0.8 + Math.sin(currentTime * 0.008 + i) * 0.2;

          if (Math.abs(player.x - c.x) < 1.8 && Math.abs(c.z) < 2.0) {
            const earnedCoins = player.coinMult > 1 ? Math.round(1 * player.coinMult) : 1;
            sessionCoins += earnedCoins;
            score += 10 * earnedCoins;
            soundEngine.playCoin();
            createSparkBurst(c.x, 0.8, c.z, 10, 0xfacc15);
            createFloatingText3D(earnedCoins > 1 ? `+${earnedCoins} COINS (BONUS!)` : '+10 COIN', c.x, 1.2, 0, '#fde047');
            scene.remove(c.mesh);
            coins3D.splice(i, 1);

            // Immediately persist coins to storage so quitting never causes coin loss
            const updatedTotal = gameStorage.addCoins(earnedCoins);
            totalCoinsRef.current = updatedTotal;
            setTotalCoins(updatedTotal);
          } else if (c.z < -20) {
            scene.remove(c.mesh);
            coins3D.splice(i, 1);
          }
        }

        // --- UPDATE & COLLECT POWERUPS ---
        for (let i = powerups3D.length - 1; i >= 0; i--) {
          const p = powerups3D[i];
          p.z -= roadSpeed * dt;
          p.group.position.z = p.z;
          p.group.rotation.y += dt * 3;
          p.group.rotation.x += dt * 2;
          p.group.position.y = 1.3 + Math.sin(currentTime * 0.006 + i) * 0.25;

          if (Math.abs(player.x - p.x) < 2.0 && Math.abs(p.z) < 2.2) {
            if (p.type === 'shield') {
              player.shieldActive = true;
              player.shieldTimer = POWERUPS.shield.duration;
              soundEngine.playPowerup('shield');
              createFloatingText3D('SHIELD ACTIVE! 🛡️', player.x, 1.5, 0, '#00e5ff');
            } else {
              slowTimer = POWERUPS.slow.duration;
              soundEngine.playPowerup('slow');
              createFloatingText3D('TIME WARP! ⏱️', player.x, 1.5, 0, '#ff8c00');
            }
            createSparkBurst(p.x, 1.2, p.z, 20, p.type === 'shield' ? 0x00e5ff : 0xff8c00);
            scene.remove(p.group);
            powerups3D.splice(i, 1);
          } else if (p.z < -20) {
            scene.remove(p.group);
            powerups3D.splice(i, 1);
          }
        }

        // --- STATS UPDATE TO REACT PARENT ---
        onStatsUpdate({
          score,
          bestScore,
          level,
          lives: player.lives,
          shieldActive: player.shieldActive,
          shieldTimer: player.shieldTimer,
          slowActive: slowTimer > 0,
          slowTimer,
          sessionCoins,
          totalCoins: totalCoinsRef.current,
          selectedCarId: selectedCarRef.current,
        });
      }

      // --- UPDATE 3D PARTICLES ---
      for (let i = particles3D.length - 1; i >= 0; i--) {
        const p = particles3D[i];
        p.life--;
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        p.vy -= 12 * dt; // Gravity
        const scale = p.life / p.maxLife;
        p.mesh.scale.set(scale, scale, scale);

        if (p.life <= 0) {
          scene.remove(p.mesh);
          particles3D.splice(i, 1);
        }
      }

      // --- UPDATE FLOATING 3D TEXT SPRITES ---
      for (let i = textSprites3D.length - 1; i >= 0; i--) {
        const t = textSprites3D[i];
        t.life--;
        t.sprite.position.y += t.vy;
        const mat = t.sprite.material as THREE.SpriteMaterial;
        mat.opacity = t.life / t.maxLife;

        if (t.life <= 0) {
          scene.remove(t.sprite);
          try {
            t.texture.dispose();
            (t.sprite.material as THREE.Material).dispose();
          } catch {}
          textSprites3D.splice(i, 1);
        }
      }

      // --- CAMERA POSITIONING & VIEW MODES ---
      cameraShake *= 0.85;
      const shakeX = (Math.random() - 0.5) * cameraShake * 1.2;
      const shakeY = (Math.random() - 0.5) * cameraShake * 0.8;

      camera.up.set(0, 1, 0);

      if (camModeRef.current === 'hood') {
        // Hood / Bumper 1st-person view
        camera.position.set(player.x + shakeX, 1.4 + shakeY, 1.4);
        camera.lookAt(player.x * 0.8, 1.4, 40.0);
        camera.rotateZ(player.roll * 0.4);
      } else if (camModeRef.current === 'retro') {
        // High-Angle Arcade 3D View
        camera.position.set(player.x * 0.3 + shakeX, 17.0 + shakeY, -14.0);
        camera.lookAt(player.x * 0.6, 0.5, 12.0);
        camera.rotateZ(player.roll * 0.2);
      } else {
        // Dynamic 3rd-Person Chase Cam (Default)
        const targetCamX = player.x * 0.5 + shakeX;
        const targetCamY = 5.2 + shakeY;
        const targetCamZ = -9.2;
        camera.position.x += (targetCamX - camera.position.x) * 0.25;
        camera.position.y += (targetCamY - camera.position.y) * 0.25;
        camera.position.z = targetCamZ;
        camera.lookAt(player.x * 0.75, 1.5, 9.0);
        camera.rotateZ(player.roll * 0.3);
      }

      // Render 3D Scene
      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 480;
      height = container.clientHeight || 680;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [gameState, selectedCarId, onStatsUpdate, setGameState, setTotalCoins]);

  return (
    <div className="relative w-full aspect-[480/600] max-w-[460px] max-h-[calc(100dvh-90px)] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-950 flex items-center justify-center">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full block" />

      {/* 3D Camera Mode Toggle Floating Pill Button */}
      <button
        onClick={cycleCamera}
        className="absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-cyan-400 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-lg backdrop-blur transition active:scale-95"
        title="Switch 3D Camera Perspective (Chase, Hood, Retro)"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="uppercase">
          {camMode === 'chase' ? 'Chase 3D' : camMode === 'hood' ? 'Hood 3D' : 'Retro 3D'}
        </span>
      </button>
    </div>
  );
};
