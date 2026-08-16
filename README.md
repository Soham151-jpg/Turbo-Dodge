# 🏎️ Turbo Dodge 3D — Arcade Endless Racer

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_WebGL-black.svg?logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Turbo Dodge 3D** is a fast-paced, high-octane 3D retro-arcade highway racer built with **React 19**, **Three.js (WebGL)**, and pure **Web Audio API** synthesizers. Weave through multi-lane highway traffic, perform high-speed near-miss close passes, collect gold coins, trigger power-ups, and unlock a garage full of specialized 3D vehicles.

---

## 🌟 Key Features

- **🎮 Real-Time 3D WebGL Engine (Three.js)**:
  - Custom procedural 3D vehicle geometries with metallic reflections, headlights, tail-light bloom, and neon ground underglow.
  - Multi-lane infinity highway with scrolling road textures, streetlamp glow, reflective barriers, and horizon fog.
  - Dynamic 3D particle systems for coin collections, sparks, smoke, speed lines, and crash debris explosions.

- **🎥 Dynamic Camera Perspectives**:
  - **Chase Cam**: Classic third-person arcade view behind and slightly above your vehicle.
  - **Hood / Bumper Cam**: High-intensity first-person perspective for adrenaline-fueled speed.
  - **Retro Top-Down Cam**: High-angle camera paying homage to classic 16-bit arcade racers.

- **🚗 15+ Unlockable Vehicles Across 6 Distinct Classes**:
  - **Sport & Tuner**: Agile, balanced street racers with dual racing stripes and spoilers.
  - **Formula 1 / Open-Wheel**: High-downforce carbon chassis with multi-tier wings and halo cockpits.
  - **Heavy & Off-Road Trucks**: Heavy armored haulers and 4x4 monster trucks with roof light bars and bullbars.
  - **V8 Muscle Cars**: Classic American muscle beasts with hood blowers and deep exhaust rumbles.
  - **GT Supercars**: Low-slung, aerodynamic hypercars designed for extreme top speeds.
  - **Special / Sci-Fi Hovercrafts**: Zero-G anti-gravity hover vehicles with floating thruster pods.

- **🔊 Procedural Web Audio Sound Engine (Zero external audio files)**:
  - Dynamic pitch-shifted engine RPM synthesizers that scale with current speed and steering input.
  - Unique signature sounds for each vehicle class (18,000 RPM F1 screams, turbo flutter, heavy air horns, V8 supercharger whines, cyber laser pulses, and police sirens).
  - Custom audio effects for coin pickups, near-miss whooshes, shield activations, slow-motion warps, and crash collisions.

- **⚡ Power-Ups & Tactical Mechanics**:
  - **🛡️ Kinetic Shield**: Protects against one fatal collision while active.
  - **⏱️ Chrono Slow-Mo**: Dilates time to 50% speed for precision maneuvering through dense traffic jams.
  - **🔥 Near-Miss Bonus**: Skim past enemy vehicles at high speed to earn bonus score points and boost multipliers.
  - **🪙 Dynamic Traffic Spawning**: Sedans, speeding motorcycles, and slow-moving freight trucks create dynamic traffic scenarios.

- **💾 Local Storage Persistence**:
  - Automatically saves unlocked vehicles, total bank coins, high scores, and audio preferences across game sessions.

- **📱 Fully Responsive & Cross-Platform**:
  - Full keyboard support for desktop players (Arrow keys / WASD / Hotkeys).
  - Touch-friendly on-screen steering controls with haptic feedback and PWA support for mobile and tablet devices.

---

## 🕹️ Controls

