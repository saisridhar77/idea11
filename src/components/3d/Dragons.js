"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Config ───────────────────────────────────────────────────────────────────
const DRAGONS = [
  { r:22, speed:0.12, offset:0,             color:"#8B1A00", emit:"#ff3300", scale:3.0, yBase:12, yAmp:2.5, yFreq:0.30 },
  { r:30, speed:0.08, offset:Math.PI*0.7,   color:"#6B0F00", emit:"#dd2200", scale:3.8, yBase:18, yAmp:3.5, yFreq:0.25 },
  { r:17, speed:0.15, offset:Math.PI*1.4,   color:"#9B2200", emit:"#ff4400", scale:2.6, yBase:9,  yAmp:2.0, yFreq:0.38 },
];

const N_SEG  = 20;
const SEG_GAP = 0.55;

// Shared dark-horn material (created once, reused across all dragons)
const HORN_MAT = new THREE.MeshStandardMaterial({ color: "#222" });

// ─── Wing geometry ────────────────────────────────────────────────────────────
const WING_PTS = [
  [ 0,    0,    0],
  [ 0.7,  0.9,  0],
  [ 1.7,  1.2,  0],
  [ 2.7,  0.8,  0],
  [ 3.2,  0.2,  0],
  [ 2.3, -0.4,  0],
  [ 1.2, -0.3,  0],
];
const WING_FACES = [[0,1,6],[1,6,5],[1,2,5],[2,5,4],[2,3,4]];

function buildWingGeo(side) {
  const s = side === "L" ? 1 : -1;
  const verts = [];
  WING_FACES.forEach(([a,b,c]) => {
    [a,b,c].forEach(idx => verts.push(s * WING_PTS[idx][0], WING_PTS[idx][1], WING_PTS[idx][2]));
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.computeVertexNormals();
  return geo;
}

const WING_GEO = { L: buildWingGeo("L"), R: buildWingGeo("R") };

function BatWing({ side, color, emissive }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity: 1,
    side: THREE.DoubleSide, transparent: true, opacity: 0.75,
  }), [color, emissive]);

  return <mesh geometry={WING_GEO[side]} material={mat} rotation={[-Math.PI/2, 0, 0]} />;
}

// ─── Fire breath ──────────────────────────────────────────────────────────────
function FireBreath({ active }) {
  const COUNT = 60;
  const ref   = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pts   = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      life: Math.random(),
      spd:  0.02 + Math.random() * 0.03,
      sx:   (Math.random() - 0.5) * 0.5,
      sy:   (Math.random() - 0.5) * 0.25,
    })), []);

  useFrame(() => {
    if (!ref.current || !active) return;
    pts.forEach((p, i) => {
      p.life += p.spd;
      if (p.life > 1) {
        p.life = 0;
        p.sx = (Math.random() - 0.5) * 0.5;
        p.sy = (Math.random() - 0.5) * 0.25;
      }
      dummy.position.set(p.sx * p.life, p.sy * p.life, p.life * 4);
      dummy.scale.setScalar((1 - p.life) * 0.6 + 0.05);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, COUNT]} visible={active}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial color="#ff5500" />
    </instancedMesh>
  );
}

// ─── Dragon body ──────────────────────────────────────────────────────────────
const RADII = Array.from({ length: N_SEG }, (_, i) => {
  if (i === 0) return 0.25;
  if (i < 5)   return 0.28 + i * 0.05;
  return Math.max(0.05, 0.45 - (i - 5) * 0.03);
});

// Ribs: 3 per wing side, shared config
const RIBS = [0, 1, 2].map(i => ({ len: 2.3 - i * 0.5, angle: i * 0.3 }));

