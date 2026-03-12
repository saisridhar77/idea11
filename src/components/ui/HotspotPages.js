"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, CARD_CLOSE_WAYPOINTS } from "@/store/useStore";

// ─── "Press E" hint shown at bottom when close to a card ─────────────────────
export function HotspotKeyHint() {
  const currentSection = useStore((s) => s.currentSection);
  const hotspots       = useStore((s) => s.hotspots);
  const openHotspotPage = useStore((s) => s.openHotspotPage);

  const activeHotspot = Object.entries(CARD_CLOSE_WAYPOINTS).find(
    ([, wp]) => wp === currentSection
  )?.[0];

  const data = activeHotspot ? hotspots[activeHotspot] : null;

  useEffect(() => {
    if (!activeHotspot) return;
    const handler = (e) => {
      if (e.key === "e" || e.key === "E") openHotspotPage(activeHotspot);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeHotspot, openHotspotPage]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key={data.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            bottom: "48px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            pointerEvents: "none",
          }}
        >
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PingRing color={data.color} />
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: `${data.color}22`,
              border: `1.5px solid ${data.color}88`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px",
            }}>
              {data.icon}
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "rgba(4,4,18,0.85)",
            border: `1px solid ${data.color}44`,
            borderRadius: "100px",
            padding: "8px 18px",
            backdropFilter: "blur(12px)",
          }}>
            <kbd style={{
              background: `${data.color}22`,
              border: `1px solid ${data.color}66`,
              borderRadius: "6px",
              padding: "2px 10px",
              fontFamily: "monospace",
              fontSize: "13px",
              fontWeight: 700,
              color: data.color,
              letterSpacing: "1px",
            }}>E</kbd>
            <span style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "12px",
              letterSpacing: "2px",
              fontFamily: "monospace",
            }}>
              ENTER {data.title.toUpperCase()}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pulsing ring as a component (no document access)
function PingRing({ color }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
      style={{
        position: "absolute",
        width: "64px", height: "64px",
        borderRadius: "50%",
        border: `2px solid ${color}`,
      }}
    />
  );
}

