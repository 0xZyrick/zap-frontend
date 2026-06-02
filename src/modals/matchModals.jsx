// ─── matchModals.jsx ──────────────────────────────────────────────────────────
// Modal overlays that appear during / after a match.
// Each is self-contained; receives only the data it needs.

import { useState, useEffect, useRef } from "react";
import { ranked } from "../game/gameState.js";
import { getRewardParticles } from "../game/gameLogic.js";
import { pick } from "../game/gameLogic.js";
import { HT_TALK } from "../game/constants.js";

// ─── HalfTime ────────────────────────────────────────────────────────────────

export function HalfTime({ score, S, matchStats, opponentName = "RIVALS FC", topOpponentIntent = null, onContinue }) {
  const [ct, setCt] = useState(14);
  const continuedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setCt(n => Math.max(n - 1, 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (ct > 0 || continuedRef.current) return;
    continuedRef.current = true;
    onContinue();
  }, [ct, onContinue]);

  const lead    = score.h > score.a;
  const behind  = score.h < score.a;
  const rc      = lead ? "#4ade80" : behind ? "#f87171" : "#d4a017";
  const talkKey = lead ? "winning" : behind ? "losing" : "drawing";
  const stats   = matchStats || { shots_h:0, shots_a:0, saves_h:0, saves_a:0, attacks_h:0, attacks_a:0 };
  const statRows = [
    { lbl:"Shots", h:stats.shots_h, a:stats.shots_a },
    { lbl:"Attacks", h:stats.attacks_h, a:stats.attacks_a },
    { lbl:"Saves", h:stats.saves_h, a:stats.saves_a },
  ];

  return (
    <div style={{
      position:"absolute", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center",
      padding:"18px", background:"radial-gradient(ellipse 90% 70% at 50% 40%,rgba(18,94,42,.42),rgba(3,7,5,.96) 72%)",
      backdropFilter:"blur(12px)", animation:"flashIn .3s ease", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:.26, background:"repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 1px,transparent 1px 16px),linear-gradient(180deg,transparent 0 44%,rgba(255,255,255,.08) 45%,transparent 46%)" }}/>
      <div style={{
        width:"min(680px,100%)", borderRadius:"18px", overflow:"hidden",
        border:"1px solid rgba(255,255,255,.12)",
        background:"linear-gradient(180deg,rgba(8,17,12,.94),rgba(3,8,5,.98))",
        boxShadow:"0 26px 80px rgba(0,0,0,.58)",
        animation:"htReveal .5s cubic-bezier(.34,1.56,.64,1)",
      }}>
        <div style={{ padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(255,255,255,.08)", background:"rgba(255,255,255,.035)" }}>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".26em", color:"var(--green)" }}>HALF TIME</div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".18em", color:"var(--tx3)" }}>45 MINUTES</div>
        </div>

        <div style={{ padding:"20px 18px 16px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"14px", alignItems:"center", marginBottom:"16px" }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:"var(--tx3)", marginBottom:"3px", letterSpacing:".16em" }}>HOME</div>
              <div style={{ fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"17px", color:"var(--green)", lineHeight:1 }}>{S.clubName || "ZAP"}</div>
            </div>
            <div style={{
              minWidth:"150px", padding:"10px 18px", textAlign:"center", borderRadius:"12px",
              background:"rgba(255,255,255,.055)", border:`1px solid ${rc}55`, boxShadow:`0 0 28px ${rc}22`,
            }}>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"58px", letterSpacing:"8px", color:rc, lineHeight:.9 }}>{score.h}–{score.a}</div>
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:"var(--tx3)", marginBottom:"3px", letterSpacing:".16em" }}>AWAY</div>
              <div style={{ fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"17px", color:"var(--tx2)", lineHeight:1 }}>{opponentName}</div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(220px,.78fr)", gap:"12px", alignItems:"stretch" }}>
            <div style={{ borderRadius:"14px", padding:"14px", background:"linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.025))", border:"1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".2em", color:"var(--tx3)", marginBottom:"12px" }}>FIRST HALF NUMBERS</div>
              {statRows.map(row => {
            const total = Math.max(row.h + row.a, 1);
            const pctH  = row.h / total * 100;
            return (
              <div key={row.lbl} style={{ marginBottom:"8px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                  <span style={{ fontFamily:"var(--f-disp)", fontSize:"13px", color:"var(--green)", minWidth:"18px" }}>{row.h}</span>
                  <span style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", color:"var(--tx3)", letterSpacing:".1em" }}>{row.lbl.toUpperCase()}</span>
                  <span style={{ fontFamily:"var(--f-disp)", fontSize:"13px", color:"var(--tx2)", minWidth:"18px", textAlign:"right" }}>{row.a}</span>
                </div>
                <div style={{ height:"3px", background:"rgba(255,255,255,.07)", borderRadius:"999px", overflow:"hidden", display:"flex" }}>
                  <div style={{ height:"100%", width:pctH+"%", background:"var(--green)", borderRadius:"999px 0 0 999px", transition:"width .8s ease" }}/>
                  <div style={{ height:"100%", width:(100-pctH)+"%", background:"rgba(248,113,113,.5)", borderRadius:"0 999px 999px 0" }}/>
                </div>
              </div>
            );
          })}
            </div>

            <div style={{ borderRadius:"14px", padding:"14px", background:`linear-gradient(135deg,${rc}1f,rgba(255,255,255,.025))`, border:`1px solid ${rc}33`, display:"flex", flexDirection:"column", justifyContent:"center", gap:"10px" }}>
              {/* Scouting intel (Fix 7) */}
              {topOpponentIntent && (
                <div style={{ borderRadius:"9px", padding:"9px 11px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(250,204,21,.22)" }}>
                  <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".18em", color:"#facc15", marginBottom:"5px" }}>SCOUT REPORT</div>
                  <div style={{ fontFamily:"var(--f-body)", fontSize:"12px", color:"rgba(255,255,255,.82)", lineHeight:1.4 }}>
                    {opponentName} used <strong style={{color:"#facc15"}}>{topOpponentIntent.id.replace(/_/g," ").toUpperCase()}</strong> {topOpponentIntent.count}× this half. Read against it in the second.
                  </div>
                </div>
              )}
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".18em", color:"var(--tx3)", marginBottom:"4px" }}>DRESSING ROOM</div>
              <div style={{ fontFamily:"var(--f-body)", fontStyle:"italic", fontSize:"14px", lineHeight:1.5, color:"rgba(255,255,255,.82)" }}>{pick(HT_TALK[talkKey])}</div>
            </div>
          </div>

          <button onClick={onContinue} style={{ width:"100%", padding:"14px", borderRadius:"12px", background:"var(--green)", color:"var(--bg)", fontFamily:"var(--f-disp)", fontSize:"18px", letterSpacing:"2.5px", marginTop:"14px", boxShadow:"0 0 28px rgba(24,193,88,.25)" }}>SECOND HALF ▶</button>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:"7.5px", color:"var(--tx3)", textAlign:"center", marginTop:"8px" }}>{ct > 0 ? `Auto-continues in ${ct}s` : "Starting..."}</div>
        </div>
      </div>
    </div>
  );
}

