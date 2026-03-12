"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Tuning ───────────────────────────────────────────────────────────────────
const DRAGONS = [
  { orbitRadius: 22, orbitSpeed: 0.18, orbitOffset: 0,              bodyColor: "#ff2200", emissive: "#ff4400", scale: 1.0,  yBase: 14, yAmp: 4, yFreq: 0.4 },
  { orbitRadius: 30, orbitSpeed: 0.13, orbitOffset: Math.PI * 0.66, bodyColor: "#cc1100", emissive: "#ff2200", scale: 0.82, yBase: 20, yAmp: 5, yFreq: 0.35 },
  { orbitRadius: 18, orbitSpeed: 0.22, orbitOffset: Math.PI * 1.33, bodyColor: "#ff5500", emissive: "#ff8800", scale: 0.7,  yBase: 10, yAmp: 3, yFreq: 0.5 },
];

const FIRE_COLORS = ["#ff2200", "#ff6600", "#ffaa00", "#ffdd00", "#ff4400"];

// ─── Single fire particle system ─────────────────────────────────────────────
function FireBreath({ count = 60 }) {
  const meshRef = useRef();
  const dummy   = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      life:    Math.random(),
      speed:   0.04 + Math.random() * 0.06,
      spread:  (Math.random() - 0.5) * 0.8,
      spreadY: (Math.random() - 0.5) * 0.4,
      offset:  Math.random() * Math.PI * 2,
    })), [count]);

  const colorArr = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const c = new THREE.Color(FIRE_COLORS[i % FIRE_COLORS.length]);
      arr[i * 3]     = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    particles.forEach((p, i) => {
      p.life += p.speed;
      if (p.life > 1) p.life = 0;

      const progress = p.life;
      dummy.position.set(
        progress * 4 + p.spread * progress,
        p.spreadY * progress,
        0
      );
      const s = (1 - progress) * 0.35 + 0.05;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        vertexColors={false}
        color="#ff6600"
        emissive="#ff3300"
        emissiveIntensity={3}
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ─── Dragon body (segmented spine + wings) ───────────────────────────────────
function DragonBody({ color, emissive, scale }) {
  // Spine segments
  const SEGMENTS = 12;
  const spineSegments = useMemo(() =>
    Array.from({ length: SEGMENTS }, (_, i) => ({
      x: -i * 0.9,
      y: Math.sin(i * 0.5) * 0.2,
      r: Math.max(0.05, 0.32 - i * 0.022),
    })), []);

  // Wing shape (left side, mirrored for right)
  const wingShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(1.5, 2.5, 4, 3.5, 5.5, 1.5);
    s.bezierCurveTo(4.5, 0.5, 3, -0.5, 0, 0);
    return s;
  }, []);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: 1.2,
    roughness: 0.4,
    metalness: 0.2,
    side: THREE.DoubleSide,
  }), [color, emissive]);

  const bodyRef = useRef();

  useFrame(({ clock }) => {
    if (!bodyRef.current) return;
    const t = clock.getElapsedTime();
    // Wing flap
    const wingL = bodyRef.current.getObjectByName("wingL");
    const wingR = bodyRef.current.getObjectByName("wingR");
    if (wingL) wingL.rotation.z =  0.4 + Math.sin(t * 4) * 0.5;
    if (wingR) wingR.rotation.z = -0.4 - Math.sin(t * 4) * 0.5;

    // Tail wave
    bodyRef.current.children.forEach((seg, i) => {
      if (seg.name?.startsWith("seg")) {
        seg.rotation.y = Math.sin(t * 2.5 + i * 0.4) * 0.12;
      }
    });
  });

  return (
    <group ref={bodyRef} scale={scale}>
      {/* Head */}
      <mesh position={[0.6, 0.1, 0]} material={mat}>
        <boxGeometry args={[0.7, 0.45, 0.4]} />
      </mesh>
      {/* Snout */}
      <mesh position={[1.05, -0.05, 0]} material={mat}>
        <boxGeometry args={[0.45, 0.28, 0.28]} />
      </mesh>
      {/* Eye glow */}
      <mesh position={[0.82, 0.2, 0.18]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffdd00" emissiveIntensity={8} />
      </mesh>
      <mesh position={[0.82, 0.2, -0.18]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffdd00" emissiveIntensity={8} />
      </mesh>

      {/* Spine segments */}
      {spineSegments.map((seg, i) => (
        <mesh key={i} name={`seg${i}`} position={[seg.x, seg.y, 0]} material={mat}>
          <sphereGeometry args={[seg.r, 8, 6]} />
        </mesh>
      ))}

      {/* Wings — pivot from mid-spine */}
      <group name="wingL" position={[-2.5, 0.5, 0]}>
        <mesh rotation={[Math.PI * 0.1, 0.2, 0]}>
          <shapeGeometry args={[wingShape]} />
          <meshStandardMaterial
            color={color} emissive={emissive} emissiveIntensity={0.8}
            transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false}
          />
        </mesh>
        {/* Wing ribs */}
        {[0, 1, 2].map((j) => (
          <mesh key={j} rotation={[0, 0, j * 0.3]}>
            <boxGeometry args={[4.5 - j * 0.8, 0.04, 0.06]} />
            <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={2} />
          </mesh>
        ))}
      </group>
      <group name="wingR" position={[-2.5, 0.5, 0]}>
        <mesh rotation={[Math.PI * 0.1, -0.2, 0]} scale={[1, 1, -1]}>
          <shapeGeometry args={[wingShape]} />
          <meshStandardMaterial
            color={color} emissive={emissive} emissiveIntensity={0.8}
            transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false}
          />
        </mesh>
        {[0, 1, 2].map((j) => (
          <mesh key={j} rotation={[0, 0, -j * 0.3]}>
            <boxGeometry args={[4.5 - j * 0.8, 0.04, 0.06]} />
            <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={2} />
          </mesh>
        ))}
      </group>

      {/* Fire breath — emitted from snout tip */}
      <group position={[1.3, -0.05, 0]}>
        <FireBreath count={50} />
        <pointLight color="#ff4400" intensity={12} distance={6} decay={2} />
      </group>
    </group>
  );
}

// ─── Single orbiting dragon ───────────────────────────────────────────────────
function Dragon({ cfg, index }) {
  const groupRef = useRef();
  const { orbitRadius, orbitSpeed, orbitOffset, bodyColor, emissive, scale, yBase, yAmp, yFreq } = cfg;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const angle = t * orbitSpeed + orbitOffset;

    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;
    const y = yBase + Math.sin(t * yFreq + orbitOffset) * yAmp;

    groupRef.current.position.set(x, y, z);

    // Face direction of travel (tangent to orbit)
    const tangentAngle = angle + Math.PI / 2;
    groupRef.current.rotation.y = -tangentAngle;

    // Pitch up/down with altitude change
    const dy = Math.cos(t * yFreq + orbitOffset) * yAmp * yFreq;
    groupRef.current.rotation.z = dy * 0.15;

    // Gentle banking
    groupRef.current.rotation.x = Math.sin(t * yFreq * 0.7) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <DragonBody color={bodyColor} emissive={emissive} scale={scale} />
      {/* Ambient glow around dragon */}
      <pointLight color="#ff3300" intensity={8} distance={12} decay={2} />
    </group>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function Dragons() {
  return (
    <group>
      {DRAGONS.map((cfg, i) => (
        <Dragon key={i} cfg={cfg} index={i} />
      ))}
    </group>
  );
}