function DragonBody({ color, emissive, wavePhase }) {
  const segRefs  = useRef([]);
  const wingLRef = useRef();
  const wingRRef = useRef();
  const [breathing, setBreathing] = useState(false);

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity: 1.4, roughness: 0.5, metalness: 0.1,
  }), [color, emissive]);

  // Periodic fire breath trigger
  useEffect(() => {
    let timeout;
    const cycle = () => {
      timeout = setTimeout(() => {
        setBreathing(true);
        timeout = setTimeout(() => { setBreathing(false); cycle(); }, 1200 + Math.random() * 800);
      }, 2000 + Math.random() * 5000);
    };
    cycle();
    return () => clearTimeout(timeout);
  }, []);

  useFrame(({ clock }) => {
    const t    = clock.getElapsedTime();
    const time = t * 2 + wavePhase;
    const AMP  = 0.15;
    const FREQ = 0.8 + Math.sin(t * 0.3) * 0.4;

    for (let i = 0; i < N_SEG; i++) {
      const seg = segRefs.current[i];
      if (!seg) continue;
      const phase = i * 0.6;
      const sy = Math.sin(time - phase) * AMP * (0.5 + Math.sin(t * 0.5) * 0.5);
      const sx = Math.sin(time * 0.6 - phase * 0.4) * 0.08;
      seg.position.set(sx, sy, -i * SEG_GAP);
      if (i < N_SEG - 1) {
        const ny = Math.sin(time - (i+1)*SEG_GAP*FREQ) * AMP * (0.3 + ((i+1)/N_SEG)*0.7);
        seg.rotation.x = -Math.atan2(ny - sy, SEG_GAP) * 0.7;
      }
    }

    const flap = Math.sin(t * 3) * 0.6;
    if (wingLRef.current) wingLRef.current.rotation.z =  0.25 + flap;
    if (wingRRef.current) wingRRef.current.rotation.z = -0.25 - flap;
  });

  const shoulderZ = -4 * SEG_GAP;

  // Wing group rendered for both sides to avoid duplication
  const WingGroup = ({ side, posX, ribSign }) => (
    <group ref={side === "L" ? wingLRef : wingRRef} position={[posX, 0.25, shoulderZ]}>
      <BatWing side={side} color={color} emissive={emissive} />
      {RIBS.map(({ len, angle }, i) => (
        <mesh key={i} rotation={[0, 0, ribSign * angle]} material={bodyMat}>
          <cylinderGeometry args={[0.02, 0.01, len, 5]} />
        </mesh>
      ))}
    </group>
  );

  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.1,  0.25]} material={bodyMat}><boxGeometry args={[0.6, 0.35, 0.5]}  /></mesh>
      <mesh position={[0, -0.05, 0.6]} material={bodyMat}><boxGeometry args={[0.4, 0.2,  0.35]} /></mesh>

      {/* Horns */}
      {[[ 0.18, 0.3], [-0.18, -0.3]].map(([x, rot], i) => (
        <mesh key={i} position={[x, 0.32, 0.08]} rotation={[0, 0, rot]} material={HORN_MAT}>
          <coneGeometry args={[0.05, 0.45, 5]} />
        </mesh>
      ))}

      {/* Eyes */}
      {[0.2, -0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.12, 0.42]}>
          <sphereGeometry args={[0.06, 7, 5]} />
          <meshBasicMaterial color="#ffee00" />
        </mesh>
      ))}

      {/* Spine */}
      {Array.from({ length: N_SEG }, (_, i) => (
        <mesh key={i} ref={el => { segRefs.current[i] = el; }} material={bodyMat}>
          <sphereGeometry args={[RADII[i], 7, 5]} />
        </mesh>
      ))}

      {/* Wings */}
      <WingGroup side="L" posX={ 0.5} ribSign={ 1} />
      <WingGroup side="R" posX={-0.5} ribSign={-1} />

      {/* Fire */}
      <group position={[0, -0.05, 0.8]}>
        <FireBreath active={breathing} />
        <pointLight color="#ff4400" intensity={20} distance={8} decay={2} />
      </group>
    </group>
  );
}

// ─── Orbit + Dragon ───────────────────────────────────────────────────────────
function Dragon({ cfg }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t     = clock.getElapsedTime();
    const angle = t * cfg.speed + cfg.offset;
    ref.current.position.set(
      Math.cos(angle) * cfg.r,
      cfg.yBase + Math.sin(t * cfg.yFreq + cfg.offset) * cfg.yAmp,
      Math.sin(angle) * cfg.r,
    );
    ref.current.rotation.y = -angle;
    ref.current.rotation.z = Math.cos(t * cfg.yFreq + cfg.offset) * cfg.yAmp * cfg.yFreq * 0.1;
  });

  return (
    <group ref={ref} scale={cfg.scale}>
      <DragonBody color={cfg.color} emissive={cfg.emit} wavePhase={cfg.offset} />
      <pointLight color="#ff2200" intensity={4} distance={22 / cfg.scale} />
    </group>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function Dragons() {
  return (
    <group>
      {DRAGONS.map((cfg, i) => <Dragon key={i} cfg={cfg} />)}
    </group>
  );
}