// ─── DramaticLeaderboard ─────────────────────────────────────────────────────

export function DramaticLeaderboard({ S, LB, prevRank, newRank }) {
  const [animDone, setAnimDone] = useState(false);
  const list    = LB ? ranked(S, LB) : [];
  const meIdx   = list.findIndex(p => !p.cpu);
  const window_ = list.slice(Math.max(0, meIdx - 2), meIdx + 3);
  const av      = ["#1d4ed8","#b91c1c","#166534","#7c3aed","#0e7490"];
  const moved   = newRank !== prevRank;
  const improved= newRank < prevRank;

  useEffect(() => { const t = setTimeout(() => setAnimDone(true), 900); return () => clearTimeout(t); }, []);

  if (!window_.length) return null;

  return (
    <div style={{ background:"linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.025))", border:"1px solid rgba(255,255,255,.09)", borderRadius:"12px", padding:"12px", marginBottom:"10px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
        <div style={{ fontFamily:"var(--f-mono)", fontSize:"9px", letterSpacing:".18em", color:"var(--tx2)" }}>LEAGUE STANDINGS</div>
        {moved && <div style={{ fontFamily:"var(--f-mono)", fontSize:"9px", color:improved?"#4ade80":"#f87171", display:"flex", alignItems:"center", gap:"4px", fontWeight:800 }}><span>{improved?"▲":"▼"}</span><span>{Math.abs(newRank-prevRank)} place{Math.abs(newRank-prevRank)>1?"s":""}</span></div>}
      </div>
      {window_.map(p => {
        const isMe = !p.cpu;
        const init = p.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
        const bg   = isMe ? "#14a34a" : av[p.id % 5];
        const rowH = 40;
        const fromRow = prevRank - newRank;
        const slideStyle = isMe && moved && !animDone ? { "--rank-from":`${fromRow*rowH}px`, animation:"rankSlide .7s cubic-bezier(.34,1.56,.64,1) forwards" } : {};

        return (
          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 10px", borderRadius:"10px", minHeight:"48px", background:isMe?(animDone?"rgba(24,193,88,.14)":"rgba(24,193,88,.08)"):"rgba(255,255,255,.025)", border:`1px solid ${isMe?(animDone?"rgba(24,193,88,.42)":"rgba(24,193,88,.2)"):"rgba(255,255,255,.04)"}`, marginBottom:"5px", transition:animDone?"all .3s ease":"none", boxShadow:isMe&&animDone?"0 0 0 1px rgba(24,193,88,.2),0 4px 20px rgba(24,193,88,.15)":"none", animation:isMe&&animDone&&moved?"rankPop .5s ease":undefined, ...slideStyle }}>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:"13px", fontWeight:800, color:p.rank<=3?"#d4a017":isMe?"rgba(24,193,88,.9)":"var(--tx3)", width:"28px", textAlign:"right", flexShrink:0 }}>#{p.rank}</div>
            <div style={{ width:"30px", height:"30px", borderRadius:"8px", background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:800, color:"white", flexShrink:0, fontFamily:"var(--f-cond)" }}>{isMe?"⚡":init}</div>
            <div style={{ fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"15px", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:isMe?"var(--green)":"#d9eee0", ...(isMe&&animDone&&moved?{background:"linear-gradient(90deg,var(--green),#a3e635,var(--green))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundSize:"200% auto",animation:"rankShimmer 2s linear infinite"}:{}) }}>{isMe ? S.clubName || "YOU" : p.name}</div>
            <div style={{ fontFamily:"var(--f-disp)", fontSize:"20px", color:isMe?"var(--green)":"var(--tx)", whiteSpace:"nowrap" }}>{p.pts}<span style={{ fontFamily:"var(--f-mono)", fontSize:"8px", color:"var(--tx3)", marginLeft:"2px" }}>REP</span></div>
            {isMe && moved && animDone && <div style={{ fontFamily:"var(--f-disp)", fontSize:"16px", color:improved?"#4ade80":"#f87171", flexShrink:0 }}>{improved?"▲":"▼"}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── FullTime ─────────────────────────────────────────────────────────────────

export function FullTime({ data, S, LB, opponentName = "RIVALS FC", onAgain, onHome }) {
  const { h, a, win, draw, delta, bd, prevRank, newRank, prevTier, newTier, matchStats } = data;
  const rl  = win ? "VICTORY" : draw ? "DRAW" : "DEFEAT";
  const rc  = win ? "#4ade80" : draw ? "#d4a017" : "#f87171";
  const sign= delta >= 0 ? "+" : "";
  const sr  = bd.find(b => b.l?.includes("STREAK"));
  const rankMove = prevRank - newRank;
  const decisionLine = win
    ? "Your decisions created enough pressure to finish the match."
    : draw
      ? "The match stayed balanced. The next tactical edge decides this fixture."
      : "The key moments went against you. Strengthen the weak phase before the rematch.";
  const stats = matchStats || { shots_h:0, shots_a:0, saves_h:0, saves_a:0, attacks_h:0, attacks_a:0 };
  const matchRows = [
    { lbl:"Shots", h:stats.shots_h, a:stats.shots_a },
    { lbl:"Attacks", h:stats.attacks_h, a:stats.attacks_a },
    { lbl:"Saves", h:stats.saves_h, a:stats.saves_a },
  ];

  // Coin display — re-derive from breakdown data
  const coinEarned = win
    ? 18 + h * 3 + (a === 0 ? 5 : 0)
    : draw ? 8 : 4;

  return (
    <div style={{
      position:"absolute", inset:0, zIndex:90, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start",
      padding:"12px",
      background:win
        ? "linear-gradient(rgba(2,6,4,.68),rgba(2,6,4,.72)),radial-gradient(ellipse 90% 70% at 50% 20%,rgba(22,101,52,.48),rgba(3,7,5,.99) 72%)"
        : draw
          ? "linear-gradient(rgba(2,6,4,.68),rgba(2,6,4,.72)),radial-gradient(ellipse 90% 70% at 50% 20%,rgba(120,86,16,.42),rgba(3,7,5,.99) 72%)"
          : "linear-gradient(rgba(2,6,4,.68),rgba(2,6,4,.72)),radial-gradient(ellipse 90% 70% at 50% 20%,rgba(127,29,29,.48),rgba(3,7,5,.99) 72%)",
      backdropFilter:"blur(10px)",
      animation:"flashIn .4s ease", boxSizing:"border-box",
    }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", opacity:.22, background:"repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 1px,transparent 1px 18px),linear-gradient(180deg,transparent 0 49%,rgba(255,255,255,.08) 50%,transparent 51%)" }}/>
      
      {/* Scrollable content container */}
      <div style={{ width:"min(780px,100%)", maxHeight:"calc(100vh - 24px)", display:"flex", flexDirection:"column", overflow:"hidden", borderRadius:"18px", border:"1px solid rgba(255,255,255,.16)", background:"rgba(4,10,7,.96)", boxShadow:"0 30px 90px rgba(0,0,0,.62)" }}>
        
        {/* Hero banner - STICKY at top */}
        <div style={{ flexShrink:0, borderBottom:"1px solid rgba(255,255,255,.12)", overflow:"hidden" }}>
          <div style={{ padding:"9px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(255,255,255,.08)", background:"rgba(255,255,255,.04)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:rc, boxShadow:`0 0 14px ${rc}` }}/>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".26em", color:"var(--tx3)" }}>FINAL WHISTLE</div>
            </div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".18em", color:rc }}>MATCH COMPLETE</div>
          </div>
          <div style={{ padding:"14px 16px", background:win?"linear-gradient(180deg,rgba(22,101,52,.34),transparent 100%)":draw?"linear-gradient(180deg,rgba(92,71,0,.28),transparent 100%)":"linear-gradient(180deg,rgba(127,29,29,.34),transparent 100%)" }}>
            <div style={{ fontFamily:"var(--f-disp)", fontSize:"clamp(44px,7vw,72px)", letterSpacing:"6px", color:rc, lineHeight:.85, textShadow:`0 0 44px ${rc}55` }}>{rl}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"10px", alignItems:"center", marginTop:"10px" }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"14px", color:"var(--green)", lineHeight:1 }}>{S.clubName || "ZAP"}</div>
                <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".16em", color:"var(--tx3)", marginTop:"2px" }}>HOME</div>
              </div>
              <div style={{ borderRadius:"12px", border:`1px solid ${rc}75`, background:"linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,.04))", boxShadow:`0 0 40px ${rc}30`, padding:"8px 14px 6px", minWidth:"140px" }}>
                <div style={{ fontFamily:"var(--f-disp)", fontSize:"56px", letterSpacing:"5px", lineHeight:.75, color:"var(--tx)" }}>{h}–{a}</div>
              </div>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"14px", color:"var(--tx2)", lineHeight:1 }}>{opponentName}</div>
                <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".16em", color:"var(--tx3)", marginTop:"2px" }}>AWAY</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div style={{ flex:1, overflowY:"auto", scrollbarWidth:"none", padding:"12px", boxSizing:"border-box" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {sr && <div style={{ background:"rgba(212,160,23,.09)", border:"1px solid rgba(212,160,23,.25)", borderRadius:"10px", padding:"7px 14px", fontFamily:"var(--f-disp)", fontSize:"15px", letterSpacing:"2px", color:"#d4a017", animation:"streakPop .5s ease", marginBottom:"12px", textAlign:"center" }}>{sr.l}</div>}

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"10px" }}>
              {matchRows.map(row => (
                <div key={row.lbl} style={{ borderRadius:"12px", background:"rgba(255,255,255,.035)", border:"1px solid rgba(255,255,255,.07)", padding:"9px 10px", textAlign:"center" }}>
                  <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:"7px" }}>
                    <span style={{ fontFamily:"var(--f-disp)", fontSize:"22px", color:"var(--green)", lineHeight:1 }}>{row.h}</span>
                    <span style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:"var(--tx3)" }}>-</span>
                    <span style={{ fontFamily:"var(--f-disp)", fontSize:"22px", color:"rgba(248,113,113,.82)", lineHeight:1 }}>{row.a}</span>
                  </div>
                  <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".16em", color:"var(--tx3)", marginTop:"4px" }}>{row.lbl.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Rep + coin delta */}
            <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"14px", padding:"12px", marginBottom:"10px", textAlign:"center" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", justifyContent:"center", marginBottom:"6px" }}>
                <div style={{ flex:1, padding:"8px", borderRadius:"8px", background:"rgba(24,193,88,.06)", border:"1px solid rgba(24,193,88,.1)" }}>
                  <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", letterSpacing:".16em", color:"rgba(24,193,88,.6)", marginBottom:"2px" }}>REPUTATION</div>
                  <div style={{ fontFamily:"var(--f-disp)", fontSize:"28px", letterSpacing:"-1px", color:delta>=0?"#4ade80":"#f87171", lineHeight:1 }}>{sign}{delta}</div>
                </div>
                <div style={{ flex:1, padding:"8px", borderRadius:"8px", background:"rgba(212,160,23,.06)", border:"1px solid rgba(212,160,23,.1)" }}>
                  <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", letterSpacing:".16em", color:"rgba(212,160,23,.6)", marginBottom:"2px" }}>COINS EARNED</div>
                  <div style={{ fontFamily:"var(--f-disp)", fontSize:"28px", letterSpacing:"-1px", color:"var(--coin)", lineHeight:1 }}>+{coinEarned}</div>
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:"4px", marginTop:"4px" }}>
                {bd.filter(x => !x.l?.includes("STREAK")).map((x,i)=><span key={i} style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:x.c }}>{x.v} {x.l}</span>)}
              </div>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:"var(--tx3)", marginTop:"5px" }}>Total: {S.rep}r · {S.coins||0}🪙</div>
            </div>

            {/* Rank change */}
            <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"14px", padding:"12px", marginBottom:"10px", display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ textAlign:"center", flex:1 }}>
                <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:"var(--tx3)", marginBottom:"3px" }}>BEFORE</div>
                <div style={{ fontFamily:"var(--f-disp)", fontSize:"26px", color:"#3a3a3a" }}>#{prevRank}</div>
                <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:prevTier.col }}>{prevTier.icon} {prevTier.short}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"var(--f-disp)", fontSize:"20px", color:newRank<prevRank?"#4ade80":newRank>prevRank?"#f87171":"#d4a017" }}>{newRank<prevRank?"▲":newRank>prevRank?"▼":"—"}</div>
              </div>
              <div style={{ textAlign:"center", flex:1 }}>
                <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:"var(--tx3)", marginBottom:"3px" }}>NOW</div>
                <div style={{ fontFamily:"var(--f-disp)", fontSize:"26px", color:"var(--tx)" }}>#{newRank}</div>
                <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:newTier.col }}>{newTier.icon} {newTier.short}</div>
              </div>
            </div>
            <div style={{ marginTop:"-4px", marginBottom:"10px", textAlign:"center", fontFamily:"var(--f-mono)", fontSize:"7.5px", letterSpacing:".12em", color:rankMove>0?"#4ade80":rankMove<0?"#f87171":"var(--tx3)" }}>
              {rankMove > 0 ? `CLIMBED ${rankMove} PLACE${rankMove>1?"S":""}` : rankMove < 0 ? `DROPPED ${Math.abs(rankMove)} PLACE${Math.abs(rankMove)>1?"S":""}` : "RANK HELD"}
            </div>

            {LB && <DramaticLeaderboard S={S} LB={LB} prevRank={prevRank} newRank={newRank}/>}
          </div>
        </div>

        {/* Fixed footer with decision line + buttons */}
        <div style={{ flexShrink:0, borderTop:"1px solid rgba(255,255,255,.12)", padding:"12px", background:"rgba(0,0,0,.2)", display:"flex", flexDirection:"column", gap:"8px" }}>
          <div style={{ fontFamily:"var(--f-body)", fontSize:"12px", lineHeight:1.4, color:"rgba(238,245,240,.68)", marginBottom:"4px" }}>{decisionLine}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1.25fr .75fr", gap:"10px" }}>
            <button onClick={onAgain} style={{ padding:"14px", borderRadius:"11px", background:"linear-gradient(135deg,var(--green),#a3e635)", color:"var(--bg)", fontFamily:"var(--f-disp)", fontSize:"16px", letterSpacing:"2px", boxShadow:"0 0 32px rgba(24,193,88,.32)", border:"none", cursor:"pointer" }}>PLAY AGAIN</button>
            <button onClick={onHome}  style={{ padding:"14px", borderRadius:"11px", background:"rgba(255,255,255,.065)", border:"1px solid rgba(255,255,255,.13)", color:"var(--tx)", fontFamily:"var(--f-disp)", fontSize:"14px", letterSpacing:"1.5px", cursor:"pointer" }}>CLUBHOUSE</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TierChangeModal ──────────────────────────────────────────────────────────

