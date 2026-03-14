"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

const SECTIONS = [
  { id: 0,  label: null,            title: null,                sub: null },
  { id: 1,  label: "ENTERING",      title: "WELCOME TO\nSPREE 2026", sub: "SPORTS FEST OF BITS GOA" },
  { id: 2,  label: null,            title: null,                sub: null },
  { id: 3,  label: "01 / ABOUT",    title: "ABOUT\nSPREE", sub: "WHERE CHAMPIONS ARE MADE",      hotspot: "about",    align: "left"  },
  { id: 4,  label: null,            title: null,                sub: null },
  { id: 5,  label: "02 / EVENTS",   title: "EVENTS\n& SCHEDULE",sub: "42 EVENTS ACROSS 3 DAYS",       hotspot: "events",   align: "right" },
  { id: 6,  label: null,            title: null,                sub: null },
  { id: 7,  label: "03 / SPORTS",   title: "12\nSPORTS",        sub: "COMPETE ACROSS DISCIPLINES",    hotspot: "sports",   align: "left"  },
  { id: 8,  label: null,            title: null,                sub: null },
  { id: 9,  label: "04 / GALLERY",  title: "GALLERY\n",  sub: "MOMENTS THAT DEFINE GREATNESS", hotspot: "gallery",  align: "right" },
  { id: 10, label: null,            title: null,                sub: null },
  { id: 11, label: "05 / SPONSORS", title: "OUR\nPARTNERS",     sub: "$500,000 PRIZE POOL",           hotspot: "sponsors", align: "left"  },
  { id: 12, label: null,            title: null,                sub: null },
  { id: 13, label: "06 / TEAM",     title: "THE\nTEAM",         sub: "200+ PEOPLE BEHIND THE GAMES",  hotspot: "team",     align: "right" },
  { id: 14, label: null,            title: null,                sub: null },
  { id: 15, label: "FINAL",         title: "GLORY\nAWAITS",     sub: "APRIL 3-4 · ENTER THE GAME", cta: "REGISTER NOW", hotspot: "about", glory: true, align: "center" },
];