| Action | Desktop Keyboard | Mobile / Tablet |
| :--- | :--- | :--- |
| **Steer Left / Right** | `←` / `→` or `A` / `D` | Left / Right On-Screen Touch Buttons |
| **Activate Shield** | `S` key | On-Screen Shield Button |
| **Activate Slow-Mo** | `T` key | On-Screen Slow-Mo Button |
| **Switch Camera Angle**| `C` key | Camera Toggle Icon |
| **Pause / Resume** | `P` or `Escape` | Pause Button in HUD |
| **Mute / Unmute Audio** | `M` key | Speaker Icon in HUD |
| **Start / Restart** | `Enter` or `Space` | Start / Play Again Button |

---

## 🏎️ Vehicle Garage

| Vehicle | Class | Sound Profile | Signature Trait |
| :--- | :--- | :--- | :--- |
| **Classic Neon** | Sport | 2.0L Twin-Cam Rev | Default starter, well-balanced handling |
| **Crimson Viper** | Sport | Turbo I4 + Backfire Pop | High-contrast dual racing stripes & spoiler |
| **Cyber Phantom** | Sport | Synthwave Electric Drive | Stealth matte black with cyan neon underglow |
| **Apex Grand Prix F1** | Formula | 18,000 RPM Screaming V10 | Open-wheel chassis, precision steering |
| **Scuderia Red Arrow** | Formula | Monza Championship V12 | Ultra-high downforce, +25% coin bonus multiplier |
| **Titan Heavy Hauler** | Truck | 15.0L Turbo-Diesel Chug | Freight train air horn & roof lightbar |
| **Mammoth 4x4 Off-Roader** | Truck | Monster 4x4 Rumble | Quad roof foglamps, steel rollcage |
| **V8 Blower Eliminator** | Muscle | Supercharged Big Block V8 | Exposed chrome hood blower, classic purple gloss |
| **Apex GT Supercar** | Supercar | Twin-Turbo High-Rev V8 | Low-profile carbon body, active aero wing |
| **Zero-G Hover Racer** | Special | Anti-Gravity Plasma Hum | Wheel-less magnetic levitation chassis |
| **Hyperion Interceptor** | Special | Dual-Tone Police Siren | Emergency red/blue strobes & siren on demand |

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: [React 19](https://react.dev/)
- **3D Graphics & Rendering**: [Three.js](https://threejs.org/) (WebGL Canvas, Procedural Meshes, Phong Materials, Directional Shadows)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Synthesis**: Native Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `GainNode`)
- **Build Tool**: [Vite 6](https://vitejs.dev/) with TypeScript support

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/turbo-dodge-3d.git
   cd turbo-dodge-3d
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open [http://localhost:3000](http://localhost:3000) (or the port indicated in your terminal) to play!

---

## 📦 Available Scripts

- `npm run dev`: Starts the Vite development server on port `3000`.
- `npm run build`: Compiles and bundles TypeScript and React for production into `dist/`.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs TypeScript type checking across all project files (`tsc --noEmit`).

---

## 📂 Project Structure

```text
├── public/                # Static assets, PWA icons, and manifest
├── src/
│   ├── components/        # React UI and 3D Canvas components
│   │   ├── GameCanvas.tsx # Three.js WebGL game loop, physics & rendering
│   │   ├── HUD.tsx        # In-game heads-up display (score, health, coins)
│   │   ├── StartOverlay.tsx # Main arcade menu & car preview
│   │   ├── ShopModal.tsx  # Garage vehicle store & skin selector
│   │   ├── GameOverOverlay.tsx # Post-game summary & high scores
│   │   ├── MobileControls.tsx  # Responsive on-screen touch steering
│   │   └── VehicleSprite.tsx   # 2D preview sprites for garage UI
│   ├── utils/
│   │   ├── audio.ts       # Procedural Web Audio synthesizer engine
│   │   └── storage.ts     # LocalStorage profile & score persistence
│   ├── types.ts           # Game types, vehicle configs & power-up definitions
│   ├── App.tsx            # Main application layout and state manager
│   ├── main.tsx           # Entry point
│   └── index.css          # Tailwind CSS global styles
├── index.html             # HTML entry template
├── package.json           # Dependencies and build scripts
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite bundler configuration
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