// ─── Full-page overlay ────────────────────────────────────────────────────────
export function HotspotPageOverlay() {
  const openHotspot    = useStore((s) => s.openHotspot);
  const hotspots       = useStore((s) => s.hotspots);
  const closeHotspotPage = useStore((s) => s.closeHotspotPage);

  const data = openHotspot ? hotspots[openHotspot] : null;

  useEffect(() => {
    if (!openHotspot) return;
    const handler = (e) => {
      if (e.key === "q" || e.key === "Q" || e.key === "Escape") closeHotspotPage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openHotspot, closeHotspotPage]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = openHotspot ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openHotspot]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key={data.id}
          initial={{ opacity: 0, scale: 0.97, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 30 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(2,2,10,0.92)",
            backdropFilter: "blur(20px)",
            overflowY: "auto", overflowX: "hidden",
          }}
        >
          {/* Top accent line */}
          <div style={{ height: "2px", background: `linear-gradient(90deg, transparent, ${data.color}, transparent)`, flexShrink: 0 }} />

          {/* Close button */}
          <ExitButton color={data.color} onClose={closeHotspotPage} />

          {/* Page content */}
          <PageContent data={data} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ExitButton({ color, onClose }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed", top: "24px", right: "28px", zIndex: 110,
        display: "flex", alignItems: "center", gap: "8px",
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${hovered ? color : "rgba(255,255,255,0.12)"}`,
        borderRadius: "100px", padding: "8px 16px",
        cursor: "pointer",
        color: hovered ? color : "rgba(255,255,255,0.5)",
        fontSize: "12px", letterSpacing: "2px", fontFamily: "monospace",
        transition: "all 0.2s",
      }}
    >
      <span style={{
        background: "rgba(255,255,255,0.08)", borderRadius: "4px",
        padding: "1px 7px", marginRight: "2px",
      }}>Q</span>
      EXIT
    </button>
  );
}

// ─── Page content switcher ────────────────────────────────────────────────────
function PageContent({ data }) {
  switch (data.id) {
    case "about":    return <AboutPage    data={data} />;
    case "events":   return <EventsPage   data={data} />;
    case "sports":   return <SportsPage   data={data} />;
    case "gallery":  return <GalleryPage  data={data} />;
    case "sponsors": return <SponsorsPage data={data} />;
    case "team":     return <TeamPage     data={data} />;
    default:         return <DefaultPage  data={data} />;
  }
}

// ─── Shared layout components ─────────────────────────────────────────────────
function PageHero({ data, children }) {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 40px 0" }}>
      <div style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
          <span style={{ fontSize: "32px" }}>{data.icon}</span>
          <div>
            <div style={{
              color: data.color, fontSize: "10px", letterSpacing: "4px",
              fontWeight: 800, textTransform: "uppercase", fontFamily: "monospace",
              textShadow: `0 0 20px ${data.color}`,
            }}>
              SPORTSFEST 2025 · {data.id.toUpperCase()}
            </div>
            <h1 style={{
              color: "#fff", fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 900, letterSpacing: "-0.02em",
              lineHeight: 1, marginTop: "4px",
              fontFamily: "system-ui, sans-serif",
            }}>
              {data.title}
            </h1>
            {data.subtitle && (
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", letterSpacing: "3px", marginTop: "6px", fontFamily: "monospace" }}>
                {data.subtitle}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
          {data.stats.map((s, i) => (
            <div key={i} style={{
              background: `${data.color}0d`,
              border: `1px solid ${data.color}28`,
              borderRadius: "12px", padding: "14px 20px", minWidth: "100px",
            }}>
              <div style={{ color: data.color, fontSize: "1.6rem", fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "4px", fontFamily: "monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: "1px", background: `linear-gradient(90deg, ${data.color}44, transparent)`, marginBottom: "40px" }} />
      {children}
      <div style={{ height: "80px" }} />
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: "48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{ width: "3px", height: "18px", background: color, borderRadius: "2px" }} />
        <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "1px", fontFamily: "system-ui, sans-serif" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Grid({ cols = 3, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "12px" }}>
      {children}
    </div>
  );
}

function Card({ color, children, style = {} }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "14px", padding: "20px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage({ data }) {
  return (
    <PageHero data={data}>
      <Section title="WHAT IS SPORTSFEST?" color={data.color}>
        <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.8, fontSize: "15px", maxWidth: "700px" }}>
          SportsFest is the largest inter-college multi-sport festival in the region, bringing together
          over 1,200 athletes from 28 institutions across 12 disciplines. Three days of raw competition,
          electric atmosphere, and moments that define careers.
        </p>
      </Section>

      <Section title="THEME — UNLEASHING THE UNTAMED" color={data.color}>
        <Card color={data.color} style={{ borderColor: `${data.color}30`, background: `${data.color}08` }}>
          <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.9, fontSize: "14px" }}>
            This year's theme celebrates the primal, unrestrained spirit of athletic competition.
            Like a fire that cannot be contained, the untamed athlete breaks barriers, defies limits,
            and leaves everything on the field. Expect something legendary.
          </p>
        </Card>
      </Section>

      <Section title="EVENT TIMELINE" color={data.color}>
        <Grid cols={3}>
          {[
            { day: "DAY 01", date: "MAR 15", title: "Opening Ceremony", desc: "Grand inauguration, parade of athletes, first round fixtures across all sports." },
            { day: "DAY 02", date: "MAR 16", title: "Semi-Finals", desc: "Knock-out rounds, quarter finals, and the battle for podium positions begins." },
            { day: "DAY 03", date: "MAR 17", title: "Grand Finals", desc: "Championship matches, medal ceremonies, and the closing celebration." },
          ].map((item, i) => (
            <Card key={i} color={data.color}>
              <div style={{ color: data.color, fontSize: "9px", letterSpacing: "3px", fontFamily: "monospace", marginBottom: "6px" }}>{item.day} · {item.date}</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", marginBottom: "8px" }}>{item.title}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", lineHeight: 1.6 }}>{item.desc}</div>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section title="VENUE" color={data.color}>
        <Card color={data.color} style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div style={{ fontSize: "48px" }}>📍</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "16px" }}>University Sports Complex</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", marginTop: "4px" }}>6 arenas · 12 courts · Main stadium capacity 5,000</div>
          </div>
        </Card>
      </Section>
    </PageHero>
  );
}

// ─── EVENTS PAGE ──────────────────────────────────────────────────────────────
const EVENT_SCHEDULE = [
  { time: "08:00", event: "Opening March & Flag Parade",  arena: "Main Stadium",   day: 1, type: "ceremony"   },
  { time: "09:30", event: "100m Sprint Heats",            arena: "Athletics Track", day: 1, type: "athletics"  },
  { time: "10:00", event: "Basketball Pool A",            arena: "Arena 2",         day: 1, type: "team"       },
  { time: "11:00", event: "Swimming — Freestyle 200m",    arena: "Aquatics Centre", day: 1, type: "aquatics"   },
  { time: "14:00", event: "Volleyball Group Stage",       arena: "Arena 3",         day: 1, type: "team"       },
  { time: "16:00", event: "Badminton Singles Round 1",    arena: "Indoor Hall",     day: 1, type: "individual" },
  { time: "09:00", event: "Football Quarter Finals",      arena: "Main Pitch",      day: 2, type: "team"       },
  { time: "10:30", event: "Wrestling Semi-Finals",        arena: "Combat Arena",    day: 2, type: "individual" },
  { time: "13:00", event: "Basketball Semi-Finals",       arena: "Arena 2",         day: 2, type: "team"       },
  { time: "15:00", event: "Athletics Finals — Relay",     arena: "Athletics Track", day: 2, type: "athletics"  },
  { time: "09:00", event: "Football Final",               arena: "Main Stadium",    day: 3, type: "team"       },
  { time: "11:00", event: "Basketball Grand Final",       arena: "Main Stadium",    day: 3, type: "team"       },
  { time: "14:00", event: "Swimming Finals",              arena: "Aquatics Centre", day: 3, type: "aquatics"   },
  { time: "17:00", event: "Closing Ceremony & Medals",   arena: "Main Stadium",    day: 3, type: "ceremony"   },
];

const TYPE_COLORS = {
  ceremony: "#FFD700", athletics: "#FF6B00", team: "#00C9FF",
  aquatics: "#00E5CC", individual: "#FF4488",
};

function EventsPage({ data }) {
  const [activeDay, setActiveDay] = useState(1);
  const filtered = EVENT_SCHEDULE.filter((e) => e.day === activeDay);

  return (
    <PageHero data={data}>
      <Section title="SCHEDULE" color={data.color}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {[1, 2, 3].map((d) => (
            <button key={d} onClick={() => setActiveDay(d)} style={{
              padding: "8px 22px", borderRadius: "100px",
              background: activeDay === d ? data.color : "rgba(255,255,255,0.05)",
              border: `1px solid ${activeDay === d ? data.color : "rgba(255,255,255,0.1)"}`,
              color: activeDay === d ? "#000" : "rgba(255,255,255,0.5)",
              fontWeight: 700, fontSize: "12px", letterSpacing: "2px",
              cursor: "pointer", transition: "all 0.2s", fontFamily: "monospace",
            }}>
              DAY {d} · MAR {14 + d}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((ev, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderLeft: `3px solid ${TYPE_COLORS[ev.type] || data.color}`,
                borderRadius: "10px", padding: "14px 18px",
              }}
            >
              <div style={{ color: data.color, fontFamily: "monospace", fontSize: "13px", fontWeight: 700, minWidth: "48px" }}>{ev.time}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>{ev.event}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "2px", fontFamily: "monospace" }}>{ev.arena}</div>
              </div>
              <div style={{
                background: `${TYPE_COLORS[ev.type] || data.color}22`,
                border: `1px solid ${TYPE_COLORS[ev.type] || data.color}44`,
                borderRadius: "6px", padding: "3px 10px",
                color: TYPE_COLORS[ev.type] || data.color,
                fontSize: "9px", letterSpacing: "1.5px", fontFamily: "monospace", textTransform: "uppercase",
              }}>
                {ev.type}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
    </PageHero>
  );
}

// ─── SPORTS PAGE ──────────────────────────────────────────────────────────────
const SPORTS_LIST = [
  { icon: "⚽", name: "Football",     venue: "Main Pitch",      format: "11-a-side knockout" },
  { icon: "🏀", name: "Basketball",   venue: "Arena 2",         format: "5-a-side pool + KO" },
  { icon: "🏊", name: "Swimming",     venue: "Aquatics Centre", format: "Individual & relay"  },
  { icon: "🏃", name: "Athletics",    venue: "Athletics Track", format: "Heats + finals"      },
  { icon: "🏐", name: "Volleyball",   venue: "Arena 3",         format: "6-a-side pool + KO"  },
  { icon: "🏸", name: "Badminton",    venue: "Indoor Hall",     format: "Singles & doubles"   },
  { icon: "🏏", name: "Cricket",      venue: "Cricket Ground",  format: "T20 format"          },
  { icon: "🏓", name: "Table Tennis", venue: "Indoor Hall",     format: "Singles & doubles"   },
  { icon: "🤼", name: "Wrestling",    venue: "Combat Arena",    format: "Weight categories"   },
  { icon: "🚴", name: "Cycling",      venue: "Outdoor Track",   format: "Time trial & race"   },
  { icon: "🥊", name: "Boxing",       venue: "Combat Arena",    format: "Weight categories"   },
  { icon: "🏹", name: "Archery",      venue: "Range",           format: "70m recurve"         },
];

function SportsPage({ data }) {
  const [selected, setSelected] = useState(null);

  return (
    <PageHero data={data}>
      <Section title="12 DISCIPLINES" color={data.color}>
        <Grid cols={4}>
          {SPORTS_LIST.map((sport, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }}
              onClick={() => setSelected(selected === i ? null : i)}
              style={{
                background: selected === i ? `${data.color}18` : "rgba(255,255,255,0.03)",
                border: `1px solid ${selected === i ? data.color + "66" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "14px", padding: "20px 16px",
                cursor: "pointer", textAlign: "center", transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>{sport.icon}</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>{sport.name}</div>
              {selected === i && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  style={{ marginTop: "10px", borderTop: `1px solid ${data.color}33`, paddingTop: "10px" }}>
                  <div style={{ color: data.color, fontSize: "10px", fontFamily: "monospace", marginBottom: "4px" }}>{sport.venue}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>{sport.format}</div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </Grid>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginTop: "14px", fontFamily: "monospace", textAlign: "center" }}>
          Click a sport for venue &amp; format details
        </p>
      </Section>
    </PageHero>
  );
}

// ─── GALLERY PAGE ─────────────────────────────────────────────────────────────
const GALLERY_ITEMS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  src: `https://picsum.photos/seed/sf${i + 10}/600/400`,
  sport: ["Football", "Basketball", "Athletics", "Swimming", "Volleyball", "Boxing"][i % 6],
  year: [2023, 2022, 2021][i % 3],
  caption: ["Match Point", "Sprint Finish", "Victory Lap", "Golden Moment", "Team Spirit", "The Tackle", "Under Pressure", "Final Whistle", "Podium Glory", "Pure Power", "Unbreakable", "The Moment"][i],
}));

