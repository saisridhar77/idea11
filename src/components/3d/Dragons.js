import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

// 3 symmetric pairs — within each pair: identical radius, speed, scale & y params,
// offsets exactly Math.PI apart so they always sit opposite each other on the circle.
const DRAGONS = [
  // Pair A — large, slow, high
  { r:15, speed:0.10, offset:0,            scale:0.17, yBase:16, yAmp:3.0, yFreq:0.28 },
  { r:15, speed:0.10, offset:Math.PI,      scale:0.17, yBase:16, yAmp:3.0, yFreq:0.28 },
  // Pair B — medium, mid speed, low
  { r:11, speed:0.18, offset:Math.PI*0.5,  scale:0.13, yBase:9,  yAmp:2.2, yFreq:0.34 },
  { r:11, speed:0.18, offset:Math.PI*1.5,  scale:0.13, yBase:9,  yAmp:2.2, yFreq:0.34 },
  // Pair C — small, fast, outer ring
  { r:17, speed:0.32, offset:Math.PI*0.25, scale:0.10, yBase:13, yAmp:2.6, yFreq:0.40 },
  { r:17, speed:0.32, offset:Math.PI*1.25, scale:0.10, yBase:13, yAmp:2.6, yFreq:0.40 },
];

const isWingVert = (x, z) => Math.abs(x) > 5 && z < -15;
const PIVOT_Y = -6;
const PIVOT_Z = -27;

// ─── Body ShaderMaterial ──────────────────────────────────────────────────────
// Red surface, edges/silhouettes go near-black (inverted rim = shadow)
// Center face = bright red, mid = medium red, edge = near-black
function makeBodyShaderMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      uTime:              { value: 0 },
      uColorCore:         { value: new THREE.Color("#cc1500") },
      uColorMid:          { value: new THREE.Color("#7a0000") },
      uColorEdge:         { value: new THREE.Color("#150000") },
      uEmissiveColor:     { value: new THREE.Color("#ff2200") },
      uEmissiveIntensity: { value: 0.35 },
    },
    vertexShader: /* glsl */`
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vec4 worldPos    = modelMatrix * vec4(position, 1.0);
        vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
        vNormal          = worldNormal;
        vViewDir         = normalize(cameraPosition - worldPos.xyz);
        gl_Position      = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform vec3  uColorCore;
      uniform vec3  uColorMid;
      uniform vec3  uColorEdge;
      uniform vec3  uEmissiveColor;
      uniform float uEmissiveIntensity;

      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        // rim = 1 facing camera, 0 at silhouette edge
        float rim      = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
        float rimSharp = pow(rim, 2.4);   // sharpen so edges go dark fast

        // 3-stop gradient: edge(dark) → mid-red → bright red core
        vec3 col;
        if (rimSharp < 0.30) {
          col = mix(uColorEdge, uColorMid, rimSharp / 0.30);
        } else {
          col = mix(uColorMid, uColorCore, (rimSharp - 0.30) / 0.70);
        }

        // Slow breathing emissive pulse
        float pulse   = 0.5 + 0.5 * sin(uTime * 1.1);
        vec3 emissive = uEmissiveColor * uEmissiveIntensity * (0.65 + 0.35 * pulse);

        // Simple top-light diffuse warmth
        float diff = clamp(dot(normalize(vNormal), normalize(vec3(0.3, 1.0, 0.5))), 0.0, 1.0) * 0.3;

        gl_FragColor = vec4(col + emissive + col * diff, 1.0);
      }
    `,
  });
}

