"use client";

import { Canvas } from "@react-three/fiber";
import { Preload, AdaptiveDpr } from "@react-three/drei";
import { Suspense } from "react";

import Lights from "./Lights";
import CameraController from "./CameraController";
import StadiumModel from "./StadiumModel";
import Hotspots from "./Hotspots";
import Dragons from "./Dragons";

export default function StadiumScene() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 45, 35], fov: 72, near: 0.1, far: 400 }}
        shadows={false}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = 4;
          gl.toneMappingExposure = 0.9;
        }}
      >
        <AdaptiveDpr pixelated />
        <Suspense fallback={null}>
          <Lights />
          <CameraController />
          <StadiumModel />
          <Dragons />
          <Hotspots />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}