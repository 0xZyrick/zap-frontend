// ─── PreMatchScreen.jsx ───────────────────────────────────────────────────────

import { useState } from "react";
import { FORMATIONS } from "../game/constants.js";
import { getFormation, getCard } from "../game/gameState.js";
import { clamp } from "../game/gameLogic.js";
import { StadiumEnvironment } from "../pitch/pitch.jsx";
import { ScreenBackButton } from "./HomeScreens.jsx";

const HOME_BG = "/assets/bg/home-bg.png";
const WHISTLE_ICON = "/assets/icons/whistle.png";
const CRESTS = {
  derick: "/assets/crests/derick.png",
  derickfc: "/assets/crests/derick.png",
  elmaestro: "/assets/crests/el-maestro.png",
  phantomxi: "/assets/crests/phantom-xi.png",
  codmai: "/assets/crests/codmai.png",
  skyfoot: "/assets/crests/sky-foot.png",
  ghoststrike: "/assets/crests/ghost-strike.png",
};

function assetKey(name = "") {
  return name
    .toLowerCase()
    .replace(/\bfc\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function crestSrc(name) {
  return CRESTS[assetKey(name)] || null;
}

export function PreMatchScreen({ S, onKickOff, onBack, teamOnly = false }) {
  const [selId, setSelId] = useState(S.formationId || "control-433");
  const sel = getFormation(selId);
  const selectedLocked = (S?.rep || 0) < (sel.minRep || 0);

  const computeStats = (fId) => {
    const f  = getFormation(fId);
    const st = S.starters || {};
    let atk = 5 + f.mods.atk, mid = 5 + f.mods.mid, def = 5 + f.mods.def;
    const dk = getCard(st.defender), mk = getCard(st.midfielder), sk = getCard(st.striker);
    if (dk) def += dk.boost;
    if (mk) mid += mk.boost;
    if (sk) atk += sk.boost;
    return { atk, mid, def };
  };

  const fmtDots = {
    "press-433":   { rows:[{n:3,y:20},{n:3,y:48},{n:4,y:76}] },
    "control-433": { rows:[{n:3,y:20},{n:3,y:48},{n:4,y:76}] },
    "pivot-4231":  { rows:[{n:1,y:18},{n:3,y:38},{n:2,y:58},{n:4,y:78}] },
    "classic-442": { rows:[{n:2,y:20},{n:4,y:48},{n:4,y:76}] },
    "diamond-41212": { rows:[{n:2,y:18},{n:1,y:36},{n:2,y:52},{n:1,y:66},{n:4,y:82}] },
    "wide-352":    { rows:[{n:2,y:18},{n:5,y:48},{n:3,y:76}] },
    "storm-343":   { rows:[{n:3,y:20},{n:4,y:50},{n:3,y:78}] },
    "lock-532":    { rows:[{n:2,y:20},{n:3,y:48},{n:5,y:76}] },
    "low-541":     { rows:[{n:1,y:18},{n:4,y:48},{n:5,y:76}] },
  };
  const dots  = fmtDots[selId]?.rows || [];
  const cs    = computeStats(selId);
  const statMax = 12;
  const statDefs = [
    { k:"atk", l:"ATK", v:cs.atk, c:"#f87171" },
    { k:"mid", l:"MID", v:cs.mid, c:"#facc15" },
    { k:"def", l:"DEF", v:cs.def, c:"#60a5fa" },
  ];

  return (
    <div style={{ position:"absolute", inset:0, background:"#07100b", display:"flex", flexDirection:"column", animation:"flashIn .25s ease", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 18% 20%,rgba(24,193,88,.14),transparent 34%),radial-gradient(circle at 78% 30%,rgba(212,160,23,.08),transparent 30%),linear-gradient(180deg,#07100b 0%,#020504 100%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(24,193,88,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(24,193,88,.035) 1px,transparent 1px)", backgroundSize:"28px 28px", pointerEvents:"none", opacity:.7 }}/>
      <ScreenBackButton onClick={onBack} />

      <div className="prematch-main">
        {/* Field preview */}
        <section className="prematch-field-panel">
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"14px", marginBottom:"12px" }}>
            <div>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".2em", color:"var(--tx3)", marginBottom:"4px" }}>TACTICAL SHAPE</div>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"38px", letterSpacing:"2px", color:"var(--tx)", lineHeight:1 }}>{sel.name}</div>
              <div style={{ fontFamily:"var(--f-body)", fontSize:"12px", lineHeight:1.45, color:"rgba(238,245,240,.5)", maxWidth:"420px", marginTop:"4px" }}>{sel.desc}</div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"34px", color:"var(--green)", lineHeight:1 }}>{sel.shape}</div>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:"var(--tx3)", letterSpacing:".16em" }}>SELECTED</div>
            </div>
          </div>

          <div className="formation-field">
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.28 }} viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth=".45"/>
              <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth=".45"/>
              <rect x="0" y="25" width="14" height="50" fill="none" stroke="white" strokeWidth=".45"/>
              <rect x="86" y="25" width="14" height="50" fill="none" stroke="white" strokeWidth=".45"/>
              <rect x="0" y="38" width="5" height="24" fill="none" stroke="white" strokeWidth=".45"/>
              <rect x="95" y="38" width="5" height="24" fill="none" stroke="white" strokeWidth=".45"/>
            </svg>
            {dots.map((row, ri) => {
              const sp = 100 / (row.n + 1);
              return Array.from({ length:row.n }, (_, di) => {
                const col = ri === 0 ? "#f87171" : ri === 1 ? "#facc15" : "#60a5fa";
                return (
                  <div key={`${ri}-${di}`} style={{
                    position:"absolute",
                    width:"clamp(18px,3.8vw,30px)", height:"clamp(18px,3.8vw,30px)",
                    borderRadius:"50%",
                    background:`radial-gradient(circle at 35% 25%,#fff8,${col} 38%,#07100b 100%)`,
                    border:`2px solid ${col}aa`,
                    left:`${sp*(di+1)}%`, top:`${row.y}%`,
                    transform:"translate(-50%,-50%)",
                    boxShadow:`0 8px 18px rgba(0,0,0,.45),0 0 18px ${col}66`,
                  }}>
                    <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--f-mono)", fontSize:"9px", fontWeight:800, color:"#020504" }}>{ri === 0 ? "A" : ri === 1 ? "M" : "D"}</span>
                  </div>
                );
              });
            })}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginTop:"12px" }}>
            {statDefs.map(s=>(
              <div key={s.k} style={{ padding:"11px 12px", borderRadius:"10px", border:`1px solid ${s.c}33`, background:"rgba(255,255,255,.035)" }}>
                <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"8px" }}>
                  <span style={{ fontFamily:"var(--f-mono)", fontSize:"8px", color:s.c, letterSpacing:".14em" }}>{s.l}</span>
                  <span style={{ fontFamily:"var(--f-disp)", fontSize:"24px", color:"var(--tx)", lineHeight:1 }}>{s.v}</span>
                </div>
                <div style={{ height:"4px", background:"rgba(255,255,255,.08)", borderRadius:"999px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:clamp(s.v/statMax*100,0,100)+"%", background:s.c, borderRadius:"999px", boxShadow:`0 0 12px ${s.c}77` }}/>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Formation options */}
        <aside className="prematch-options-panel">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px", flexShrink:0 }}>
            <div>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".2em", color:"var(--green)", marginBottom:"3px" }}>FORMATION OPTIONS</div>
              <div style={{ fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"14px", color:"var(--tx2)", letterSpacing:".06em" }}>{teamOnly ? "Set the shape used from Kick Off" : "Pick your match shape"}</div>
            </div>
            <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"var(--green)", boxShadow:"0 0 14px rgba(24,193,88,.8)" }}/>
          </div>

          <div style={{ flex:1, minHeight:0, overflowY:"auto", scrollbarWidth:"none", paddingRight:"2px" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {FORMATIONS.map((f, fi) => {
                const st     = computeStats(f.id);
                const active = selId === f.id;
                const locked = (S?.rep || 0) < (f.minRep || 0);
                const needed = Math.max(0, (f.minRep || 0) - (S?.rep || 0));
                return (
                  <button key={f.id} disabled={locked} onClick={() => setSelId(f.id)} style={{
                    padding:"12px",
                    borderRadius:"12px",
                    border:`1.5px solid ${active?"var(--green)":locked?"rgba(255,255,255,.045)":"rgba(255,255,255,.08)"}`,
                    background:locked?"rgba(255,255,255,.015)":active?"linear-gradient(135deg,rgba(24,193,88,.14),rgba(255,255,255,.035))":"rgba(255,255,255,.025)",
                    textAlign:"left",
                    cursor:locked?"not-allowed":"pointer",
                    opacity:locked ? .75 : 1,
                    animation:`formCardIn .3s ${fi*0.07}s ease both`,
                    boxShadow:active?"0 0 0 1px rgba(24,193,88,.08),0 12px 32px rgba(24,193,88,.1)":"none",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", marginBottom:"8px" }}>
                      <div>
                        <div style={{ fontFamily:"var(--f-disp)", fontSize:"24px", letterSpacing:"1.5px", color:locked?"rgba(255,255,255,.32)":active?"var(--green)":"var(--tx)", lineHeight:1 }}>{f.shape}</div>
                        <div style={{ fontFamily:"var(--f-cond)", fontWeight:700, fontSize:"12px", color:"rgba(238,245,240,.68)", marginTop:"2px" }}>{f.name}</div>
                        {locked && <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", color:"#facc15", letterSpacing:".12em", marginTop:"5px" }}>{needed} ZAP NEEDED · {f.minRep} REP</div>}
                      </div>
                      <div style={{ width:"22px", height:"22px", borderRadius:"50%", border:`1px solid ${active?"var(--green)":locked?"rgba(250,204,21,.26)":"rgba(255,255,255,.12)"}`, display:"flex", alignItems:"center", justifyContent:"center", color:active?"var(--green)":locked?"#facc15":"transparent", fontFamily:"var(--f-mono)", fontSize:"12px", flexShrink:0 }}>{locked ? "⌁" : "✓"}</div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"6px" }}>
                      {[{k:"def",l:"DEF",v:st.def,c:"#60a5fa"},{k:"mid",l:"MID",v:st.mid,c:"#facc15"},{k:"atk",l:"ATK",v:st.atk,c:"#f87171"}].map(s=>(
                        <div key={s.k} style={{ borderRadius:"8px", padding:"7px 7px 6px", background:"rgba(0,0,0,.18)", border:"1px solid rgba(255,255,255,.05)" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"5px" }}>
                            <span style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", color:s.c, letterSpacing:".1em" }}>{s.l}</span>
                            <span style={{ fontFamily:"var(--f-disp)", fontSize:"17px", color:"var(--tx)", lineHeight:1 }}>{s.v}</span>
                          </div>
                          <div style={{ height:"3px", background:"rgba(255,255,255,.08)", borderRadius:"999px", overflow:"hidden" }}>
                            <div style={{ height:"100%", width:clamp(s.v/statMax*100,0,100)+"%", background:s.c, borderRadius:"999px" }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button disabled={selectedLocked} onClick={() => onKickOff(selId)} style={{ marginTop:"12px", width:"100%", padding:"16px", borderRadius:"12px", background:selectedLocked?"rgba(255,255,255,.08)":"var(--green)", color:selectedLocked?"rgba(255,255,255,.34)":"var(--bg)", fontFamily:"var(--f-disp)", fontSize:"19px", letterSpacing:"3px", boxShadow:selectedLocked?"none":"0 0 30px rgba(24,193,88,.34)", cursor:selectedLocked?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", flexShrink:0 }}>
            {selectedLocked ? `${Math.max(0, (sel.minRep || 0) - (S?.rep || 0))} ZAP NEEDED` : teamOnly ? "SAVE FORMATION" : "KICK OFF"} <span>{selectedLocked ? "⌁" : teamOnly ? "✓" : "→"}</span>
          </button>
        </aside>
      </div>
    </div>
  );
}

// ─── MatchFoundScreen.jsx ─────────────────────────────────────────────────────

const systemDifficulty = (S) => {
  const played = S?.total || 0;
  const rep = S?.rep || 50;
  const streak = S?.streak || 0;
  if (played === 0) return "easy";
  if (played < 3 && rep < 90) return "medium";
  if (streak >= 3 || rep >= 120 || played >= 7) return "hard";
  return "medium";
};

const opponentRepForDifficulty = (S, difficulty) => {
  const rep = S?.rep || 50;
  const ranges = {
    easy:   [0.58, 0.82],
    medium: [0.86, 1.12],
    hard:   [1.06, 1.34],
  };
  const [lo, hi] = ranges[difficulty] || ranges.medium;
  return Math.max(10, Math.round(rep * (lo + Math.random() * (hi - lo))));
};

const OPPONENT_RAIL = [
  { name:"Phantom XI", difficulty:"medium", rarity:"COMMON", acc:"61%" },
  { name:"Codmai", difficulty:"hard", rarity:"RARE", acc:"68%" },
  { name:"Sky Foot", difficulty:"easy", rarity:"COMMON", acc:"56%" },
  { name:"Ghost Strike", difficulty:"hard", rarity:"ELITE", acc:"72%" },
  { name:"El Maestro", difficulty:"medium", rarity:"RARE", acc:"64%" },
];

export function MatchFoundScreen({ S, selectedFormationId, onSelectFormation, onKickOff, onBack }) {
  const [opponents] = useState(() => {
    const preferred = systemDifficulty(S);
    const sorted = [...OPPONENT_RAIL].sort((a, b) => (a.difficulty === preferred ? -1 : 0) - (b.difficulty === preferred ? -1 : 0));
    return sorted.map((item) => ({ ...item, rep: opponentRepForDifficulty(S, item.difficulty) }));
  });
  const [opponentIndex, setOpponentIndex] = useState(0);
  const [formationOpen, setFormationOpen] = useState(false);
  const opponent = opponents[opponentIndex] || opponents[0];
  const activeFormationId = selectedFormationId || S?.formationId || "control-433";
  const activeFormation = getFormation(activeFormationId);
  const formationLocked = (S?.rep || 0) < (activeFormation?.minRep || 0);
  const moveOpponent = (dir) => {
    setOpponentIndex((idx) => (idx + dir + opponents.length) % opponents.length);
  };

  const opponentRep = opponent.rep;
  const opponentName = opponent.name;
  const oppInit = opponentName.split(" ").map(w=>w[0]).join("").slice(0,3).toUpperCase();
  const myInit  = (S.clubName || "ZAP").split(" ").map(w=>w[0]).join("").slice(0,3).toUpperCase();
  const myClubName = S.clubName || "ZAP FC";
  const myWins = Math.max(0, S?.wins ?? 5);
  const myDraws = Math.max(0, S?.draws ?? 1);
  const myLosses = Math.max(0, S?.losses ?? 0);
  const oppWins = opponent.difficulty === "hard" ? 7 : opponent.difficulty === "medium" ? 6 : 5;
  const oppDraws = 1;
  const oppLosses = opponent.difficulty === "hard" ? 1 : 0;
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", animation:"flashIn .3s ease", background:"#06110c" }}>
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg,rgba(2,6,4,.92),rgba(2,6,4,.48),rgba(2,6,4,.92)),linear-gradient(180deg,rgba(2,6,4,.72),rgba(2,6,4,.38) 42%,rgba(2,6,4,.88)),url("${HOME_BG}") center / cover no-repeat` }}/>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 64% 62% at 50% 55%,rgba(34,197,94,.14),transparent 68%)" }}/>

      <ScreenBackButton onClick={onBack} />

      <div style={{ position:"relative", zIndex:2, height:"100%", display:"grid", alignItems:"center", padding:"clamp(82px,8vw,110px) clamp(44px,7vw,110px) clamp(38px,6vw,70px)" }}>
        <div style={{ display:"grid", gridTemplateColumns:"minmax(210px,245px) minmax(170px,300px) minmax(210px,245px)", gap:"clamp(54px,10vw,150px)", alignItems:"center", justifyContent:"center" }}>
          {[
            { name:myClubName, init:myInit, crest:crestSrc(myClubName), col:"#74ff49", wins:myWins, draws:myDraws, losses:myLosses, acc:"70%" },
            { name:opponentName, init:oppInit, crest:crestSrc(opponentName), col:"#ff7b43", wins:oppWins, draws:oppDraws, losses:oppLosses, acc:"60%" },
          ].map((club, index) => (
            <div key={club.name} style={{ gridColumn:index === 0 ? "1" : "3", gridRow:"1", display:"grid", gap:"12px", animation:`splashFade .45s ${index*.1}s ease both` }}>
              <div style={{ height:"clamp(270px,42vh,318px)", borderRadius:"6px", padding:"clamp(16px,2vw,24px)", background:"rgba(233,255,225,.065)", border:"1px solid rgba(255,255,255,.04)", boxShadow:"inset 0 1px 0 rgba(255,255,255,.05),0 24px 70px rgba(0,0,0,.18)", backdropFilter:"blur(2px)", display:"grid", gridTemplateRows:"auto 1fr auto", overflow:"hidden" }}>
                <div style={{ fontFamily:"var(--f-body)", fontSize:"clamp(21px,2.1vw,29px)", fontWeight:700, lineHeight:1, textAlign:"center", textTransform:"uppercase", background:`linear-gradient(90deg,#f5ffd9 0%,${club.col} 48%,#ffffff 100%)`, WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>
                  {club.name}
                </div>

                <div style={{ display:"grid", placeItems:"center", minHeight:0 }}>
                  {club.crest ? (
                    <img src={club.crest} alt="" draggable={false} style={{ width:"min(78%,178px)", height:"min(78%,178px)", objectFit:"contain", filter:"drop-shadow(0 22px 34px rgba(0,0,0,.45))" }} />
                  ) : (
                    <div style={{ width:"min(66%,136px)", aspectRatio:"1", borderRadius:"14px", display:"grid", placeItems:"center", background:"rgba(6,18,10,.62)", border:`1px solid ${club.col}66`, color:"#fff", fontFamily:"var(--f-disp)", fontSize:"clamp(34px,3.6vw,50px)", filter:"drop-shadow(0 22px 34px rgba(0,0,0,.45))" }}>{club.init}</div>
                  )}
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", color:"#fff", textAlign:"center" }}>
                  {[
                    ["WIN", club.wins],
                    ["DRAW", club.draws],
                    ["LOSS", club.losses],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontFamily:"var(--f-body)", fontSize:"clamp(17px,1.55vw,22px)", fontWeight:900, lineHeight:1 }}>{value}</div>
                      <div style={{ marginTop:"7px", fontFamily:"var(--f-body)", fontSize:"clamp(12px,1.25vw,16px)", fontWeight:400, lineHeight:1 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ minHeight:"clamp(64px,8vw,76px)", borderRadius:"6px", background:"rgba(233,255,225,.065)", border:"1px solid rgba(255,255,255,.04)", display:"grid", placeItems:"center", textAlign:"center", color:"#fff", backdropFilter:"blur(2px)" }}>
                <div>
                  <div style={{ fontFamily:"var(--f-body)", fontSize:"clamp(12px,1.4vw,17px)", fontWeight:400, lineHeight:1, marginBottom:"8px" }}>READ ACCURACY</div>
                  <div style={{ fontFamily:"var(--f-body)", fontSize:"clamp(18px,2vw,25px)", fontWeight:900, lineHeight:1 }}>{club.acc}</div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ gridColumn:"2", gridRow:"1", display:"grid", placeItems:"center", alignSelf:"center" }}>
            <div style={{ display:"grid", gap:"12px", justifyItems:"center", width:"min(100%,210px)" }}>
              <div style={{ display:"grid", gridTemplateColumns:"44px 1fr 44px", gap:"8px", alignItems:"center", width:"100%" }}>
                <button onClick={() => moveOpponent(-1)} aria-label="Previous opponent" style={{ height:"44px", borderRadius:"8px", background:"rgba(255,255,255,.08)", color:"#fff", border:"1px solid rgba(255,255,255,.1)", fontSize:"22px" }}>‹</button>
                <div style={{ minWidth:0, textAlign:"center", fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".12em", color:"rgba(255,255,255,.64)" }}>{opponentIndex + 1}/{opponents.length}</div>
                <button onClick={() => moveOpponent(1)} aria-label="Next opponent" style={{ height:"44px", borderRadius:"8px", background:"rgba(255,255,255,.08)", color:"#fff", border:"1px solid rgba(255,255,255,.1)", fontSize:"22px" }}>›</button>
              </div>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"center" }}>
                <span style={{ padding:"7px 9px", borderRadius:"999px", background:"rgba(255,255,255,.09)", color:"#fff", fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".12em" }}>{opponent.difficulty.toUpperCase()}</span>
                <span style={{ padding:"7px 9px", borderRadius:"999px", background:"rgba(116,220,69,.13)", color:"#bafc8a", fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".12em" }}>{opponent.rarity}</span>
              </div>
              <button onClick={() => setFormationOpen(true)} style={{ width:"100%", minHeight:"44px", borderRadius:"7px", background:"rgba(255,255,255,.075)", color:"#fff", border:"1px solid rgba(255,255,255,.12)", fontFamily:"var(--f-body)", fontSize:"14px", fontWeight:600 }}>
                Formation · {activeFormation.shape}
              </button>
              <button disabled={formationLocked} onClick={() => onKickOff({ name:opponentName, rep:opponentRep, difficulty:opponent.difficulty })} style={{ width:"min(100%,176px)", height:"clamp(42px,5vw,56px)", borderRadius:"7px", background:formationLocked?"rgba(255,255,255,.12)":"linear-gradient(135deg,#bafc8a,#74dc45)", color:formationLocked?"rgba(255,255,255,.44)":"#061008", border:"1px solid rgba(255,255,255,.18)", fontFamily:"var(--f-body)", fontSize:"clamp(16px,1.55vw,22px)", fontWeight:700, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"10px", boxShadow:formationLocked?"none":"0 18px 42px rgba(0,0,0,.28),0 0 30px rgba(116,220,69,.24)" }}>
                KICK OFF
                <img src={WHISTLE_ICON} alt="" draggable={false} onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ width:"clamp(22px,2.4vw,30px)", height:"clamp(22px,2.4vw,30px)", objectFit:"contain" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {formationOpen && (
        <div className="zap-modal-backdrop">
          <div className="formation-quick-modal">
            <button className="formation-quick-modal__close" onClick={() => setFormationOpen(false)} aria-label="Close">×</button>
            <div className="formation-quick-modal__eyebrow">MATCH SHAPE</div>
            <h2>Pick your setup</h2>
            <div className="formation-quick-modal__list">
              {FORMATIONS.map((f) => {
                const locked = (S?.rep || 0) < (f.minRep || 0);
                const active = f.id === activeFormationId;
                const needed = Math.max(0, (f.minRep || 0) - (S?.rep || 0));
                return (
                  <button
                    key={f.id}
                    disabled={locked}
                    className={active ? "is-active" : ""}
                    onClick={() => {
                      onSelectFormation?.(f.id);
                      setFormationOpen(false);
                    }}
                  >
                    <strong>{f.shape}</strong>
                    <span>{f.name}{locked ? ` · ${needed} ZAP NEEDED` : ""}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
