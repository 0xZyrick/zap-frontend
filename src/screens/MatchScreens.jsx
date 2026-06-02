// ─── PreMatchScreen.jsx ───────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { FORMATIONS } from "../game/constants.js";
import { getFormation, getCard } from "../game/gameState.js";
import { clamp } from "../game/gameLogic.js";
import { StadiumEnvironment } from "../pitch/pitch.jsx";

export function PreMatchScreen({ S, onKickOff, onBack }) {
  const [selId, setSelId] = useState(S.formationId || "control-433");
  const sel = getFormation(selId);

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

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,.07)", flexShrink:0, zIndex:2, background:"rgba(3,8,5,.72)", backdropFilter:"blur(14px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <button onClick={onBack} style={{ width:"32px", height:"32px", borderRadius:"8px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", color:"var(--tx2)", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <span style={{ fontFamily:"var(--f-disp)", fontSize:"22px", letterSpacing:"2px" }}>PRE-MATCH</span>
        </div>
        <div style={{ padding:"5px 12px", borderRadius:"999px", background:"rgba(212,160,23,.1)", border:"1px solid rgba(212,160,23,.25)", fontFamily:"var(--f-mono)", fontSize:"8px", color:"var(--gold)", letterSpacing:".14em" }}>vs Rival FC</div>
      </div>

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
              <div style={{ fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"14px", color:"var(--tx2)", letterSpacing:".06em" }}>Pick your match shape</div>
            </div>
            <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"var(--green)", boxShadow:"0 0 14px rgba(24,193,88,.8)" }}/>
          </div>

          <div style={{ flex:1, minHeight:0, overflowY:"auto", scrollbarWidth:"none", paddingRight:"2px" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {FORMATIONS.map((f, fi) => {
                const st     = computeStats(f.id);
                const active = selId === f.id;
                return (
                  <button key={f.id} onClick={() => setSelId(f.id)} style={{
                    padding:"12px",
                    borderRadius:"12px",
                    border:`1.5px solid ${active?"var(--green)":"rgba(255,255,255,.08)"}`,
                    background:active?"linear-gradient(135deg,rgba(24,193,88,.14),rgba(255,255,255,.035))":"rgba(255,255,255,.025)",
                    textAlign:"left",
                    cursor:"pointer",
                    animation:`formCardIn .3s ${fi*0.07}s ease both`,
                    boxShadow:active?"0 0 0 1px rgba(24,193,88,.08),0 12px 32px rgba(24,193,88,.1)":"none",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", marginBottom:"8px" }}>
                      <div>
                        <div style={{ fontFamily:"var(--f-disp)", fontSize:"24px", letterSpacing:"1.5px", color:active?"var(--green)":"var(--tx)", lineHeight:1 }}>{f.shape}</div>
                        <div style={{ fontFamily:"var(--f-cond)", fontWeight:700, fontSize:"12px", color:"rgba(238,245,240,.68)", marginTop:"2px" }}>{f.name}</div>
                      </div>
                      <div style={{ width:"22px", height:"22px", borderRadius:"50%", border:`1px solid ${active?"var(--green)":"rgba(255,255,255,.12)"}`, display:"flex", alignItems:"center", justifyContent:"center", color:active?"var(--green)":"transparent", fontFamily:"var(--f-mono)", fontSize:"12px", flexShrink:0 }}>✓</div>
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

          <button onClick={() => onKickOff(selId)} style={{ marginTop:"12px", width:"100%", padding:"16px", borderRadius:"12px", background:"var(--green)", color:"var(--bg)", fontFamily:"var(--f-disp)", fontSize:"19px", letterSpacing:"3px", boxShadow:"0 0 30px rgba(24,193,88,.34)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", flexShrink:0 }}>KICK OFF <span>→</span></button>
        </aside>
      </div>
    </div>
  );
}

// ─── MatchFoundScreen.jsx ─────────────────────────────────────────────────────

export function MatchFoundScreen({ S, onKickOff, onChangeFormation }) {
  const [searching, setSearching] = useState(true);
  const [opponent] = useState(() => {
    const names = [
      "Apex Rovers",
      "Iron Gate FC",
      "Northbridge XI",
      "Metro Albion",
      "Harbor Athletic",
      "Crown Park FC",
      "Redline United",
      "Union Vale",
      "Velocity City",
      "Eastbank Rangers",
    ];
    const name = names[Math.floor(Math.random() * names.length)];
    const rep = Math.max(10, Math.round(S.rep * (0.72 + Math.random() * 0.56)));
    return { name, rep };
  });

  useEffect(() => {
    const t = setTimeout(() => setSearching(false), 1650);
    return () => clearTimeout(t);
  }, []);

  const opponentRep = opponent.rep;
  const opponentName = opponent.name;
  const diff    = Math.abs(S.rep - opponentRep);
  const winRep  = Math.max(6,  Math.min(25, Math.round(8  + diff * 0.12)));
  const lossRep = Math.max(8,  Math.min(20, Math.round(10 + diff * 0.1)));
  const oppColors = ["#7c3aed","#b91c1c","#0e7490","#166534","#334155","#6d28d9","#0f766e"];
  const oppCol  = oppColors[Math.round(opponentRep) % oppColors.length];
  const oppInit = opponentName.split(" ").map(w=>w[0]).join("").slice(0,3).toUpperCase();
  const myInit  = (S.clubName || "ZAP").split(" ").map(w=>w[0]).join("").slice(0,3).toUpperCase();
  const repGap = opponentRep - (S.rep || 0);
  const searchRows = [
    { label:"FORM", value:"RECENTLY ACTIVE" },
    { label:"RANGE", value:`REP ${Math.max(10, S.rep - 18)}-${S.rep + 24}` },
    { label:"RULESET", value:"RANKED FRIENDLY" },
  ];

  if (searching) {
    return (
      <div style={{ position:"absolute", inset:0, overflow:"hidden", animation:"flashIn .3s ease", background:"#06110c" }}>
        <StadiumEnvironment gs="MIDFIELD"/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,rgba(2,6,4,.94),rgba(2,6,4,.58),rgba(2,6,4,.94)),radial-gradient(ellipse 60% 64% at 50% 42%,rgba(24,193,88,.16),transparent 68%)" }}/>
        <div style={{ position:"relative", zIndex:2, height:"100%", display:"grid", gridTemplateRows:"auto 1fr auto", padding:"18px", gap:"14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".3em", color:"var(--green)" }}>SCOUTING OPPONENT</div>
            <button onClick={onChangeFormation} style={{ padding:"7px 11px", borderRadius:"999px", border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.05)", color:"var(--tx2)", fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".12em" }}>CHANGE SHAPE</button>
          </div>

          <div style={{ width:"min(780px,100%)", margin:"auto", display:"grid", gap:"16px" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"clamp(48px,8vw,88px)", letterSpacing:"4px", color:"var(--tx)", lineHeight:.9 }}>FINDING MATCH</div>
              <div style={{ margin:"12px auto 0", width:"min(420px,88vw)", height:"4px", borderRadius:"999px", overflow:"hidden", background:"rgba(255,255,255,.08)" }}>
                <div style={{ height:"100%", width:"42%", borderRadius:"999px", background:"linear-gradient(90deg,transparent,var(--green),transparent)", animation:"scanSweep 1.2s ease-in-out infinite" }}/>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:"10px" }}>
              {searchRows.map((row, i) => (
                <div key={row.label} style={{ padding:"13px 14px", borderRadius:"12px", background:"rgba(3,8,5,.78)", border:"1px solid rgba(255,255,255,.08)", animation:`splashFade .35s ${i*.08}s ease both` }}>
                  <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".2em", color:"rgba(255,255,255,.36)", marginBottom:"7px" }}>{row.label}</div>
                  <div style={{ fontFamily:"var(--f-cond)", fontSize:"15px", fontWeight:800, color:"var(--tx2)", letterSpacing:".06em" }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ width:"min(560px,100%)", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"10px", alignItems:"center" }}>
            <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(24,193,88,.42))" }}/>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".18em", color:"rgba(24,193,88,.72)", animation:"loadPulse 1.1s ease-in-out infinite" }}>PAIRING</div>
            <div style={{ height:"1px", background:"linear-gradient(90deg,rgba(24,193,88,.42),transparent)" }}/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", animation:"flashIn .3s ease", background:"#06110c" }}>
      <StadiumEnvironment gs="MIDFIELD"/>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 78% at 50% 48%,rgba(24,193,88,.12),transparent 64%),linear-gradient(90deg,rgba(2,6,4,.92),rgba(2,6,4,.48),rgba(2,6,4,.92))" }}/>

      <div style={{ position:"relative", zIndex:2, height:"100%", display:"grid", gridTemplateRows:"auto 1fr auto", padding:"18px", gap:"14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".32em", color:"var(--green)", animation:"vsFlash 1.5s ease-in-out infinite" }}>MATCH READY</div>
          <button onClick={onChangeFormation} style={{ padding:"7px 11px", borderRadius:"999px", border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.05)", color:"var(--tx2)", fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".12em" }}>CHANGE SHAPE</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) auto minmax(0,1fr)", gap:"14px", alignItems:"center", maxWidth:"940px", width:"100%", margin:"0 auto", minHeight:0 }}>
          {[{ name:S.clubName || "ZAP", rep:S.rep, init:myInit, col:"var(--green)", label:"YOUR CLUB" }, { name:opponentName, rep:opponentRep, init:oppInit, col:oppCol, label:"OPPOSITION" }].map((club, i) => (
            <div key={club.label} style={{ gridColumn:i===0 ? "1" : "3", borderRadius:"18px", border:`1px solid ${club.col}44`, background:"linear-gradient(180deg,rgba(8,18,13,.88),rgba(3,8,5,.95))", boxShadow:"0 24px 70px rgba(0,0,0,.38)", overflow:"hidden", animation:`splashFade .45s ${i*.1}s ease both` }}>
              <div style={{ padding:"10px 14px", display:"flex", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,.08)" }}>
                <span style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".2em", color:club.col }}>{club.label}</span>
                <span style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:"var(--tx3)" }}>REP {club.rep}</span>
              </div>
              <div style={{ padding:"20px", display:"flex", alignItems:"center", gap:"14px" }}>
                <div style={{ width:"68px", height:"68px", borderRadius:"18px", background:`radial-gradient(circle,${club.col}3a,rgba(255,255,255,.04))`, border:`1px solid ${club.col}66`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--f-disp)", fontSize:"20px", color:club.col, letterSpacing:"1px" }}>{club.init}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:"var(--f-disp)", fontSize:"34px", letterSpacing:"1px", color:"var(--tx)", lineHeight:.95, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{club.name}</div>
                  <div style={{ marginTop:"8px", height:"5px", width:"160px", maxWidth:"100%", background:"rgba(255,255,255,.08)", borderRadius:"999px", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:Math.max(8, Math.min(100, club.rep / 2))+"%", background:club.col, borderRadius:"999px" }}/>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div style={{ gridColumn:"2", gridRow:"1", width:"72px", height:"72px", borderRadius:"50%", border:"1px solid rgba(255,255,255,.1)", background:"rgba(3,8,5,.82)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--f-disp)", fontSize:"32px", color:"var(--gold)", boxShadow:"0 20px 56px rgba(0,0,0,.4)" }}>VS</div>
        </div>

        <div style={{ width:"min(700px,100%)", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"10px", alignItems:"stretch" }}>
          <div style={{ padding:"12px", borderRadius:"14px", background:"rgba(74,222,128,.08)", border:"1px solid rgba(74,222,128,.2)", textAlign:"center" }}>
            <div style={{ fontFamily:"var(--f-disp)", fontSize:"34px", color:"#4ade80", lineHeight:1 }}>+{winRep}</div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:"rgba(74,222,128,.65)", letterSpacing:".16em" }}>WIN REP</div>
          </div>
          <button onClick={() => onKickOff({ name:opponentName, rep:opponentRep })} style={{ minWidth:"190px", padding:"0 24px", borderRadius:"14px", background:"var(--green)", color:"var(--bg)", fontFamily:"var(--f-disp)", fontSize:"24px", letterSpacing:"3px", boxShadow:"0 0 30px rgba(24,193,88,.34)" }}>
            KICK OFF
            <span style={{ display:"block", marginTop:"3px", fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".14em", opacity:.62 }}>
              {repGap > 0 ? `+${repGap} REP GAP` : repGap < 0 ? `${repGap} REP GAP` : "EVEN REP"}
            </span>
          </button>
          <div style={{ padding:"12px", borderRadius:"14px", background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.2)", textAlign:"center" }}>
            <div style={{ fontFamily:"var(--f-disp)", fontSize:"34px", color:"#f87171", lineHeight:1 }}>-{lossRep}</div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:"rgba(248,113,113,.65)", letterSpacing:".16em" }}>LOSS REP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
