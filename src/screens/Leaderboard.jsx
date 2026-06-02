// ─── Leaderboard.jsx ─────────────────────────────────────────────────────────
import { useState } from "react";
import { TIERS } from "../game/constants.js";
import { ranked, myRank, getTier } from "../game/gameState.js";
import { StadiumEnvironment } from "../pitch/pitch.jsx";

function initials(name) {
  return (name || "FC").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const CLUB_COLORS = [
  "#e53935","#1e88e5","#43a047","#8e24aa","#f4511e",
  "#00acc1","#d4a017","#6d4c41","#3949ab","#00897b",
];

const TIER_CONF = {
  "Master League": { short:"MST", gradient:"linear-gradient(135deg,#d4a017,#f5c842)", text:"#7a5a00" },
  "Elite League":  { short:"ELT", gradient:"linear-gradient(135deg,#94a3b8,#cbd5e1)", text:"#334155" },
  "Professional":  { short:"PRO", gradient:"linear-gradient(135deg,#c2734a,#e09070)", text:"#5a2a0a" },
  "Amateur": { short:"AMT", gradient:"linear-gradient(135deg,#22c55e,#4ade80)", text:"#14532d" },
  "Rookie":  { short:"RKE", gradient:"linear-gradient(135deg,#3b82f6,#60a5fa)", text:"#1e3a8a" },
};

const RANK_STYLE = {
  1: { bg:"linear-gradient(135deg,#d4a017,#f5c842)", color:"#7a5a00", label:"1ST" },
  2: { bg:"linear-gradient(135deg,#94a3b8,#cbd5e1)", color:"#334155", label:"2ND" },
  3: { bg:"linear-gradient(135deg,#c2734a,#e09070)", color:"#5a2a0a", label:"3RD" },
};

export function Leaderboard({ S, LB, onHome }) {
  const [activeTier, setActiveTier] = useState(null);
  const list  = ranked(S, LB);
  const rank  = myRank(S, LB);
  const tier  = getTier(rank);
  const tc    = TIER_CONF[tier?.name] || TIER_CONF["Rookie"];

  const tierGroups = TIERS.map(t => ({
    ...t,
    entries: list.filter(p => p.rank >= t.min && p.rank <= t.max),
    hasMe:   list.filter(p => p.rank >= t.min && p.rank <= t.max).some(p => !p.cpu),
  })).filter(t => t.entries.length);

  const visibleTiers = activeTier
    ? tierGroups.filter(t => t.name === activeTier)
    : tierGroups;
  const podium = list.slice(0, 3);

  return (
    <div style={{ position:"absolute", inset:0, background:"#050e08", overflow:"hidden" }}>
      <StadiumEnvironment gs="MIDFIELD"/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(2,6,4,.96) 0%,rgba(1,3,2,.92) 100%)" }}/>

      <div style={{ position:"relative", zIndex:1, height:"100%", display:"flex", flexDirection:"column" }}>

        {/* ── Top bar ── */}
        <div style={{ padding:"14px 16px 0", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
            <button onClick={onHome} style={{ width:"36px", height:"36px", borderRadius:"9px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"rgba(255,255,255,.7)", fontSize:"18px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer" }}>←</button>

            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".3em", color:"rgba(255,255,255,.38)", marginBottom:"3px" }}>SEASON 1 · LIVE LADDER</div>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"34px", letterSpacing:"2px", color:"#fff", lineHeight:1 }}>LEAGUE TABLE</div>
            </div>

            {/* Player badge */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px" }}>
              <div style={{ padding:"5px 11px", borderRadius:"7px", background:tc.gradient, fontFamily:"var(--f-mono)", fontSize:"8px", fontWeight:700, color:tc.text, letterSpacing:".1em" }}>{tc.short}</div>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"30px", color:tier?.col || "#18c158", lineHeight:1 }}>#{rank}</div>
            </div>
          </div>

          {/* ── Tier filter pills ── */}
          <div style={{ display:"flex", gap:"6px", overflowX:"auto", paddingBottom:"10px", scrollbarWidth:"none" }}>
            <button
              onClick={() => setActiveTier(null)}
              style={{ flexShrink:0, padding:"7px 13px", borderRadius:"999px", fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".14em", cursor:"pointer", background: activeTier === null ? "rgba(24,193,88,.2)" : "rgba(255,255,255,.05)", border: activeTier === null ? "1px solid rgba(24,193,88,.4)" : "1px solid rgba(255,255,255,.1)", color: activeTier === null ? "#18c158" : "rgba(255,255,255,.62)" }}
            >ALL</button>
            {tierGroups.map(t => (
              <button
                key={t.name}
                onClick={() => setActiveTier(activeTier === t.name ? null : t.name)}
                style={{ flexShrink:0, padding:"7px 13px", borderRadius:"999px", fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".14em", cursor:"pointer", background: activeTier === t.name ? `${t.col}22` : "rgba(255,255,255,.05)", border: activeTier === t.name ? `1px solid ${t.col}55` : "1px solid rgba(255,255,255,.1)", color: activeTier === t.name ? t.col : "rgba(255,255,255,.62)" }}
              >
                {t.icon} {t.short || t.name.slice(0,3).toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"0 16px 16px", minHeight:0 }}>
          {!activeTier && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:"10px", marginBottom:"14px" }}>
              {podium.map((p) => {
                const rs = RANK_STYLE[p.rank];
                const isMe = !p.cpu;
                const badgeCol = isMe ? tier?.col || "#18c158" : CLUB_COLORS[(p.id + 7) % CLUB_COLORS.length];
                return (
                  <div key={`podium-${p.id ?? "me"}`} style={{
                    minHeight:"118px",
                    borderRadius:"14px",
                    padding:"13px",
                    background:`linear-gradient(145deg,${isMe ? (tier?.col || "#18c158") + "22" : "rgba(255,255,255,.07)"},rgba(3,8,5,.84))`,
                    border:`1px solid ${isMe ? (tier?.col || "#18c158") + "66" : "rgba(255,255,255,.1)"}`,
                    boxShadow:isMe ? `0 18px 45px ${(tier?.col || "#18c158")}22` : "0 16px 38px rgba(0,0,0,.28)",
                    display:"flex",
                    flexDirection:"column",
                    justifyContent:"space-between",
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"8px" }}>
                      <div style={{ width:"42px", height:"42px", borderRadius:"11px", background:badgeCol, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--f-disp)", fontSize:"16px", letterSpacing:"1px" }}>
                        {isMe ? initials(S.clubName || "ZF") : initials(p.name)}
                      </div>
                      <div style={{ padding:"5px 8px", borderRadius:"7px", background:rs?.bg || "rgba(255,255,255,.1)", color:rs?.color || "#fff", fontFamily:"var(--f-mono)", fontSize:"9px", fontWeight:800 }}>{rs?.label || `#${p.rank}`}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily:"var(--f-disp)", fontSize:"24px", color:isMe ? tier?.col || "#18c158" : "#fff", lineHeight:.95, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{isMe ? S.clubName || "ZAP" : p.name}</div>
                      <div style={{ marginTop:"7px", fontFamily:"var(--f-mono)", fontSize:"10px", color:"rgba(255,255,255,.55)", letterSpacing:".12em" }}>{p.pts} REP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Column headers */}
          <div style={{ display:"grid", gridTemplateColumns:"48px 48px 1fr 46px 46px 46px 68px", gap:"6px", alignItems:"center", padding:"8px 12px", marginBottom:"5px", background:"rgba(255,255,255,.035)", borderRadius:"9px" }}>
            {["#","","CLUB","W","D","L","REP"].map((h,i) => (
              <div key={i} style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".18em", color:"rgba(255,255,255,.38)", textAlign: i >= 3 ? "center" : "left" }}>{h}</div>
            ))}
          </div>

          {visibleTiers.map(t => (
            <div key={t.name} style={{ marginBottom:"20px" }}>

              {/* Tier header — slim bar */}
              <div style={{ display:"flex", alignItems:"center", gap:"9px", padding:"8px 12px", borderRadius:"9px", marginBottom:"5px", background:`linear-gradient(90deg,${t.col}22,transparent 82%)`, borderLeft:`3px solid ${t.col}` }}>
                <span style={{ fontSize:"16px" }}>{t.icon}</span>
                <span style={{ fontFamily:"var(--f-disp)", fontSize:"18px", letterSpacing:"1.5px", color:t.col }}>{t.name.toUpperCase()}</span>
                {t.hasMe && (
                  <span style={{ marginLeft:"auto", fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".12em", color:t.col, padding:"3px 7px", borderRadius:"5px", background:`${t.col}18` }}>YOU</span>
                )}
                <span style={{ marginLeft: t.hasMe ? "0" : "auto", fontFamily:"var(--f-mono)", fontSize:"8px", color:"rgba(255,255,255,.32)" }}>{t.entries.length} CLUBS</span>
              </div>

              {/* Rows */}
              {t.entries.map((p, i) => {
                const isMe = !p.cpu;
                const rs   = RANK_STYLE[p.rank];
                const badgeCol = CLUB_COLORS[(p.id + 7) % CLUB_COLORS.length];
                const w = p.wins   || 0;
                const d = p.draws  || 0;
                const l = p.losses || 0;

                return (
                  <div key={p.id ?? "me"} style={{
                    display:"grid",
                    gridTemplateColumns:"48px 48px 1fr 46px 46px 46px 68px",
                    gap:"6px",
                    alignItems:"center",
                    padding:"11px 12px",
                    borderRadius:"10px",
                    marginBottom:"4px",
                    background: isMe
                      ? `linear-gradient(90deg,${t.col}14,rgba(5,14,8,.85) 70%)`
                      : i % 2 === 0 ? "rgba(255,255,255,.025)" : "transparent",
                    borderLeft: isMe ? `2px solid ${t.col}` : "2px solid transparent",
                    transition:"background .12s",
                  }}>

                    {/* Rank */}
                    <div style={{ textAlign:"center" }}>
                      {rs ? (
                        <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:"26px", height:"26px", borderRadius:"6px", background:rs.bg, fontFamily:"var(--f-mono)", fontSize:"7px", fontWeight:700, color:rs.color }}>{rs.label}</div>
                      ) : (
                        <span style={{ fontFamily:"var(--f-mono)", fontSize:"15px", fontWeight:800, color: isMe ? t.col : "rgba(255,255,255,.45)" }}>#{p.rank}</span>
                      )}
                    </div>

                    {/* Club badge */}
                    <div style={{ display:"flex", justifyContent:"center" }}>
                      <div style={{
                        width:"38px", height:"38px", borderRadius:"10px",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontFamily:"var(--f-disp)", fontSize:"14px", fontWeight:700, color:"#fff",
                        background: isMe ? t.col : badgeCol,
                        opacity: isMe ? 1 : 0.8,
                        boxShadow: isMe ? `0 0 14px ${t.col}55` : "none",
                      }}>
                        {isMe ? (S.clubName || "ZF").slice(0,2) : initials(p.name)}
                      </div>
                    </div>

                    {/* Club name */}
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontFamily:"var(--f-disp)", fontSize:"20px", letterSpacing:".8px", color: isMe ? t.col : "#fff", lineHeight:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {isMe ? (S.clubName || "ZAP") : p.name}
                      </div>
                    </div>

                    {/* W */}
                    <div style={{ textAlign:"center", fontFamily:"var(--f-mono)", fontSize:"14px", fontWeight:800, color: w > 0 ? "#22c55e" : "rgba(255,255,255,.28)" }}>{w}</div>
                    {/* D */}
                    <div style={{ textAlign:"center", fontFamily:"var(--f-mono)", fontSize:"14px", fontWeight:800, color: d > 0 ? "#d4a017" : "rgba(255,255,255,.28)" }}>{d}</div>
                    {/* L */}
                    <div style={{ textAlign:"center", fontFamily:"var(--f-mono)", fontSize:"14px", fontWeight:800, color: l > 0 ? "#ef4444" : "rgba(255,255,255,.28)" }}>{l}</div>

                    {/* REP */}
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"var(--f-disp)", fontSize:"24px", color: isMe ? t.col : "rgba(255,255,255,.82)", lineHeight:1 }}>{p.pts}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
