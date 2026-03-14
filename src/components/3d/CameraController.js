"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore, CAMERA_WAYPOINTS, CARD_CLOSE_WAYPOINTS, CARD_WAYPOINTS } from "@/store/useStore";

const ORBIT_SPEED  = 0.1;
const ORBIT_RADIUS = 2;
const ORBIT_Y_AMP  = 0.2;
const DRAG_SENSITIVITY = -0.003;
const DRAG_CLAMP_X     = 0.5;
const DRAG_CLAMP_Y     = 0.5;
const DRAG_LERP        = 0.07;

const CLOSE_SECTIONS = new Set(Object.values(CARD_CLOSE_WAYPOINTS));

export default function CameraController() {
  const { camera, gl } = useThree();
  const setCurrentSection = useStore((s) => s.setCurrentSection);
  const setShowFireworks  = useStore((s) => s.setShowFireworks);
  const setShowConfetti   = useStore((s) => s.setShowConfetti);
  const openHotspot       = useStore((s) => s.openHotspot);
  const openHotspotPage   = useStore((s) => s.openHotspotPage);
  const closeHotspotPage  = useStore((s) => s.closeHotspotPage);

  const targetPos  = useRef(new THREE.Vector3(...CAMERA_WAYPOINTS[0].position));
  const targetLook = useRef(new THREE.Vector3(...CAMERA_WAYPOINTS[0].target));
  const targetFov  = useRef(CAMERA_WAYPOINTS[0].fov);
  const smoothPos  = useRef(new THREE.Vector3(...CAMERA_WAYPOINTS[0].position));
  const smoothLook = useRef(new THREE.Vector3(...CAMERA_WAYPOINTS[0].target));
  const currentFov = useRef(CAMERA_WAYPOINTS[0].fov);
  const sectionRef = useRef(0);
  const zoomedIn   = useRef(false);
  const drag = useRef({ active:false, startX:0, startY:0, offsetX:0, offsetY:0, smoothX:0, smoothY:0 });

  useEffect(() => {
    camera.position.set(...CAMERA_WAYPOINTS[0].position);
    camera.fov = CAMERA_WAYPOINTS[0].fov;
    camera.updateProjectionMatrix();
  }, [camera]);

  useEffect(() => {
    let triggers = [], timeout;
    const init = async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      timeout = setTimeout(() => {
        triggers = CAMERA_WAYPOINTS.map((wp, i) => {
          const el = document.getElementById(`section-${i}`);
          if (!el) return null;
          const apply = () => {
            setCurrentSection(i);
            sectionRef.current = i;
            if (zoomedIn.current) { zoomedIn.current = false; closeHotspotPage(); }
            targetPos.current.set(...wp.position);
            targetLook.current.set(...wp.target);
            targetFov.current = wp.fov;
          };
          return ScrollTrigger.create({
            trigger:el, start:"top center", end:"bottom center",
            onEnter:     () => { apply(); if (i===CAMERA_WAYPOINTS.length-1) { setShowFireworks(true);  setShowConfetti(true);  } },
            onEnterBack: () => { apply(); if (i< CAMERA_WAYPOINTS.length-1) { setShowFireworks(false); setShowConfetti(false); } },
          });
        }).filter(Boolean);
      }, 600);
    };
    init();
    return () => { clearTimeout(timeout); triggers.forEach(t=>t?.kill()); };
  }, [setCurrentSection, setShowFireworks, setShowConfetti, closeHotspotPage]);

  useEffect(() => {
    const onKey = (e) => {
      const key = e.key.toLowerCase();
      if (key==="e" && !zoomedIn.current) {
        const hotspotId = Object.entries(CARD_CLOSE_WAYPOINTS).find(([,wp])=>wp===sectionRef.current)?.[0];
        if (!hotspotId) return;
        const zoomWp = CARD_WAYPOINTS[hotspotId]?.zoom;
        if (!zoomWp) return;
        zoomedIn.current = true;
        targetPos.current.set(...zoomWp.position);
        targetLook.current.set(...zoomWp.target);
        targetFov.current = zoomWp.fov;
        openHotspotPage(hotspotId);
      }
      if ((key==="q"||key==="escape") && zoomedIn.current) {
        zoomedIn.current = false;
        closeHotspotPage();
        const wp = CAMERA_WAYPOINTS[sectionRef.current];
        if (wp) { targetPos.current.set(...wp.position); targetLook.current.set(...wp.target); targetFov.current = wp.fov; }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openHotspotPage, closeHotspotPage]);

  useEffect(() => {
    if (openHotspot===null && zoomedIn.current) {
      zoomedIn.current = false;
      const wp = CAMERA_WAYPOINTS[sectionRef.current];
      if (wp) { targetPos.current.set(...wp.position); targetLook.current.set(...wp.target); targetFov.current = wp.fov; }
    }
  }, [openHotspot]);

  useEffect(() => {
    const isMobile = () => window.matchMedia("(pointer:coarse)").matches||"ontouchstart" in window;
    if (isMobile()) return;
    const canvas = gl.domElement;
    const onDown = (e) => { if (zoomedIn.current) return; drag.current.active=true; drag.current.startX=e.clientX; drag.current.startY=e.clientY; };
    const onMove = (e) => {
      if (!drag.current.active) return;
      drag.current.offsetX = THREE.MathUtils.clamp((e.clientX-drag.current.startX)*DRAG_SENSITIVITY,-DRAG_CLAMP_Y,DRAG_CLAMP_Y);
      drag.current.offsetY = THREE.MathUtils.clamp((e.clientY-drag.current.startY)*DRAG_SENSITIVITY,-DRAG_CLAMP_X,DRAG_CLAMP_X);
    };
    const onUp = () => { drag.current.active=false; drag.current.offsetX=0; drag.current.offsetY=0; };
    canvas.addEventListener("mousedown",onDown);
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
    canvas.style.cursor="grab";
    return () => { canvas.removeEventListener("mousedown",onDown); window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); };
  }, [gl]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const isZoom  = zoomedIn.current;
    const isClose = CLOSE_SECTIONS.has(sectionRef.current);

    const posLerp  = 1-Math.pow(isZoom?0.005:0.001, delta);
    const lookLerp = 1-Math.pow(isZoom?0.006:0.006, delta);
    const fovLerp  = 1-Math.pow(isZoom?0.008:0.001, delta);

    smoothPos.current.lerp(targetPos.current, posLerp);

    const orbitOn = !isClose && !isZoom;
    const ox = orbitOn ? Math.cos(t*ORBIT_SPEED)*ORBIT_RADIUS : 0;
    const oz = orbitOn ? Math.sin(t*ORBIT_SPEED)*ORBIT_RADIUS : 0;
    const oy = orbitOn ? Math.sin(t*ORBIT_SPEED*0.7)*ORBIT_Y_AMP : 0;

    camera.position.set(smoothPos.current.x+ox, smoothPos.current.y+oy, smoothPos.current.z+oz);

    smoothLook.current.lerp(targetLook.current, lookLerp);

    drag.current.smoothX += (drag.current.offsetX-drag.current.smoothX)*DRAG_LERP;
    drag.current.smoothY += (drag.current.offsetY-drag.current.smoothY)*DRAG_LERP;

    let finalLook = smoothLook.current.clone();
    if (!isZoom && (Math.abs(drag.current.smoothX)>0.0001||Math.abs(drag.current.smoothY)>0.0001)) {
      const dir   = finalLook.clone().sub(camera.position).normalize();
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0,1,0)).normalize();
      dir.applyAxisAngle(new THREE.Vector3(0,1,0),-drag.current.smoothX);
      dir.applyAxisAngle(right,-drag.current.smoothY);
      finalLook = camera.position.clone().addScaledVector(dir,20);
    }
    camera.lookAt(finalLook);

    currentFov.current = THREE.MathUtils.lerp(currentFov.current, targetFov.current, fovLerp);
    camera.fov = currentFov.current;
    camera.updateProjectionMatrix();
  });

  return null;
}