export function TierChangeModal({ data, onClose }) {
  const promoted = data.dir === "up";
  const col      = promoted ? "#4ade80" : "#f87171";
  return (
    <div style={{ position:"absolute", inset:0, zIndex:120, display:"flex", alignItems:"center", justifyContent:"center", padding:"18px", background:"rgba(0,0,0,.5)", backdropFilter:"blur(8px)", animation:"flashIn .2s ease" }}>
      <div style={{ width:"100%", maxWidth:"300px", borderRadius:"18px", padding:"22px 18px 16px", background:promoted?"linear-gradient(160deg,rgba(10,38,22,.98),rgba(8,18,12,.98))":"linear-gradient(160deg,rgba(46,16,16,.98),rgba(18,8,8,.98))", border:`1px solid ${col}40`, textAlign:"center" }}>
        <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".28em", color:col, marginBottom:"6px" }}>{promoted?"ENTERING NEW SECTION":"SECTION CHANGED"}</div>
        <div style={{ fontFamily:"var(--f-disp)", fontSize:"28px", letterSpacing:"2px", color:"var(--tx)", marginBottom:"5px" }}>{data.newTier.name}</div>
        <div style={{ fontFamily:"var(--f-body)", fontSize:"12px", lineHeight:1.35, color:"rgba(238,245,240,.62)", marginBottom:"12px" }}>
          {promoted ? "Your table position moved you into a stronger leaderboard band." : "Your table position moved you into a lower leaderboard band."}
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", marginBottom:"12px" }}>
          <div style={{ textAlign:"center" }}><div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:"var(--tx3)", marginBottom:"2px" }}>FROM</div><div style={{ fontFamily:"var(--f-disp)", fontSize:"16px", color:data.prevTier.col }}>{data.prevTier.icon}</div></div>
          <div style={{ fontFamily:"var(--f-disp)", fontSize:"22px", color:col }}>{promoted?"▲":"▼"}</div>
          <div style={{ textAlign:"center" }}><div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:"var(--tx3)", marginBottom:"2px" }}>TO</div><div style={{ fontFamily:"var(--f-disp)", fontSize:"16px", color:data.newTier.col }}>{data.newTier.icon}</div></div>
        </div>
        <button onClick={onClose} style={{ width:"100%", padding:"11px", borderRadius:"10px", background:col, color:promoted?"#062611":"#260808", fontFamily:"var(--f-disp)", fontSize:"14px", letterSpacing:"1.5px" }}>VIEW NEW SECTION</button>
      </div>
    </div>
  );
}

