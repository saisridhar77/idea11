"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@react-three/drei";
import { useStore } from "@/store/useStore";

/**
 * LOADER
 * Full-screen loading overlay shown while Three.js assets load.
 *
 * Uses @react-three/drei's useProgress hook to track:
 * - progress (0-100%)
 * - item (currently loading asset name)
 * - loaded (number of loaded items)
 * - total (total items to load)
 *
 * Features:
 * - Animated stadium icon
 * - Loading progress bar
 * - Currently loading item display
 * - Cinematic reveal animation when complete
 */
export default function Loader() {
  const { progress, active, item } = useProgress();
  const setLoaded = useStore((s) => s.setLoaded);
  const setLoadProgress = useStore((s) => s.setLoadProgress);
  const [show, setShow] = useState(true);
  const [progressDisplay, setProgressDisplay] = useState(0);

  useEffect(() => {
    setLoadProgress(progress);

    // Smoothly animate displayed progress
    const interval = setInterval(() => {
      setProgressDisplay((p) => {
        if (p < progress) return Math.min(p + 2, progress);
        return p;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [progress, setLoadProgress]);

  useEffect(() => {
    if (!active && progress === 100) {
      // Small delay for dramatic effect
      const timer = setTimeout(() => {
        setLoaded(true);
        setShow(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [active, progress, setLoaded]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "#05050a" }}
          exit={{
            opacity: 0,
            scale: 1.05,
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Scanlines overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
            }}
          />

          {/* Stadium icon — animated */}
          <motion.div
            className="mb-12"
            animate={{
              scale: [1, 1.05, 1],
              filter: [
                "drop-shadow(0 0 20px #FF6B00)",
                "drop-shadow(0 0 40px #FFD700)",
                "drop-shadow(0 0 20px #FF6B00)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="text-8xl">🏟️</div>
          </motion.div>

          {/* Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1
              className="font-display text-white tracking-widest mb-2"
              style={{ fontSize: "3.5rem", letterSpacing: "0.15em" }}
            >
              SPORT<span className="text-gradient">FEST</span>
            </h1>
            <p className="text-gray-500 text-xs tracking-[6px] font-body">
              2025 · ENTER THE ARENA
            </p>
          </motion.div>

          {/* Progress bar container */}
          <div className="w-72 mb-4">
            {/* Track */}
            <div
              className="w-full h-0.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              {/* Fill */}
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progressDisplay}%`,
                  background: "linear-gradient(90deg, #FF6B00, #FFD700)",
                  boxShadow: "0 0 10px rgba(255,215,0,0.5)",
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Progress number */}
          <div
            className="font-mono text-2xl font-bold mb-3"
            style={{
              color: "#FFD700",
              textShadow: "0 0 15px #FFD700",
            }}
          >
            {Math.round(progressDisplay)}
            <span className="text-base text-gray-600">%</span>
          </div>

          {/* Currently loading item */}
          <motion.p
            key={item}
            className="text-xs text-gray-600 font-mono tracking-widest max-w-xs text-center truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.2 }}
          >
            {item || "INITIALIZING STADIUM..."}
          </motion.p>

          {/* Corner decorations */}
          <CornerDecor />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CornerDecor() {
  const corners = [
    "top-8 left-8",
    "top-8 right-8 rotate-90",
    "bottom-8 left-8 -rotate-90",
    "bottom-8 right-8 rotate-180",
  ];
  return (
    <>
      {corners.map((cls, i) => (
        <svg
          key={i}
          className={`absolute ${cls} opacity-20`}
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path d="M0 40V0H40" stroke="#FFD700" strokeWidth="1.5" />
        </svg>
      ))}
    </>
  );
}
