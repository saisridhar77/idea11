"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useStore, CARD_CLOSE_WAYPOINTS } from "@/store/useStore";

// distanceFactor stays FIXED. Card HTML is 820px wide.
// At distanceFactor=5, camera 5 units away → card fills ~50% of screen (fov 50).
// At zoom (camera 4 units away, fov 38) → card fills ~80% of screen — comfortable.
// NO group scaling. Card stays same world size.
const DF = 5;

export default function Hotspots() {
  const hotspots       = useStore((s) => s.hotspots);
  const currentSection = useStore((s) => s.currentSection);
  return (
    <group visible={currentSection >= 1}>
      {Object.values(hotspots).map((h, i) => (
        <HologramCard key={h.id} data={h} index={i} />
      ))}
    </group>
  );
}

function HologramCard({ data, index }) {
  const floatRef       = useRef();
  const currentSection = useStore((s) => s.currentSection);
  const openHotspot    = useStore((s) => s.openHotspot);
  const closeHotspotPage = useStore((s) => s.closeHotspotPage);

  const closeWp = CARD_CLOSE_WAYPOINTS[data.id];
  const isClose = currentSection === closeWp;
  const isOpen  = openHotspot === data.id;

  const [cx, , cz] = data.position;
  const faceAngle = Math.atan2(cx, cz) + Math.PI;

  useFrame(({ clock }) => {
    if (!floatRef.current) return;
    const t = clock.getElapsedTime();
    floatRef.current.position.y = isOpen ? 0 : Math.sin(t*0.8 + index*1.1) * 0.07;
    floatRef.current.rotation.y = faceAngle;
  });

  return (
    <group position={[cx, 0, cz]}>
      {/* Ground FX — hidden when open */}
      {!isOpen && <>
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,0]}>
          <ringGeometry args={[4.8,5,64]} />
          <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={isClose?4:1.5} transparent opacity={0.9} depthWrite={false} />
        </mesh>
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}>
          <circleGeometry args={[5,64]} />
          <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={0.3} transparent opacity={isClose?0.35:0.15} depthWrite={false} />
        </mesh>
      </>}

      <pointLight color={data.color} intensity={isOpen?30:isClose?18:5} distance={isOpen?20:10} decay={2} position={[0,2,0]} />

      <group ref={floatRef} position={[0, 1.2, 0]}>
        {/*
          KEY FIX: pointerEvents is a PROP on <Html>, not a style property.
          When isOpen=true, pointerEvents="auto" makes the HTML clickable.
          When isOpen=false, pointerEvents="none" lets scroll/3D events pass through.
        */}
        <Html
          transform
          distanceFactor={DF}
          position={[0,0,0]}
          pointerEvents={isOpen ? "auto" : "none"}
          zIndexRange={[100, 0]}
        >
          {isOpen
            ? <ExpandedPage data={data} onClose={closeHotspotPage} />
            : <CardFace data={data} isActive={isClose} />
          }
        </Html>
      </group>
    </group>
  );
}

