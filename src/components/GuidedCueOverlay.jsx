// ─── GuidedCueOverlay.jsx ─────────────────────────────────────────────────────
// Soft guided overlay for the first two turns of a player's first real match.
// Does NOT block the game — it layers a pulsing arrow + label over the cue panel
// and the action cards, pointing the player's eye to what matters.
//
// Disappears permanently after turn 2. Never shown again after trainingDone.
//
// Props:
//   turn        {number}  current turn number (1-indexed)
//   phase       {string}  "MIDFIELD" | "ATTACK" | "DEFEND"
//   cues        {array}   active cues from context
//   onDismiss   {fn}      called when player taps "Got it"
//   dismissed   {bool}    if true, render nothing
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { trackOnboardingStep } from "../lib/analytics.js";

const GUIDE_STEPS = [
  {
    turn: 1,
    headline: "Read the cues first.",
    body: "Before you pick, look at the cues below. They show you the space, the pressure, and who is free. One of your options fits the picture.",
    arrowTarget: "cues",   // highlights the cue panel
    ctaLabel: "OK, I see them →",
  },
  {
    turn: 2,
    headline: "Pick the read that fits.",
    body: "Each card matches a cue. If the right side is open, go wide. If space is ahead, drive. If pressure is on, stay safe. Trust what the pitch is showing you.",
    arrowTarget: "cards",  // highlights the action cards
    ctaLabel: "Got it. I'll read from here. →",
  },
];

export default function GuidedCueOverlay({ turn, cues = [], onDismiss, dismissed }) {
  const [visible, setVisible] = useState(false);

  const guide = GUIDE_STEPS.find(g => g.turn === turn);

  useEffect(() => {
    if (!dismissed && guide) {
      const t = setTimeout(() => setVisible(true), 600); // short delay so pitch renders first
      return () => clearTimeout(t);
    }
  }, [turn, dismissed, guide]);

  if (!visible || !guide || dismissed) return null;

  const handleDismiss = () => {
    setVisible(false);
    trackOnboardingStep(turn);
    onDismiss(turn);
  };

  // Pick the most "good" toned cue to spotlight, or first one
  const spotlightCue = cues.find(c => c.tone === "good") || cues[0];

  return (
    <>
      {/* Dark vignette to focus attention — does not block touches */}
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at 50% 72%, transparent 38%, rgba(0,0,0,.52) 100%)",
        pointerEvents:"none",
        zIndex:38,
        animation:"flashIn .4s ease",
      }}/>

      {/* Guide card — anchored bottom-center above the action cards */}
      <div style={{
        position:"absolute",
        bottom:"220px",   // sits just above where action cards typically are
        left:"50%",
        transform:"translateX(-50%)",
        width:"min(320px, calc(100% - 32px))",
        zIndex:40,
        animation:"slideUp .35s cubic-bezier(.22,1,.36,1)",
        pointerEvents:"all",
      }}>
        {/* Connector pulse dot pointing down toward cues/cards */}
        <div style={{
          width:"10px", height:"10px", borderRadius:"50%",
          background:"#18c158",
          boxShadow:"0 0 14px rgba(24,193,88,.8)",
          margin:"0 auto 8px",
          animation:"carrierPulse 1.4s ease-in-out infinite",
        }}/>

        {/* Card body */}
        <div style={{
          borderRadius:"14px",
          background:"rgba(4,12,7,.92)",
          border:"1px solid rgba(24,193,88,.35)",
          backdropFilter:"blur(18px)",
          overflow:"hidden",
          boxShadow:"0 8px 40px rgba(0,0,0,.6), 0 0 0 1px rgba(24,193,88,.12)",
        }}>
          {/* Green top bar */}
          <div style={{
            height:"3px",
            background:"linear-gradient(90deg,#18c158,#4ade80,#18c158)",
          }}/>

          <div style={{ padding:"14px 16px 16px" }}>
            {/* Turn indicator */}
            <div style={{
              display:"flex", alignItems:"center", gap:"6px", marginBottom:"8px",
            }}>
              <div style={{
                padding:"2px 8px", borderRadius:"999px",
                background:"rgba(24,193,88,.15)", border:"1px solid rgba(24,193,88,.3)",
                fontFamily:"var(--f-mono)", fontSize:"6.5px", color:"#18c158", letterSpacing:".2em",
              }}>
                TURN {turn} GUIDE
              </div>
              {guide.arrowTarget === "cues" && spotlightCue && (
                <div style={{
                  padding:"2px 8px", borderRadius:"999px",
                  background:`rgba(74,222,128,.12)`, border:`1px solid rgba(74,222,128,.3)`,
                  fontFamily:"var(--f-mono)", fontSize:"6.5px",
                  color:"#4ade80", letterSpacing:".18em",
                }}>
                  ● {spotlightCue.label.toUpperCase()}
                </div>
              )}
            </div>

            {/* Headline */}
            <div style={{
              fontFamily:"var(--f-disp)", fontSize:"20px", letterSpacing:"2px",
              color:"#fff", lineHeight:1, marginBottom:"7px",
            }}>
              {guide.headline}
            </div>

            {/* Body */}
            <div style={{
              fontFamily:"var(--f-body)", fontSize:"12px", lineHeight:1.55,
              color:"rgba(255,255,255,.58)", marginBottom:"14px",
            }}>
              {guide.body}
            </div>

            {/* Cue spotlight strip (turn 1 only) */}
            {guide.arrowTarget === "cues" && cues.length > 0 && (
              <div style={{
                display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"12px",
              }}>
                {cues.map(cue => {
                  const col = cue.tone === "good" ? "#4ade80" : cue.tone === "warn" ? "#facc15" : "#f87171";
                  const isSpot = cue.id === spotlightCue?.id;
                  return (
                    <div key={cue.id} style={{
                      display:"flex", alignItems:"center", gap:"4px",
                      padding:"4px 8px", borderRadius:"6px",
                      border:`1px solid ${col}${isSpot ? "66" : "33"}`,
                      background:`${col}${isSpot ? "18" : "0a"}`,
                      transition:"all .3s ease",
                    }}>
                      <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:col, flexShrink:0 }}/>
                      <span style={{ fontFamily:"var(--f-mono)", fontSize:"7px", color:col, letterSpacing:".14em" }}>
                        {cue.label.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTA button */}
            <button
              onClick={handleDismiss}
              style={{
                width:"100%", padding:"11px",
                borderRadius:"9px", border:"none",
                background:"linear-gradient(135deg,#18c158,#0ea042)",
                color:"#fff", fontFamily:"var(--f-disp)", fontSize:"13px",
                letterSpacing:"2px", cursor:"pointer",
                boxShadow:"0 3px 14px rgba(24,193,88,.3)",
              }}
            >
              {guide.ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
