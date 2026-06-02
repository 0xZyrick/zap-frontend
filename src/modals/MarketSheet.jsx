// ─── MarketSheet.jsx ──────────────────────────────────────────────────────────
// Slide-in sheet with two tabs: Formation and Market.

import { useState } from "react";
import {
  MCARDS, FORMATIONS, RARITY_COL, ROLE_SHORT, SQUAD_LIMIT, FORMATION_FELT,
} from "../game/constants.js";
import { getCard, getFormation, recalcTeamState } from "../game/gameState.js";
import { clamp } from "../game/gameLogic.js";
import PlayerArt from "../players/PlayerArt.jsx";
import { StadiumEnvironment } from "../pitch/pitch.jsx";

const ROLE_COLORS = { striker:"#f87171", midfielder:"#facc15", defender:"#60a5fa" };

export default function MarketSheet({ S, onUpdate, onClose, showToast, dojo, account }) {
  const [tab, setTab]       = useState("formation");
  const [filter, setFilter] = useState("all");
  const [compactMode, setCompactMode] = useState(false);

  const squad     = S.squad || [];
  const formation = getFormation(S.formationId);
  const updateTeam = (ns) => onUpdate(recalcTeamState(ns));

  // ── Formation selection ───────────────────────────────────────────────────
  const selectFormation = async (formationId) => {
    const next = recalcTeamState({ ...S, formationId });
    updateTeam(next);
    if (dojo && account) {
      try {
        const feltId = FORMATION_FELT[formationId];
        if (feltId) await dojo.doSetFormation(feltId);
      } catch (e) {
        showToast("Formation sync failed: " + (e?.message || "error"));
        updateTeam(S);
      }
    }
  };

  // ── Buy card ──────────────────────────────────────────────────────────────
  const buy = async (id) => {
    const c = getCard(id);
    if (!c) return;
    if ((S.coins || 0) < c.cost)     return showToast("Not enough ZAP Coins!");
    if (squad.includes(id))           return showToast("Already in your squad.");
    if (squad.length >= SQUAD_LIMIT)  return showToast("Squad is full (6 players).");

    const starters        = { ...(S.starters || {}) };
    const shouldAutoStart = !starters[c.role];
    if (shouldAutoStart) starters[c.role] = id;

    const next = recalcTeamState({ ...S, coins:(S.coins||0)-c.cost, squad:[...squad,id], starters });
    updateTeam(next);
    showToast(`${c.name} signed! −${c.cost} coins`);

    if (dojo && account) {
      try {
        await dojo.doBuyCard(id);
        if (shouldAutoStart) await dojo.doEquipStarter(id, c.role);
      } catch (e) {
        showToast("Purchase failed on-chain: " + (e?.message || "error"));
        updateTeam(S);
      }
    }
  };

  // ── Sell card ─────────────────────────────────────────────────────────────
  const sell = async (id) => {
    const c = getCard(id);
    if (!c) return;
    const ref     = Math.floor(c.cost / 2);
    const starters = { ...(S.starters || {}) };
    if (starters[c.role] === id) starters[c.role] = null;

    updateTeam({ ...S, coins:(S.coins||0)+ref, squad:squad.filter(pid=>pid!==id), starters });
    showToast(`+${ref} coins back.`);

    if (dojo && account) {
      try { await dojo.doSellCard(id); }
      catch (e) { showToast("Sell failed on-chain: " + (e?.message || "error")); updateTeam(S); }
    }
  };

  // ── Toggle starter ────────────────────────────────────────────────────────
  const toggleStarter = async (id) => {
    const c = getCard(id);
    if (!c || !squad.includes(id)) return;
    const starters  = { ...(S.starters || {}) };
    const wasStarted = starters[c.role] === id;
    starters[c.role] = wasStarted ? null : id;
    const next = recalcTeamState({ ...S, starters });
    updateTeam(next);
    if (dojo && account) {
      try {
        if (wasStarted) await dojo.doUnequipStarter(c.role);
        else            await dojo.doEquipStarter(id, c.role);
      } catch (e) {
        showToast("Starter sync failed: " + (e?.message || "error"));
        updateTeam(S);
      }
    }
  };

  const marketList = filter === "all" ? MCARDS : MCARDS.filter(c => c.role === filter);
  const starterCards = ["striker", "midfielder", "defender"].map(role => getCard(S.starters?.[role])).filter(Boolean);
  const roleNeed = ["striker", "midfielder", "defender"].find(role => !S.starters?.[role]);
  const teamTotal = 15 + (S.atkBoost || 0) + (S.midBoost || 0) + (S.defBoost || 0);
  const spendHint = roleNeed
    ? `Priority: sign a ${ROLE_SHORT[roleNeed]} starter`
    : "Priority: upgrade the weakest role";

  return (
    <div style={{ position:"absolute", inset:0, zIndex:80 }}>
      <StadiumEnvironment gs="ATTACK"/>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 80% at 28% 42%,rgba(24,193,88,.14),rgba(0,0,0,.72) 68%),rgba(0,0,0,.48)", backdropFilter:"blur(7px)" }}/>

      {/* Sheet */}
      <div style={{ position:"absolute", top:"12px", left:"12px", bottom:"12px", width:"min(640px,calc(100% - 24px))", borderRadius:"14px", border:"1px solid rgba(255,255,255,.12)", background:"linear-gradient(180deg,rgba(8,18,13,.96),rgba(3,8,5,.98))", boxShadow:"0 28px 90px rgba(0,0,0,.55)", display:"flex", flexDirection:"column", animation:"slideLeft .28s cubic-bezier(.22,1,.36,1)", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ padding:"14px 16px 0", borderBottom:"1px solid rgba(255,255,255,.08)", flexShrink:0, background:"radial-gradient(ellipse 80% 80% at 0% 0%,rgba(24,193,88,.16),transparent 64%)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
            <div>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".24em", color:"var(--green)", marginBottom:"3px" }}>CLUB OPERATIONS</div>
              <span style={{ fontFamily:"var(--f-disp)", fontSize:"28px", letterSpacing:"2px", lineHeight:1 }}>SQUAD HQ</span>
              <div style={{ fontFamily:"var(--f-body)", fontSize:"11px", lineHeight:1.35, color:"rgba(238,245,240,.55)", marginTop:"4px" }}>Build the XI that answers your match situations.</div>
            </div>
            <button onClick={onClose} style={{ width:"32px", height:"32px", borderRadius:"9px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"var(--tx2)", fontSize:"13px", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>

          {/* Currency bar */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"12px" }}>
            <div style={{ flex:1, display:"flex", alignItems:"center", gap:"7px", padding:"7px 11px", borderRadius:"10px", background:"rgba(212,160,23,.08)", border:"1px solid rgba(212,160,23,.2)" }}>
              <span style={{ fontSize:"14px" }}>🪙</span>
              <div>
                <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", letterSpacing:".14em", color:"rgba(212,160,23,.7)", marginBottom:"1px" }}>ZAP COINS</div>
                <div style={{ fontFamily:"var(--f-disp)", fontSize:"18px", letterSpacing:"1px", color:"var(--coin)", lineHeight:1 }}>{S.coins || 0}</div>
              </div>
              <div style={{ marginLeft:"auto", fontFamily:"var(--f-mono)", fontSize:"6px", color:"rgba(212,160,23,.55)", textAlign:"right", lineHeight:1.4 }}>Win +18<br/>Draw +8</div>
            </div>
            <div style={{ flex:1, display:"flex", alignItems:"center", gap:"7px", padding:"7px 11px", borderRadius:"10px", background:"rgba(24,193,88,.06)", border:"1px solid rgba(24,193,88,.15)" }}>
              <span style={{ fontSize:"14px" }}>⭐</span>
              <div>
                <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", letterSpacing:".14em", color:"rgba(24,193,88,.7)", marginBottom:"1px" }}>REP (RANK)</div>
                <div style={{ fontFamily:"var(--f-disp)", fontSize:"18px", letterSpacing:"1px", color:"var(--green)", lineHeight:1 }}>{S.rep || 0}</div>
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1.1fr .9fr", gap:"8px", marginBottom:"12px" }}>
            <div style={{ borderRadius:"10px", border:"1px solid rgba(255,255,255,.07)", background:"rgba(255,255,255,.03)", padding:"9px 10px" }}>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".16em", color:"var(--tx3)", marginBottom:"6px" }}>MATCH READINESS</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:"8px" }}>
                <span style={{ fontFamily:"var(--f-disp)", fontSize:"26px", color:"var(--tx)", lineHeight:1 }}>{teamTotal}</span>
                <span style={{ fontFamily:"var(--f-body)", fontSize:"11px", color:"rgba(238,245,240,.6)" }}>team power</span>
              </div>
              <div style={{ marginTop:"6px", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"5px" }}>
                {[{l:"ATK",v:(S.atkBoost||0)+5,c:"#f87171"},{l:"MID",v:(S.midBoost||0)+5,c:"#facc15"},{l:"DEF",v:(S.defBoost||0)+5,c:"#60a5fa"}].map(x => (
                  <div key={x.l} style={{ borderRadius:"8px", background:`${x.c}10`, border:`1px solid ${x.c}24`, padding:"5px 6px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", color:x.c }}>{x.l}</span>
                    <span style={{ fontFamily:"var(--f-disp)", fontSize:"16px", color:"var(--tx)", lineHeight:1 }}>{x.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderRadius:"10px", border:"1px solid rgba(212,160,23,.18)", background:"rgba(212,160,23,.055)", padding:"9px 10px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".16em", color:"rgba(212,160,23,.72)", marginBottom:"5px" }}>TRANSFER PLAN</div>
              <div style={{ fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"14px", color:"var(--tx)", lineHeight:1.1 }}>{spendHint}</div>
              <div style={{ fontFamily:"var(--f-body)", fontSize:"10.5px", color:"rgba(238,245,240,.48)", marginTop:"4px" }}>{starterCards.length}/3 starters ready</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex" }}>
            {[{id:"formation",lbl:"LINEUP PLAN"},{id:"market",lbl:"TRANSFER MARKET"}].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"11px 8px", fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"13px", letterSpacing:".08em", color:tab===t.id?"var(--green)":"var(--tx3)", borderBottom:`2px solid ${tab===t.id?"var(--green)":"transparent"}`, background:tab===t.id?"linear-gradient(180deg,rgba(24,193,88,.1),transparent)":"none", transition:"all .15s" }}>{t.lbl}</button>
            ))}
          </div>
        </div>

        {/* ── Formation tab ── */}
        {tab === "formation" && (
          <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column", animation:"tabSlide .18s ease" }}>
            <div style={{ padding:"12px 14px 0", flexShrink:0 }}>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".16em", color:"var(--tx3)", marginBottom:"7px" }}>SELECT FORMATION</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"5px", marginBottom:"12px" }}>
                {FORMATIONS.map(f => {
                  const active = f.id === S.formationId;
                  return (
                    <button key={f.id} onClick={() => selectFormation(f.id)} style={{ padding:"7px 4px", borderRadius:"10px", border:`1px solid ${active?"rgba(24,193,88,.4)":"rgba(255,255,255,.06)"}`, background:active?"rgba(24,193,88,.12)":"rgba(255,255,255,.025)", textAlign:"center" }}>
                      <div style={{ fontFamily:"var(--f-disp)", fontSize:"14px", letterSpacing:"1px", color:active?"var(--green)":"var(--tx)" }}>{f.shape}</div>
                      <div style={{ fontFamily:"var(--f-mono)", fontSize:"5.5px", color:"var(--tx3)", marginTop:"2px", lineHeight:1.4 }}>
                        <span style={{ color:"#f87171" }}>A{f.mods.atk>=0?"+":""}{f.mods.atk}</span>{" "}
                        <span style={{ color:"#facc15" }}>M{f.mods.mid>=0?"+":""}{f.mods.mid}</span>{" "}
                        <span style={{ color:"#60a5fa" }}>D{f.mods.def>=0?"+":""}{f.mods.def}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:"9px", padding:"9px 10px", marginBottom:"12px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px", marginBottom:"4px" }}>
                  <span style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:"var(--green)", letterSpacing:".14em" }}>ACTIVE IDENTITY</span>
                  <span style={{ fontFamily:"var(--f-disp)", fontSize:"15px", color:"var(--tx)", lineHeight:1 }}>{formation.name}</span>
                </div>
                <div style={{ fontFamily:"var(--f-body)", fontSize:"10.5px", color:"rgba(238,245,240,.55)", lineHeight:1.35 }}>{formation.desc}</div>
              </div>
            </div>

            {/* Mini pitch */}
            <div style={{ margin:"0 14px", borderRadius:"14px", overflow:"hidden", height:"160px", flexShrink:0, position:"relative", border:"1px solid rgba(255,255,255,.07)", background:"repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 12%,transparent 12% 24%),linear-gradient(180deg,#104a20 0%,#1a7a3d 50%,#104a20 100%)" }}>
              <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.3 }} viewBox="0 0 100 60" preserveAspectRatio="none">
                <line x1="50" y1="0" x2="50" y2="60" stroke="rgba(255,255,255,.2)" strokeWidth=".6"/>
                <circle cx="50" cy="30" r="9" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth=".5"/>
              </svg>
              {/* Stat bars */}
              <div style={{ position:"absolute", left:"8px", top:"8px", display:"flex", flexDirection:"column", gap:"3px", zIndex:2 }}>
                {[{lbl:"ATK",val:(S.atkBoost||0)+5,col:"#f87171"},{lbl:"MID",val:(S.midBoost||0)+5,col:"#facc15"},{lbl:"DEF",val:(S.defBoost||0)+5,col:"#60a5fa"}].map(d=>(
                  <div key={d.lbl} style={{ display:"flex", alignItems:"center", gap:"4px", background:"rgba(4,10,7,.7)", borderRadius:"999px", padding:"2px 6px" }}>
                    <span style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:d.col, fontWeight:600 }}>{d.lbl}</span>
                    <div style={{ width:"28px", height:"2.5px", background:"rgba(255,255,255,.08)", borderRadius:"999px", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:clamp(d.val*10,0,100)+"%", background:d.col, borderRadius:"999px" }}/>
                    </div>
                    <span style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:d.col }}>{d.val}</span>
                  </div>
                ))}
              </div>
              {/* Player slots */}
              {[{role:"striker",x:"50%",y:"14%",label:"ST"},{role:"midfielder",x:"50%",y:"50%",label:"MID"},{role:"defender",x:"50%",y:"82%",label:"DEF"}].map(({role,x,y,label})=>{
                const card = getCard(S.starters?.[role]);
                return (
                  <button key={role} onClick={()=>card?toggleStarter(card.id):showToast(`Buy a ${role} to fill this slot.`)} style={{ position:"absolute", left:x, top:y, transform:"translate(-50%,-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px", zIndex:2 }}>
                    {card?(
                      <div style={{ width:"34px", height:"34px", borderRadius:"10px", background:`radial-gradient(circle,${RARITY_COL[card.rarity]}22,rgba(4,12,8,.95))`, border:`1px solid ${RARITY_COL[card.rarity]}55`, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
                        <div style={{ fontFamily:"var(--f-mono)", fontSize:"9px", fontWeight:700, color:RARITY_COL[card.rarity] }}>{card.number}</div>
                        <div style={{ fontFamily:"var(--f-mono)", fontSize:"5px", color:"var(--tx3)", marginTop:"1px" }}>+{card.boost}</div>
                      </div>
                    ):(
                      <div style={{ width:"32px", height:"32px", borderRadius:"10px", border:"1px dashed rgba(255,255,255,.15)", background:"rgba(255,255,255,.03)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", opacity:.5 }}>+</div>
                    )}
                    <div style={{ fontFamily:"var(--f-mono)", fontSize:"5.5px", color:card?"var(--tx2)":"var(--tx3)", background:"rgba(4,10,7,.75)", borderRadius:"999px", padding:"1px 5px" }}>{card?card.name.split(" ")[0]:label}</div>
                  </button>
                );
              })}
            </div>

            {/* Owned players */}
            <div style={{ flex:1, overflowY:"auto", padding:"10px 14px 14px", scrollbarWidth:"none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".16em", color:"var(--tx3)" }}>YOUR PLAYERS ({squad.length}/{SQUAD_LIMIT})</div>
                <button onClick={()=>setCompactMode(!compactMode)} style={{ padding:"4px 7px", borderRadius:"6px", border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.03)", fontFamily:"var(--f-mono)", fontSize:"6.5px", color:"var(--tx3)", whiteSpace:"nowrap" }}>{compactMode?"Full":"Compact"}</button>
              </div>
              {squad.length === 0 ? (
                <div style={{ textAlign:"center", padding:"20px 0", fontFamily:"var(--f-mono)", fontSize:"8px", color:"var(--tx3)" }}>No players yet.<br/>Buy from the Market tab.</div>
              ) : compactMode ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(65px, 1fr))", gap:"6px" }}>
                  {squad.map(id => {
                    const card    = getCard(id); if (!card) return null;
                    const started = S.starters?.[card.role] === card.id;
                    return (
                      <button
                        key={id}
                        onClick={()=>toggleStarter(card.id)}
                        style={{
                          display:"flex",
                          flexDirection:"column",
                          alignItems:"center",
                          gap:"4px",
                          padding:"7px",
                          borderRadius:"11px",
                          background:started?"rgba(24,193,88,.12)":"rgba(255,255,255,.08)",
                          border:`1px solid ${started?"rgba(24,193,88,.28)":"rgba(255,255,255,.12)"}`,
                          transition:"all .2s ease",
                          cursor:"pointer"
                        }}
                        onMouseEnter={(e)=>e.target.style.background=started?"rgba(24,193,88,.18)":"rgba(255,255,255,.14)"}
                        onMouseLeave={(e)=>e.target.style.background=started?"rgba(24,193,88,.12)":"rgba(255,255,255,.08)"}
                      >
                        <PlayerArt card={card} size={26}/>
                        <div style={{ fontFamily:"var(--f-cond)", fontWeight:700, fontSize:"7px", color:started?"var(--green)":"var(--tx)", textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"100%" }}>
                          {card.name.split(" ")[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
                  {squad.map(id => {
                    const card    = getCard(id); if (!card) return null;
                    const started = S.starters?.[card.role] === card.id;
                    return (
                      <div key={id} style={{ padding:"8px", borderRadius:"11px", background:started?"rgba(24,193,88,.07)":"rgba(255,255,255,.025)", border:`1px solid ${started?"rgba(24,193,88,.25)":"rgba(255,255,255,.05)"}` }}>
                        <div style={{ display:"flex", gap:"7px", alignItems:"center", marginBottom:"6px" }}>
                          <PlayerArt card={card} size={38}/>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontFamily:"var(--f-cond)", fontWeight:700, fontSize:"11px", color:"var(--tx)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{card.name}</div>
                            <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", color:RARITY_COL[card.rarity], marginTop:"2px" }}>{ROLE_SHORT[card.role]} +{card.boost}</div>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:"4px" }}>
                          <button onClick={()=>toggleStarter(card.id)} style={{ flex:1, padding:"4px", borderRadius:"7px", background:started?"rgba(255,255,255,.04)":"var(--green)", color:started?"var(--tx3)":"var(--bg)", fontFamily:"var(--f-cond)", fontWeight:700, fontSize:"9px" }}>{started?"Bench":"Start"}</button>
                          <button onClick={()=>sell(card.id)} style={{ padding:"4px 6px", borderRadius:"7px", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.14)", color:"var(--red)", fontFamily:"var(--f-mono)", fontSize:"8px" }}>−</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Market tab ── */}
        {tab === "market" && (
          <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column", animation:"tabSlide .18s ease" }}>
            {/* Filter pills & Toggle */}
            <div style={{ padding:"10px 14px 8px", display:"flex", gap:"5px", flexShrink:0, borderBottom:"1px solid rgba(255,255,255,.05)", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", gap:"5px" }}>
                {[{k:"all",lbl:"All"},{k:"striker",lbl:"ATK"},{k:"midfielder",lbl:"MID"},{k:"defender",lbl:"DEF"}].map(f=>(
                  <button key={f.k} onClick={()=>setFilter(f.k)} style={{ padding:"6px 10px", borderRadius:"8px", border:`1px solid ${filter===f.k?"rgba(24,193,88,.4)":"rgba(255,255,255,.07)"}`, background:filter===f.k?"rgba(24,193,88,.1)":"rgba(255,255,255,.02)", fontFamily:"var(--f-mono)", fontSize:"7px", color:filter===f.k?"var(--green)":"var(--tx3)", whiteSpace:"nowrap", flex:filter===f.k?1:"auto" }}>{f.lbl}</button>
                ))}
              </div>
              <button onClick={()=>setCompactMode(!compactMode)} style={{ padding:"5px 9px", borderRadius:"6px", border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.03)", fontFamily:"var(--f-mono)", fontSize:"7px", color:"var(--tx3)", whiteSpace:"nowrap", transition:"all .2s" }}>{compactMode?"Full":"Compact"}</button>
            </div>
            {/* Cards */}
            <div style={{ flex:1, overflowY:"auto", padding:compactMode?"10px 8px 14px":"8px 12px 14px", scrollbarWidth:"none" }}>
              {compactMode ? (
                // Compact grid view
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(65px, 1fr))", gap:"8px" }}>
                  {marketList.map(c => {
                    const owned   = squad.includes(c.id);
                    const canBuy  = !owned && (S.coins||0) >= c.cost && squad.length < SQUAD_LIMIT;
                    return (
                      <button
                        key={c.id}
                        onClick={()=>buy(c.id)}
                        disabled={!canBuy}
                        style={{
                          display:"flex",
                          flexDirection:"column",
                          alignItems:"center",
                          gap:"5px",
                          padding:"8px",
                          borderRadius:"12px",
                          background:"rgba(255,255,255,.08)",
                          border:"1px solid rgba(255,255,255,.12)",
                          cursor:canBuy?"pointer":"not-allowed",
                          opacity:canBuy?1:.5,
                          transition:"all .2s ease",
                          _hover:{
                            background:"rgba(255,255,255,.14)"
                          }
                        }}
                        onMouseEnter={(e)=>e.target.style.background="rgba(255,255,255,.14)"}
                        onMouseLeave={(e)=>e.target.style.background="rgba(255,255,255,.08)"}
                      >
                        <PlayerArt card={c} size={28}/>
                        <div style={{ fontFamily:"var(--f-cond)", fontWeight:700, fontSize:"8px", color:"var(--tx)", textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"100%" }}>
                          {c.name.split(" ")[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Full card view
                <div>
                  {marketList.map(c => {
                    const owned   = squad.includes(c.id);
                    const canBuy  = !owned && (S.coins||0) >= c.cost && squad.length < SQUAD_LIMIT;
                    const started = S.starters?.[c.role] === c.id;
                    const rarityBg= {common:"rgba(154,181,160,.06)",rare:"rgba(96,165,250,.06)",elite:"rgba(212,160,23,.07)"}[c.rarity];
                    const roleStat = c.role === "striker" ? "attack" : c.role === "midfielder" ? "midfield control" : "defensive cover";
                    const buyState = owned ? "Owned" : squad.length >= SQUAD_LIMIT ? "Squad full" : (S.coins||0) < c.cost ? "Need coins" : "Available";
                    return (
                      <div key={c.id} style={{ display:"grid", gridTemplateColumns:"48px minmax(0,1fr) auto", alignItems:"center", gap:"10px", padding:"11px", marginBottom:"7px", background:owned?"rgba(24,193,88,.06)":rarityBg||"rgba(255,255,255,.03)", border:`1px solid ${owned?"rgba(24,193,88,.24)":RARITY_COL[c.rarity]+"33"}`, borderRadius:"12px", boxShadow:owned?"0 0 24px rgba(24,193,88,.05)":"none" }}>
                        <PlayerArt card={c} size={48}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"baseline", gap:"7px", marginBottom:"2px", minWidth:0 }}>
                            <div style={{ fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"13px", color:"var(--tx)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div>
                            <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:"var(--tx3)", flexShrink:0 }}>{buyState}</div>
                          </div>
                          <div style={{ display:"flex", gap:"5px", alignItems:"center", flexWrap:"wrap" }}>
                            <span style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:ROLE_COLORS[c.role], padding:"1px 5px", borderRadius:"999px", background:ROLE_COLORS[c.role]+"16" }}>{ROLE_SHORT[c.role]} +{c.boost}</span>
                            <span style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:RARITY_COL[c.rarity] }}>{c.rarity}</span>
                            {started && <span style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:"var(--green)", padding:"1px 5px", borderRadius:"999px", background:"rgba(24,193,88,.12)" }}>STARTING</span>}
                          </div>
                          <div style={{ fontFamily:"var(--f-body)", fontSize:"9.5px", color:"rgba(238,245,240,.45)", lineHeight:1.25, marginTop:"4px" }}>Adds +{c.boost} {roleStat} for tactical decisions.</div>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px", flexShrink:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"3px" }}>
                            <span style={{ fontSize:"10px" }}>🪙</span>
                            <span style={{ fontFamily:"var(--f-disp)", fontSize:"14px", color:"var(--coin)", letterSpacing:".5px" }}>{c.cost}</span>
                          </div>
                          {owned ? (
                            <div style={{ display:"flex", gap:"3px" }}>
                              <button onClick={()=>toggleStarter(c.id)} style={{ padding:"4px 7px", borderRadius:"7px", fontFamily:"var(--f-cond)", fontWeight:700, fontSize:"9px", background:started?"rgba(255,255,255,.05)":"rgba(24,193,88,.14)", color:started?"var(--tx3)":"var(--green)" }}>{started?"Bench":"Start"}</button>
                              <button onClick={()=>sell(c.id)} style={{ padding:"4px 7px", borderRadius:"7px", fontFamily:"var(--f-mono)", fontSize:"9px", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.15)", color:"var(--red)" }}>Sell</button>
                            </div>
                          ) : (
                            <button disabled={!canBuy} onClick={()=>buy(c.id)} style={{ padding:"6px 11px", borderRadius:"8px", fontFamily:"var(--f-cond)", fontWeight:700, fontSize:"10px", background:canBuy?"var(--green)":"rgba(255,255,255,.04)", color:canBuy?"var(--bg)":"var(--tx3)", cursor:canBuy?"pointer":"not-allowed", opacity:canBuy?1:.55 }}>{canBuy?"Buy":owned?"Owned":"Locked"}</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