/* ─── Collapsed card ──────────────────────────────────────────────────────── */
function CardFace({ data, isActive }) {
  return (
    <div style={{
      width: "820px",
      height: "430px",
      background: "linear-gradient(160deg, rgba(4,4,18,0.97), rgba(6,6,22,0.94))",
      border: `1px solid ${data.color}45`,
      borderRadius: "16px",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
      boxShadow: `0 0 60px ${data.color}22, 0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 ${data.color}30`,
      opacity: isActive ? 1 : 0.45,
      transform: `scale(${isActive ? 1 : 0.86})`,
      transition: "opacity 0.5s, transform 0.5s",
    }}>
      <div style={{ height:"2px", background:`linear-gradient(90deg, transparent, ${data.color}, transparent)` }} />

      <div style={{
        padding:"16px 20px 12px",
        borderBottom:`1px solid ${data.color}18`,
        display:"flex", alignItems:"center", gap:"12px",
        background:`linear-gradient(90deg, ${data.color}12, transparent)`,
      }}>
        <span style={{ fontSize:"26px" }}>{data.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ color:data.color, fontSize:"8px", letterSpacing:"3.5px", fontWeight:800, textTransform:"uppercase" }}>SPORTSFEST 2025</div>
          <div style={{ color:"#fff", fontSize:"17px", fontWeight:800, marginTop:"2px" }}>{data.title}</div>
          {data.subtitle && <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"8px", letterSpacing:"1.5px", marginTop:"2px" }}>{data.subtitle}</div>}
        </div>
        {isActive && (
          <div style={{ display:"flex", alignItems:"center", gap:"6px", flexShrink:0 }}>
            <div style={{
              background:`${data.color}22`, border:`1px solid ${data.color}88`,
              borderRadius:"7px", padding:"5px 13px",
              fontFamily:"monospace", fontSize:"14px", fontWeight:900,
              color:data.color, boxShadow:`0 0 14px ${data.color}55`,
            }}>E</div>
            <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"9px", letterSpacing:"2px", fontFamily:"monospace" }}>ENTER</span>
          </div>
        )}
      </div>

      <div style={{ padding:"14px 20px" }}>
        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"10px", lineHeight:1.7, marginBottom:"14px" }}>{data.body}</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
          {data.stats.slice(0,4).map((s,i) => (
            <div key={i} style={{ background:`${data.color}0e`, border:`1px solid ${data.color}1a`, borderRadius:"9px", padding:"10px 12px" }}>
              <div style={{ color:data.color, fontSize:"16px", fontWeight:800, lineHeight:1 }}>{s.value}</div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"7px", letterSpacing:"1px", textTransform:"uppercase", marginTop:"3px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height:"1px", background:`linear-gradient(90deg, transparent, ${data.color}50, transparent)` }} />
    </div>
  );
}

/* ─── Expanded page in 3D card space ─────────────────────────────────────── */
function ExpandedPage({ data, onClose }) {
  return (
    <div style={{
      width: "820px",
      height: "560px",
      overflowY: "auto",
      overflowX: "hidden",
      background: "linear-gradient(160deg, rgba(3,2,12,0.99), rgba(5,4,16,0.99))",
      border: `1px solid ${data.color}55`,
      borderRadius: "18px",
      fontFamily: "'Inter', sans-serif",
      boxShadow: `0 0 100px ${data.color}44, inset 0 1px 0 ${data.color}40`,
      scrollbarWidth: "thin",
      scrollbarColor: `${data.color}55 transparent`,
      userSelect: "none",
    }}>
      <div style={{ height:"2px", background:`linear-gradient(90deg, transparent, ${data.color}, transparent)` }} />

      {/* Sticky header */}
      <div style={{
        position:"sticky", top:0, zIndex:10,
        padding:"14px 20px 10px",
        borderBottom:`1px solid ${data.color}22`,
        display:"flex", alignItems:"center", gap:"12px",
        background:`rgba(3,2,12,0.97)`,
      }}>
        <span style={{ fontSize:"24px" }}>{data.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ color:data.color, fontSize:"8px", letterSpacing:"4px", fontWeight:800, textTransform:"uppercase" }}>SPORTSFEST 2025</div>
          <div style={{ color:"#fff", fontSize:"17px", fontWeight:900, marginTop:"1px" }}>{data.title}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            display:"flex", alignItems:"center", gap:"6px",
            background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)",
            borderRadius:"100px", padding:"6px 14px",
            cursor:"pointer", color:"rgba(255,255,255,0.55)",
            fontSize:"11px", letterSpacing:"2px", fontFamily:"monospace",
          }}
        >
          <span style={{ background:`${data.color}22`, border:`1px solid ${data.color}66`, borderRadius:"4px", padding:"1px 7px", color:data.color, fontWeight:700 }}>Q</span>
          EXIT
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:"8px", padding:"12px 20px", borderBottom:`1px solid ${data.color}15`, flexWrap:"wrap" }}>
        {data.stats.map((s,i) => (
          <div key={i} style={{ flex:1, minWidth:"80px", background:`${data.color}0d`, border:`1px solid ${data.color}22`, borderRadius:"10px", padding:"10px 14px" }}>
            <div style={{ color:data.color, fontSize:"1.2rem", fontWeight:900, lineHeight:1 }}>{s.value}</div>
            <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"8px", letterSpacing:"1.5px", textTransform:"uppercase", marginTop:"3px", fontFamily:"monospace" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:"16px 20px 20px" }}>
        <PageBody data={data} />
      </div>
    </div>
  );
}

