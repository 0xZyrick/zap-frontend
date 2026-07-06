// ─── matchModals.jsx ──────────────────────────────────────────────────────────
// Modal overlays that appear during / after a match.
// Each is self-contained; receives only the data it needs.

import { useState, useEffect, useRef } from "react";
import { ranked } from "../game/gameState.js";
import { pick } from "../game/gameLogic.js";
import { HT_TALK } from "../game/constants.js";

const COIN_ICON = "/assets/icons/coin.png";

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

export function FullTime({ data, S, opponentName = "RIVALS FC", onAgain, onHome, onExtraTime }) {
  const { h, a, win, draw } = data;
  const rl  = win ? "VICTORY" : draw ? "DRAW" : "DEFEAT";
  const rc  = win ? "#4ade80" : draw ? "#d4a017" : "#f87171";
  const decisionLine = win
    ? "Your decisions created enough pressure to finish the match."
    : draw
      ? "The match stayed balanced. The next tactical edge decides this fixture."
      : "The key moments went against you. Regroup from the clubhouse.";

  return (
    <div style={{
      position:"absolute", inset:0, zIndex:90, display:"flex", alignItems:"center", justifyContent:"center",
      padding:"16px",
      background:win
        ? "linear-gradient(rgba(2,6,4,.68),rgba(2,6,4,.72)),radial-gradient(ellipse 90% 70% at 50% 20%,rgba(22,101,52,.48),rgba(3,7,5,.99) 72%)"
        : draw
          ? "linear-gradient(rgba(2,6,4,.68),rgba(2,6,4,.72)),radial-gradient(ellipse 90% 70% at 50% 20%,rgba(120,86,16,.42),rgba(3,7,5,.99) 72%)"
          : "linear-gradient(rgba(2,6,4,.68),rgba(2,6,4,.72)),radial-gradient(ellipse 90% 70% at 50% 20%,rgba(127,29,29,.48),rgba(3,7,5,.99) 72%)",
      backdropFilter:"blur(10px)",
      animation:"flashIn .4s ease", boxSizing:"border-box",
    }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", opacity:.22, background:"repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 1px,transparent 1px 18px),linear-gradient(180deg,transparent 0 49%,rgba(255,255,255,.08) 50%,transparent 51%)" }}/>
      <div style={{ width:"min(620px,100%)", overflow:"hidden", borderRadius:"18px", border:"1px solid rgba(255,255,255,.16)", background:"rgba(4,10,7,.96)", boxShadow:"0 30px 90px rgba(0,0,0,.62)" }}>
        <div style={{ padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(255,255,255,.08)", background:"rgba(255,255,255,.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:rc, boxShadow:`0 0 14px ${rc}` }}/>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".26em", color:"var(--tx3)" }}>FINAL WHISTLE</div>
          </div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".18em", color:rc }}>MATCH COMPLETE</div>
        </div>
        <div style={{ padding:"22px 18px 18px", textAlign:"center", background:win?"linear-gradient(180deg,rgba(22,101,52,.3),transparent 100%)":draw?"linear-gradient(180deg,rgba(92,71,0,.24),transparent 100%)":"linear-gradient(180deg,rgba(127,29,29,.3),transparent 100%)" }}>
          <div style={{ fontFamily:"var(--f-disp)", fontSize:"clamp(54px,9vw,86px)", letterSpacing:"6px", color:rc, lineHeight:.82, textShadow:`0 0 44px ${rc}55` }}>{rl}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"10px", alignItems:"center", marginTop:"16px" }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"15px", color:"var(--green)", lineHeight:1 }}>{S.clubName || "ZAP"}</div>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".16em", color:"var(--tx3)", marginTop:"3px" }}>HOME</div>
            </div>
            <div style={{ borderRadius:"12px", border:`1px solid ${rc}75`, background:"linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,.04))", boxShadow:`0 0 40px ${rc}30`, padding:"9px 16px 7px", minWidth:"148px" }}>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"60px", letterSpacing:"5px", lineHeight:.75, color:"var(--tx)" }}>{h}–{a}</div>
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"15px", color:"var(--tx2)", lineHeight:1 }}>{opponentName}</div>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".16em", color:"var(--tx3)", marginTop:"3px" }}>AWAY</div>
            </div>
          </div>
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,.1)", padding:"14px", background:"rgba(0,0,0,.18)", display:"flex", flexDirection:"column", gap:"10px" }}>
          <div style={{ fontFamily:"var(--f-body)", fontSize:"13px", lineHeight:1.45, color:"rgba(238,245,240,.68)" }}>{decisionLine}</div>
          <div style={{ display:"grid", gridTemplateColumns:draw && onExtraTime ? "1fr 1fr .82fr" : "1.25fr .75fr", gap:"10px" }}>
            {draw && onExtraTime && (
              <button onClick={onExtraTime} style={{ padding:"14px", borderRadius:"11px", background:"linear-gradient(135deg,#facc15,#a3e635)", color:"var(--bg)", fontFamily:"var(--f-disp)", fontSize:"16px", letterSpacing:"2px", boxShadow:"0 0 32px rgba(250,204,21,.22)", border:"none", cursor:"pointer" }}>EXTRA TIME</button>
            )}
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
  const leagueName = data?.newTier?.name || "Master League";
  const badge = data?.newTier?.icon || "MASTERS";
  const leagueLogo = data?.newTier?.logo || null;
  return (
    <div style={{ position:"absolute", inset:0, zIndex:120, display:"flex", alignItems:"center", justifyContent:"center", padding:"clamp(18px,4vw,54px)", background:"rgba(0,0,0,.58)", backdropFilter:"blur(4px)", animation:"flashIn .2s ease" }}>
      <div style={{ width:"min(58vw, 760px)", minWidth:"min(340px, calc(100vw - 36px))", minHeight:"min(360px, 54vh)", borderRadius:"18px", position:"relative", overflow:"hidden", background:"linear-gradient(135deg,#078428 0%,#0c8d2d 52%,#05701f 100%)", boxShadow:"0 28px 82px rgba(0,0,0,.42)", display:"grid", gridTemplateRows:"1fr auto", padding:"clamp(28px,4vw,52px)" }}>
        <div style={{ position:"absolute", inset:0, opacity:.42, background:"linear-gradient(148deg,transparent 0 18%,rgba(255,255,255,.16) 18% 43%,transparent 43% 100%),linear-gradient(62deg,transparent 0 60%,rgba(255,255,255,.12) 60% 76%,transparent 76% 100%)" }}/>
        <div style={{ position:"relative", zIndex:1, display:"grid", gridTemplateColumns:"minmax(110px,170px) minmax(0,1fr)", alignItems:"center", gap:"clamp(22px,4vw,50px)" }}>
          <div style={{ justifySelf:"center", width:"clamp(92px,11vw,150px)", aspectRatio:"1", borderRadius:"22px", display:"grid", placeItems:"center", textAlign:"center", padding:"14px", background:"radial-gradient(circle at 44% 24%,#fff6a8,#101407 45%,#040704 100%)", border:"2px solid rgba(255,231,96,.72)", boxShadow:"0 18px 48px rgba(0,0,0,.36),0 0 32px rgba(250,204,21,.24)", color:"#f8e36b", fontFamily:"var(--f-disp)", fontSize:"clamp(18px,2.3vw,30px)", lineHeight:.85 }}>
            {leagueLogo ? (
              <img src={leagueLogo} alt="" draggable={false} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.textContent = badge; }} style={{ width:"78%", height:"78%", objectFit:"contain", filter:"drop-shadow(0 10px 16px rgba(0,0,0,.32))" }} />
            ) : badge}
          </div>
          <div>
            <div style={{ fontFamily:"var(--f-body)", fontSize:"clamp(20px,2.2vw,30px)", fontWeight:800, color:"#fff", lineHeight:1.05, marginBottom:"12px" }}>
              {promoted ? `Promoted to ${leagueName}` : `Moved to ${leagueName}`}
            </div>
            <div style={{ fontFamily:"var(--f-body)", fontSize:"clamp(16px,1.7vw,22px)", fontWeight:700, color:"rgba(255,255,255,.86)", lineHeight:1.28 }}>
              {promoted ? "Congratulations! Keep up the good work!" : "Keep pushing. The climb back starts now."}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ position:"relative", zIndex:1, width:"100%", minHeight:"clamp(50px,6vh,66px)", borderRadius:"14px", background:"#fff", color:"#031007", fontFamily:"var(--f-body)", fontSize:"clamp(17px,1.8vw,24px)", fontWeight:900, border:0 }}>
          OK
        </button>
      </div>
    </div>
  );
}

