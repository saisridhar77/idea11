import * as THREE from "three";

/**
 * SCENE CONSTANTS
 * Centralized configuration for the 3D scene
 */

// Stadium dimensions (in Three.js units)
export const STADIUM = {
  PITCH_WIDTH: 22,
  PITCH_DEPTH: 14,
  STANDS_HEIGHT: 8,
  STANDS_DEPTH: 14,
  TOTAL_WIDTH: 55,
  TOTAL_DEPTH: 40,
  FLOODLIGHT_HEIGHT: 30,
};

// Camera settings
export const CAMERA = {
  NEAR: 0.1,
  FAR: 1000,
  DEFAULT_FOV: 75,
  LERP_FACTOR: 0.04,
};

// Colors
export const COLORS = {
  PITCH: "#2d7a2d",
  TRACK: "#cc4400",
  CONCRETE: "#1a1a22",
  SEAT_RED: "#cc2222",
  SEAT_BLUE: "#2244cc",
  SEAT_WHITE: "#cccccc",
  SKY: "#05050a",
  FOG: "#08080f",
};

// Performance tiers
export const QUALITY = {
  HIGH: {
    shadowMapSize: 2048,
    crowdCount: 5000,
    fireworkParticles: 3000,
    antialias: true,
    dpr: [1, 2],
  },
  LOW: {
    shadowMapSize: 512,
    crowdCount: 1500,
    fireworkParticles: 1000,
    antialias: false,
    dpr: [0.5, 1],
  },
};

// Hotspot positions (must match HOTSPOT_DATA in store)
export const HOTSPOT_POSITIONS = {
  events: [-8, 3, -5],
  schedule: [8, 3, -5],
  registration: [0, 5, -12],
  sponsors: [-10, 2, 0],
  trophy: [10, 2, 0],
};
