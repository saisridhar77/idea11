"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export default function Lights() {
  const currentSection = useStore((s) => s.currentSection);
  const { scene } = useThree();

  // Atmospheric fog — things far away fade to near-black
  useEffect(() => {
    scene.fog = new THREE.FogExp2("#080306", 0.022);
    return () => { scene.fog = null; };
  }, [scene]);

  return (
    <>
      {/* Very dim ambient — just enough to not be pitch black */}
      <ambientLight intensity={0.18} color="#1a0a05" />

      {/* Warm hemisphere — lava glow from below, deep sky above */}
      <hemisphereLight skyColor="#0a0510" groundColor="#3a1200" intensity={0.6} />

      {/* Single key light — dramatic angle, warm */}
      <directionalLight
        position={[10, 40, 15]} intensity={1.2}
        color="#ff8855"
      />
      {/* Cool rim from opposite side */}
      <directionalLight position={[-10, 30, -20]} intensity={0.3} color="#2244aa" />

      {/* 4 lava-glow uplights from pit floor — close range only */}
      {[
        [ 12,  0.5,  12],
        [-12,  0.5,  12],
        [ 12,  0.5, -12],
        [-12,  0.5, -12],
      ].map(([x, y, z], i) => (
        <pointLight key={i}
          position={[x, y, z]}
          intensity={12} color="#ff4400" distance={18} decay={2.5}
        />
      ))}

      {/* Center pit glow — the arena floor */}
      <pointLight position={[0, 0.5, 0]} intensity={20} color="#ff6600" distance={15} decay={2} />

      {/* Hotspot card accent lights — warm orange ring per card position */}
      {[
        [0, 3, 13], [-13, 3, 6.5], [-13, 3, -6.5],
        [0, 3, -13], [13, 3, -6.5], [13, 3, 6.5],
      ].map(([x, y, z], i) => (
        <pointLight key={`card-${i}`}
          position={[x, y, z]}
          intensity={4} color="#ff5500" distance={8} decay={2}
        />
      ))}

      {/* Celebration burst */}
      {currentSection >= 13 && (
        <>
          <pointLight position={[-20, 25, -20]} intensity={80} color="#ff0066" distance={80} decay={2} />
          <pointLight position={[ 20, 25, -20]} intensity={80} color="#0066ff" distance={80} decay={2} />
          <pointLight position={[  0, 35,   0]} intensity={60} color="#FFD700" distance={80} decay={2} />
        </>
      )}
    </>
  );
}