// ─── RewardModal ──────────────────────────────────────────────────────────────

export function RewardModal({ cfg, onClaim, onSkip }) {
  const amountValue = Number(cfg?.coins || cfg?.rep || 0);
  const amount = amountValue.toLocaleString();
  const rank = cfg?.rank || cfg?.ranking || "4TH";
  const crest = cfg?.badgeImage || cfg?.crest || "/assets/crests/codmai.png";
  const title = cfg?.title || "REWARD UNLOCKED";
  const sub = cfg?.sub || "Claim your bonus";
  return (
    <div style={{ position:"absolute", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:"clamp(18px,4vw,54px)", background:"rgba(0,0,0,.58)", backdropFilter:"blur(5px)", animation:"flashIn .2s ease" }}>
      <div style={{ width:"min(44vw, 580px)", minWidth:"min(320px, calc(100vw - 36px))", height:"clamp(370px,48vh,460px)", maxHeight:"calc(100vh - 36px)", borderRadius:"18px", position:"relative", overflow:"hidden", background:"linear-gradient(180deg,#087d26 0%,#078526 58%,#128d34 58%,#0b7625 100%)", boxShadow:"0 24px 70px rgba(0,0,0,.42)", display:"grid", gridTemplateRows:"minmax(0,1fr) auto", padding:"clamp(24px,3vw,40px)", gap:"clamp(16px,2vh,24px)" }}>
        <div style={{ position:"absolute", inset:0, opacity:.3, background:"linear-gradient(90deg,transparent 0 15%,rgba(255,255,255,.15) 15% 35%,transparent 35% 68%,rgba(255,255,255,.13) 68% 100%),linear-gradient(180deg,transparent 0 78%,rgba(255,255,255,.08) 78% 100%)" }}/>
        <div style={{ position:"relative", zIndex:1, display:"grid", placeItems:"center", alignContent:"center", textAlign:"center" }}>
          <div style={{ width:"clamp(58px,6vw,86px)", height:"clamp(58px,6vw,86px)", borderRadius:"18px", display:"grid", placeItems:"center", background:"rgba(2,10,6,.36)", border:"1px solid rgba(255,255,255,.16)", boxShadow:"0 12px 24px rgba(0,0,0,.24),0 0 24px rgba(250,204,21,.16)", marginBottom:"clamp(14px,2vw,22px)" }}>
            <img src={crest} alt="" draggable={false} onError={(e) => { e.currentTarget.style.display = "none"; }} style={{ width:"72%", height:"72%", objectFit:"contain", filter:"drop-shadow(0 10px 18px rgba(0,0,0,.3))" }} />
          </div>
          <div style={{ fontFamily:"var(--f-body)", fontSize:"clamp(16px,1.55vw,22px)", fontWeight:900, color:"#fff", lineHeight:1, textTransform:"uppercase", marginBottom:"8px" }}>
            {title}
          </div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:"clamp(6px,.7vw,8px)", letterSpacing:".16em", color:"rgba(255,255,255,.68)", textTransform:"uppercase", marginBottom:"clamp(10px,1.5vw,18px)" }}>
            {sub}
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"10px", fontFamily:"var(--f-body)", fontSize:"clamp(34px,4.8vw,58px)", fontWeight:900, color:"#fff", lineHeight:.85, marginBottom:"clamp(10px,1.5vw,16px)" }}>
            <span>+{amount}</span>
            {cfg?.coins && <img src={COIN_ICON} alt="" draggable={false} style={{ width:"clamp(28px,3.6vw,44px)", height:"clamp(28px,3.6vw,44px)", objectFit:"contain", filter:"drop-shadow(0 8px 14px rgba(0,0,0,.3))" }} />}
          </div>
          {!cfg?.coins && (
            <div style={{ fontFamily:"var(--f-body)", fontSize:"clamp(14px,1.5vw,20px)", fontWeight:900, color:"#fff", lineHeight:1, textTransform:"uppercase" }}>
              RANKING {rank}
            </div>
          )}
        </div>
        <button onClick={onClaim || onSkip} style={{ position:"relative", zIndex:1, width:"100%", minHeight:"clamp(44px,5vh,56px)", borderRadius:"12px", background:"#fff", color:"#031007", fontFamily:"var(--f-body)", fontSize:"clamp(15px,1.5vw,20px)", fontWeight:900, border:0 }}>
          OK
        </button>
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