export default function ScrollSections() {
  const currentSection   = useStore((s) => s.currentSection);
  const setActiveHotspot = useStore((s) => s.setActiveHotspot);
  const setPanelOpen     = useStore((s) => s.setPanelOpen);

  return (
    <div className="relative z-10 pointer-events-none">
      {SECTIONS.map((sec) => {
        const justify =
          sec.align === "right"  ? "justify-end"
        : sec.align === "center" ? "justify-center"
        : "justify-start";

        return (
          <section
            key={sec.id}
            id={`section-${sec.id}`}
            className={`scroll-section h-screen w-full flex items-center pb-16 px-14 ${justify}`}
          >
            {sec.id === 0 && currentSection === 0 && <HeroTitle />}

            {sec.title && (
              <SectionHUD
                sec={sec}
                isActive={currentSection === sec.id || (sec.glory && currentSection >= 14)}
                onCta={() => { setActiveHotspot(sec.hotspot); setPanelOpen(true); }}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}

// ─── Hero title ───────────────────────────────────────────────────────────────
function HeroTitle() {
  return (
    <div className="relative w-full flex flex-col items-center text-center select-none">
      
      {/* Full viewport-width dark band — stretches edge to edge regardless of content */}
      <div style={{
        position: "absolute",
        top: "-60px",
        bottom: "-60px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100vw",
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.78) 20%, rgba(0,0,0,0.88) 50%, rgba(0,0,0,0.78) 80%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <motion.div
        className="relative z-10 flex flex-col items-center"
        style={{ padding: "3rem 2rem" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Date badge */}
        <motion.div
          className="font-mono text-xs tracking-[6px] mb-6 px-4 py-1.5 rounded-full border"
          style={{
            color: "#FFD700",
            borderColor: "#FFD70066",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
          }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          APRIL 3–5
        </motion.div>

        {/* Wordmark */}
        <h1
          className="font-display leading-none"
          style={{
            fontSize: "clamp(4.5rem, 14vw, 11rem)",
            letterSpacing: "-0.01em",
            background: "linear-gradient(170deg, #ffffff 0%, #FFE566 40%, #FF8C00 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: [
              "drop-shadow(0 4px 0 rgba(0,0,0,1))",
              "drop-shadow(0 8px 16px rgba(0,0,0,0.95))",
              "drop-shadow(0 0 50px rgba(255,160,0,0.45))",
            ].join(" "),
          }}
        >
          SPREE 26
        </h1>

        {/* Divider + tagline */}
        <div className="flex items-center gap-4 mt-6 mb-3 w-screen max-w-2xl">
          <div className="flex-1 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,210,0,0.45))" }} />
          <span
            className="font-mono text-xs tracking-[5px]"
            style={{
              color: "#FFD700",
              textShadow: "0 0 18px rgba(255,215,0,0.55), 0 1px 6px rgba(0,0,0,0.99)",
            }}
          >
            UNLEASHING THE UNTAMED
          </span>
          <div className="flex-1 h-px"
            style={{ background: "linear-gradient(90deg, rgba(255,210,0,0.45), transparent)" }} />
        </div>

        <p
          className="font-mono text-xs tracking-[5px]"
          style={{
            color: "rgba(255,255,255,0.85)",
            textShadow: "0 1px 10px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1)",
          }}
        >
          SCROLL DOWN TO ENTER THE ARENA
        </p>
      </motion.div>
    </div>
  );
} 
// ─── Section HUD ──────────────────────────────────────────────────────────────
function SectionHUD({ sec, isActive, onCta }) {
  const isRight  = sec.align === "right";
  const isCenter = sec.align === "center";

  return (
    <motion.div
      className={`flex flex-col ${isCenter ? "items-center text-center" : isRight ? "items-end text-right" : "items-start text-left"}`}
      style={{ maxWidth: isCenter ? "800px" : "48%" }}
      initial={{ opacity: 0, x: isCenter ? 0 : isRight ? 50 : -50, y: isCenter ? 40 : 0 }}
      animate={{ opacity: isActive ? 1 : 0.15, x: 0, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Label */}
      {sec.label && (
        <div className="font-mono text-xs tracking-[5px] mb-3" style={{ color: "#FF6B00", opacity: 0.7 }}>
          {sec.label}
        </div>
      )}

      {/* Title */}
      <h2
        className="font-display leading-none mb-3"
        style={{
          fontSize: isCenter ? "clamp(5rem, 13vw, 9.5rem)" : "clamp(3rem, 7.5vw, 6rem)",
          letterSpacing: "0.01em",
          whiteSpace: "pre-line",
          color: sec.glory ? "#FFD700" : "#ffffff",
          textShadow: sec.glory
            ? "0 0 80px #FFD70099, 0 0 160px #FF880055, 0 4px 40px rgba(0,0,0,0.9)"
            : "0 2px 40px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.6)",
          filter: sec.glory ? "drop-shadow(0 0 35px #FFD70077)" : "none",
        }}
      >
        {sec.title}
      </h2>

      {/* Sub */}
      {sec.sub && (
        <p className="font-mono text-xs tracking-[3px] mb-5" style={{ color: "rgba(255,255,255,1)" }}>
          {sec.sub}
        </p>
      )}

      {/* CTA button */}
      {sec.cta && isActive && (
        <motion.button
          className="pointer-events-auto font-bold text-xs tracking-widest px-10 py-4 rounded-full mt-2"
          style={{
            background: "linear-gradient(135deg, #FFD700, #FF8800)",
            color: "#000",
            boxShadow: "0 0 40px #FFD70077, 0 4px 20px rgba(0,0,0,0.5)",
          }}
          onClick={onCta}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.07, boxShadow: "0 0 70px #FFD700aa" }}
          whileTap={{ scale: 0.96 }}
        >
          {sec.cta} →
        </motion.button>
      )}

      {/* Progress pill dots */}
      {!isCenter && sec.id >= 3 && sec.id <= 13 && (
        <div className={`flex gap-2 mt-5 ${isRight ? "flex-row-reverse" : ""}`}>
          {[3, 5, 7, 9, 11, 13].map((i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width:  i === sec.id ? "22px" : "6px",
                height: "6px",
                background: i === sec.id ? "#FF6B00" : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}