function GalleryPage({ data }) {
  const [lightbox, setLightbox] = useState(null);

  return (
    <PageHero data={data}>
      <Section title="HIGHLIGHTS" color={data.color}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div key={item.id} whileHover={{ scale: 1.02 }}
              onClick={() => setLightbox(item)}
              style={{
                borderRadius: "12px", overflow: "hidden", cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.08)",
                gridColumn: i === 0 ? "span 2" : "span 1",
                position: "relative", aspectRatio: i === 0 ? "2/1.3" : "4/3",
              }}
            >
              <img src={item.src} alt={item.caption} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(transparent 40%, rgba(0,0,0,0.8))",
                display: "flex", alignItems: "flex-end", padding: "12px",
              }}>
                <div>
                  <div style={{ color: data.color, fontSize: "9px", fontFamily: "monospace", letterSpacing: "2px" }}>{item.sport} · {item.year}</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "12px" }}>{item.caption}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <motion.div initial={{ scale: 0.88 }} animate={{ scale: 1 }} exit={{ scale: 0.88 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "800px", width: "90%", borderRadius: "16px", overflow: "hidden" }}
            >
              <img src={lightbox.src.replace("600/400", "1200/800")} alt={lightbox.caption} style={{ width: "100%", display: "block" }} />
              <div style={{ background: "#0a0a14", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: data.color, fontSize: "10px", fontFamily: "monospace" }}>{lightbox.sport} · {lightbox.year}</div>
                  <div style={{ color: "#fff", fontWeight: 700 }}>{lightbox.caption}</div>
                </div>
                <button onClick={() => setLightbox(null)} style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageHero>
  );
}

