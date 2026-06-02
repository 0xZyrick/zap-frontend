// ─── TrainingMode.jsx ─────────────────────────────────────────────────────────
// Full training mode screen. Shows curated situations freeze-framed, lets the
// player pick an intent, then immediately reveals all three possible opponent
// outcomes side by side. No score, no rep, no stakes — pure read learning.
//
// Flow:
//   Step 0-2 : Three curated situations (MIDFIELD / ATTACK / DEFEND)
//   Step 3   : Completion screen → onDone() called
//
// Called from Zap when S.trainingDone !== true.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { trackTrainingStarted, trackTrainingCompleted, trackTrainingAbandoned } from "../lib/analytics.js";
import { INTENTS, OPPONENT_INTENTS, CUE_FEEDBACK } from "../game/constants.js";
import { buildTurnContext, getIntentRoute } from "../game/gameLogic.js";
import { PitchMarkings } from "../pitch/pitch.jsx";
import PlayerFigure from "../players/PlayerFigure.jsx";
import { IntentDirectionArrow } from "../ui/ui.jsx";

// ── Curated training situations ───────────────────────────────────────────────
// One per phase — chosen for clear, teachable cue signals.
const TRAINING_STEPS = [
  {
    phase: "MIDFIELD",
    si: 0, // midfield_pocket — pressure + right_open + inside_tight
    lesson: "Read the cues before you pick.",
    tip: "One player is free. One lane is closed. The cues tell you which is which.",
  },
  {
    phase: "ATTACK",
    si: 0, // final_third — runner_free + shot_closing
    lesson: "Attack reads are about timing.",
    tip: "The runner is moving. The defender is stepping. Who do you trust?",
  },
  {
    phase: "DEFEND",
    si: 0, // defend_runner_behind — danger_run + space_behind
    lesson: "Defend by reading the threat, not just reacting.",
    tip: "A runner is loose. Space is behind you. Press, hold, or step — which protects the goal?",
  },
];

// Tone colours
const TONE_COL = { good:"#4ade80", warn:"#facc15", danger:"#f87171" };
const PHASE_COL = { MIDFIELD:"#facc15", ATTACK:"#4ade80", DEFEND:"#f87171" };
const RESULT_COL = { beats:"#4ade80", wins:"#4ade80", loses:"#f87171" };

// ── OutcomeCard ────────────────────────────────────────────────────────────────
function OutcomeCard({ opponentIntent, playerIntentId, context, gs: _gs, reveal }) {
  const rule    = context?.situation?.readMatrix?.[playerIntentId] || {};
  const relation = rule.beats === opponentIntent.id
    ? "beats" : rule.losesTo === opponentIntent.id
    ? "loses" : "wins";
  const ok      = relation !== "loses";

  const activeCueIds = (context?.cues || []).map(c => c.id);
  const why = CUE_FEEDBACK[playerIntentId]?.[activeCueIds.find(id => CUE_FEEDBACK[playerIntentId]?.[id])]
    || (ok ? CUE_FEEDBACK[playerIntentId]?.default_win : CUE_FEEDBACK[playerIntentId]?.default_lose)
    || (ok ? "Read it right." : "Wrong read.");

  const borderCol = RESULT_COL[relation];
  const label     = ok ? "WIN" : "LOSS";

  return (
    <div style={{
      flex: 1, minWidth: 0,
      borderRadius: "10px",
      border: `1px solid ${borderCol}${reveal ? "55" : "18"}`,
      background: `${borderCol}${reveal ? "0f" : "06"}`,
      padding: "10px",
      transition: "all .35s ease",
      opacity: reveal ? 1 : 0.35,
      transform: reveal ? "translateY(0)" : "translateY(6px)",
    }}>
      {/* Opponent intent label */}
      <div style={{ fontFamily:"var(--f-mono)", fontSize:"5.5px", letterSpacing:".18em", color:"var(--tx3)", marginBottom:"4px" }}>
        RIVAL
      </div>
      <div style={{ fontFamily:"var(--f-disp)", fontSize:"11px", letterSpacing:"1.2px", color:"rgba(255,255,255,.9)", marginBottom:"6px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {opponentIntent.lbl.toUpperCase()}
      </div>

      {/* Verdict badge */}
      <div style={{
        display:"inline-flex", alignItems:"center", gap:"4px",
        padding:"2px 6px", borderRadius:"5px",
        background:`${borderCol}22`, border:`1px solid ${borderCol}44`,
        marginBottom:"6px",
      }}>
        <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:borderCol, flexShrink:0 }}/>
        <span style={{ fontFamily:"var(--f-disp)", fontSize:"8px", color:borderCol, letterSpacing:"1.2px" }}>{label}</span>
      </div>

      {/* Why line */}
      <div style={{ fontFamily:"var(--f-body)", fontSize:"10px", lineHeight:1.35, color:"rgba(255,255,255,.5)" }}>
        {why}
      </div>
    </div>
  );
}

