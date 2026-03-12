import { useEffect, useRef, useState } from "react";

/**
 * useScrollProgress
 * Returns the current scroll progress (0–1) across the entire page.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}

/**
 * useWindowSize
 * Tracks window dimensions, useful for canvas sizing.
 */
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

/**
 * useIntersection
 * Returns whether an element ref is currently in view.
 * Used for lazy rendering sections.
 */
export function useIntersection(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

/**
 * usePerformanceMode
 * Detects low-end devices and returns a degraded flag.
 */
export function usePerformanceMode() {
  const [degraded, setDegraded] = useState(false);
  const fpsRef = useRef([]);
  const lastTimeRef = useRef(0);
  const rafRef = useRef();

  useEffect(() => {
    let frameCount = 0;

    const measure = (now) => {
      if (lastTimeRef.current) {
        const fps = 1000 / (now - lastTimeRef.current);
        fpsRef.current.push(fps);

        if (fpsRef.current.length > 60) {
          const avg = fpsRef.current.reduce((a, b) => a + b) / fpsRef.current.length;
          if (avg < 30) setDegraded(true);
          fpsRef.current = [];
        }
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(measure);
    };

    rafRef.current = requestAnimationFrame(measure);

    // Stop measuring after 5 seconds
    const timeout = setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }, 5000);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(timeout);
    };
  }, []);

  return degraded;
}
