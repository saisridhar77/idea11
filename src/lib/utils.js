import * as THREE from "three";

/**
 * LERP
 * Linear interpolation between two values
 */
export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * DAMP
 * Framerate-independent smooth interpolation (used in useFrame)
 * @param {number} a - current value
 * @param {number} b - target value
 * @param {number} lambda - smoothing factor (higher = faster)
 * @param {number} dt - delta time from useFrame
 */
export const damp = (a, b, lambda, dt) => {
  return lerp(a, b, 1 - Math.exp(-lambda * dt));
};

/**
 * CLAMP
 * Constrain a value between min and max
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * MAP RANGE
 * Maps a value from one range to another
 */
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
};

/**
 * HEX TO RGB
 * Convert hex color string to {r, g, b} object (0-1 range)
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 1, g: 1, b: 1 };
};

/**
 * RANDOM RANGE
 * Returns a random float between min and max
 */
export const randomRange = (min, max) => min + Math.random() * (max - min);

/**
 * SPHERICAL TO CARTESIAN
 * Convert spherical coordinates to Cartesian
 */
export const sphericalToCartesian = (radius, theta, phi) => ({
  x: radius * Math.sin(phi) * Math.cos(theta),
  y: radius * Math.cos(phi),
  z: radius * Math.sin(phi) * Math.sin(theta),
});

/**
 * CREATE TEXTURE
 * Utility to create a canvas texture programmatically
 * Useful for creating simple textures without external files
 */
export const createCanvasTexture = (draw, width = 512, height = 512) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  draw(ctx, width, height);
  return new THREE.CanvasTexture(canvas);
};

/**
 * CREATE GRADIENT TEXTURE
 * Creates a linear gradient texture
 */
export const createGradientTexture = (colors, width = 256, height = 4) => {
  return createCanvasTexture((ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    colors.forEach(([stop, color]) => gradient.addColorStop(stop, color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }, width, height);
};

/**
 * FORMAT TIME
 * Format seconds as MM:SS
 */
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};