// ─── RewardModal ──────────────────────────────────────────────────────────────

export function RewardModal({ cfg, onClaim, onSkip }) {
  const isGold = cfg.type === "gold";
  const pts    = getRewardParticles(isGold);
  return (
    <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.86)", backdropFilter:"blur(10px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:"14px", animation:"flashIn .2s ease" }}>
      <div style={{ width:"100%", maxWidth:"290px", background:isGold?"linear-gradient(160deg,#0e0d05,#1a1508)":"linear-gradient(160deg,#0d1510,#111d14)", border:`1px solid ${isGold?"rgba(212,160,23,.4)":"rgba(24,193,88,.3)"}`, borderRadius:"18px", padding:"22px 16px 16px", textAlign:"center", position:"relative", overflow:"hidden", animation:isGold?"rewardPop .5s cubic-bezier(.34,1.56,.64,1),borderGlow 2s ease-in-out .6s infinite":"rewardPop .5s cubic-bezier(.34,1.56,.64,1)" }}>
        {/* Particles */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
          {pts.map((p,i) => (
            <div key={i} style={{ position:"absolute", ...(p.tp==="c"?{width:"5px",height:"8px",borderRadius:"1px",left:p.l,top:"-12px"}:{width:"6px",height:"11px",borderRadius:"50% 50% 20% 20%",left:p.l,bottom:0}), background:p.bg, opacity:0, animation:`${p.tp==="c"?"confettiFall":"flameRise"} linear forwards`, animationDuration:p.d, animationDelay:p.dl, transform:`rotate(${p.r})` }}/>
          ))}
        </div>
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontSize:"28px", marginBottom:"10px", animation:"bounceIn .6s ease" }}>{cfg.icon}</div>
          <div style={{ fontFamily:"var(--f-disp)", fontSize:"26px", letterSpacing:"3px", color:"var(--tx)", lineHeight:1, marginBottom:"2px" }}>{cfg.title}</div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".2em", color:"var(--tx3)", marginBottom:"14px" }}>{cfg.sub}</div>
          <div style={{ background:isGold?"rgba(212,160,23,.05)":"rgba(24,193,88,.05)", border:`1px solid ${isGold?"rgba(212,160,23,.25)":"rgba(24,193,88,.2)"}`, borderRadius:"12px", padding:"12px", marginBottom:"10px" }}>
            <div style={{ fontFamily:"var(--f-disp)", fontSize:"44px", letterSpacing:"-2px", color:isGold?"var(--gold)":"var(--green)", lineHeight:1 }}>+{cfg.rep}</div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", color:"var(--tx3)", marginTop:"1px" }}>REPUTATION POINTS</div>
          </div>
          <button onClick={onClaim} style={{ width:"100%", padding:"13px", borderRadius:"10px", background:isGold?"var(--gold)":"var(--green)", color:isGold?"#0e0900":"var(--bg)", fontFamily:"var(--f-disp)", fontSize:"15px", letterSpacing:"2px", marginBottom:"6px" }}>CLAIM REWARD</button>
          <button onClick={onSkip}  style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".1em", color:"var(--tx3)", padding:"4px", width:"100%" }}>Skip for now</button>
        </div>
      </div>
    </div>
  );
}