// ─── SPONSORS PAGE ────────────────────────────────────────────────────────────
const SPONSOR_TIERS = [
  { tier: "PLATINUM", color: "#C8C8FF",
    sponsors: [{ name: "NovaTech", tagline: "Powering Champions", icon: "🔷" }, { name: "ArenaX", tagline: "Where Champions Train", icon: "⚡" }] },
  { tier: "GOLD", color: "#FFD700",
    sponsors: [{ name: "SwiftGear", tagline: "Built for Speed", icon: "🏅" }, { name: "ProForm", tagline: "Performance Redefined", icon: "💪" }, { name: "ApexSports", tagline: "Rise to the Top", icon: "🎯" }] },
  { tier: "SILVER", color: "#C0C0C0",
    sponsors: [{ name: "FuelX", tagline: "Energy Unleashed", icon: "⚡" }, { name: "StrideOn", tagline: "Every Step Counts", icon: "👟" }, { name: "PlayBold", tagline: "Dare to Play", icon: "🎮" }, { name: "WinEdge", tagline: "Competitive Advantage", icon: "🏆" }] },
];

function SponsorsPage({ data }) {
  return (
    <PageHero data={data}>
      {SPONSOR_TIERS.map((tier) => (
        <Section key={tier.tier} title={tier.tier + " SPONSORS"} color={tier.color}>
          <Grid cols={tier.sponsors.length <= 2 ? 2 : tier.sponsors.length === 3 ? 3 : 4}>
            {tier.sponsors.map((sp, i) => (
              <Card key={i} color={tier.color} style={{ textAlign: "center", padding: "28px 16px", borderColor: `${tier.color}20`, background: `${tier.color}06` }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>{sp.icon}</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "16px" }}>{sp.name}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "4px" }}>{sp.tagline}</div>
              </Card>
            ))}
          </Grid>
        </Section>
      ))}

      <Section title="BECOME A SPONSOR" color={data.color}>
        <div style={{
          background: `linear-gradient(135deg, ${data.color}22, rgba(255,255,255,0.03))`,
          border: `1px solid ${data.color}40`, borderRadius: "16px", padding: "32px",
          display: "flex", gap: "24px", alignItems: "center",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "20px", marginBottom: "8px" }}>Partner with SportsFest 2025</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", lineHeight: 1.7 }}>
              Reach 2,000+ of India's brightest student athletes. Request our sponsorship deck today.
            </div>
          </div>
          <a href="mailto:sportsfest@college.edu" style={{
            background: data.color, color: "#000", padding: "12px 28px",
            borderRadius: "100px", fontWeight: 800, fontSize: "12px", letterSpacing: "2px",
            textDecoration: "none", whiteSpace: "nowrap",
          }}>GET DECK →</a>
        </div>
      </Section>
    </PageHero>
  );
}

