import * as THREE from 'three';
import { CarSkin, ChassisType, EnemyVariantType } from '../types';

// Shared Materials & Geometries cache for high performance
const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16);
wheelGeo.rotateZ(Math.PI / 2);
const f1FrontWheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
f1FrontWheelGeo.rotateZ(Math.PI / 2);
const f1RearWheelGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.6, 16);
f1RearWheelGeo.rotateZ(Math.PI / 2);
const truckWheelGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.6, 16);
truckWheelGeo.rotateZ(Math.PI / 2);
const bikeWheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.25, 16);
bikeWheelGeo.rotateZ(Math.PI / 2);

const rubberMat = new THREE.MeshStandardMaterial({
  color: 0x181818,
  roughness: 0.8,
  metalness: 0.1,
});

const rimMat = new THREE.MeshStandardMaterial({
  color: 0xd4d4d8,
  roughness: 0.3,
  metalness: 0.8,
});

const chromeMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.15,
  metalness: 0.95,
});

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x0f172a,
  roughness: 0.1,
  metalness: 0.2,
  transparent: true,
  opacity: 0.85,
});

export interface Vehicle3DInstance {
  mesh: THREE.Group;
  wheels: THREE.Mesh[];
  underglow?: THREE.PointLight;
  headlights?: THREE.SpotLight[];
  thrusters?: THREE.Mesh[];
  lightBar?: THREE.Mesh;
  shieldMesh?: THREE.Mesh;
  isHover?: boolean;
}

/**
 * Creates a detailed 3D vehicle group based on CarSkin profile or enemy variant
 */
