"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

/**
 * INFO PANEL
 * A sliding glassmorphic panel that appears from the right
 * when a 3D hotspot is clicked.
 *
 * Features:
 * - Framer Motion slide animation
 * - Glassmorphism card design
 * - Dynamic content based on active hotspot
 * - Stats row at top
 * - Content list sections
 * - Gradient accent matching hotspot color
 */
export default function InfoPanel() {
  const isPanelOpen = useStore((s) => s.isPanelOpen);
  const activeHotspot = useStore((s) => s.activeHotspot);
  const hotspots = useStore((s) => s.hotspots);
  const setPanelOpen = useStore((s) => s.setPanelOpen);
  const clearActiveHotspot = useStore((s) => s.clearActiveHotspot);

  const hotspot = activeHotspot ? hotspots[activeHotspot] : null;

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(clearActiveHotspot, 400);
  };

  return (
    <AnimatePresence>
      {isPanelOpen && hotspot && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
            style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
          />

          {/* Panel */}
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div
              className="h-full flex flex-col overflow-hidden"
              style={{
                background: "rgba(5, 5, 12, 0.92)",
                backdropFilter: "blur(40px)",
                borderLeft: `1px solid ${hotspot.color}30`,
              }}
            >
              {/* Accent gradient at top */}
              <div
                className="h-1 w-full flex-shrink-0"
                style={{
                  background: `linear-gradient(90deg, transparent, ${hotspot.color}, transparent)`,
                }}
              />

              {/* Header */}
              <div className="flex items-start justify-between p-6 flex-shrink-0">
                <div>
                  {/* Icon + label */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{
                        background: `${hotspot.color}15`,
                        border: `1px solid ${hotspot.color}40`,
                      }}
                    >
                      {hotspot.icon}
                    </div>
                    <span
                      className="text-xs font-mono tracking-[4px] font-semibold"
                      style={{ color: hotspot.color }}
                    >
                      {hotspot.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="font-display text-white leading-none"
                    style={{ fontSize: "2.2rem", letterSpacing: "0.02em" }}
                  >
                    {hotspot.title}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-xs text-gray-500 tracking-[2px] mt-1 font-body">
                    {hotspot.subtitle}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={closePanel}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1L13 13M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Stats row */}
              <div
                className="mx-6 mb-5 p-4 rounded-xl flex-shrink-0"
                style={{ background: `${hotspot.color}08`, border: `1px solid ${hotspot.color}20` }}
              >
                <div className="grid grid-cols-3 divide-x divide-white/5">
                  {hotspot.stats.map((stat) => (
                    <div key={stat.label} className="px-3 first:pl-0 last:pr-0 text-center">
                      <div
                        className="font-display leading-none mb-1"
                        style={{
                          fontSize: "1.8rem",
                          color: hotspot.color,
                          textShadow: `0 0 20px ${hotspot.color}`,
                        }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-gray-500 text-xs tracking-wider font-body">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div
                className="mx-6 mb-4 h-px flex-shrink-0"
                style={{ background: `linear-gradient(90deg, ${hotspot.color}40, transparent)` }}
              />

              {/* Content sections — scrollable */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
                {hotspot.content.map((section, i) => (
                  <motion.div
                    key={section.time}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* Section header */}
                    <div
                      className="text-xs tracking-[3px] font-mono font-semibold mb-3"
                      style={{ color: hotspot.color }}
                    >
                      {section.time}
                    </div>

                    {/* Events list */}
                    <ul className="space-y-2">
                      {section.events.map((event, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.08 + j * 0.04 }}
                          className="flex items-start gap-3 text-sm font-body text-gray-300"
                        >
                          <span
                            className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                            style={{ background: hotspot.color }}
                          />
                          {event}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}

                {/* Register CTA at bottom of panel */}
                {activeHotspot !== "registration" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="pt-2"
                  >
                    <button
                      className="w-full py-3 rounded-xl font-body font-bold text-sm tracking-widest text-black transition-all"
                      style={{ background: hotspot.color }}
                      onClick={() => {
                        const { setActiveHotspot } = useStore.getState();
                        setActiveHotspot("registration");
                      }}
                    >
                      REGISTER FOR EVENTS →
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
