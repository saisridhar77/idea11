import { create } from "zustand";

export const HOTSPOT_DATA = {
  about:    { id:"about",    label:"ABOUT",    icon:"🏟️", color:"#FF6B00", position:[0,0,13],    title:"SportsFest 2025", subtitle:"ENTER THE ARENA",        body:"The biggest multi-sport festival in the region. Three days of fierce competition, electric atmosphere, and unforgettable moments.",                                        stats:[{label:"Athletes",value:"1,200+"},{label:"Sports",value:"12"},{label:"Countries",value:"28"},{label:"Days",value:"3"}] },
  events:   { id:"events",   label:"EVENTS",   icon:"⚡",  color:"#FF6B00", position:[-13,0,6.5], title:"Events",          subtitle:"MAR 15–17",              body:"From explosive sprint finals to nail-biting basketball overtimes. Every moment is a highlight.",                                                                  stats:[{label:"Day 01",value:"Opening"},{label:"Day 02",value:"Semis"},{label:"Day 03",value:"Finals"},{label:"Daily",value:"14 Events"}] },
  sports:   { id:"sports",   label:"SPORTS",   icon:"🏅",  color:"#FF6B00", position:[-13,0,-6.5],title:"Sports",          subtitle:"12 DISCIPLINES",         body:"Football · Basketball · Swimming · Athletics · Volleyball · Badminton · Cricket · Table Tennis · Wrestling · Cycling · Boxing · Archery",                       stats:[{label:"Sports",value:"12"},{label:"Arenas",value:"6"},{label:"Gold Medals",value:"36"},{label:"Records",value:"Est. 8"}] },
  gallery:  { id:"gallery",  label:"GALLERY",  icon:"📸",  color:"#FF6B00", position:[0,0,-13],   title:"Gallery",         subtitle:"MOMENTS IN TIME",        body:"Relive the greatest moments from past SportsFest editions. Over 2,000 photos and videos from 5 years of competition.",                                           stats:[{label:"Photos",value:"2,000+"},{label:"Videos",value:"340"},{label:"Years",value:"5"},{label:"Champions",value:"180"}] },
  sponsors: { id:"sponsors", label:"SPONSORS", icon:"⭐",  color:"#FF6B00", position:[13,0,-6.5], title:"Sponsors",        subtitle:"PARTNERS IN EXCELLENCE", body:"Backed by the world's leading sports brands. Together we build the future of athletic competition.",                                                             stats:[{label:"Platinum",value:"3"},{label:"Gold",value:"8"},{label:"Silver",value:"13"},{label:"Prize Pool",value:"$500K"}] },
  team:     { id:"team",     label:"TEAM",     icon:"👥",  color:"#FF6B00", position:[13,0,6.5],  title:"The Team",        subtitle:"BEHIND THE ARENA",       body:"Meet the passionate organizers, coaches, and volunteers who make SportsFest happen every year.",                                                                  stats:[{label:"Organisers",value:"42"},{label:"Coaches",value:"68"},{label:"Volunteers",value:"200+"},{label:"Years",value:"5"}] },
};

// Card HTML width = 800px, distanceFactor = 5
// Apparent world width = 800/100 * (1/distanceFactor) = 1.6 world units wide
// At "close" wp (5 units away, fov 50): card should be nicely framed
// At "zoom" wp: camera moves to 4 units away — card fills ~60% of screen comfortably
// No group scaling needed — the card stays same world size, camera just gets closer

function mkWaypoints(cx, cz) {
  const len = Math.sqrt(cx*cx + cz*cz);
  const dx = -cx/len;
  const dz = -cz/len;
  
  // about [0,0,13] and gallery [0,0,-13] are axis-aligned — need more distance
  const isAxisAligned = cx === 0 || cz === 0;

  if(isAxisAligned){
    return {
      close: {
        position: [cx + dx * 15, 1, cz + dz * 15],
        target:   [cx, 1, cz],
        fov: 50,
      },
    zoom: {
      position: [cx + dx * 10, 1, cz + dz * 10],
      target:   [cx, 1, cz],
      fov: 65,
    },
  };
}
else{
  return {
    close: {
      position: [cx + dx * 15, 1, cz + dz * 15],
      target:   [cx, 1, cz],
      fov: 50,
    },
    zoom: {
      position: [cx + dx * 10, 1, cz + dz * 10],
      target:   [cx, 1, cz],
      fov: 65,
    },
  };
}
}

const WP = {};
Object.values(HOTSPOT_DATA).forEach(({ id, position:[cx,,cz] }) => { WP[id] = mkWaypoints(cx, cz); });
export { WP as CARD_WAYPOINTS };

export const CAMERA_WAYPOINTS = [
  { position:[0,5,45],  target:[0,0,0],    fov:72 }, // 0 aerial
  { position:[0,2.5,0],  target:[0,2,5],    fov:68 }, // 1 center

  { position:[0,2.5,0],  target:[0,2.2,13],    fov:65 }, WP.about.close,    // 2,3
  { position:[0,2.5,0],  target:[-13,2.2,6.5], fov:65 }, WP.events.close,   // 4,5
  { position:[0,2.5,0],  target:[-13,2.2,-6.5],fov:65 }, WP.sports.close,   // 6,7
  { position:[0,2.5,0],  target:[0,2.2,-13],   fov:65 }, WP.gallery.close,  // 8,9
  { position:[0,2.5,0],  target:[13,2.2,-6.5], fov:65 }, WP.sponsors.close, // 10,11
  { position:[0,2.5,0],  target:[13,2.2,6.5],  fov:65 }, WP.team.close,     // 12,13

  { position:[0,5,35],  target:[0,0,0],    fov:78 }, // 14 celebration
];

export const CARD_CLOSE_WAYPOINTS = {
  about:3, events:5, sports:7, gallery:9, sponsors:11, team:13,
};

export const useStore = create((set) => ({
  isLoaded:false,      setLoaded:         (v)=>set({isLoaded:v}),
  loadProgress:0,      setLoadProgress:   (v)=>set({loadProgress:v}),
  scrollProgress:0,    setScrollProgress: (v)=>set({scrollProgress:v}),
  currentSection:0,    setCurrentSection: (v)=>set({currentSection:v}),

  hotspots:HOTSPOT_DATA,
  activeHotspot:null,  setActiveHotspot:  (id)=>set({activeHotspot:id}),
                       clearActiveHotspot:()=>set({activeHotspot:null}),
  nearCard:null,       setNearCard:       (id)=>set({nearCard:id}),

  openHotspot:null,
  openHotspotPage:     (id)=>set({openHotspot:id}),
  closeHotspotPage:    ()=>set({openHotspot:null}),

  showFireworks:false,  setShowFireworks:(v)=>set({showFireworks:v}),
  showConfetti:false,   setShowConfetti: (v)=>set({showConfetti:v}),
}));