// ─── TEAM PAGE ────────────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  { name: "Arjun Mehta",   role: "Festival Director",     dept: "Core",       icon: "👑" },
  { name: "Priya Sharma",  role: "Events Head",           dept: "Core",       icon: "⚡" },
  { name: "Karan Patel",   role: "Logistics Lead",        dept: "Operations", icon: "🔧" },
  { name: "Sneha Iyer",    role: "Design Lead",           dept: "Creatives",  icon: "🎨" },
  { name: "Rohan Gupta",   role: "Tech Lead",             dept: "Technology", icon: "💻" },
  { name: "Ananya Singh",  role: "Marketing Head",        dept: "Marketing",  icon: "📢" },
  { name: "Dev Nair",      role: "Sponsorship Head",      dept: "Finance",    icon: "🤝" },
  { name: "Lakshmi Rao",   role: "Sports Coordinator",    dept: "Sports",     icon: "🏅" },
  { name: "Vikram Joshi",  role: "Venue Manager",         dept: "Operations", icon: "🏟️" },
  { name: "Meera Pillai",  role: "Media & PR",            dept: "Marketing",  icon: "📸" },
  { name: "Aditya Kumar",  role: "Volunteer Coordinator", dept: "Core",       icon: "🙌" },
  { name: "Ritika Bose",   role: "Finance Head",          dept: "Finance",    icon: "💰" },
];

