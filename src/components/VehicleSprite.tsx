import React from 'react';
import { CarSkin } from '../types';

interface VehicleSpriteProps {
  skin: CarSkin;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const VehicleSprite: React.FC<VehicleSpriteProps> = ({
  skin,
  className = '',
  size = 'md',
  animated = false,
}) => {
  const width = size === 'sm' ? 44 : size === 'lg' ? 76 : 56;
  const height = size === 'sm' ? 80 : size === 'lg' ? 140 : 104;

  const {
    chassisType,
    primaryColor,
    secondaryColor,
    windshieldColor,
    accentColor,
    glowColor,
    hasStripes,
    hasSpoiler,
    hasNeonGlow,
    hasLightBar,
    hasBlower,
  } = skin;

  return (
    <div
      className={`relative flex items-center justify-center ${className} ${
        animated ? 'transition-transform duration-300 hover:scale-105' : ''
      }`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Neon Glow */}
      {hasNeonGlow && (
        <div
          className="absolute rounded-full blur-md pointer-events-none opacity-75 animate-pulse"
          style={{
            backgroundColor: glowColor,
            width: `${width * 1.1}px`,
            height: `${height * 0.9}px`,
          }}
        />
      )}

      {/* SVG Multi-Chassis Vehicle Renderer */}
      <svg
        viewBox="0 0 100 180"
        className="w-full h-full relative z-10 drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={`glow-${skin.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ----------------- 1. FORMULA 1 CHASSIS ----------------- */}
        {chassisType === 'f1' && (
          <g>
            {/* Front Wing */}
            <rect x="15" y="16" width="70" height="12" rx="3" fill={secondaryColor} stroke="#0f172a" strokeWidth="1.5" />
            <rect x="22" y="12" width="56" height="5" rx="1.5" fill={accentColor} />
            <rect x="12" y="14" width="6" height="16" rx="2" fill={secondaryColor} />
            <rect x="82" y="14" width="6" height="16" rx="2" fill={secondaryColor} />

            {/* Front Wishbone Suspension Struts */}
            <line x1="32" y1="42" x2="16" y2="46" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <line x1="34" y1="52" x2="16" y2="52" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="68" y1="42" x2="84" y2="46" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <line x1="66" y1="52" x2="84" y2="52" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

            {/* Front Exposed Tires */}
            <rect x="4" y="32" width="14" height="28" rx="4" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="8" y="38" width="6" height="16" rx="2" fill={accentColor} opacity="0.8" />
            <rect x="82" y="32" width="14" height="28" rx="4" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="86" y="38" width="6" height="16" rx="2" fill={accentColor} opacity="0.8" />

            {/* Rear Wishbone Suspension */}
            <line x1="30" y1="120" x2="14" y2="126" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <line x1="70" y1="120" x2="86" y2="126" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

            {/* Rear Wide Exposed Tires */}
            <rect x="2" y="112" width="18" height="34" rx="4" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="7" y="120" width="8" height="18" rx="2" fill={accentColor} opacity="0.8" />
            <rect x="80" y="112" width="18" height="34" rx="4" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="85" y="120" width="8" height="18" rx="2" fill={accentColor} opacity="0.8" />

            {/* Main Tapered Fuselage / Nosecone */}
            <path
              d="M44 20 L56 20 L62 58 L72 85 L70 135 L30 135 L28 85 L38 58 Z"
              fill={primaryColor}
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Sidepod Radiator Intakes */}
            <path d="M28 85 L18 100 L22 130 L30 130 Z" fill={secondaryColor} stroke="#0f172a" strokeWidth="1.5" />
            <path d="M72 85 L82 100 L78 130 L70 130 Z" fill={secondaryColor} stroke="#0f172a" strokeWidth="1.5" />
            {/* Sidepod vents */}
            <line x1="22" y1="105" x2="28" y2="105" stroke="#0f172a" strokeWidth="2" />
            <line x1="23" y1="114" x2="29" y2="114" stroke="#0f172a" strokeWidth="2" />
            <line x1="78" y1="105" x2="72" y2="105" stroke="#0f172a" strokeWidth="2" />
            <line x1="77" y1="114" x2="71" y2="114" stroke="#0f172a" strokeWidth="2" />

            {/* Racing Stripes */}
            {hasStripes && (
              <path d="M48 22 L52 22 L53 134 L47 134 Z" fill={accentColor} opacity="0.9" />
            )}

            {/* Cockpit Opening & Safety Halo */}
            <ellipse cx="50" cy="86" rx="10" ry="14" fill="#09090b" />
            {/* Halo Protection Arc */}
            <path d="M42 80 C42 70 58 70 58 80 L56 94 L44 94 Z" fill="none" stroke="#1e293b" strokeWidth="3.5" />
            <line x1="50" y1="70" x2="50" y2="82" stroke="#1e293b" strokeWidth="3" />
            {/* Driver Helmet */}
            <circle cx="50" cy="85" r="6.5" fill={accentColor} />
            <rect x="46" y="80" width="8" height="4" rx="1" fill="#0f172a" />

            {/* Engine Airbox Scoop above Driver */}
            <ellipse cx="50" cy="104" rx="6" ry="4" fill="#0f172a" stroke={accentColor} strokeWidth="1" />

            {/* Rear Wing Endplates & Wing Elements */}
            <rect x="14" y="145" width="72" height="14" rx="2" fill={secondaryColor} stroke="#0f172a" strokeWidth="2" />
            <rect x="20" y="148" width="60" height="4" rx="1" fill={accentColor} />
            <rect x="10" y="138" width="6" height="24" rx="2" fill={secondaryColor} />
            <rect x="84" y="138" width="6" height="24" rx="2" fill={secondaryColor} />

            {/* Rear Red Rain Warning LED Flasher */}
            <rect x="47" y="152" width="6" height="5" rx="1.5" fill="#ef4444" filter={`url(#glow-${skin.id})`} />
          </g>
        )}

        {/* ----------------- 2. HEAVY TRUCK CHASSIS ----------------- */}
        {chassisType === 'truck' && (
          <g>
            {/* Massive Knobby Tires */}
            <rect x="4" y="34" width="16" height="32" rx="4" fill="#09090b" stroke="#27272a" strokeWidth="2" />
            <rect x="80" y="34" width="16" height="32" rx="4" fill="#09090b" stroke="#27272a" strokeWidth="2" />
            <rect x="4" y="108" width="16" height="36" rx="4" fill="#09090b" stroke="#27272a" strokeWidth="2" />
            <rect x="80" y="108" width="16" height="36" rx="4" fill="#09090b" stroke="#27272a" strokeWidth="2" />
            {/* Tire Tread Lugs */}
            <line x1="4" y1="44" x2="10" y2="44" stroke="#52525b" strokeWidth="2" />
            <line x1="4" y1="56" x2="10" y2="56" stroke="#52525b" strokeWidth="2" />
            <line x1="90" y1="44" x2="96" y2="44" stroke="#52525b" strokeWidth="2" />
            <line x1="90" y1="56" x2="96" y2="56" stroke="#52525b" strokeWidth="2" />
            <line x1="4" y1="120" x2="10" y2="120" stroke="#52525b" strokeWidth="2" />
            <line x1="4" y1="132" x2="10" y2="132" stroke="#52525b" strokeWidth="2" />
            <line x1="90" y1="120" x2="96" y2="120" stroke="#52525b" strokeWidth="2" />
            <line x1="90" y1="132" x2="96" y2="132" stroke="#52525b" strokeWidth="2" />

            {/* Front Heavy Steel Bullbar */}
            <rect x="18" y="14" width="64" height="12" rx="4" fill="#1c1917" stroke="#44403c" strokeWidth="2" />
            <rect x="26" y="18" width="8" height="4" rx="1.5" fill="#facc15" />
            <rect x="66" y="18" width="8" height="4" rx="1.5" fill="#facc15" />
            <line x1="38" y1="16" x2="38" y2="24" stroke="#78716c" strokeWidth="2" />
            <line x1="50" y1="16" x2="50" y2="24" stroke="#78716c" strokeWidth="2" />
            <line x1="62" y1="16" x2="62" y2="24" stroke="#78716c" strokeWidth="2" />

            {/* Heavy Truck Body / Hood */}
            <rect x="16" y="24" width="68" height="126" rx="8" fill={primaryColor} stroke="#0c0a09" strokeWidth="2" />

            {/* Hood Power Bulge & Grille */}
            <rect x="28" y="28" width="44" height="24" rx="4" fill={secondaryColor} stroke="#292524" strokeWidth="1.5" />
            <line x1="34" y1="34" x2="66" y2="34" stroke={accentColor} strokeWidth="2" />
            <line x1="34" y1="42" x2="66" y2="42" stroke={accentColor} strokeWidth="2" />

            {/* Armored Windshield */}
            <rect x="22" y="56" width="56" height="24" rx="4" fill={windshieldColor} stroke="#1c1917" strokeWidth="2" />
            {/* Center Window Divider */}
            <line x1="50" y1="56" x2="50" y2="80" stroke="#1c1917" strokeWidth="2.5" />

            {/* Roof Light Bar */}
            {hasLightBar && (
              <g>
                <rect x="20" y="52" width="60" height="7" rx="2" fill="#09090b" stroke="#52525b" strokeWidth="1" />
                <circle cx="28" cy="55.5" r="2.5" fill="#38bdf8" />
                <circle cx="42" cy="55.5" r="2.5" fill="#facc15" />
                <circle cx="58" cy="55.5" r="2.5" fill="#facc15" />
                <circle cx="72" cy="55.5" r="2.5" fill="#38bdf8" />
              </g>
            )}

            {/* Truck Bed / Cargo Liner */}
            <rect x="22" y="88" width="56" height="54" rx="4" fill={secondaryColor} stroke="#1c1917" strokeWidth="1.5" />
            {/* Bed Grooves */}
            <line x1="32" y1="92" x2="32" y2="136" stroke="#0c0a09" strokeWidth="2" />
            <line x1="44" y1="92" x2="44" y2="136" stroke="#0c0a09" strokeWidth="2" />
            <line x1="56" y1="92" x2="56" y2="136" stroke="#0c0a09" strokeWidth="2" />
            <line x1="68" y1="92" x2="68" y2="136" stroke="#0c0a09" strokeWidth="2" />

            {/* Dual Steel Rollbars */}
            <rect x="20" y="85" width="60" height="6" rx="3" fill="#44403c" stroke="#1c1917" strokeWidth="1.5" />

            {/* Heavy Taillights */}
            <rect x="20" y="144" width="12" height="6" rx="1.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
            <rect x="68" y="144" width="12" height="6" rx="1.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
          </g>
        )}

        {/* ----------------- 3. V8 MUSCLE CAR CHASSIS ----------------- */}
        {chassisType === 'muscle' && (
          <g>
            {/* Wide Tires (Drag Slicks on Rear) */}
            <rect x="8" y="32" width="10" height="26" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="82" y="32" width="10" height="26" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            {/* Extra wide rear drag tires */}
            <rect x="4" y="112" width="14" height="32" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="82" y="112" width="14" height="32" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />

            {/* Main Muscular Fastback Body */}
            <rect x="16" y="20" width="68" height="132" rx="6" fill={primaryColor} stroke="#09090b" strokeWidth="2" />

            {/* Wide Fender Flares */}
            <path d="M16 28 L12 36 L12 56 L16 64 Z" fill={secondaryColor} />
            <path d="M84 28 L88 36 L88 56 L84 64 Z" fill={secondaryColor} />
            <path d="M16 108 L10 118 L10 140 L16 148 Z" fill={secondaryColor} />
            <path d="M84 108 L90 118 L90 140 L84 148 Z" fill={secondaryColor} />

            {/* Racing Stripes */}
            {hasStripes && (
              <g opacity="0.95">
                <rect x="40" y="20" width="7" height="132" fill={accentColor} />
                <rect x="53" y="20" width="7" height="132" fill={accentColor} />
              </g>
            )}

            {/* Front Quad Round Headlights */}
            <circle cx="24" cy="24" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="33" cy="24" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="67" cy="24" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="76" cy="24" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />

            {/* Chrome Supercharger Blower / Air Scoop */}
            {hasBlower && (
              <g>
                {/* Hood Cutout hole */}
                <rect x="34" y="34" width="32" height="22" rx="3" fill="#09090b" stroke="#334155" strokeWidth="1.5" />
                {/* Blower Case (Chrome) */}
                <rect x="36" y="36" width="28" height="16" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
                {/* Red Triple Butterfly Valves */}
                <ellipse cx="43" cy="40" rx="3.5" ry="2" fill="#ef4444" />
                <ellipse cx="50" cy="40" rx="3.5" ry="2" fill="#ef4444" />
                <ellipse cx="57" cy="40" rx="3.5" ry="2" fill="#ef4444" />
                <line x1="38" y1="46" x2="62" y2="46" stroke="#475569" strokeWidth="2" />
              </g>
            )}

            {/* Muscle Windshield */}
            <rect x="22" y="62" width="56" height="22" rx="3" fill={windshieldColor} stroke="#09090b" strokeWidth="1.5" />

            {/* Fastback Roof & Rear Window */}
            <rect x="26" y="88" width="48" height="24" rx="2" fill={primaryColor} />
            <rect x="28" y="114" width="44" height="18" rx="2" fill={secondaryColor} stroke="#09090b" strokeWidth="1" />

            {/* Rear Ducktail / Spoiler */}
            {hasSpoiler && (
              <rect x="14" y="148" width="72" height="6" rx="2" fill={secondaryColor} stroke="#09090b" strokeWidth="1.5" />
            )}

            {/* Horizontal Taillight Bar */}
            <rect x="20" y="144" width="60" height="5" rx="1.5" fill="#ef4444" />
          </g>
        )}

        {/* ----------------- 4. EXOTIC SUPERCAR & HYPERCAR CHASSIS ----------------- */}
        {chassisType === 'supercar' && (
          <g>
            {/* Wheels & Brake Calipers */}
            <rect x="6" y="34" width="11" height="26" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="83" y="34" width="11" height="26" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="5" y="112" width="12" height="30" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="83" y="112" width="12" height="30" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />

            {/* Widebody Wedge Silhouette */}
            <path
              d="M34 16 L66 16 L84 40 L86 110 L88 144 L12 144 L14 110 L16 40 Z"
              fill={primaryColor}
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Front Aero Splitter */}
            <path d="M26 14 L74 14 L80 24 L20 24 Z" fill={secondaryColor} stroke="#0f172a" strokeWidth="1.5" />

            {/* Sharp Dagger LED Headlights */}
            <polygon points="24,24 38,20 32,28" fill="#facc15" filter={`url(#glow-${skin.id})`} />
            <polygon points="76,24 62,20 68,28" fill="#facc15" filter={`url(#glow-${skin.id})`} />

            {/* Deep Side Air Intakes */}
            <path d="M16 68 L26 78 L26 106 L15 108 Z" fill="#09090b" stroke={accentColor} strokeWidth="1.5" />
            <path d="M84 68 L74 78 L74 106 L85 108 Z" fill="#09090b" stroke={accentColor} strokeWidth="1.5" />

            {/* Cockpit Canopy */}
            <path
              d="M32 44 L68 44 L72 82 L28 82 Z"
              fill={windshieldColor}
              stroke="#0f172a"
              strokeWidth="1.5"
            />

            {/* Mid-Engine Glass Cover & V12 Cylinder Banks */}
            <rect x="32" y="86" width="36" height="32" rx="3" fill="#09090b" stroke="#334155" strokeWidth="1.5" />
            <rect x="38" y="90" width="10" height="24" rx="2" fill={secondaryColor} />
            <rect x="52" y="90" width="10" height="24" rx="2" fill={secondaryColor} />
            <line x1="43" y1="94" x2="43" y2="110" stroke={accentColor} strokeWidth="2" />
            <line x1="57" y1="94" x2="57" y2="110" stroke={accentColor} strokeWidth="2" />

            {/* Swan-Neck Carbon GT Wing */}
            {hasSpoiler && (
              <g>
                <rect x="8" y="146" width="84" height="10" rx="3" fill={secondaryColor} stroke="#0f172a" strokeWidth="2" />
                <rect x="14" y="148" width="72" height="3" rx="1" fill={accentColor} />
                <rect x="28" y="138" width="4" height="10" fill="#0f172a" />
                <rect x="68" y="138" width="4" height="10" fill="#0f172a" />
              </g>
            )}

            {/* Quad Exhaust Diffuser */}
            <circle cx="44" cy="146" r="2.5" fill="#38bdf8" />
            <circle cx="50" cy="146" r="2.5" fill="#38bdf8" />
            <circle cx="56" cy="146" r="2.5" fill="#38bdf8" />
          </g>
        )}