export function createPlayerVehicle3D(skin: CarSkin): Vehicle3DInstance {
  const group = new THREE.Group();
  const wheels: THREE.Mesh[] = [];
  const thrusters: THREE.Mesh[] = [];

  const primColor = new THREE.Color(skin.primaryColor);
  const secColor = new THREE.Color(skin.secondaryColor);
  const glowColor = new THREE.Color(skin.glowColor);
  const accentColor = new THREE.Color(skin.accentColor);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: primColor,
    roughness: 0.3,
    metalness: 0.5,
  });

  const secMat = new THREE.MeshStandardMaterial({
    color: secColor,
    roughness: 0.35,
    metalness: 0.4,
  });

  const glowMat = new THREE.MeshStandardMaterial({
    color: glowColor,
    emissive: glowColor,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });

  const isHover = skin.chassisType === 'hover';

  if (skin.chassisType === 'f1') {
    // --- FORMULA 1 CAR ---
    // Monocoque / Cockpit body
    const bodyGeo = new THREE.BoxGeometry(1.2, 0.5, 3.4);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;
    group.add(body);

    // Needle Nose
    const noseGeo = new THREE.ConeGeometry(0.55, 1.8, 4);
    noseGeo.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.45, 2.3);
    nose.scale.set(1, 0.45, 1);
    group.add(nose);

    // Front Wing
    const fWingGeo = new THREE.BoxGeometry(2.8, 0.08, 0.6);
    const fWing = new THREE.Mesh(fWingGeo, secMat);
    fWing.position.set(0, 0.25, 2.7);
    group.add(fWing);

    // Front Wing Endplates
    const epGeo = new THREE.BoxGeometry(0.08, 0.3, 0.7);
    const epL = new THREE.Mesh(epGeo, glowMat);
    epL.position.set(-1.4, 0.35, 2.7);
    const epR = new THREE.Mesh(epGeo, glowMat);
    epR.position.set(1.4, 0.35, 2.7);
    group.add(epL, epR);

    // Cockpit & Halo
    const cockpitGeo = new THREE.BoxGeometry(0.7, 0.4, 0.9);
    const cockpit = new THREE.Mesh(cockpitGeo, glassMat);
    cockpit.position.set(0, 0.8, 0.1);
    group.add(cockpit);

    const haloGeo = new THREE.TorusGeometry(0.35, 0.05, 8, 16, Math.PI);
    haloGeo.rotateX(Math.PI / 2);
    const halo = new THREE.Mesh(haloGeo, chromeMat);
    halo.position.set(0, 1.0, 0.1);
    group.add(halo);

    // Rear Engine Cover & Airbox
    const airboxGeo = new THREE.ConeGeometry(0.4, 1.4, 4);
    airboxGeo.rotateX(-Math.PI / 2);
    const airbox = new THREE.Mesh(airboxGeo, bodyMat);
    airbox.position.set(0, 0.85, -0.6);
    group.add(airbox);

    // Rear Wing
    const rWingGeo = new THREE.BoxGeometry(2.4, 0.1, 0.7);
    const rWing = new THREE.Mesh(rWingGeo, secMat);
    rWing.position.set(0, 1.25, -1.8);
    group.add(rWing);

    const strutGeo = new THREE.BoxGeometry(0.1, 0.7, 0.3);
    const strutL = new THREE.Mesh(strutGeo, chromeMat);
    strutL.position.set(-0.6, 0.85, -1.8);
    const strutR = new THREE.Mesh(strutGeo, chromeMat);
    strutR.position.set(0.6, 0.85, -1.8);
    group.add(strutL, strutR);

    // Open Wheels with wishbone suspension
    const createF1Wheel = (x: number, y: number, z: number, isRear: boolean) => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(isRear ? f1RearWheelGeo : f1FrontWheelGeo, rubberMat);
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(isRear ? 0.4 : 0.3, isRear ? 0.4 : 0.3, isRear ? 0.62 : 0.42, 8),
        rimMat
      );
      rim.rotateZ(Math.PI / 2);
      wGroup.add(tire, rim);
      wGroup.position.set(x, y, z);
      group.add(wGroup);
      wheels.push(tire);

      // Suspension rod
      const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, Math.abs(x) * 0.7, 8);
      rodGeo.rotateZ(x > 0 ? -Math.PI / 3 : Math.PI / 3);
      const rod = new THREE.Mesh(rodGeo, chromeMat);
      rod.position.set(x * 0.5, y + 0.1, z);
      group.add(rod);
    };

    createF1Wheel(-1.5, 0.45, 1.7, false);
    createF1Wheel(1.5, 0.45, 1.7, false);
    createF1Wheel(-1.6, 0.55, -1.4, true);
    createF1Wheel(1.6, 0.55, -1.4, true);

  } else if (skin.chassisType === 'truck') {
    // --- HEAVY HAULER / ARMORED TRUCK ---
    // Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(2.2, 0.8, 4.4);
    const chassis = new THREE.Mesh(chassisGeo, secMat);
    chassis.position.y = 0.8;
    group.add(chassis);

    // Cab / Cabin
    const cabGeo = new THREE.BoxGeometry(2.1, 1.3, 2.2);
    const cab = new THREE.Mesh(cabGeo, bodyMat);
    cab.position.set(0, 1.7, 0.8);
    group.add(cab);

    // Windshield
    const wsGeo = new THREE.BoxGeometry(1.9, 0.7, 0.1);
    const ws = new THREE.Mesh(wsGeo, glassMat);
    ws.position.set(0, 1.8, 1.91);
    group.add(ws);

    // Heavy Front Grille & Bullbar
    const grilleGeo = new THREE.BoxGeometry(1.8, 0.9, 0.3);
    const grille = new THREE.Mesh(grilleGeo, chromeMat);
    grille.position.set(0, 0.9, 2.25);
    group.add(grille);

    const bullbarGeo = new THREE.TorusGeometry(0.7, 0.08, 8, 16, Math.PI);
    bullbarGeo.rotateX(Math.PI / 2);
    const bullbar = new THREE.Mesh(bullbarGeo, chromeMat);
    bullbar.position.set(0, 0.9, 2.45);
    group.add(bullbar);

    // Roof Light Bar
    const lightBarGeo = new THREE.BoxGeometry(1.6, 0.15, 0.3);
    const lightBar = new THREE.Mesh(
      lightBarGeo,
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xfacc15,
        emissiveIntensity: 1.5,
      })
    );
    lightBar.position.set(0, 2.45, 0.9);
    group.add(lightBar);

    // Dual Exhaust Stacks
    const stackGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.8, 8);
    const stackL = new THREE.Mesh(stackGeo, chromeMat);
    stackL.position.set(-1.05, 2.2, -0.4);
    const stackR = new THREE.Mesh(stackGeo, chromeMat);
    stackR.position.set(1.05, 2.2, -0.4);
    group.add(stackL, stackR);

    // Truck Wheels (6 wheels for heavy feel)
    const addTruckWheel = (x: number, y: number, z: number) => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(truckWheelGeo, rubberMat);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.62, 8), rimMat);
      rim.rotateZ(Math.PI / 2);
      wGroup.add(tire, rim);
      wGroup.position.set(x, y, z);
      group.add(wGroup);
      wheels.push(tire);
    };

    addTruckWheel(-1.15, 0.7, 1.4);
    addTruckWheel(1.15, 0.7, 1.4);
    addTruckWheel(-1.15, 0.7, -0.8);
    addTruckWheel(1.15, 0.7, -0.8);
    addTruckWheel(-1.15, 0.7, -1.8);
    addTruckWheel(1.15, 0.7, -1.8);

  } else if (skin.chassisType === 'muscle') {
    // --- V8 SUPERCHARGED MUSCLE CAR ---
    // Body base
    const bodyGeo = new THREE.BoxGeometry(2.0, 0.65, 4.2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.65;
    group.add(body);

    // Roof & Greenhouse
    const roofGeo = new THREE.BoxGeometry(1.6, 0.55, 1.8);
    const roof = new THREE.Mesh(roofGeo, secMat);
    roof.position.set(0, 1.15, -0.3);
    group.add(roof);

    // Windshield & Rear glass
    const wsGeo = new THREE.BoxGeometry(1.5, 0.5, 0.1);
    const ws = new THREE.Mesh(wsGeo, glassMat);
    ws.position.set(0, 1.1, 0.6);
    ws.rotateX(-Math.PI / 6);
    group.add(ws);

    // Supercharger Roots Blower popping through hood!
    const blowerBaseGeo = new THREE.BoxGeometry(0.7, 0.35, 0.9);
    const blowerBase = new THREE.Mesh(blowerBaseGeo, chromeMat);
    blowerBase.position.set(0, 1.05, 1.1);
    group.add(blowerBase);

    // Dual intake butterfly scoops
    const scoopGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.25, 12);
    scoopGeo.rotateX(Math.PI / 2);
    const scoopL = new THREE.Mesh(scoopGeo, new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 }));
    scoopL.position.set(-0.2, 1.28, 1.4);
    const scoopR = new THREE.Mesh(scoopGeo, new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 }));
    scoopR.position.set(0.2, 1.28, 1.4);
    group.add(scoopL, scoopR);

    // Ducktail spoiler
    const spoilerGeo = new THREE.BoxGeometry(1.9, 0.2, 0.3);
    const spoiler = new THREE.Mesh(spoilerGeo, glowMat);
    spoiler.position.set(0, 1.05, -2.05);
    group.add(spoiler);

    // Muscle Wheels (Big wide rear drag slicks)
    const addMuscleWheel = (x: number, y: number, z: number, isRear: boolean) => {
      const wGroup = new THREE.Group();
      const geo = isRear
        ? new THREE.CylinderGeometry(0.65, 0.65, 0.6, 16)
        : wheelGeo;
      if (isRear) geo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(geo, rubberMat);
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, isRear ? 0.62 : 0.48, 8),
        rimMat
      );
      rim.rotateZ(Math.PI / 2);
      wGroup.add(tire, rim);
      wGroup.position.set(x, y, z);
      group.add(wGroup);
      wheels.push(tire);
    };

    addMuscleWheel(-1.05, 0.55, 1.3, false);
    addMuscleWheel(1.05, 0.55, 1.3, false);
    addMuscleWheel(-1.1, 0.62, -1.3, true);
    addMuscleWheel(1.1, 0.62, -1.3, true);

  } else if (skin.chassisType === 'hover') {
    // --- QUANTUM / ION HOVERCRAFT ---
    // Sci-Fi Zero-G hull
    const hullGeo = new THREE.ConeGeometry(1.2, 4.4, 5);
    hullGeo.rotateX(Math.PI / 2);
    const hull = new THREE.Mesh(hullGeo, bodyMat);
    hull.position.set(0, 0.8, 0);
    hull.scale.set(1.4, 0.5, 1);
    group.add(hull);

    // Cockpit canopy
    const canopyGeo = new THREE.SphereGeometry(0.7, 16, 12);
    canopyGeo.scale(1, 0.6, 1.8);
    const canopy = new THREE.Mesh(canopyGeo, glassMat);
    canopy.position.set(0, 1.05, 0.2);
    group.add(canopy);

    // Side aero wings / stabilizer fins
    const wingGeo = new THREE.BoxGeometry(3.2, 0.08, 1.4);
    const wing = new THREE.Mesh(wingGeo, secMat);
    wing.position.set(0, 0.7, -0.6);
    group.add(wing);

    // Quad Ion Repulsor pods
    const podGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 12);
    const createPod = (x: number, y: number, z: number) => {
      const pod = new THREE.Mesh(podGeo, chromeMat);
      pod.position.set(x, y, z);

      // Plasma Ring
      const ringGeo = new THREE.TorusGeometry(0.32, 0.08, 8, 16);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, glowMat);
      ring.position.y = -0.3;
      pod.add(ring);

      group.add(pod);
      thrusters.push(ring);
    };

    createPod(-1.2, 0.4, 1.2);
    createPod(1.2, 0.4, 1.2);
    createPod(-1.4, 0.4, -1.2);
    createPod(1.4, 0.4, -1.2);

  } else {
    // --- SPORT & SUPERCAR / HYPERCAR ---
    const isSupercar = skin.chassisType === 'supercar';

    // Wedge Chassis
    const bodyGeo = new THREE.BoxGeometry(2.0, isSupercar ? 0.55 : 0.65, 4.0);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = isSupercar ? 0.55 : 0.6;
    group.add(body);

    // Aerodynamic Sloped Nose
    const noseGeo = new THREE.ConeGeometry(1.0, 1.4, 4);
    noseGeo.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, isSupercar ? 0.45 : 0.5, 2.3);
    nose.scale.set(1.9, 0.5, 1);
    group.add(nose);

    // Cockpit Roof
    const roofGeo = new THREE.BoxGeometry(1.4, 0.5, 1.8);
    const roof = new THREE.Mesh(roofGeo, secMat);
    roof.position.set(0, isSupercar ? 0.95 : 1.1, -0.1);
    group.add(roof);

    // Windshield
    const wsGeo = new THREE.BoxGeometry(1.35, 0.5, 0.1);
    const ws = new THREE.Mesh(wsGeo, glassMat);
    ws.position.set(0, isSupercar ? 0.9 : 1.05, 0.8);
    ws.rotateX(-Math.PI / 5);
    group.add(ws);

    // GT Carbon Wing
    if (skin.hasSpoiler || isSupercar) {
      const wingGeo = new THREE.BoxGeometry(2.2, 0.08, 0.5);
      const wing = new THREE.Mesh(wingGeo, glowMat);
      wing.position.set(0, isSupercar ? 1.05 : 1.1, -1.9);
      group.add(wing);

      const strutGeo = new THREE.BoxGeometry(0.08, 0.45, 0.2);
      const strutL = new THREE.Mesh(strutGeo, chromeMat);
      strutL.position.set(-0.7, isSupercar ? 0.8 : 0.85, -1.9);
      const strutR = new THREE.Mesh(strutGeo, chromeMat);
      strutR.position.set(0.7, isSupercar ? 0.8 : 0.85, -1.9);
      group.add(strutL, strutR);
    }

    // Racing Stripes Accent
    if (skin.hasStripes) {
      const stripeGeo = new THREE.BoxGeometry(0.3, 0.02, 3.8);
      const stripeL = new THREE.Mesh(stripeGeo, glowMat);
      stripeL.position.set(-0.25, isSupercar ? 0.84 : 0.94, 0);
      const stripeR = new THREE.Mesh(stripeGeo, glowMat);
      stripeR.position.set(0.25, isSupercar ? 0.84 : 0.94, 0);
      group.add(stripeL, stripeR);
    }

    // 4 Sport Wheels
    const addSportWheel = (x: number, y: number, z: number) => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, rubberMat);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.47, 10), rimMat);
      rim.rotateZ(Math.PI / 2);
      wGroup.add(tire, rim);
      wGroup.position.set(x, y, z);
      group.add(wGroup);
      wheels.push(tire);
    };

    addSportWheel(-1.05, 0.5, 1.25);
    addSportWheel(1.05, 0.5, 1.25);
    addSportWheel(-1.05, 0.5, -1.25);
    addSportWheel(1.05, 0.5, -1.25);
  }

  // --- UNIVERSAL ADDITIONS (Headlights, Taillights, Underglow, Shield) ---
  // Headlights
  const hlGeo = new THREE.BoxGeometry(0.35, 0.15, 0.1);
  const hlMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0xe0f2fe,
    emissiveIntensity: 2.0,
  });
  const hlL = new THREE.Mesh(hlGeo, hlMat);
  hlL.position.set(-0.7, 0.5, 2.05);
  const hlR = new THREE.Mesh(hlGeo, hlMat);
  hlR.position.set(0.7, 0.5, 2.05);
  group.add(hlL, hlR);

  // Taillights
  const tlGeo = new THREE.BoxGeometry(0.45, 0.12, 0.1);
  const tlMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 2.0,
  });
  const tlL = new THREE.Mesh(tlGeo, tlMat);
  tlL.position.set(-0.7, 0.55, -2.05);
  const tlR = new THREE.Mesh(tlGeo, tlMat);
  tlR.position.set(0.7, 0.55, -2.05);
  group.add(tlL, tlR);

  // Neon Underglow Light
  const underglow = new THREE.PointLight(glowColor, 2.5, 6);
  underglow.position.set(0, 0.1, 0);
  group.add(underglow);

  // 3D Geodesic Shield Mesh (hidden by default)
  const shieldGeo = new THREE.IcosahedronGeometry(2.6, 2);
  const shieldMat = new THREE.MeshPhysicalMaterial({
    color: 0x00e5ff,
    emissive: 0x00e5ff,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    metalness: 0.1,
    wireframe: true,
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  shieldMesh.position.set(0, 0.8, 0);
  shieldMesh.visible = false;
  group.add(shieldMesh);

  return {
    mesh: group,
    wheels,
    underglow,
    thrusters,
    shieldMesh,
    isHover,
  };
}

/**
 * Creates 3D Traffic Obstacle Mesh (Sedan, Heavy Truck, or Motorcycle)
 */
export function createTrafficVehicle3D(variant: EnemyVariantType, colorHex: string): Vehicle3DInstance {
  const group = new THREE.Group();
  const wheels: THREE.Mesh[] = [];
  const col = new THREE.Color(colorHex);

  const mat = new THREE.MeshStandardMaterial({
    color: col,
    roughness: 0.4,
    metalness: 0.3,
  });

  if (variant === 'truck') {
    // Traffic Box Truck
    const cabGeo = new THREE.BoxGeometry(2.2, 1.4, 1.6);
    const cab = new THREE.Mesh(cabGeo, mat);
    cab.position.set(0, 1.4, 1.4);

    const cargoGeo = new THREE.BoxGeometry(2.3, 2.0, 3.2);
    const cargo = new THREE.Mesh(cargoGeo, new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.6 }));
    cargo.position.set(0, 1.8, -0.9);
    group.add(cab, cargo);

    const addTWheel = (x: number, y: number, z: number) => {
      const w = new THREE.Mesh(truckWheelGeo, rubberMat);
      w.position.set(x, y, z);
      group.add(w);
      wheels.push(w);
    };
    addTWheel(-1.15, 0.7, 1.3);
    addTWheel(1.15, 0.7, 1.3);
    addTWheel(-1.15, 0.7, -1.0);
    addTWheel(1.15, 0.7, -1.0);
    addTWheel(-1.15, 0.7, -2.0);
    addTWheel(1.15, 0.7, -2.0);

  } else if (variant === 'bike') {
    // Traffic Motorcycle
    const frameGeo = new THREE.BoxGeometry(0.6, 0.8, 2.2);
    const frame = new THREE.Mesh(frameGeo, mat);
    frame.position.set(0, 0.8, 0);

    const riderGeo = new THREE.BoxGeometry(0.7, 0.9, 0.8);
    const rider = new THREE.Mesh(riderGeo, new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 }));
    rider.position.set(0, 1.4, -0.2);
    group.add(frame, rider);

    const wF = new THREE.Mesh(bikeWheelGeo, rubberMat);
    wF.position.set(0, 0.6, 1.0);
    const wR = new THREE.Mesh(bikeWheelGeo, rubberMat);
    wR.position.set(0, 0.6, -1.0);
    group.add(wF, wR);
    wheels.push(wF, wR);

  } else {
    // Traffic Sedan
    const bodyGeo = new THREE.BoxGeometry(2.0, 0.65, 3.8);
    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.y = 0.6;

    const roofGeo = new THREE.BoxGeometry(1.5, 0.55, 1.8);
    const roof = new THREE.Mesh(roofGeo, glassMat);
    roof.position.set(0, 1.15, -0.2);
    group.add(body, roof);

    const addSWheel = (x: number, y: number, z: number) => {
      const w = new THREE.Mesh(wheelGeo, rubberMat);
      w.position.set(x, y, z);
      group.add(w);
      wheels.push(w);
    };
    addSWheel(-1.05, 0.5, 1.1);
    addSWheel(1.05, 0.5, 1.1);
    addSWheel(-1.05, 0.5, -1.1);
    addSWheel(1.05, 0.5, -1.1);
  }

  // Taillights facing oncoming player
  const tlGeo = new THREE.BoxGeometry(0.35, 0.15, 0.1);
  const tlMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 2.2,
  });
  const tlL = new THREE.Mesh(tlGeo, tlMat);
  tlL.position.set(-0.7, 0.6, -1.9);
  const tlR = new THREE.Mesh(tlGeo, tlMat);
  tlR.position.set(0.7, 0.6, -1.9);
  group.add(tlL, tlR);

  return {
    mesh: group,
    wheels,
  };
}

/**
 * Creates a glowing 3D Coin Mesh
 */
export function createCoin3D(): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(0.65, 0.65, 0.15, 18);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xeab308,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.2,
  });
  const mesh = new THREE.Mesh(geo, mat);
  return mesh;
}

/**
 * Creates 3D Power-Up Pickup
 */
export function createPowerUp3D(type: 'shield' | 'slow'): THREE.Group {
  const group = new THREE.Group();
  const color = type === 'shield' ? 0x00e5ff : 0xff8c00;

  const coreGeo = new THREE.IcosahedronGeometry(0.6, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.2,
    roughness: 0.1,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Orbital Ring
  const ringGeo = new THREE.TorusGeometry(0.9, 0.06, 8, 20);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: color,
    emissiveIntensity: 0.8,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotateX(Math.PI / 3);
  group.add(ring);

  return group;
}
