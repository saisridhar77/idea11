"use client";

import { useRef } from "react";
import * as THREE from "three";

/**
 * TUNNEL ENTRY
 * Static tunnel — no fade out. Camera starts inside via waypoint 0.
 * Position/rotation this group to align with your GLTF stadium's tunnel opening.
 */
export default function TunnelEntry() {
  return (
    <group position={[0, 0, 70]}>
      {/* Tunnel tube segments */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 1.8, -i * 8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[4.5, 4.5, 8, 24, 1, true]} />
          <meshStandardMaterial
            color={`hsl(240, 20%, ${5 + i * 1.5}%)`}
            roughness={0.9}
            side={THREE.BackSide}
          />
        </mesh>
      ))}

      {/* Concrete floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}>
        <planeGeometry args={[9, 48]} />
        <meshStandardMaterial color="#0d0d14" roughness={0.95} />
      </mesh>

      {/* Floor LED strips */}
      {[-1.2, 0, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0.04, -20]}>
          <boxGeometry args={[0.12, 0.04, 46]} />
          <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={3} />
        </mesh>
      ))}

      {/* Wall sconces */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i}>
          <mesh position={[-4.2, 2.5, -i * 6]}>
            <boxGeometry args={[0.08, 0.3, 0.4]} />
            <meshStandardMaterial color="#FF8800" emissive="#FF8800" emissiveIntensity={3} />
          </mesh>
          <mesh position={[4.2, 2.5, -i * 6]}>
            <boxGeometry args={[0.08, 0.3, 0.4]} />
            <meshStandardMaterial color="#FF8800" emissive="#FF8800" emissiveIntensity={3} />
          </mesh>
          <pointLight position={[0, 2, -i * 6]} intensity={8} color="#FF6B00" distance={7} />
        </group>
      ))}

      {/* black box at the end of tunnel */}
      <mesh position={[0, 1.8, -31]}>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}