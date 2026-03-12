"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export default function StadiumModel() {
  const { scene } = useGLTF("/models/stadium/scene.gltf");

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
          if (child.material.transparent) child.material.depthWrite = false;
          if (child.material.emissiveIntensity !== undefined)
            child.material.emissiveIntensity = Math.max(child.material.emissiveIntensity, 0.1);
        }
      }
    });
  }, [scene]);

  if (!scene) return null;

  return (
    <primitive
      object={scene}
      scale={200}
      position={[0, -20, 0]}
      rotation={[0,  Math.PI / 3, 0]}
    />
  );
}

useGLTF.preload("/models/stadium/scene.gltf");