// ─── Wing ShaderMaterial ──────────────────────────────────────────────────────
// Pure dark red — near-black base, slightly brighter red toward edges so
// wing membranes read as dark crimson rather than flat black.
function makeWingShaderMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uFlap: { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vec4 worldPos    = modelMatrix * vec4(position, 1.0);
        vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
        vNormal          = worldNormal;
        vViewDir         = normalize(cameraPosition - worldPos.xyz);
        gl_Position      = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform float uFlap;

      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        float rim = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);

        // Facing camera → dark red,  silhouette edge → near-black
        // base:  very dark red-black  #120000
        // inner: dark crimson         #4a0000
        vec3 edgeCol  = vec3(0.07, 0.00, 0.00);
        vec3 innerCol = vec3(0.29, 0.02, 0.02);
        vec3 col = mix(edgeCol, innerCol, pow(rim, 1.8));

        // Very subtle red emissive breath so wings don't look completely dead
        float pulse = 0.5 + 0.5 * sin(uTime * 1.1);
        col += vec3(0.08, 0.00, 0.00) * pulse;

        gl_FragColor = vec4(col, 0.88);
      }
    `,
  });
}

// ─── Geometry split ───────────────────────────────────────────────────────────
function splitGeometry(srcGeo) {
  const geo = srcGeo.index ? srcGeo.toNonIndexed() : srcGeo.clone();
  geo.computeVertexNormals();
  const pos  = geo.attributes.position;
  const N    = pos.count;
  const bodyV = [], leftV = [], rightV = [];

  for (let i = 0; i < N; i += 3) {
    const x = [pos.getX(i), pos.getX(i+1), pos.getX(i+2)];
    const z = [pos.getZ(i), pos.getZ(i+1), pos.getZ(i+2)];
    const allWing = x.every((xi, j) => isWingVert(xi, z[j]));

    if (allWing) {
      const cx  = (x[0]+x[1]+x[2]) / 3;
      const arr = cx > 0 ? leftV : rightV;
      for (let j = 0; j < 3; j++) arr.push(pos.getX(i+j), pos.getY(i+j), pos.getZ(i+j));
    } else {
      for (let j = 0; j < 3; j++) bodyV.push(pos.getX(i+j), pos.getY(i+j), pos.getZ(i+j));
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

// ─── Fire breath — seamless full gradient ─────────────────────────────────────
// Gradient matches the reference dragon image:
//   0.00  bright yellow-white  #ffee88
//   0.15  hot yellow-orange    #ffcc00
//   0.30  orange               #ff6600
//   0.45  deep red-orange      #dd2200
//   0.60  deep purple          #642878
//   0.78  violet-blue          #3250A0
//   1.00  azure teal           #00A08C
//
// Each of the 55 particles has its OWN MeshBasicMaterial so colour
// is set individually per-frame — giving a perfectly seamless gradient stream.

// 9-stop gradient — white-yellow core → orange → red → deep purple → violet → azure → teal
const GRADIENT = [
  { t: 0.00, c: new THREE.Color("#fff5aa") },
  { t: 0.08, c: new THREE.Color("#ffdd00") },
  { t: 0.18, c: new THREE.Color("#ff8800") },
  { t: 0.30, c: new THREE.Color("#ff4400") },
  { t: 0.42, c: new THREE.Color("#cc0000") },
  { t: 0.54, c: new THREE.Color("#642878") },
  { t: 0.68, c: new THREE.Color("#3250A0") },
  { t: 0.82, c: new THREE.Color("#1E82BE") },
  { t: 1.00, c: new THREE.Color("#00A08C") },
];

const _gradTmp = new THREE.Color();
function sampleGradient(t) {
  const ct = Math.max(0, Math.min(1, t));
  for (let i = 0; i < GRADIENT.length - 1; i++) {
    const a = GRADIENT[i], b = GRADIENT[i + 1];
    if (ct >= a.t && ct <= b.t) {
      return _gradTmp.lerpColors(a.c, b.c, (ct - a.t) / (b.t - a.t));
    }
  }
  return _gradTmp.copy(GRADIENT[GRADIENT.length - 1].c);
}

const PCOUNT = 110;
const STREAM_LENGTH = 18.0;

function FireBreath({ active }) {
  const meshRefs = useRef([]);
  const timeRef  = useRef(0);

  // Per-particle unique noise seeds so each one waves differently
  const particles = useMemo(() =>
    Array.from({ length: PCOUNT }, (_, i) => ({
      life:      i / PCOUNT,
      spd:       0.0075 + Math.random() * 0.004,
      // unique phase offsets for X and Y sine waves
      phaseX:    Math.random() * Math.PI * 2,
      phaseY:    Math.random() * Math.PI * 2,
      // individual wave frequencies — low freq = lazy curl, high = flicker
      freqX:     1.8 + Math.random() * 2.2,
      freqY:     1.4 + Math.random() * 1.8,
      // amplitude envelope — wider spread toward the cool tip
      ampX:      0.18 + Math.random() * 0.22,
      ampY:      0.10 + Math.random() * 0.14,
      // secondary high-freq flicker (adds texture)
      flickPhX:  Math.random() * Math.PI * 2,
      flickPhY:  Math.random() * Math.PI * 2,
      flickAmp:  0.04 + Math.random() * 0.06,
    }))
  , []);

  const mats = useMemo(() =>
    Array.from({ length: PCOUNT }, () =>
      new THREE.MeshBasicMaterial({
        color:      "#ffdd00",
        transparent: true,
        opacity:    0.92,
        depthWrite: false,
      })
    )
  , []);

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);

  useFrame(({ clock }) => {
    const T = clock.getElapsedTime();

    particles.forEach((p, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      if (!active) { mesh.visible = false; return; }

      p.life += p.spd;
      if (p.life > 1) {
        p.life -= 1;
        // reseed wave phases on recycle so no two particles repeat
        p.phaseX  = Math.random() * Math.PI * 2;
        p.phaseY  = Math.random() * Math.PI * 2;
        p.flickPhX = Math.random() * Math.PI * 2;
        p.flickPhY = Math.random() * Math.PI * 2;
      }

      const l = p.life;

      // ── Forward progress along Z ──────────────────────────────────────────
      const z = l * STREAM_LENGTH;

      // ── Lateral wave displacement ─────────────────────────────────────────
      // Amplitude grows with distance (flame spreads as it cools & slows)
      // Near core (l<0.12) kept very tight; beyond that opens up naturally
      const spreadEnv = l < 0.12 ? l / 0.12 : 1.0;
      const wideEnv   = 0.5 + l * 1.8;   // wider near tip

      // Primary lazy curl — slow sine keyed to global time + particle phase
      const wx = Math.sin(T * p.freqX + p.phaseX + l * 3.5) * p.ampX * wideEnv * spreadEnv;
      const wy = Math.sin(T * p.freqY + p.phaseY + l * 2.8) * p.ampY * wideEnv * spreadEnv;

      // Secondary high-frequency flicker — adds surface turbulence
      const fx = Math.sin(T * 8.0 + p.flickPhX + l * 6.0) * p.flickAmp * spreadEnv;
      const fy = Math.sin(T * 7.2 + p.flickPhY + l * 5.0) * p.flickAmp * spreadEnv;

      // Upward buoyancy: real flame rises, stronger toward the cooler tip
      const rise = l * l * 0.55;

      mesh.position.set(wx + fx, wy + fy + rise, z);

      // ── Size ──────────────────────────────────────────────────────────────
      // Hot dense core = large blobs; wispy teal tip = small tendrils
      const s = l < 0.14
        ? 0.08 + l * 4.5            // fast bloom from mouth
        : 0.72 * (1.0 - l) + 0.07; // long smooth taper
      mesh.scale.setScalar(Math.max(s, 0.05));

      // ── Opacity ───────────────────────────────────────────────────────────
      mats[i].opacity = l < 0.04
        ? l * 20
        : l > 0.80
          ? (1 - l) * 5.0
          : 0.90;

      // ── Colour ────────────────────────────────────────────────────────────
      const col = sampleGradient(l);
      mats[i].color.setRGB(col.r, col.g, col.b);

      mesh.visible = true;
    });
  });

  return (
    <>
      {Array.from({ length: PCOUNT }, (_, i) => (
        <mesh
          key={i}
          ref={el => { meshRefs.current[i] = el; }}
          geometry={sphereGeo}
          material={mats[i]}
          visible={false}
        />
      ))}
    </>
  );
}

// ─── Dragon model ─────────────────────────────────────────────────────────────
function DragonModel({ cfg, index }) {
  const groupRef = useRef();
  const wingLRef = useRef();
  const wingRRef = useRef();
  const [breathing, setBreathing] = useState(false);

  const obj = useLoader(OBJLoader, "/models/Dragon/Dragon.obj");

  const { bodyGeo, leftWingGeo, rightWingGeo, bodyMat, wingMatL, wingMatR } = useMemo(() => {
    let srcGeo = null;
    obj.traverse(c => { if (c.isMesh && !srcGeo) srcGeo = c.geometry; });
    const { bodyGeo, leftWingGeo, rightWingGeo } = splitGeometry(srcGeo);
    return {
      bodyGeo, leftWingGeo, rightWingGeo,
      bodyMat:  makeBodyShaderMaterial(),
      wingMatL: makeWingShaderMaterial(),
      wingMatR: makeWingShaderMaterial(),
    };
  }, [obj]);

  useEffect(() => {
    let t;
    const cycle = () => {
      t = setTimeout(() => {
        setBreathing(true);
        t = setTimeout(() => { setBreathing(false); cycle(); }, 900 + Math.random() * 700);
      }, 2500 + index * 1800 + Math.random() * 4000);
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
      Math.cos(na) * cfg.r, groupRef.current.position.y, Math.sin(na) * cfg.r
    );

    const dydt = Math.cos(t * cfg.yFreq + cfg.offset) * cfg.yAmp * cfg.yFreq;
    groupRef.current.rotateX(dydt * 0.04);

    // Push time to shaders
    bodyMat.uniforms.uTime.value  = t;
    wingMatL.uniforms.uTime.value = t;
    wingMatR.uniforms.uTime.value = t;

    // Flap rotation + pass to wing shader for edge-glow colour
    const flap = Math.sin(t * 3.0 + cfg.offset);
    if (wingLRef.current) wingLRef.current.rotation.z =  flap * 0.5;
    if (wingRRef.current) wingRRef.current.rotation.z = -flap * 0.5;
    wingMatL.uniforms.uFlap.value = flap;
    wingMatR.uniforms.uFlap.value = flap;
  });

  return (
    <group ref={groupRef} scale={cfg.scale}>
      {/* Body — red with dark shadowed silhouette edges */}
      <mesh geometry={bodyGeo} material={bodyMat} />

      {/* Wings — dark red/black with violet↔teal edge glow */}
      <group ref={wingLRef} position={[0, PIVOT_Y, PIVOT_Z]}>
        <mesh geometry={leftWingGeo} material={wingMatL} position={[0, -PIVOT_Y, -PIVOT_Z]} />
      </group>
      <group ref={wingRRef} position={[0, PIVOT_Y, PIVOT_Z]}>
        <mesh geometry={rightWingGeo} material={wingMatR} position={[0, -PIVOT_Y, -PIVOT_Z]} />
      </group>

      {/* Fire breath — long seamless gradient stream */}
      <group position={[0, 0, 4]}>
        <FireBreath active={breathing} />
        <pointLight color="#ff8800" intensity={breathing ? 35 : 0} distance={12} decay={2} />
        <pointLight color="#3250A0" intensity={breathing ? 10 : 0} distance={28} decay={2} />
        <pointLight color="#00A08C" intensity={breathing ? 6  : 0} distance={40} decay={2} />
      </group>

      {/* Ambient body glow */}
      <pointLight color="#cc1500" intensity={5} distance={25} decay={2} />
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