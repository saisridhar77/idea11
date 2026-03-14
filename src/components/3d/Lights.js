"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export default function Lights() {
  const currentSection = useStore((s) => s.currentSection);
  const { scene } = useThree();

  // ── Set scene background to a deep night sky colour ──────────────────────
  // Without this the canvas background is just whatever CSS says (often black)
  // and no amount of lighting will make a "sky" appear.
  // useEffect(() => {
  //   scene.background = new THREE.Color("#08060f"); // deep dark indigo-night
  //   return () => { scene.background = null; };
  // }, [scene]);

  // Optional: uncomment for atmospheric depth
  // useEffect(() => {
  //   scene.fog = new THREE.FogExp2("#080306", 0.022);
  //   return () => { scene.fog = null; };
  // }, [scene]);

  return (
    <>
      {/* Slightly brighter ambient — was 0.18 which made everything muddy-dark */}
      <ambientLight intensity={1} color="#1a0a05" />

      {/* FIX: skyColor was "#0a0510" — nearly black, contributing nothing.
          Changed to a visible deep-blue/purple night sky tone.
          groundColor stays warm lava-orange. */}
      <hemisphereLight
        skyColor="#1a1040"      // dark blue-purple night sky — actually visible now
        groundColor="#3a1200"   // warm lava glow from below
        intensity={0.7}
      />

      {/* Key light unchanged — warm dramatic angle */}
      {/* <directionalLight
        position={[10, 40, 15]}
        intensity={1.2}
        color="#ff8855"
      /> */}

      {/* Cool rim — slightly brighter so it reads against the dark sky
      <directionalLight
        position={[-10, 30, -20]}
        intensity={0.45}
        color="#2244aa"
      /> */}

      {/* 4 lava-glow uplights from pit floor */}
      {/* {[
        [ 12, 0.5,  12],
        [-12, 0.5,  12],
        [ 12, 0.5, -12],
        [-12, 0.5, -12],
      ].map(([x, y, z], i) => (
        <pointLight key={i}
          position={[x, y, z]}
          intensity={12} color="#ff4400" distance={18} decay={2.5}
        />
      ))} */}

      {/* Center pit glow */}
      <pointLight
        position={[0, 0.5, 0]}
        intensity={20} color="#ff6600" distance={15} decay={2}
      />

      {/* Card accent lights */}
      {[
        [0, 3, 13], [-13, 3, 6.5], [-13, 3, -6.5],
        [0, 3, -13], [13, 3, -6.5], [13, 3, 6.5],
      ].map(([x, y, z], i) => (
        <pointLight key={`card-${i}`}
          position={[x, y, z]}
          intensity={4} color="#ff5500" distance={8} decay={2}
        />
      ))}
    </>
  );
}