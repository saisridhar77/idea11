"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useStore } from "@/store/useStore";

// Dynamically import Confetti (no SSR)
const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false });

/**
 * CONFETTI OVERLAY
 * Celebratory confetti that rains down when the user reaches the final section.
 * Also shows a "Champion" banner.
 *
 * Auto-hides after 8 seconds to not be annoying.
 */
export default function ConfettiOverlay() {
  const showConfetti = useStore((s) => s.showConfetti);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showBanner, setShowBanner] = useState(false);
  const [recycle, setRecycle] = useState(true);

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      // Show banner with delay
      const bannerTimer = setTimeout(() => setShowBanner(true), 300);

      // Stop recycling confetti after 5s (lets it naturally fall away)
      const recycleTimer = setTimeout(() => setRecycle(false), 5000);

      // Hide banner after 6s
      const hideTimer = setTimeout(() => setShowBanner(false), 6000);

      return () => {
        clearTimeout(bannerTimer);
        clearTimeout(recycleTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setShowBanner(false);
      setRecycle(true);
    }
  }, [showConfetti]);

  return (
    <>
      {/* Confetti canvas — on top of everything */}
      {showConfetti && windowSize.width > 0 && (
        <div className="fixed inset-0 z-[60] pointer-events-none">
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={recycle}
            numberOfPieces={recycle ? 250 : 120}
            gravity={0.12}
            wind={0.01}
            colors={[
              "#FFD700",
              "#FF6B00",
              "#E63946",
              "#ffffff",
              "#9B59B6",
              "#3498DB",
              "#2ECC71",
            ]}
            tweenDuration={5000}
          />
        </div>
      )}

      {/* Champion banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            className="fixed inset-0 z-[65] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
            >
              {/* Trophy emoji */}
              <motion.div
                className="text-8xl mb-4"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                🏆
              </motion.div>

              {/* Champion text */}
              <div
                className="font-display leading-none mb-2"
                style={{
                  fontSize: "clamp(3rem, 10vw, 7rem)",
                  background: "linear-gradient(135deg, #FFD700, #FF6B00, #FFD700)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmer 1.5s linear infinite",
                  textShadow: "none",
                  letterSpacing: "0.05em",
                }}
              >
                CHAMPIONS
              </div>

              <div
                className="font-body font-semibold tracking-[8px] text-white/60"
                style={{ fontSize: "0.85rem" }}
              >
                SPORTSFEST 2025 · GRAND FINALS
              </div>

              {/* Glowing underline */}
              <motion.div
                className="mx-auto mt-4 h-0.5 rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent, #FFD700, transparent)",
                  boxShadow: "0 0 20px #FFD700",
                }}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </>
  );
}