// ── CueBadge ──────────────────────────────────────────────────────────────────
function CueBadge({ cue, highlight }) {
  const col = TONE_COL[cue.tone] || "#94a3b8";
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:"4px",
      padding:"5px 8px", borderRadius:"6px",
      border:`1px solid ${col}${highlight ? "66" : "28"}`,
      background:`${col}${highlight ? "18" : "0a"}`,
      transition:"all .3s ease",
      transform: highlight ? "scale(1.02)" : "scale(1)",
    }}>
      <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:col, boxShadow: highlight ? `0 0 6px ${col}` : "none", flexShrink:0 }}/>
      <div>
        <div style={{ fontFamily:"var(--f-disp)", fontSize:"9px", letterSpacing:"1px", color:col, lineHeight:1 }}>{cue.label}</div>
        <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:"rgba(255,255,255,.3)", marginTop:"0.5px" }}>{cue.sub}</div>
      </div>
    </div>
  );
}

// ── MiniPitch ────────────────────────────────────────────────────────────────
function MiniPitch({ context, selectedIntentId }) {
  const route = selectedIntentId ? getIntentRoute(context.gs, context, selectedIntentId) : null;
  const ball  = context.ball || { x:50, y:50 };

  return (
    <div style={{ position:"relative", width:"100%", paddingTop:"100%", borderRadius:"8px", overflow:"hidden", background:"#0d2016" }}>
      {/* Pitch base */}
      <div style={{ position:"absolute", inset:0 }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,#0a1c10,#0d2016)" }}/>
        <PitchMarkings/>

        {/* Players - smaller figures */}
        {(context.players || []).map((p, i) => (
          <PlayerFigure
            key={p.id || i}
            p={p} gs={context.gs}
            state={
              p.hB ? "ballCarrier"
              : (context.openPlayers || []).includes(p.id) ? "open"
              : (context.pressurePlayerIds || context.pressurePlayers || []).includes(p.id) ? "underPressure"
              : (context.supportOptions || []).includes(p.id) ? "support"
              : "idle"
            }
            figH={20}
          />
        ))}

        {/* Intent route arrow */}
        {route && (
          <IntentDirectionArrow
            from={route.from} to={route.to}
            color={route.color || "#38bdf8"}
            dash={route.dash || "none"}
            kind={route.kind}
            pitchW={100} pitchH={100}
          />
        )}

        {/* Ball dot */}
        <div style={{
          position:"absolute",
          left:`${ball.x}%`, top:`${ball.y}%`,
          transform:"translate(-50%,-50%)",
          width:"8px", height:"8px",
          borderRadius:"50%",
          background:"radial-gradient(circle at 38% 35%, #fff 18%, #d4d4d4 60%, #aaa)",
          boxShadow:"0 0 6px rgba(255,255,255,.6), 0 2px 4px rgba(0,0,0,.5)",
          zIndex:20,
        }}/>
      </div>
    </div>
  );
}

// ── IntentPicker ──────────────────────────────────────────────────────────────
function IntentPicker({ context, onPick, picked }) {
  const gs      = context.gs;
  const intents = (context.availableIntents || [])
    .map(id => (INTENTS[gs] || []).find(x => x.id === id))
    .filter(Boolean);

  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
      <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".2em", color:"var(--tx3)", marginBottom:"1px" }}>
        YOUR READ
      </div>
      {intents.map(intent => {
        const isPicked = picked === intent.id;
        const isHov    = hovered === intent.id;
        const rc       = intent.rc || "#60a5fa";

        // Check if this intent's targetCue is active in the situation
        const activeCueIds = new Set((context?.cues || []).map(c => c.id));
        const cueMatch = intent.targetCue && activeCueIds.has(intent.targetCue);

        return (
          <button
            key={intent.id}
            onMouseEnter={() => setHovered(intent.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => !picked && onPick(intent.id)}
            disabled={!!picked && !isPicked}
            style={{
              display:"flex", alignItems:"center", gap:"8px",
              padding:"8px 10px", borderRadius:"8px",
              border:`1px solid ${rc}${isPicked ? "88" : isHov ? "55" : "28"}`,
              background:`${rc}${isPicked ? "1e" : isHov ? "12" : "08"}`,
              color:"#fff", textAlign:"left", cursor: picked ? "default" : "pointer",
              transition:"all .18s ease",
              opacity: picked && !isPicked ? 0.35 : 1,
            }}
          >
            <div style={{
              width:"28px", height:"28px", borderRadius:"6px", flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              background:`${rc}22`, border:`1px solid ${rc}44`, color:rc,
              fontFamily:"var(--f-disp)", fontSize:"13px",
              boxShadow: cueMatch && !picked ? `0 0 8px ${rc}44` : "none",
            }}>
              {intent.icon || "→"}
            </div>
            <div style={{ flex:1, minWidth: 0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                <span style={{ fontFamily:"var(--f-disp)", fontSize:"12px", letterSpacing:"1.3px" }}>
                  {intent.lbl.toUpperCase()}
                </span>
                {cueMatch && !picked && (
                  <span style={{ fontFamily:"var(--f-mono)", fontSize:"5px", color:rc, letterSpacing:".14em", opacity:0.7, flexShrink: 0 }}>● READS</span>
                )}
              </div>
              <div style={{ fontFamily:"var(--f-body)", fontSize:"10px", color:"rgba(255,255,255,.4)", marginTop:"1px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {intent.dsc}
              </div>
            </div>
            {isPicked && (
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", color:rc, letterSpacing:".16em", flexShrink:0 }}>✓</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── TrainingStep ──────────────────────────────────────────────────────────────
function TrainingStep({ step, stepIndex, totalSteps, onNext }) {
  const [picked,     setPicked]     = useState(null);
  const [revealed,   setRevealed]   = useState(false);
  const [cueHighlight, setCueHighlight] = useState(null);

  const context = buildTurnContext(step.phase, step.si, {});
  const gs      = step.phase;

  // Get all opponent intents for this situation
  const opponentIntents = (context.opponentIntents || [])
    .map(id => (OPPONENT_INTENTS[gs] || []).find(x => x.id === id))
    .filter(Boolean);

  const handlePick = (intentId) => {
    setPicked(intentId);
    // Reveal outcomes after a short beat
    setTimeout(() => setRevealed(true), 320);
    // Pulse cues that relate to this intent
    const intent = (INTENTS[gs] || []).find(x => x.id === intentId);
    if (intent?.targetCue) setCueHighlight(intent.targetCue);
  };

  const phaseCol = PHASE_COL[gs];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>

      {/* ── Header ── */}
      <div style={{
        padding:"12px 16px 10px",
        borderBottom:"1px solid rgba(255,255,255,.07)",
        flexShrink:0,
        background:"rgba(3,8,5,.8)", backdropFilter:"blur(12px)",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{
              padding:"3px 10px", borderRadius:"999px",
              background:`${phaseCol}18`, border:`1px solid ${phaseCol}44`,
              fontFamily:"var(--f-mono)", fontSize:"7px", color:phaseCol, letterSpacing:".2em",
            }}>{gs}</div>
            <div style={{ fontFamily:"var(--f-disp)", fontSize:"18px", letterSpacing:"2px" }}>
              {context.title}
            </div>
          </div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", color:"var(--tx3)", letterSpacing:".18em" }}>
            {stepIndex + 1} / {totalSteps}
          </div>
        </div>

        <div style={{ fontFamily:"var(--f-body)", fontSize:"12px", color:"rgba(255,255,255,.5)", marginTop:"5px" }}>
          {step.tip}
        </div>
      </div>

      {/* ── Main scroll area ── */}
      <div style={{ flex:1, overflow:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:"10px" }}>

        {/* 2-column layout: pitch on left, cues + intent picker on right */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", minHeight: 0 }}>
          {/* Left: Mini pitch */}
          <div>
            <MiniPitch context={context} selectedIntentId={picked}/>
          </div>

          {/* Right: Cues + Intent Picker */}
          <div style={{ display:"flex", flexDirection:"column", gap:"10px", minHeight:0 }}>
            {/* Cues */}
            <div>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".2em", color:"var(--tx3)", marginBottom:"6px" }}>
                CUES
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px" }}>
                {(context.cues || []).map(cue => (
                  <CueBadge
                    key={cue.id}
                    cue={cue}
                    highlight={cueHighlight === cue.id}
                  />
                ))}
              </div>
            </div>

            {/* Intent picker */}
            <div style={{ flex:1, minHeight:0 }}>
              <IntentPicker context={context} onPick={handlePick} picked={picked}/>
            </div>
          </div>
        </div>

        {/* ── Outcome reveal (full width) ── */}
        {picked && (
          <div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".2em", color:"var(--tx3)", marginBottom:"6px" }}>
              OUTCOMES
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              {opponentIntents.slice(0, 3).map((oi) => (
                <OutcomeCard
                  key={oi.id}
                  opponentIntent={oi}
                  playerIntentId={picked}
                  context={context}
                  gs={gs}
                  reveal={revealed}
                />
              ))}
            </div>

            {/* Lesson callout */}
            {revealed && (
              <div style={{
                marginTop:"8px", padding:"10px",
                borderRadius:"8px",
                background:"rgba(255,255,255,.03)",
                border:"1px solid rgba(255,255,255,.08)",
                animation:"flashIn .3s ease",
              }}>
                <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", letterSpacing:".2em", color:"#facc15", marginBottom:"4px" }}>
                  LESSON
                </div>
                <div style={{ fontFamily:"var(--f-body)", fontSize:"11px", lineHeight:1.4, color:"rgba(255,255,255,.65)" }}>
                  {step.lesson}{" "}
                  Green = win. Red = trap.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer CTA ── */}
      {picked && revealed && (
        <div style={{ padding:"14px 16px", borderTop:"1px solid rgba(255,255,255,.07)", flexShrink:0, background:"rgba(3,8,5,.72)", backdropFilter:"blur(12px)" }}>
          <button
            onClick={onNext}
            style={{
              width:"100%", padding:"14px",
              borderRadius:"12px", border:"none",
              background:"linear-gradient(135deg,#18c158,#0ea042)",
              color:"#fff", fontFamily:"var(--f-disp)", fontSize:"16px",
              letterSpacing:"2px", cursor:"pointer",
              boxShadow:"0 4px 22px rgba(24,193,88,.35)",
            }}
          >
            {stepIndex < totalSteps - 1 ? "NEXT SITUATION →" : "START YOUR FIRST MATCH →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── CompletionScreen ──────────────────────────────────────────────────────────
function CompletionScreen({ onDone }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      height:"100%", padding:"32px 24px", gap:"20px", textAlign:"center",
    }}>
      <div style={{
        width:"72px", height:"72px", borderRadius:"50%",
        background:"rgba(24,193,88,.15)", border:"2px solid rgba(24,193,88,.4)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"34px",
        animation:"carrierPulse 2s ease-in-out infinite",
      }}>⚡</div>

      <div>
        <div style={{ fontFamily:"var(--f-disp)", fontSize:"32px", letterSpacing:"3px", color:"#4ade80", marginBottom:"6px" }}>
          YOU'RE READY
        </div>
        <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".2em", color:"var(--tx3)" }}>
          READING THE GAME
        </div>
      </div>

      <div style={{
        maxWidth:"340px",
        fontFamily:"var(--f-body)", fontSize:"13px", lineHeight:1.6,
        color:"rgba(255,255,255,.6)",
      }}>
        You've seen the three reads. Now play a real match.
        Watch the cues before every pick — they tell you the right call.
        Every wrong read has a reason. Every win has a read behind it.
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"8px", width:"100%", maxWidth:"320px" }}>
        {[
          { icon:"🟢", text:"Green cue = use it" },
          { icon:"🟡", text:"Yellow cue = be careful" },
          { icon:"🔴", text:"Red cue = danger zone" },
        ].map(r => (
          <div key={r.text} style={{
            display:"flex", alignItems:"center", gap:"10px",
            padding:"9px 12px", borderRadius:"9px",
            background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)",
          }}>
            <span style={{ fontSize:"16px" }}>{r.icon}</span>
            <span style={{ fontFamily:"var(--f-body)", fontSize:"12px", color:"rgba(255,255,255,.65)" }}>{r.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => { trackTrainingCompleted(); onDone(); }}
        style={{
          width:"100%", maxWidth:"320px", padding:"15px",
          borderRadius:"12px", border:"none",
          background:"linear-gradient(135deg,#18c158,#0ea042)",
          color:"#fff", fontFamily:"var(--f-disp)", fontSize:"17px",
          letterSpacing:"2.5px", cursor:"pointer",
          boxShadow:"0 4px 28px rgba(24,193,88,.4)",
          marginTop:"6px",
        }}
      >
        KICK OFF →
      </button>
    </div>
  );
}

// ── TrainingMode (root export) ────────────────────────────────────────────────
export default function TrainingMode({ onDone }) {
  const [stepIndex, setStepIndex] = useState(0);
  const done = stepIndex >= TRAINING_STEPS.length;

  // Track training started once on mount
  useEffect(() => { trackTrainingStarted(); }, []);

  // Track abandon if component unmounts before completion
  useEffect(() => {
    return () => {
      if (stepIndex < TRAINING_STEPS.length) {
        trackTrainingAbandoned(stepIndex);
      }
    };
  }, [stepIndex]);

  const handleNext = () => setStepIndex(i => i + 1);

  return (
    <div style={{
      position:"absolute", inset:0,
      background:"linear-gradient(180deg,#040d07 0%,#020504 100%)",
      display:"flex", flexDirection:"column",
      overflow:"hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"linear-gradient(rgba(24,193,88,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(24,193,88,.03) 1px,transparent 1px)",
        backgroundSize:"28px 28px", pointerEvents:"none", opacity:.8,
      }}/>

      {/* ZAP branding strip */}
      <div style={{
        position:"relative", zIndex:2,
        padding:"10px 16px 8px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:"1px solid rgba(255,255,255,.06)",
        background:"rgba(2,5,3,.7)", backdropFilter:"blur(12px)",
        flexShrink:0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ fontFamily:'"Bebas Neue",cursive', fontSize:"22px", letterSpacing:"4px", color:"#18c158" }}>ZAP</div>
          <div style={{ width:"1px", height:"18px", background:"rgba(255,255,255,.12)" }}/>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".22em", color:"rgba(24,193,88,.6)" }}>TRAINING MODE</div>
        </div>
        <div style={{
          padding:"3px 10px", borderRadius:"999px",
          background:"rgba(250,204,21,.1)", border:"1px solid rgba(250,204,21,.25)",
          fontFamily:"var(--f-mono)", fontSize:"7px", color:"#facc15", letterSpacing:".16em",
        }}>
          NO STAKES
        </div>
      </div>

      {/* Progress bar */}
      {!done && (
        <div style={{ height:"2px", background:"rgba(255,255,255,.06)", flexShrink:0, position:"relative", zIndex:2 }}>
          <div style={{
            height:"100%",
            width:`${((stepIndex) / TRAINING_STEPS.length) * 100}%`,
            background:"linear-gradient(90deg,#18c158,#4ade80)",
            transition:"width .4s ease",
          }}/>
        </div>
      )}

      {/* Content */}
      <div style={{ flex:1, overflow:"hidden", position:"relative", zIndex:1 }}>
        {done
          ? <CompletionScreen onDone={onDone}/>
          : (
            <TrainingStep
              key={stepIndex}
              step={TRAINING_STEPS[stepIndex]}
              stepIndex={stepIndex}
              totalSteps={TRAINING_STEPS.length}
              onNext={handleNext}
            />
          )
        }
      </div>
    </div>
  );
}