        {/* ----------------- 5. ANTI-GRAVITY CYBER HOVERCRAFT CHASSIS ----------------- */}
        {chassisType === 'hover' && (
          <g>
            {/* Floating Quad Ion Repulsor Pods with Energy Rings */}
            <g>
              {/* Front-Left Repulsor */}
              <ellipse cx="14" cy="42" rx="10" ry="16" fill="#042f2e" stroke={accentColor} strokeWidth="2" />
              <ellipse cx="14" cy="42" rx="5" ry="8" fill={glowColor} filter={`url(#glow-${skin.id})`} opacity="0.9" />
              {/* Front-Right Repulsor */}
              <ellipse cx="86" cy="42" rx="10" ry="16" fill="#042f2e" stroke={accentColor} strokeWidth="2" />
              <ellipse cx="86" cy="42" rx="5" ry="8" fill={glowColor} filter={`url(#glow-${skin.id})`} opacity="0.9" />
              {/* Rear-Left Repulsor */}
              <ellipse cx="12" cy="120" rx="11" ry="18" fill="#042f2e" stroke={accentColor} strokeWidth="2" />
              <ellipse cx="12" cy="120" rx="6" ry="10" fill={glowColor} filter={`url(#glow-${skin.id})`} opacity="0.9" />
              {/* Rear-Right Repulsor */}
              <ellipse cx="88" cy="120" rx="11" ry="18" fill="#042f2e" stroke={accentColor} strokeWidth="2" />
              <ellipse cx="88" cy="120" rx="6" ry="10" fill={glowColor} filter={`url(#glow-${skin.id})`} opacity="0.9" />
            </g>

            {/* Main Cyber Delta Fuselage */}
            <path
              d="M50 14 L76 48 L80 130 L64 148 L36 148 L20 130 L24 48 Z"
              fill={primaryColor}
              stroke={accentColor}
              strokeWidth="2"
            />

            {/* Swept Forward Aero Vector Canards */}
            <polygon points="50,14 62,34 38,34" fill={secondaryColor} />

            {/* High-Tech Plasma Cockpit Canopy */}
            <path
              d="M40 38 L60 38 L66 84 L34 84 Z"
              fill={windshieldColor}
              stroke={accentColor}
              strokeWidth="1.5"
            />
            {/* Cockpit holographic grid line */}
            <line x1="50" y1="38" x2="50" y2="84" stroke={glowColor} strokeWidth="1.5" opacity="0.8" />

            {/* Fusion Core Reactor Hatch */}
            <circle cx="50" cy="106" r="10" fill="#022c22" stroke={accentColor} strokeWidth="2" />
            <circle cx="50" cy="106" r="5" fill={glowColor} filter={`url(#glow-${skin.id})`} />

            {/* Twin Ion Plasma Exhaust Thrusters */}
            <rect x="36" y="148" width="10" height="12" rx="2" fill="#0f172a" stroke={accentColor} strokeWidth="1" />
            <rect x="54" y="148" width="10" height="12" rx="2" fill="#0f172a" stroke={accentColor} strokeWidth="1" />
            {/* Plasma Flame Trails */}
            <polygon points="38,160 44,176 40,160" fill={glowColor} filter={`url(#glow-${skin.id})`} />
            <polygon points="56,160 62,176 58,160" fill={glowColor} filter={`url(#glow-${skin.id})`} />
          </g>
        )}

