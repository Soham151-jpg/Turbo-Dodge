// Web Audio API Retro & Multi-Vehicle Sound Effects Engine

interface EngineAudioNodes {
  osc1: OscillatorNode;
  osc2?: OscillatorNode;
  noise?: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentEngine: EngineAudioNodes | null = null;
  private currentEngineCarId: string | null = null;

  constructor() {
    try {
      const savedMute = localStorage.getItem('turbo_dodge_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      // Ignore
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('turbo_dodge_muted', String(this.isMuted));
    } catch {
      // Ignore
    }
    if (this.isMuted) {
      this.stopEngine();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // =========================================================================
  // 1. CAR SIGNATURE & HORN / REV SFX (DISTINCT FOR EVERY VEHICLE)
  // =========================================================================

  public playCarSignature(carId: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    switch (carId) {
      // 1. Classic Neon - Crisp 2.0L Twin-Cam rev & double road-runner horn
      case 'classic': {
        // Rev up
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);

        // Double Beep
        [0.2, 0.34].forEach((tOffset) => {
          if (!this.ctx) return;
          const hOsc = this.ctx.createOscillator();
          const hGain = this.ctx.createGain();
          hOsc.type = 'sine';
          hOsc.frequency.setValueAtTime(520, now + tOffset);
          hGain.gain.setValueAtTime(0.2, now + tOffset);
          hGain.gain.exponentialRampToValueAtTime(0.01, now + tOffset + 0.09);
          hOsc.connect(hGain);
          hGain.connect(this.ctx.destination);
          hOsc.start(now + tOffset);
          hOsc.stop(now + tOffset + 0.09);
        });
        break;
      }

      // 2. Crimson Viper - Turbo I4 + aggressive sport horn + popping backfires
      case 'crimson_viper': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(220, now);
        osc2.frequency.setValueAtTime(330, now);
        osc1.frequency.exponentialRampToValueAtTime(650, now + 0.22);
        osc2.frequency.exponentialRampToValueAtTime(980, now + 0.22);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);

        // Exhaust pops / backfire
        [0.24, 0.3, 0.36].forEach((offset, idx) => {
          if (!this.ctx) return;
          const popBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
          const data = popBuf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
          const noise = this.ctx.createBufferSource();
          noise.buffer = popBuf;
          const pGain = this.ctx.createGain();
          pGain.gain.setValueAtTime(0.2 - idx * 0.04, now + offset);
          pGain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.05);
          noise.connect(pGain);
          pGain.connect(this.ctx.destination);
          noise.start(now + offset);
          noise.stop(now + offset + 0.05);
        });
        break;
      }

      // 3. Cyber Phantom - Synthwave laser pulse & sub-drop
      case 'cyber_phantom': {
        const freqs = [330, 440, 660, 880];
        freqs.forEach((f, idx) => {
          if (!this.ctx) return;
          const t = now + idx * 0.06;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, t);
          osc.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.1);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.15);
        });

        // Sub drop
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(180, now);
        sub.frequency.exponentialRampToValueAtTime(45, now + 0.4);
        subGain.gain.setValueAtTime(0.3, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + 0.45);
        break;
      }

      // 4. Solar Flare - High compression golden V6 & dual fanfare horn
      case 'solar_flare': {
        const brass = [587.33, 739.99, 880.0];
        brass.forEach((f) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
        });
        break;
      }

      // 5. Apex Grand Prix F1 - 18,000 RPM screaming V10 & rapid paddle shifts
      case 'apex_gp_f1': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
        osc.frequency.setValueAtTime(900, now + 0.19); // Paddle Shift 1
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.32);
        osc.frequency.setValueAtTime(1100, now + 0.33); // Paddle Shift 2
        osc.frequency.exponentialRampToValueAtTime(1850, now + 0.48);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.52);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.52);
        break;
      }

      // 6. Scuderia Red Arrow - Crisp High-Rev Italian V12 + Pit Race Horn (Guaranteed auto-cutoff)
      case 'scuderia_fire_f1': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(520, now);
        osc2.frequency.setValueAtTime(780, now);
        osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
        osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.18);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.36);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.36);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.38);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.38);
        osc2.stop(now + 0.38);

        // Fail-safe cleanup
        setTimeout(() => {
          try {
            osc1.disconnect();
            osc2.disconnect();
            gain.disconnect();
          } catch {
            // Safe ignore
          }
        }, 400);
        break;
      }

      // 7. Silver Arrow F1 - Turbo-hybrid whine & electric MGU-K battery discharge
      case 'silver_bullet_f1': {
        const osc = this.ctx.createOscillator();
        const eOsc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        eOsc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(1300, now + 0.3);
        eOsc.frequency.setValueAtTime(1200, now);
        eOsc.frequency.exponentialRampToValueAtTime(3200, now + 0.3);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
        osc.connect(gain);
        eOsc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        eOsc.start(now);
        osc.stop(now + 0.42);
        eOsc.stop(now + 0.42);
        break;
      }

      // 8. Titan Heavy Hauler - 15.0L Diesel V8 chug & huge freight air horn
      case 'titan_truck': {
        // Deep freight horn (dual low chord)
        const h1 = this.ctx.createOscillator();
        const h2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        h1.type = 'sawtooth';
        h2.type = 'sawtooth';
        h1.frequency.setValueAtTime(164.81, now); // E3
        h2.frequency.setValueAtTime(207.65, now); // G#3
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        h1.connect(gain);
        h2.connect(gain);
        gain.connect(this.ctx.destination);
        h1.start(now);
        h2.start(now);
        h1.stop(now + 0.45);
        h2.stop(now + 0.45);

        // Airbrake hiss
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const hiss = this.ctx.createBufferSource();
        hiss.buffer = buf;
        const hFilt = this.ctx.createBiquadFilter();
        hFilt.type = 'highpass';
        hFilt.frequency.setValueAtTime(2500, now + 0.3);
        const hGain = this.ctx.createGain();
        hGain.gain.setValueAtTime(0.18, now + 0.3);
        hGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        hiss.connect(hFilt);
        hFilt.connect(hGain);
        hGain.connect(this.ctx.destination);
        hiss.start(now + 0.3);
        hiss.stop(now + 0.5);
        break;
      }

      // 9. Mammoth 4x4 Off-Roader - Train horn & monster turbo diesel roar
      case 'mammoth_4x4': {
        const notes = [146.83, 185.0, 220.0]; // D3, F#3, A3
        notes.forEach((f) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.5);
        });
        break;
      }

      // 10. Cyber Titan Truck - Industrial sonic blast & servo clamp
      case 'cyber_armored_truck': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }

      // 11. V8 Blower Eliminator - Roots supercharger whine & V8 burnout gunshot
      case 'v8_blower_eliminator': {
        // Supercharger whine
        const whine = this.ctx.createOscillator();
        const wGain = this.ctx.createGain();
        whine.type = 'sine';
        whine.frequency.setValueAtTime(800, now);
        whine.frequency.exponentialRampToValueAtTime(1900, now + 0.25);
        wGain.gain.setValueAtTime(0.18, now);
        wGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        whine.connect(wGain);
        wGain.connect(this.ctx.destination);
        whine.start(now);
        whine.stop(now + 0.35);

        // V8 Thump
        const v8 = this.ctx.createOscillator();
        const v8Gain = this.ctx.createGain();
        v8.type = 'sawtooth';
        v8.frequency.setValueAtTime(95, now);
        v8.frequency.exponentialRampToValueAtTime(320, now + 0.22);
        v8Gain.gain.setValueAtTime(0.3, now);
        v8Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
        v8.connect(v8Gain);
        v8Gain.connect(this.ctx.destination);
        v8.start(now);
        v8.stop(now + 0.38);
        break;
      }

      // 12. Road Warrior Muscle - Big Block 502 V8 straight-pipe rumble & tire chirp
      case 'road_warrior_muscle': {
        const v1 = this.ctx.createOscillator();
        const v2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        v1.type = 'sawtooth';
        v2.type = 'sawtooth';
        v1.frequency.setValueAtTime(80, now);
        v2.frequency.setValueAtTime(120, now);
        v1.frequency.exponentialRampToValueAtTime(290, now + 0.25);
        v2.frequency.exponentialRampToValueAtTime(435, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
        v1.connect(gain);
        v2.connect(gain);
        gain.connect(this.ctx.destination);
        v1.start(now);
        v2.start(now);
        v1.stop(now + 0.42);
        v2.stop(now + 0.42);
        break;
      }

      // 13. Venom GT Supercar - Turbo Blowoff flutter ("stututu-tu!")
      case 'venom_supercar': {
        // High rev
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);

        // Wastegate flutter (rapid pulsed noise chuffs)
        [0.2, 0.25, 0.29, 0.33, 0.36].forEach((tOffset, i) => {
          if (!this.ctx) return;
          const oscFlutter = this.ctx.createOscillator();
          const gFlutter = this.ctx.createGain();
          oscFlutter.type = 'triangle';
          oscFlutter.frequency.setValueAtTime(1400 - i * 150, now + tOffset);
          gFlutter.gain.setValueAtTime(0.16 - i * 0.03, now + tOffset);
          gFlutter.gain.exponentialRampToValueAtTime(0.01, now + tOffset + 0.04);
          oscFlutter.connect(gFlutter);
          gFlutter.connect(this.ctx.destination);
          oscFlutter.start(now + tOffset);
          oscFlutter.stop(now + tOffset + 0.04);
        });
        break;
      }

      // 14. Ghost Hypercar - Quad-Turbo W16 Titanium Exhaust Scream
      case 'ghost_hypercar': {
        const h1 = this.ctx.createOscillator();
        const h2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        h1.type = 'sawtooth';
        h2.type = 'sine';
        h1.frequency.setValueAtTime(440, now);
        h1.frequency.exponentialRampToValueAtTime(1450, now + 0.28);
        h2.frequency.setValueAtTime(880, now);
        h2.frequency.exponentialRampToValueAtTime(2900, now + 0.28);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        h1.connect(gain);
        h2.connect(gain);
        gain.connect(this.ctx.destination);
        h1.start(now);
        h2.start(now);
        h1.stop(now + 0.45);
        h2.stop(now + 0.45);
        break;
      }

      // 15. Galactic Void - Dark matter spatial warp sweep
      case 'galactic_void': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.62);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.62);
        break;
      }

      // 16. Orbital Ion Speeder - Zero-G Ion repulsor plasma pulse
      case 'orbital_hover_speeder': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.45);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.48);
        break;
      }

      // 17. Phoenix Quantum Hover - Quantum solar laser & tachyon surge
      case 'phoenix_quantum_speeder': {
        const freqs = [523.25, 783.99, 1046.5, 1567.98];
        freqs.forEach((f, idx) => {
          if (!this.ctx) return;
          const t = now + idx * 0.05;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, t);
          osc.frequency.exponentialRampToValueAtTime(f * 2, t + 0.12);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.18);
        });
        break;
      }

      default:
        this.playStart();
        break;
    }
  }

  // Quick In-Game Horn / Rev Blast
  public playCarHorn(carId: string) {
    this.playCarSignature(carId);
  }

  // =========================================================================
  // 2. NEAR-MISS DODGE & DRIFT SOUNDS (TAILORED PER CAR CLASS)
  // =========================================================================

  public playNearMiss(carId: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const isHover = carId.includes('hover') || carId.includes('quantum');
    const isTruck = carId.includes('truck') || carId.includes('4x4');
    const isF1 = carId.includes('f1');

    if (isHover) {
      // Sci-fi zero-friction air vortex slip
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (isF1) {
      // Sonic aero vortex tear
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.16);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (isTruck) {
      // Heavy air blast whoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      // High-speed Doppler whoosh & tire chirp
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.16);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  }

  public playDrift(carId: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const isHover = carId.includes('hover') || carId.includes('quantum');

    if (isHover) {
      // Thruster ionization burst
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      // Tire squeal chirp
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  // =========================================================================
  // 3. CONTINUOUS DYNAMIC IN-GAME ENGINE SYNTHESIZER
  // =========================================================================

  public startEngine(carId: string = 'classic') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // If engine is already running with same car, don't recreate
    if (this.currentEngine && this.currentEngineCarId === carId) {
      return;
    }

    this.stopEngine();
    this.currentEngineCarId = carId;
    const now = this.ctx.currentTime;

    const isHover = carId.includes('hover') || carId.includes('quantum');
    const isTruck = carId.includes('truck') || carId.includes('4x4');
    const isF1 = carId.includes('f1');
    const isMuscle = carId.includes('muscle') || carId.includes('v8');
    const isSuper = carId.includes('supercar') || carId.includes('hypercar') || carId.includes('void');

    const osc1 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.3);

    if (isF1) {
      // Screaming high RPM F1 sawtooth
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(320, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      osc1.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      this.currentEngine = { osc1, filter, gain };
    } else if (isTruck) {
      // Heavy low-pass pulse diesel
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(65, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);
      osc1.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      this.currentEngine = { osc1, filter, gain };
    } else if (isMuscle) {
      // Detuned roaring V8
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(90, now);
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(94, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      osc2.start(now);
      this.currentEngine = { osc1, osc2, filter, gain };
    } else if (isHover) {
      // FM sci-fi ion repulsor
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(130, now);
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(8, now);
      lfoGain.gain.setValueAtTime(25, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      osc1.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      lfo.start(now);
      osc1.start(now);
      this.currentEngine = { osc1, filter, gain, lfo, lfoGain };
    } else if (isSuper) {
      // Exotic high-rev supercar
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(180, now);
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(360, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      osc2.start(now);
      this.currentEngine = { osc1, osc2, filter, gain };
    } else {
      // Sport car
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(120, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);
      osc1.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      this.currentEngine = { osc1, filter, gain };
    }
  }

  public updateEngine(carId: string, speedFactor: number, isSteering: boolean) {
    if (this.isMuted || !this.ctx || !this.currentEngine) return;

    const isHover = carId.includes('hover') || carId.includes('quantum');
    const isTruck = carId.includes('truck') || carId.includes('4x4');
    const isF1 = carId.includes('f1');
    const isMuscle = carId.includes('muscle') || carId.includes('v8');
    const isSuper = carId.includes('supercar') || carId.includes('hypercar') || carId.includes('void');

    const steerBoost = isSteering ? 1.08 : 1.0;
    const now = this.ctx.currentTime;

    if (isF1) {
      const targetFreq = (300 + speedFactor * 500) * steerBoost;
      this.currentEngine.osc1.frequency.setTargetAtTime(targetFreq, now, 0.05);
      this.currentEngine.filter.frequency.setTargetAtTime(1200 + speedFactor * 1000, now, 0.05);
    } else if (isTruck) {
      const targetFreq = (60 + speedFactor * 75) * steerBoost;
      this.currentEngine.osc1.frequency.setTargetAtTime(targetFreq, now, 0.05);
      this.currentEngine.filter.frequency.setTargetAtTime(320 + speedFactor * 250, now, 0.05);
    } else if (isMuscle) {
      const targetFreq = (85 + speedFactor * 160) * steerBoost;
      this.currentEngine.osc1.frequency.setTargetAtTime(targetFreq, now, 0.05);
      if (this.currentEngine.osc2) {
        this.currentEngine.osc2.frequency.setTargetAtTime(targetFreq * 1.05, now, 0.05);
      }
      this.currentEngine.filter.frequency.setTargetAtTime(550 + speedFactor * 500, now, 0.05);
    } else if (isHover) {
      const targetFreq = (120 + speedFactor * 220) * steerBoost;
      this.currentEngine.osc1.frequency.setTargetAtTime(targetFreq, now, 0.05);
      if (this.currentEngine.lfo) {
        this.currentEngine.lfo.frequency.setTargetAtTime(8 + speedFactor * 12, now, 0.05);
      }
    } else if (isSuper) {
      const targetFreq = (170 + speedFactor * 320) * steerBoost;
      this.currentEngine.osc1.frequency.setTargetAtTime(targetFreq, now, 0.05);
      if (this.currentEngine.osc2) {
        this.currentEngine.osc2.frequency.setTargetAtTime(targetFreq * 2, now, 0.05);
      }
      this.currentEngine.filter.frequency.setTargetAtTime(950 + speedFactor * 800, now, 0.05);
    } else {
      const targetFreq = (115 + speedFactor * 180) * steerBoost;
      this.currentEngine.osc1.frequency.setTargetAtTime(targetFreq, now, 0.05);
      this.currentEngine.filter.frequency.setTargetAtTime(650 + speedFactor * 450, now, 0.05);
    }
  }

  public stopEngine() {
    if (!this.currentEngine || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.currentEngine.gain.gain.setValueAtTime(this.currentEngine.gain.gain.value, now);
      this.currentEngine.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      const engineToStop = this.currentEngine;
      setTimeout(() => {
        try {
          engineToStop.osc1.stop();
          engineToStop.osc2?.stop();
          engineToStop.lfo?.stop();
          engineToStop.noise?.stop();
        } catch {
          // Ignore
        }
      }, 160);
    } catch {
      // Ignore
    }
    this.currentEngine = null;
    this.currentEngineCarId = null;
  }

  // =========================================================================
  // 4. CORE ARCADE GAMEPLAY SOUNDS
  // =========================================================================

  // Powerup Pickup
  public playPowerup(type?: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type === 'shield' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Powerup Expire SFX
  public playPowerupEnd() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Shield Deflect / Break SFX
  public playShieldBreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Speed Update alias
  public updateSpeed(speedFactor: number, carId?: string, isSteering: boolean = false) {
    const id = carId || this.currentEngineCarId || 'classic';
    this.updateEngine(id, speedFactor, isSteering);
  }

  // Crash / Collision sound with vehicle signature sound
  public playCrash(carId?: string, isGameOver: boolean = false) {
    if (isGameOver) {
      this.stopEngine();
    }
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Trigger the equipped vehicle's signature horn / rev / engine sound on crash
    if (carId) {
      this.playCarSignature(carId);
    }

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.4);
  }

  // Level Up Jingle
  public playLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    });
  }

  // Coin collection sound
  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Shop purchase sound
  public playPurchase() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  // Start game sound
  public playStart() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const soundEngine = new SoundEngine();