/* ─── Shared helpers ─────────────────────────────────────────────────────── */
const sTitle = (color) => ({
  color:"#fff", fontSize:"10px", fontWeight:800, letterSpacing:"3px",
  textTransform:"uppercase", marginBottom:"10px",
  paddingLeft:"8px", borderLeft:`2px solid ${color}`, fontFamily:"monospace",
});
const sCard = (color) => ({
  background:`${color}0a`, border:`1px solid ${color}22`, borderRadius:"10px", padding:"11px 13px",
});
const sGrid = (cols) => ({
  display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:"8px",
});

function PageBody({ data }) {
  switch(data.id) {
    case "about":    return <AboutBody    color={data.color}/>;
    case "events":   return <EventsBody   color={data.color}/>;
    case "sports":   return <SportsBody   color={data.color}/>;
    case "gallery":  return <GalleryBody  color={data.color}/>;
    case "sponsors": return <SponsorsBody color={data.color}/>;
    case "team":     return <TeamBody     color={data.color}/>;
    default:         return null;
  }
}

/* ─── ABOUT ──────────────────────────────────────────────────────────────── */
function AboutBody({ color }) {
  return (
    <>
      <div style={{ marginBottom:"16px" }}>
        <div style={sTitle(color)}>ABOUT</div>
        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"11px", lineHeight:1.75, margin:0 }}>
          SportsFest is the largest inter-college multi-sport festival in the region, bringing together over 1,200 athletes from 28 institutions across 12 disciplines. Three days of raw competition, electric atmosphere, and moments that define careers.
        </p>
      </div>
      <div style={{ marginBottom:"16px" }}>
        <div style={sTitle(color)}>THEME — UNLEASHING THE UNTAMED</div>
        <div style={sCard(color)}>
          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"11px", lineHeight:1.75, margin:0 }}>
            Like a fire that cannot be contained, the untamed athlete breaks barriers, defies limits, and leaves everything on the field.
          </p>
        </div>
      </div>
      <div>
        <div style={sTitle(color)}>TIMELINE</div>
        <div style={sGrid(3)}>
          {[{day:"MAR 15",title:"Opening",desc:"Ceremony + Round 1"},{day:"MAR 16",title:"Semi-Finals",desc:"Quarter & Semis"},{day:"MAR 17",title:"Grand Finals",desc:"Championships + Closing"}].map((d,i)=>(
            <div key={i} style={sCard(color)}>
              <div style={{ color, fontSize:"9px", fontFamily:"monospace", letterSpacing:"2px", marginBottom:"4px" }}>{d.day}</div>
              <div style={{ color:"#fff", fontWeight:700, fontSize:"12px" }}>{d.title}</div>
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"10px", marginTop:"3px" }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── EVENTS ─────────────────────────────────────────────────────────────── */
const EV = [
  {time:"09:30",event:"100m Sprint Heats",      arena:"Athletics Track",day:1,type:"athletics"},
  {time:"10:00",event:"Basketball Pool A",       arena:"Arena 2",        day:1,type:"team"},
  {time:"11:00",event:"Swimming Freestyle 200m", arena:"Aquatics",       day:1,type:"aquatics"},
  {time:"14:00",event:"Volleyball Group Stage",  arena:"Arena 3",        day:1,type:"team"},
  {time:"09:00",event:"Football Quarter Finals", arena:"Main Pitch",     day:2,type:"team"},
  {time:"13:00",event:"Basketball Semi-Finals",  arena:"Arena 2",        day:2,type:"team"},
  {time:"15:00",event:"Athletics Relay Finals",  arena:"Athletics Track",day:2,type:"athletics"},
  {time:"09:00",event:"Football Final",          arena:"Main Stadium",   day:3,type:"team"},
  {time:"11:00",event:"Basketball Grand Final",  arena:"Main Stadium",   day:3,type:"team"},
  {time:"17:00",event:"Closing & Medals",        arena:"Main Stadium",   day:3,type:"ceremony"},
];
const TC = {ceremony:"#FFD700",athletics:"#FF6B00",team:"#00C9FF",aquatics:"#00E5CC"};

function EventsBody({ color }) {
  const [day,setDay] = useState(1);
  return (
    <>
      <div style={{ display:"flex", gap:"6px", marginBottom:"12px" }}>
        {[1,2,3].map(d=>(
          <button key={d} onClick={()=>setDay(d)} style={{
            padding:"5px 14px", borderRadius:"100px", cursor:"pointer",
            background:day===d?color:"rgba(255,255,255,0.05)",
            border:`1px solid ${day===d?color:"rgba(255,255,255,0.1)"}`,
            color:day===d?"#000":"rgba(255,255,255,0.5)",
            fontWeight:700, fontSize:"10px", letterSpacing:"2px", fontFamily:"monospace",
          }}>DAY {d}</button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
        {EV.filter(e=>e.day===day).map((ev,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", background:"rgba(255,255,255,0.03)", borderLeft:`3px solid ${TC[ev.type]||color}`, borderRadius:"8px", padding:"9px 12px" }}>
            <div style={{ color, fontFamily:"monospace", fontSize:"11px", fontWeight:700, minWidth:"38px" }}>{ev.time}</div>
            <div style={{ flex:1 }}>
              <div style={{ color:"#fff", fontWeight:600, fontSize:"12px" }}>{ev.event}</div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"9px", fontFamily:"monospace" }}>{ev.arena}</div>
            </div>
            <div style={{ background:`${TC[ev.type]||color}22`, border:`1px solid ${TC[ev.type]||color}44`, borderRadius:"5px", padding:"2px 7px", color:TC[ev.type]||color, fontSize:"8px", letterSpacing:"1px", fontFamily:"monospace", textTransform:"uppercase" }}>{ev.type}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── SPORTS ─────────────────────────────────────────────────────────────── */
const SP = [
  {icon:"⚽",name:"Football",   venue:"Main Pitch",     format:"11-a-side KO"},
  {icon:"🏀",name:"Basketball", venue:"Arena 2",         format:"5-a-side pool"},
  {icon:"🏊",name:"Swimming",   venue:"Aquatics Centre", format:"Individual+relay"},
  {icon:"🏃",name:"Athletics",  venue:"Athletics Track", format:"Heats + finals"},
  {icon:"🏐",name:"Volleyball", venue:"Arena 3",         format:"6-a-side pool"},
  {icon:"🏸",name:"Badminton",  venue:"Indoor Hall",     format:"Singles+doubles"},
  {icon:"🏏",name:"Cricket",    venue:"Cricket Ground",  format:"T20 format"},
  {icon:"🏓",name:"Table Tennis",venue:"Indoor Hall",    format:"Singles+doubles"},
  {icon:"🤼",name:"Wrestling",  venue:"Combat Arena",    format:"Weight categories"},
  {icon:"🚴",name:"Cycling",    venue:"Outdoor Track",   format:"Time trial"},
  {icon:"🥊",name:"Boxing",     venue:"Combat Arena",    format:"Weight categories"},
  {icon:"🏹",name:"Archery",    venue:"Range",           format:"70m recurve"},
];

function SportsBody({ color }) {
  const [sel,setSel] = useState(null);
  return (
    <div style={sGrid(4)}>
      {SP.map((sp,i)=>(
        <div key={i} onClick={()=>setSel(sel===i?null:i)} style={{ ...sCard(color), textAlign:"center", cursor:"pointer", background:sel===i?`${color}20`:`${color}0a`, border:`1px solid ${sel===i?color+"55":color+"20"}`, transition:"all 0.2s" }}>
          <div style={{ fontSize:"20px", marginBottom:"5px" }}>{sp.icon}</div>
          <div style={{ color:"#fff", fontWeight:700, fontSize:"11px" }}>{sp.name}</div>
          {sel===i && <div style={{ marginTop:"6px", borderTop:`1px solid ${color}33`, paddingTop:"6px" }}>
            <div style={{ color, fontSize:"9px", fontFamily:"monospace" }}>{sp.venue}</div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"9px" }}>{sp.format}</div>
          </div>}
        </div>
      ))}
    </div>
  );
}

/* ─── GALLERY ────────────────────────────────────────────────────────────── */
const GI = Array.from({length:8},(_,i)=>({
  src:`https://picsum.photos/seed/sf${i+10}/300/200`,
  sport:["Football","Basketball","Athletics","Swimming","Volleyball","Boxing","Cricket","Cycling"][i],
  caption:["Match Point","Sprint Finish","Victory Lap","Golden Moment","Team Spirit","The Tackle","Six Appeal","Final Sprint"][i],
}));

function GalleryBody({ color }) {
  const [lb,setLb] = useState(null);
  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
        {GI.map((img,i)=>(
          <div key={i} onClick={()=>setLb(img)} style={{ borderRadius:"8px", overflow:"hidden", cursor:"pointer", border:"1px solid rgba(255,255,255,0.08)", gridColumn:i===0?"span 2":"span 1" }}>
            <img src={img.src} alt={img.caption} style={{ width:"100%", height:i===0?"105px":"70px", objectFit:"cover", display:"block" }} />
          </div>
        ))}
      </div>
      {lb && (
        <div onClick={()=>setLb(null)} style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.92)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div onClick={e=>e.stopPropagation()} style={{ maxWidth:"500px", width:"90%", borderRadius:"12px", overflow:"hidden" }}>
            <img src={lb.src.replace("300/200","600/400")} alt={lb.caption} style={{ width:"100%", display:"block" }} />
            <div style={{ background:"#0a0a14", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ color:"#fff", fontWeight:700, fontSize:"13px" }}>{lb.caption}</div>
              <button onClick={()=>setLb(null)} style={{ color:"rgba(255,255,255,0.4)", background:"none", border:"none", cursor:"pointer", fontSize:"16px" }}>✕</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── SPONSORS ───────────────────────────────────────────────────────────── */
const TIERS=[
  {tier:"PLATINUM",clr:"#C8C8FF",sponsors:[{name:"NovaTech",icon:"🔷"},{name:"ArenaX",icon:"⚡"}]},
  {tier:"GOLD",    clr:"#FFD700",sponsors:[{name:"SwiftGear",icon:"🏅"},{name:"ProForm",icon:"💪"},{name:"ApexSports",icon:"🎯"}]},
  {tier:"SILVER",  clr:"#C0C0C0",sponsors:[{name:"FuelX",icon:"⚡"},{name:"StrideOn",icon:"👟"},{name:"PlayBold",icon:"🎮"},{name:"WinEdge",icon:"🏆"}]},
];

function SponsorsBody({ color }) {
  return (
    <>
      {TIERS.map(tier=>(
        <div key={tier.tier} style={{ marginBottom:"14px" }}>
          <div style={{ color:tier.clr, fontSize:"9px", letterSpacing:"3px", fontFamily:"monospace", marginBottom:"7px" }}>{tier.tier}</div>
          <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
            {tier.sponsors.map((sp,i)=>(
              <div key={i} style={{ ...sCard(tier.clr), display:"flex", alignItems:"center", gap:"8px", flex:1, minWidth:"80px" }}>
                <span style={{ fontSize:"16px" }}>{sp.icon}</span>
                <span style={{ color:"#fff", fontWeight:700, fontSize:"11px" }}>{sp.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ ...sCard(color), display:"flex", alignItems:"center", gap:"12px", marginTop:"6px" }}>
        <div style={{ flex:1 }}>
          <div style={{ color:"#fff", fontWeight:700, fontSize:"12px" }}>Become a Sponsor</div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"10px", marginTop:"2px" }}>Reach 2,000+ student athletes</div>
        </div>
        <a href="mailto:sportsfest@college.edu" style={{ background:color, color:"#000", padding:"6px 13px", borderRadius:"100px", fontWeight:700, fontSize:"10px", textDecoration:"none" }}>EMAIL →</a>
      </div>
    </>
  );
}

/* ─── TEAM ───────────────────────────────────────────────────────────────── */
const TM=[
  {name:"Arjun Mehta",  role:"Festival Director",  icon:"👑"},
  {name:"Priya Sharma", role:"Events Head",         icon:"⚡"},
  {name:"Karan Patel",  role:"Logistics Lead",      icon:"🔧"},
  {name:"Sneha Iyer",   role:"Design Lead",         icon:"🎨"},
  {name:"Rohan Gupta",  role:"Tech Lead",           icon:"💻"},
  {name:"Ananya Singh", role:"Marketing Head",      icon:"📢"},
  {name:"Dev Nair",     role:"Sponsorship Head",    icon:"🤝"},
  {name:"Lakshmi Rao",  role:"Sports Coordinator",  icon:"🏅"},
];

function TeamBody({ color }) {
  return (
    <div style={sGrid(4)}>
      {TM.map((m,i)=>(
        <div key={i} style={{ ...sCard(color), textAlign:"center" }}>
          <div style={{ width:"36px", height:"36px", margin:"0 auto 7px", borderRadius:"50%", background:`${color}18`, border:`1px solid ${color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>{m.icon}</div>
          <div style={{ color:"#fff", fontWeight:700, fontSize:"11px" }}>{m.name}</div>
          <div style={{ color, fontSize:"9px", fontFamily:"monospace", marginTop:"2px", letterSpacing:"1px" }}>{m.role}</div>
        </div>
      ))}
    </div>
  );
}