        {/* ----------------- 6. CLASSIC / SPORT CHASSIS ----------------- */}
        {chassisType === 'sport' && (
          <g>
            {/* 4 Wheels */}
            <rect x="8" y="32" width="10" height="24" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="82" y="32" width="10" height="24" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="8" y="112" width="10" height="26" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />
            <rect x="82" y="112" width="10" height="26" rx="3" fill="#09090b" stroke="#27272a" strokeWidth="1.5" />

            {/* Main Aerodynamic Sport Body */}
            <rect x="18" y="18" width="64" height="136" rx="14" fill={primaryColor} stroke="#0f172a" strokeWidth="2" />

            {/* Aero Side Skirts */}
            <rect x="18" y="62" width="4" height="52" rx="2" fill={secondaryColor} />
            <rect x="78" y="62" width="4" height="52" rx="2" fill={secondaryColor} />

            {/* Dual Racing Stripes */}
            {hasStripes && (
              <g opacity="0.9">
                <rect x="42" y="18" width="5" height="136" fill={accentColor} />
                <rect x="53" y="18" width="5" height="136" fill={accentColor} />
              </g>
            )}

            {/* Front Headlights */}
            <rect x="24" y="22" width="14" height="8" rx="3" fill="#facc15" />
            <rect x="62" y="22" width="14" height="8" rx="3" fill="#facc15" />

            {/* Front Windshield */}
            <rect x="25" y="48" width="50" height="28" rx="6" fill={windshieldColor} stroke="#0f172a" strokeWidth="1.5" />

            {/* Rear Window */}
            <rect x="28" y="104" width="44" height="22" rx="4" fill={secondaryColor} stroke="#0f172a" strokeWidth="1.5" />

            {/* Rear Spoiler */}
            {hasSpoiler && (
              <g>
                <rect x="12" y="148" width="76" height="8" rx="3" fill={secondaryColor} stroke="#0f172a" strokeWidth="1.5" />
                <rect x="28" y="142" width="4" height="8" fill="#0f172a" />
                <rect x="68" y="142" width="4" height="8" fill="#0f172a" />
              </g>
            )}

            {/* Taillights */}
            <rect x="24" y="146" width="12" height="5" rx="2" fill="#ef4444" />
            <rect x="64" y="146" width="12" height="5" rx="2" fill="#ef4444" />
          </g>
        )}
      </svg>
    </div>
  );
};
