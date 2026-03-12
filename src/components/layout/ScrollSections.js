"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

const SECTIONS = [
  { id: 0,  label: null,              title: null,                sub: null },
  { id: 1,  label: "THE ARENA",       title: "UNLEASH\nTHE UNTAMED", sub: "SPORTSFEST 2025 · SCROLL TO EXPLORE" },
  { id: 2,  label: null,              title: null,                sub: null },
  { id: 3,  label: "01 / ABOUT",      title: "ABOUT\nSPORTSFEST", sub: "WHERE CHAMPIONS ARE MADE",      hotspot: "about"    },
  { id: 4,  label: null,              title: null,                sub: null },
  { id: 5,  label: "02 / EVENTS",     title: "EVENTS\n& SCHEDULE",sub: "42 EVENTS ACROSS 3 DAYS",       hotspot: "events"   },
  { id: 6,  label: null,              title: null,                sub: null },
  { id: 7,  label: "03 / SPORTS",     title: "12\nSPORTS",        sub: "COMPETE ACROSS DISCIPLINES",    hotspot: "sports"   },
  { id: 8,  label: null,              title: null,                sub: null },
  { id: 9,  label: "04 / GALLERY",    title: "GALLERY\n& MEDIA",  sub: "MOMENTS THAT DEFINE GREATNESS", hotspot: "gallery"  },
  { id: 10, label: null,              title: null,                sub: null },
  { id: 11, label: "05 / SPONSORS",   title: "OUR\nPARTNERS",     sub: "$500,000 PRIZE POOL",            hotspot: "sponsors" },
  { id: 12, label: null,              title: null,                sub: null },
  { id: 13, label: "06 / TEAM",       title: "THE\nTEAM",         sub: "200+ PEOPLE BEHIND THE ARENA",  hotspot: "team"     },
  { id: 14, label: null,              title: null,                sub: null },
  { id: 15, label: "FINAL",           title: "GLORY\nAWAITS",     sub: "MARCH 15–17 · ENTER THE ARENA" },
  { id: 16, label: null,              title: null,                sub: null },
];

export default function ScrollSections() {
  const currentSection = useStore((s) => s.currentSection);
  const openHotspot    = useStore((s) => s.openHotspot);

  // Lock body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = openHotspot ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openHotspot]);

  return (
    <div className="relative z-10 pointer-events-none">
      {SECTIONS.map((sec) => (
        <section
          key={sec.id}
          id={`section-${sec.id}`}
          className="scroll-section h-screen w-full flex items-center pb-16 px-14"
        >
          {sec.id === 0 && currentSection === 0 && (
            <motion.div
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <h1
                className="text-4xl tracking-[12px] text-white font-display mb-3"
                style={{ textShadow: "0 2px 40px rgba(0,0,0,0.95), 0 0 80px rgba(0,0,0,0.7)" }}
              >
                SPORTS FEST 2025
              </h1>
              <p className="text-lg tracking-[6px] text-white font-mono mb-3">UNLEASHING THE UNTAMED</p>
              <p className="text-lg tracking-[4px] text-white font-mono mt-2">↓ SCROLL DOWN</p>
            </motion.div>
          )}

          {sec.title && (
            <SectionHUD sec={sec} isActive={currentSection === sec.id} />
          )}
        </section>
      ))}
    </div>
  );
}

function SectionHUD({ sec, isActive }) {
  return (
    <motion.div
      className="flex flex-col items-start"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: isActive ? 1 : 0.2, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {sec.label && (
        <div
          className="text-xs font-mono tracking-[5px] mb-2 opacity-50"
          style={{ color: "#FF6B00" }}
        >
          {sec.label}
        </div>
      )}

      <h2
        className="text-white font-display leading-none mb-2"
        style={{
          fontSize: "clamp(3rem, 8vw, 6.5rem)",
          letterSpacing: "0.02em",
          whiteSpace: "pre-line",
          textShadow: "0 2px 40px rgba(0,0,0,0.95), 0 0 80px rgba(0,0,0,0.7)",
        }}
      >
        {sec.title}
      </h2>

      {sec.sub && (
        <p className="text-gray-400 font-mono text-xs tracking-[3px] mb-5">
          {sec.sub}
        </p>
      )}

      {/* When close to a card, show a subtle hint (the big E prompt is in HotspotKeyHint) */}
      {sec.hotspot && isActive && (
        <motion.p
          className="text-gray-600 font-mono text-xs tracking-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          SCROLL CLOSER TO INTERACT
        </motion.p>
      )}

      {/* Step indicator dots */}
      {sec.id >= 2 && sec.id <= 16 && (
        <div className="flex gap-2 mt-4">
          {[1, 3, 5, 7, 9, 11, 13, 15].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i === sec.id ? "#FFD700" : "rgba(255,255,255,0.2)" }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}