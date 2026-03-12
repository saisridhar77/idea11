"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

const NAV_ITEMS = [
  { label: "Events", section: 2, hotspot: "events" },
  { label: "Schedule", section: 2, hotspot: "schedule" },
  { label: "Register", section: 2, hotspot: "registration" },
  { label: "Sponsors", section: 3, hotspot: "sponsors" },
  { label: "Trophy", section: 4, hotspot: "trophy" },
];

/**
 * NAVBAR
 * Floating glassmorphic navigation bar.
 *
 * Features:
 * - Hidden during tunnel intro (section 0)
 * - Fades in after stadium reveal
 * - Smooth scroll-to section on click
 * - Highlights active section
 * - Opens info panels from nav
 */
export default function Navbar() {
  const currentSection = useStore((s) => s.currentSection);
  const setActiveHotspot = useStore((s) => s.setActiveHotspot);
  const setPanelOpen = useStore((s) => s.setPanelOpen);
  const [scrolled, setScrolled] = useState(false);

  const visible = currentSection >= 1;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (index) => {
    const el = document.getElementById(`section-${index}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const openPanel = (hotspotId) => {
    setActiveHotspot(hotspotId);
    setPanelOpen(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        >
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => scrollToSection(0)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-9 h-9 rounded-lg glass-gold flex items-center justify-center">
              <span className="text-lg">🏟️</span>
            </div>
            <div className="font-display tracking-widest text-white text-xl leading-none">
              SPORT<span className="text-gradient">FEST</span>
              <div className="text-[9px] tracking-[4px] text-gray-500 font-body font-light mt-0.5">
                2025 · ENTER THE ARENA
              </div>
            </div>
          </motion.div>

          {/* Center nav items */}
          <div
            className={`
              hidden md:flex items-center gap-1 px-4 py-2 rounded-full
              ${scrolled ? "glass" : ""}
              transition-all duration-500
            `}
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.button
                key={item.label}
                onClick={() => openPanel(item.hotspot)}
                className={`
                  px-4 py-2 rounded-full text-xs font-body font-semibold tracking-widest
                  transition-all duration-200
                  ${currentSection >= item.section
                    ? "text-brand-gold"
                    : "text-gray-400 hover:text-white"}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.3 }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            onClick={() => openPanel("registration")}
            className="
              relative px-5 py-2.5 rounded-full overflow-hidden
              font-body font-bold text-xs tracking-widest
              text-black bg-brand-gold
              hover:bg-yellow-300 transition-colors duration-200
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            REGISTER NOW
          </motion.button>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
