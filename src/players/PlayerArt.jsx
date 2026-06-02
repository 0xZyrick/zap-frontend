// ─── PlayerArt.jsx ────────────────────────────────────────────────────────────
// Compact player card illustration used in the Market and Formation sheets.

import { RARITY_COL } from "../game/constants.js";

const PALETTES = {
  striker:    { jersey:"#d97706", trim:"#fbbf24", shorts:"#7c2d12", skin:"#c68642", hair:"#1a1a1a" },
  midfielder: { jersey:"#1d4ed8", trim:"#93c5fd", shorts:"#172554", skin:"#b5845a", hair:"#24160b" },
  defender:   { jersey:"#0f766e", trim:"#5eead4", shorts:"#134e4a", skin:"#c8a882", hair:"#111827" },
};

/**
 * @param {{ card: object|null, size: number }} props
 *   card — an MCARDS entry, or null to show an empty slot
 *   size — square px size (default 46)
 */
export default function PlayerArt({ card, size = 46 }) {
  if (!card) {
    return (
      <div style={{
        width:size, height:size, borderRadius:"12px",
        border:"1px dashed rgba(255,255,255,.12)",
        background:"rgba(255,255,255,.02)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <span style={{ fontSize:size*0.32+"px", opacity:.3 }}>+</span>
      </div>
    );
  }

  const p    = PALETTES[card.role];
  const glow = RARITY_COL[card.rarity] || "#9ab5a0";
  const num  = card.number || "10";

  return (
    <div style={{
      width:size, height:size, borderRadius:"14px",
      display:"flex", alignItems:"center", justifyContent:"center",
      background:`radial-gradient(circle at 30% 20%,${glow}30 0%,rgba(4,12,8,.96) 62%)`,
      border:`1px solid ${glow}40`,
      overflow:"hidden", flexShrink:0,
    }}>
      <svg viewBox="0 0 36 40"
           width={Math.round(size * 0.78)} height={Math.round(size * 0.86)}
           xmlns="http://www.w3.org/2000/svg" style={{ display:"block" }}>
        {/* Legs */}
        <rect x="12" y="28" width="4" height="7" rx="1" fill={p.trim}/>
        <rect x="20" y="28" width="4" height="7" rx="1" fill={p.trim}/>
        {/* Shorts */}
        <rect x="10" y="18" width="16" height="11" rx="2" fill={p.shorts}/>
        {/* Jersey */}
        <rect x="9"  y="9"  width="18" height="12" rx="2.5" fill={p.jersey}/>
        {/* Sleeves */}
        <rect x="4"  y="11" width="5" height="9" rx="1.5" fill={p.jersey}/>
        <rect x="27" y="11" width="5" height="9" rx="1.5" fill={p.jersey}/>
        {/* Neck */}
        <rect x="15" y="7.5" width="6" height="3" fill={p.skin}/>
        {/* Head */}
        <rect x="11.5" y="1.5" width="13" height="10" rx="3" fill={p.skin}/>
        {/* Hair */}
        <rect x="11.5" y="1.5" width="13" height="4.5" rx="3" fill={p.hair}/>
        {/* Number */}
        <text x="18" y="18.3" textAnchor="middle"
              fontFamily="monospace" fontSize="6" fontWeight="900"
              fill="rgba(255,255,255,.76)">{num}</text>
      </svg>
    </div>
  );
}