function TeamPage({ data }) {
  return (
    <PageHero data={data}>
      <Section title="CORE TEAM" color={data.color}>
        <Grid cols={4}>
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div key={i} whileHover={{ scale: 1.03 }} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px", padding: "20px 16px", textAlign: "center",
            }}>
              <div style={{
                width: "52px", height: "52px", margin: "0 auto 12px", borderRadius: "50%",
                background: `${data.color}18`, border: `1.5px solid ${data.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
              }}>
                {member.icon}
              </div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>{member.name}</div>
              <div style={{ color: data.color, fontSize: "10px", fontFamily: "monospace", marginTop: "3px", letterSpacing: "1px" }}>{member.role}</div>
              <div style={{
                marginTop: "8px", display: "inline-block",
                background: "rgba(255,255,255,0.05)", borderRadius: "4px",
                padding: "2px 8px", color: "rgba(255,255,255,0.3)",
                fontSize: "9px", letterSpacing: "1.5px", fontFamily: "monospace",
              }}>
                {member.dept}
              </div>
            </motion.div>
          ))}
        </Grid>
      </Section>

      <Section title="BY THE NUMBERS" color={data.color}>
        <Grid cols={4}>
          {[
            { icon: "👑", label: "Core Members", value: "12" },
            { icon: "🔧", label: "Organisers Total", value: "42" },
            { icon: "🎓", label: "Faculty Advisors", value: "8" },
            { icon: "🙌", label: "Volunteers", value: "200+" },
          ].map((s, i) => (
            <Card key={i} color={data.color} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
              <div style={{ color: data.color, fontSize: "1.8rem", fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", marginTop: "4px", fontFamily: "monospace", letterSpacing: "1px" }}>{s.label}</div>
            </Card>
          ))}
        </Grid>
      </Section>
    </PageHero>
  );
}

// ─── DEFAULT fallback ─────────────────────────────────────────────────────────
function DefaultPage({ data }) {
  return (
    <PageHero data={data}>
      <Section title="OVERVIEW" color={data.color}>
        <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontSize: "15px" }}>{data.body}</p>
      </Section>
    </PageHero>
  );
}