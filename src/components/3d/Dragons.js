import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

const DRAGONS = [
  { r:10, speed:0.12, offset:0,            scale:0.12, yBase:12, yAmp:2.5, yFreq:0.30 },
  { r:15, speed:0.08, offset:Math.PI*0.7,  scale:0.18, yBase:18, yAmp:3.5, yFreq:0.25 },
  { r:16, speed:0.16, offset:Math.PI*1.4,  scale:0.16, yBase:8,  yAmp:2.0, yFreq:0.38 },
  { r:12, speed:0.68, offset:Math.PI*2.1,  scale:0.13, yBase:12, yAmp:2.5, yFreq:0.30 },
  { r:8, speed:0.48, offset:Math.PI*2.8,  scale:0.09, yBase:18, yAmp:3.5, yFreq:0.25 },
  { r:18, speed:0.32, offset:Math.PI*3.5,  scale:0.11, yBase:8,  yAmp:2.0, yFreq:0.38 },
];

// Wing isolation: faces where ALL 3 verts have |x|>5 AND z<-15
// Verified from geometry analysis: 8956 wing verts, only 16 false positives
const isWingVert = (x, z) => Math.abs(x) > 5 && z < -15;

// Wing hinge point (shoulder) in model space
const PIVOT_Y = -6;
const PIVOT_Z = -27;

// ─── Geometry split: body / left wing / right wing ────────────────────────────
function splitGeometry(srcGeo) {
  const geo = srcGeo.index ? srcGeo.toNonIndexed() : srcGeo.clone();
  geo.computeVertexNormals();
  const pos = geo.attributes.position;
  const N   = pos.count;
  const bodyV = [], leftV = [], rightV = [];

  for (let i = 0; i < N; i += 3) {
    const x = [pos.getX(i), pos.getX(i+1), pos.getX(i+2)];
    const z = [pos.getZ(i), pos.getZ(i+1), pos.getZ(i+2)];
    const allWing = x.every((xi, j) => isWingVert(xi, z[j]));

    if (allWing) {
      const cx = (x[0]+x[1]+x[2]) / 3;
      const arr = cx > 0 ? leftV : rightV;
      for (let j=0; j<3; j++) arr.push(pos.getX(i+j), pos.getY(i+j), pos.getZ(i+j));
    } else {
      for (let j=0; j<3; j++) bodyV.push(pos.getX(i+j), pos.getY(i+j), pos.getZ(i+j));
    }
  }

  const make = (v) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  };
  return { bodyGeo: make(bodyV), leftWingGeo: make(leftV), rightWingGeo: make(rightV) };
}

// ─── Fire breath ──────────────────────────────────────────────────────────────
function FireBreath({ active }) {
  const COUNT = 70;
  const ref   = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pts   = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      life: Math.random(), spd: 0.018 + Math.random()*0.028,
      sx: (Math.random()-0.5)*0.6, sy: (Math.random()-0.5)*0.3,
    })), []);

  useFrame(() => {
    if (!ref.current || !active) return;
    pts.forEach((p, i) => {
      p.life += p.spd;
      if (p.life > 1) { p.life=0; p.sx=(Math.random()-0.5)*0.6; p.sy=(Math.random()-0.5)*0.3; }
      dummy.position.set(p.sx*p.life, p.sy*p.life, p.life*6);
      dummy.scale.setScalar((1-p.life)*0.9 + 0.05);
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

// ─── Dragon model ─────────────────────────────────────────────────────────────
function DragonModel({ cfg, index }) {
  const groupRef = useRef();
  const wingLRef = useRef();
  const wingRRef = useRef();
  const [breathing, setBreathing] = useState(false);

  const obj = useLoader(OBJLoader, "/models/dragon/dragon.obj");

  const { bodyGeo, leftWingGeo, rightWingGeo, bodyMat, wingMat } = useMemo(() => {
    let srcGeo = null;
    obj.traverse(c => { if (c.isMesh && !srcGeo) srcGeo = c.geometry; });
    const { bodyGeo, leftWingGeo, rightWingGeo } = splitGeometry(srcGeo);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: "#2a0300", emissive: "#bb0e00", emissiveIntensity: 0.9,
      roughness: 0.7, metalness: 0.1, side: THREE.DoubleSide,
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: "#150000", emissive: "#770000", emissiveIntensity: 0.7,
      roughness: 0.8, transparent: true, opacity: 0.95,
      side: THREE.DoubleSide,
    });
    return { bodyGeo, leftWingGeo, rightWingGeo, bodyMat, wingMat };
  }, [obj]);

  useEffect(() => {
    let t;
    const cycle = () => {
      t = setTimeout(() => {
        setBreathing(true);
        t = setTimeout(() => { setBreathing(false); cycle(); }, 1000 + Math.random()*800);
      }, 2500 + index*1800 + Math.random()*4000);
    };
    cycle();
    return () => clearTimeout(t);
  }, [index]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t     = clock.getElapsedTime();
    const angle = t * cfg.speed + cfg.offset;

    groupRef.current.position.set(
      Math.cos(angle) * cfg.r,
      cfg.yBase + Math.sin(t * cfg.yFreq + cfg.offset) * cfg.yAmp,
      Math.sin(angle) * cfg.r,
    );

    const na = angle + 0.01;
    groupRef.current.lookAt(
      Math.cos(na)*cfg.r, groupRef.current.position.y, Math.sin(na)*cfg.r
    );

    const dydt = Math.cos(t*cfg.yFreq+cfg.offset)*cfg.yAmp*cfg.yFreq;
    groupRef.current.rotateX(dydt * 0.04);

    // Flap: rotate each wing around Z at shoulder pivot
    const flap = Math.sin(t * 3.0 + cfg.offset) * 0.5;
    if (wingLRef.current) wingLRef.current.rotation.z =  flap;
    if (wingRRef.current) wingRRef.current.rotation.z = -flap;
  });

  return (
    <group ref={groupRef} scale={cfg.scale}>
      {/* Body (no wings) */}
      <mesh geometry={bodyGeo} material={bodyMat} />

      {/* Left wing pivot at shoulder, mesh offset back to correct world position */}
      <group ref={wingLRef} position={[0, PIVOT_Y, PIVOT_Z]}>
        <mesh geometry={leftWingGeo} material={wingMat} position={[0, -PIVOT_Y, -PIVOT_Z]} />
      </group>

      {/* Right wing */}
      <group ref={wingRRef} position={[0, PIVOT_Y, PIVOT_Z]}>
        <mesh geometry={rightWingGeo} material={wingMat} position={[0, -PIVOT_Y, -PIVOT_Z]} />
      </group>

      {/* Fire from snout */}
      <group position={[0, 0, 4]}>
        <FireBreath active={breathing} />
        <pointLight color="#ff4400" intensity={25} distance={10} decay={2} />
      </group>

      <pointLight color="#cc1100" intensity={5} distance={25} decay={2} />
    </group>
  );
}

function Dragon({ cfg, index }) {
  return <Suspense fallback={null}><DragonModel cfg={cfg} index={index} /></Suspense>;
}

export default function Dragons() {
  return (
    <group>
      {DRAGONS.map((cfg, i) => <Dragon key={i} cfg={cfg} index={i} />)}
    </group>
  );
}