// ─── DemotionModal ─────────────────────────────────────────────────────────────
// Shown when a player's rank drops from one league tier to a lower one.

export function DemotionModal({ fromTier, toTier, newRank, clubName, onClose }) {
  if (!fromTier || !toTier) return null;
  const col = toTier.col || "#f87171";

  return (
    <div style={{
      position:"absolute", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center",
      padding:"18px", background:"rgba(0,0,0,.82)", backdropFilter:"blur(14px)",
      animation:"flashIn .22s ease",
    }}>
      <div style={{
        width:"min(400px,100%)", borderRadius:"20px", overflow:"hidden",
        border:`1px solid ${col}44`,
        background:"linear-gradient(160deg,rgba(24,6,6,.98),rgba(8,4,4,.99))",
        boxShadow:`0 30px 90px rgba(0,0,0,.74),0 0 70px rgba(239,68,68,.12)`,
        animation:"htReveal .44s cubic-bezier(.34,1.56,.64,1)",
        textAlign:"center",
      }}>
        {/* Red top accent */}
        <div style={{ height:"3px", background:"linear-gradient(90deg,transparent,#f87171,transparent)" }}/>

        <div style={{ padding:"28px 24px 24px" }}>
          {/* Down arrow icon */}
          <div style={{
            width:"64px", height:"64px", borderRadius:"18px", margin:"0 auto 18px",
            background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.28)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"30px",
          }}>📉</div>

          <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".28em", color:"rgba(248,113,113,.7)", marginBottom:"8px" }}>
            RELEGATION
          </div>
          <div style={{ fontFamily:"var(--f-disp)", fontSize:"32px", letterSpacing:"2px", color:"#fff", lineHeight:.95, marginBottom:"6px" }}>
            DROPPED DOWN
          </div>
          <div style={{ fontFamily:"var(--f-body)", fontSize:"13px", color:"rgba(238,245,240,.58)", lineHeight:1.5, marginBottom:"22px" }}>
            {clubName || "Your club"} has fallen from{" "}
            <span style={{ color:fromTier.col, fontWeight:700 }}>{fromTier.name}</span>
            {" "}into{" "}
            <span style={{ color:col, fontWeight:700 }}>{toTier.name}</span>.
            {" "}Win matches to climb back up the ladder.
          </div>

          {/* From / To tier display */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"10px", alignItems:"center", marginBottom:"22px" }}>
            <div style={{ padding:"12px 8px", borderRadius:"12px", background:`${fromTier.col}14`, border:`1px solid ${fromTier.col}33` }}>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"22px" }}>{fromTier.icon}</div>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"14px", color:"var(--tx)", letterSpacing:".5px", marginTop:"4px" }}>{fromTier.name}</div>
            </div>
            <div style={{ fontFamily:"var(--f-disp)", fontSize:"22px", color:"#f87171" }}>↓</div>
            <div style={{ padding:"12px 8px", borderRadius:"12px", background:`${col}14`, border:`1px solid ${col}33` }}>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"22px" }}>{toTier.icon}</div>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"14px", color:"var(--tx)", letterSpacing:".5px", marginTop:"4px" }}>{toTier.name}</div>
            </div>
          </div>

          <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".16em", color:"rgba(255,255,255,.24)", marginBottom:"18px" }}>
            CURRENT RANK #{newRank}
          </div>

          <button
            onClick={onClose}
            style={{
              width:"100%", padding:"14px", borderRadius:"12px",
              background:"linear-gradient(135deg,#b91c1c,#7f1d1d)",
              color:"#fff", fontFamily:"var(--f-disp)", fontSize:"16px",
              letterSpacing:"2px", border:"none", cursor:"pointer",
              boxShadow:"0 10px 28px rgba(239,68,68,.28)",
            }}
          >FIGHT BACK</button>
        </div>
      </div>
    </div>
  );
}
