// ─── ui.jsx ───────────────────────────────────────────────────────────────────
// Redesigned game HUD — premium broadcast aesthetic.
// Options pinned to bottom. Wide stat sidebar. Full atmosphere.

import { clamp, getIntentRoute } from "../game/gameLogic.js";
import { ACTION_MODS, ACTIONS, SITS, ZONE, INTENTS } from "../game/constants.js";

const stableIndex = (seed, length) => {
  if (!length) return 0;
  const text = String(seed || "zap");
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash % length;
};

const READ_COPY = {
  drive_on:      { name:"DRIVE", sub:"go through" },
  go_wide:       { name:"WIDE",  sub:"release wide" },
  play_safe:     { name:"SAFE",  sub:"keep possession" },
  play_through:  { name:"SPLIT", sub:"find the gap" },
  go_long:       { name:"LONG",  sub:"go direct" },
  finish:        { name:"FINISH", sub:"hit it now" },
  slip_pass:     { name:"SPLIT", sub:"release the run" },
  hold_wait:     { name:"HOLD",  sub:"wait for help" },
  place_shot:    { name:"PLACE", sub:"place it low" },
  power_shot:    { name:"POWER", sub:"pure power" },
  square_pass:   { name:"SQUARE", sub:"square it" },
  near_post:     { name:"NEAR",  sub:"near post" },
  back_post:     { name:"BACK",  sub:"back post" },
  cut_back:      { name:"CUT",   sub:"cut it back" },
  press_ball:    { name:"BLOCK", sub:"stop shot" },
  step_in:       { name:"STEP",  sub:"go win it" },
  hold_line:     { name:"HOLD",  sub:"don't move" },

  press_inside:  { name:"PRESS", sub:"close middle" },
  close_wide:    { name:"CLOSE", sub:"close wide" },
  hold_middle:   { name:"HOLD",  sub:"hold middle" },
  cover_wide:    { name:"COVER", sub:"cover flank" },
  hold_shape:    { name:"HOLD",  sub:"stay compact" },
  drop_off:      { name:"DROP",  sub:"give ground" },
  press_middle:  { name:"PRESS", sub:"close center" },
  step_up:       { name:"STEP",  sub:"push up" },
  block_shot:    { name:"BLOCK", sub:"stop shot" },
  rush_keeper:   { name:"RUSH",  sub:"close angle" },
  cover_corner:  { name:"COVER", sub:"guard corner" },
  stay_big:      { name:"BIG",   sub:"stand tall" },
  mark_zone:     { name:"MARK",  sub:"guard zone" },
  guard_near:    { name:"NEAR",  sub:"block near" },
  shoot_early:   { name:"SHOOT", sub:"hit early" },
  slip_runner:   { name:"SPLIT", sub:"release run" },
};

const getReadCopy = (intent, fallback = {}) => {
  const id = typeof intent === "string" ? intent : intent?.id;
  const copy = READ_COPY[id];
  if (copy) return copy;

  const rawName = fallback.name || intent?.lbl || "READ";
  const name = String(rawName).split(/\s+/)[0].slice(0, 6).toUpperCase();
  return {
    name: name || "READ",
    sub: fallback.sub || intent?.dsc || "",
  };
};

const getReadHoverSub = (context, intentId) => {
  const losesTo = context?.situation?.readMatrix?.[intentId]?.losesTo;
  if (!losesTo) return "";

  const counter = getReadCopy(losesTo);
  return `loses to ${String(counter.name || losesTo).toLowerCase()}`;
};

const CRESTS = {
  derick: "/assets/crests/derick.png",
  derickfc: "/assets/crests/derick.png",
  elmaestro: "/assets/crests/el-maestro.png",
  phantomxi: "/assets/crests/phantom-xi.png",
  codmai: "/assets/crests/codmai.png",
  skyfoot: "/assets/crests/sky-foot.png",
  ghoststrike: "/assets/crests/ghost-strike.png",
};

const assetKey = (name = "") =>
  String(name)
    .toLowerCase()
    .replace(/\bfc\b/g, "")
    .replace(/[^a-z0-9]/g, "");

const crestSrc = (name) => CRESTS[assetKey(name)] || null;

const clubInitials = (name = "FC") =>
  String(name)
    .replace(/\s+F\.?C\.?$/i, "")
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "FC";

const GLYPH_KIND = {
  drive_on:"drive",
  go_wide:"wide",
  play_safe:"safe",
  play_through:"split",
  go_long:"long",
  finish:"shoot",
  slip_pass:"split",
  hold_wait:"hold",
  place_shot:"place",
  power_shot:"power",
  square_pass:"wide",
  near_post:"near",
  back_post:"back",
  cut_back:"cut",
  press_ball:"block",
  step_in:"step",
  hold_line:"hold",
};

function TacticalGlyph({ intentId, color }) {
  const kind = GLYPH_KIND[intentId] || "wide";
  const dot = (left, top, size = 5, extra = {}) => (
    <span style={{
      position:"absolute", left, top, width:size, height:size, borderRadius:"50%",
      background:"#eefcf2", boxShadow:`0 0 8px ${color}aa`, ...extra,
    }}/>
  );
  const line = (left, top, width, rotate = 0, extra = {}) => (
    <span className="read-glyph-route" style={{
      position:"absolute", left, top, width, height:"2px",
      borderRadius:"999px",
      background:`linear-gradient(90deg, ${color}, rgba(255,255,255,.88))`,
      transform:`rotate(${rotate}deg)`,
      transformOrigin:"left center",
      boxShadow:`0 0 8px ${color}88`,
      ...extra,
    }}/>
  );
  const arrow = (left, top, rotate = 0) => (
    <span style={{
      position:"absolute", left, top, width:0, height:0,
      borderTop:"4px solid transparent", borderBottom:"4px solid transparent",
      borderLeft:`7px solid ${color}`,
      transform:`rotate(${rotate}deg)`,
      filter:`drop-shadow(0 0 5px ${color}aa)`,
    }}/>
  );
  const ring = (left, top, size = 17, extra = {}) => (
    <span style={{
      position:"absolute", left, top, width:size, height:size, borderRadius:"50%",
      border:`1.5px solid ${color}`,
      boxShadow:`0 0 10px ${color}66, inset 0 0 8px ${color}22`,
      ...extra,
    }}/>
  );

  return (
    <div className="read-glyph" style={{ "--glyph-col": color }}>
      <span className="read-glyph__midline"/>
      <span className="read-glyph__box"/>

      {kind === "drive" && (
        <>
          {dot("13px", "31px", 6)}
          {line("17px", "31px", "24px", -37)}
          {arrow("35px", "16px", -37)}
          <span style={{ position:"absolute", left:"20px", top:"18px", width:"9px", height:"9px", borderRadius:"50%", background:`${color}55`, boxShadow:`0 0 12px ${color}88` }}/>
        </>
      )}
      {kind === "wide" && (
        <>
          {dot("11px", "25px", 5)}
          {line("16px", "26px", "28px", 0)}
          {arrow("38px", "22px", 0)}
          {dot("35px", "18px", 5, { background:color })}
        </>
      )}
      {kind === "safe" && (
        <>
          {dot("17px", "20px", 5)}
          {line("20px", "23px", "17px", 26, { opacity:.75 })}
          {line("18px", "31px", "19px", -24)}
          {dot("34px", "29px", 5, { background:color })}
          <span style={{ position:"absolute", left:"21px", top:"18px", width:"18px", height:"18px", border:`1px solid ${color}99`, transform:"rotate(45deg)", borderRadius:"3px" }}/>
        </>
      )}
      {kind === "split" && (
        <>
          {dot("12px", "32px", 5)}
          {line("16px", "32px", "33px", -43)}
          {arrow("38px", "11px", -43)}
          <span style={{ position:"absolute", left:"25px", top:"8px", bottom:"8px", width:"1px", background:"rgba(255,255,255,.22)", transform:"rotate(18deg)" }}/>
          <span style={{ position:"absolute", left:"34px", top:"8px", bottom:"10px", width:"1px", background:"rgba(255,255,255,.18)", transform:"rotate(18deg)" }}/>
        </>
      )}
      {kind === "long" && (
        <>
          {dot("10px", "33px", 5)}
          <span style={{
            position:"absolute", left:"15px", top:"10px", width:"34px", height:"31px",
            borderTop:`2px solid ${color}`, borderRadius:"50% 50% 0 0",
            transform:"rotate(-15deg)", boxShadow:`0 -3px 8px ${color}55`,
          }}/>
          {arrow("39px", "14px", -23)}
        </>
      )}
      {["shoot", "place", "power", "near", "back"].includes(kind) && (
        <>
          <span style={{ position:"absolute", right:"8px", top:"12px", width:"11px", height:"28px", border:`1px solid ${color}bb`, borderLeft:"0", borderRadius:"0 4px 4px 0" }}/>
          {dot("12px", kind === "back" ? "31px" : "25px", 5)}
          {line("16px", kind === "back" ? "31px" : "26px", "29px", kind === "near" ? -20 : kind === "back" ? -42 : 0)}
          {arrow("38px", kind === "back" ? "13px" : kind === "near" ? "17px" : "22px", kind === "near" ? -20 : kind === "back" ? -42 : 0)}
          {kind === "power" && ring("28px", "18px", 14)}
          {kind === "place" && dot("39px", "17px", 4, { background:color })}
        </>
      )}
      {kind === "cut" && (
        <>
          {dot("35px", "17px", 5)}
          {line("36px", "20px", "25px", 145)}
          {arrow("15px", "31px", 145)}
          {dot("12px", "34px", 5, { background:color })}
        </>
      )}
      {kind === "press" && (
        <>
          {ring("26px", "16px", 18)}
          {dot("34px", "24px", 5, { background:"#fff" })}
          {line("12px", "34px", "26px", -31)}
          {arrow("32px", "22px", -31)}
          {dot("10px", "32px", 5, { background:color })}
        </>
      )}
      {kind === "block" && (
        <>
          <span style={{ position:"absolute", right:"8px", top:"12px", width:"12px", height:"28px", border:`1px solid ${color}bb`, borderLeft:"0", borderRadius:"0 4px 4px 0" }}/>
          {dot("16px", "28px", 5, { background:color })}
          <span style={{ position:"absolute", left:"27px", top:"14px", width:"3px", height:"31px", background:color, borderRadius:"999px", boxShadow:`0 0 9px ${color}88` }}/>
          <span style={{ position:"absolute", left:"35px", top:"16px", width:"3px", height:"27px", background:"rgba(255,255,255,.68)", borderRadius:"999px" }}/>
          {line("15px", "29px", "29px", 0, { opacity:.6 })}
        </>
      )}
      {kind === "step" && (
        <>
          {dot("14px", "32px", 5, { background:color })}
          {line("17px", "31px", "22px", -50)}
          {arrow("32px", "16px", -50)}
          <span style={{ position:"absolute", left:"30px", top:"14px", width:"14px", height:"14px", border:`1.5px solid ${color}`, transform:"rotate(45deg)", borderRadius:"3px", boxShadow:`0 0 9px ${color}66` }}/>
        </>
      )}
      {kind === "hold" && (
        <>
          {dot("15px", "25px", 5)}
          <span style={{ position:"absolute", left:"22px", top:"17px", width:"2px", height:"27px", background:color, boxShadow:`0 0 8px ${color}88` }}/>
          <span style={{ position:"absolute", left:"31px", top:"15px", width:"2px", height:"29px", background:"rgba(255,255,255,.65)" }}/>
          {ring("13px", "19px", 18, { opacity:.75 })}
        </>
      )}
    </div>
  );
}

const SITUATION_REPORTS = {
  MIDFIELD: [
    { problem:"Rivals are compact while you start possession.", ask:"How do you move the ball forward?" },
    { problem:"Their forwards are closing down your ball carrier.", ask:"How do you escape the press?" },
    { problem:"Both teams are stretched after a turnover.", ask:"How do you use the open space?" },
    { problem:"You have an extra runner wide.", ask:"How do you use the overload?" },
    { problem:"There is space behind their midfield.", ask:"How direct should the break be?" },
    { problem:"Your midfielder receives between the lines.", ask:"How do you use the pocket?" },
    { problem:"A loose ball is there to be won.", ask:"How do you take control?" },
    { problem:"You are trapped near the sideline.", ask:"How do you get out?" },
    { problem:"Both teams are set and the tempo is slow.", ask:"How do you restart the attack?" },
    { problem:"The far-side runner is free.", ask:"Do you switch play?" },
  ],
  ATTACK: [
    { problem:"You have a sight of goal from the edge of the box.", ask:"How do you finish the chance?" },
    { problem:"Your attacker is one-on-one with the keeper.", ask:"How do you beat him?" },
    { problem:"You have a spare runner in a 2v1.", ask:"How do you create the cleanest shot?" },
    { problem:"A wide ball is arriving into the box.", ask:"How do you attack the delivery?" },
    { problem:"You won the ball high near their box.", ask:"How fast do you punish them?" },
    { problem:"A late runner is arriving centrally.", ask:"Do you shoot or find the runner?" },
    { problem:"Your striker is darting to the near post.", ask:"How do you use the run?" },
    { problem:"The far-post ball is hanging up.", ask:"How do you attack it?" },
    { problem:"The keeper spills the ball in traffic.", ask:"How do you react first?" },
    { problem:"Your winger has isolated the full-back.", ask:"How do you beat the defender?" },
  ],
  DEFEND: [
    { problem:"You are the last line before a clear shot.", ask:"How do you stop the chance?" },
    { problem:"They are countering with numbers.", ask:"How do you slow the break?" },
    { problem:"The attack has become a 2v2 scramble.", ask:"Who do you control first?" },
    { problem:"A set-piece ball is coming into your area.", ask:"How do you clear danger?" },
    { problem:"A through ball puts their striker in behind.", ask:"How do you stop the runner?" },
    { problem:"A cutback runner is arriving free.", ask:"How do you block the best shot?" },
    { problem:"The back post is exposed.", ask:"How do you cover the weak side?" },
    { problem:"Your first press has been broken.", ask:"How do you delay the attack?" },
    { problem:"You are defending deep in your box.", ask:"How do you protect the goal?" },
    { problem:"They recover the second ball after your clearance.", ask:"How do you reset?" },
  ],
};

const ACTION_DECISIONS = {
  MIDFIELD: [
    "Break the first line",
    "Keep possession",
    "Skip midfield early",
  ],
  ATTACK: [
    "End the move now",
    "Find the runner",
    "Wait for support",
  ],
  DEFEND: [
    "Force a mistake",
    "Win the ball",
    "Protect the lanes",
  ],
};

const TACTICAL_READS = {
  MIDFIELD: [
    { shape:"Compact block", press:"Medium", space:"Wide lanes", zone:"overload", lane:"safe" },
    { shape:"High press", press:"High", space:"Behind press", zone:"pressure", lane:"risky" },
    { shape:"Broken shape", press:"Medium", space:"Central gap", zone:"open", lane:"direct" },
    { shape:"Wide press", press:"High", space:"Far side", zone:"overload", lane:"blocked" },
    { shape:"High line", press:"Medium", space:"Behind defence", zone:"open", lane:"direct" },
    { shape:"Narrow midfield", press:"Medium", space:"Half-space", zone:"open", lane:"safe" },
    { shape:"Second-ball swarm", press:"High", space:"Loose central", zone:"pressure", lane:"risky" },
    { shape:"Touchline trap", press:"High", space:"Inside lane", zone:"pressure", lane:"blocked" },
    { shape:"Low tempo block", press:"Low", space:"Back line", zone:"safe", lane:"safe" },
    { shape:"Shifted block", press:"Medium", space:"Far side", zone:"open", lane:"direct" },
  ],
  ATTACK: [
    { shape:"Box block", press:"Low", space:"Shot lane", zone:"danger", lane:"risky" },
    { shape:"Keeper set", press:"High", space:"Near post", zone:"danger", lane:"direct" },
    { shape:"Last defender split", press:"Medium", space:"Spare runner", zone:"overload", lane:"safe" },
    { shape:"Deep line", press:"Low", space:"Back post", zone:"danger", lane:"direct" },
    { shape:"Disorganised block", press:"High", space:"Edge gap", zone:"open", lane:"risky" },
    { shape:"Cutback covered", press:"Medium", space:"Penalty spot", zone:"overload", lane:"safe" },
    { shape:"Near-post squeeze", press:"Medium", space:"Far side", zone:"danger", lane:"blocked" },
    { shape:"Aerial mismatch", press:"Low", space:"Back post", zone:"open", lane:"direct" },
    { shape:"Scramble", press:"High", space:"Loose ball", zone:"danger", lane:"risky" },
    { shape:"Isolated full-back", press:"Medium", space:"Outside lane", zone:"overload", lane:"safe" },
  ],
  DEFEND: [
    { shape:"Direct runner", press:"High", space:"Central danger", zone:"danger", lane:"blocked" },
    { shape:"Fast counter", press:"High", space:"Channels", zone:"pressure", lane:"direct" },
    { shape:"Split runners", press:"Medium", space:"Between CBs", zone:"danger", lane:"risky" },
    { shape:"Set-piece crowd", press:"Low", space:"Second ball", zone:"danger", lane:"blocked" },
    { shape:"Runner behind", press:"High", space:"Recovery lane", zone:"pressure", lane:"direct" },
    { shape:"Cutback threat", press:"Medium", space:"Top of box", zone:"danger", lane:"safe" },
    { shape:"Weak-side overload", press:"Medium", space:"Back post", zone:"overload", lane:"blocked" },
    { shape:"Press beaten", press:"High", space:"Back line", zone:"pressure", lane:"risky" },
    { shape:"Box siege", press:"Low", space:"Shot edge", zone:"danger", lane:"safe" },
    { shape:"Second phase", press:"Medium", space:"Wide recycle", zone:"pressure", lane:"direct" },
  ],
};

// ─── Intent colour + style per id (Change 3 — arrow reacts to hovered card) ───
const INTENT_ARROW_STYLE = {
  // MIDFIELD
  go_wide:     { color:"#38bdf8", dash:"1.2 1.0", width:0.36, opacity:0.88 },
  drive_on:    { color:"#f97316", dash:"none",     width:0.40, opacity:0.92 },
  play_safe:   { color:"#facc15", dash:"2.2 1.4",  width:0.30, opacity:0.78 },
  play_through:{ color:"#34d399", dash:"1.2 1.0",  width:0.36, opacity:0.88 },
  go_long:     { color:"#f59e0b", dash:"2.8 1.2",  width:0.34, opacity:0.80 },
  // ATTACK
  finish:      { color:"#fb7185", dash:"none",     width:0.44, opacity:0.95 },
  place_shot:  { color:"#34d399", dash:"none",     width:0.42, opacity:0.92 },
  power_shot:  { color:"#fb7185", dash:"none",     width:0.46, opacity:0.96 },
  slip_pass:   { color:"#34d399", dash:"1.2 1.0",  width:0.36, opacity:0.88 },
  square_pass: { color:"#60a5fa", dash:"1.2 1.0",  width:0.34, opacity:0.84 },
  cut_back:    { color:"#34d399", dash:"1.4 1.1",  width:0.34, opacity:0.84 },
  near_post:   { color:"#f59e0b", dash:"none",     width:0.38, opacity:0.88 },
  back_post:   { color:"#a78bfa", dash:"1.8 1.2",  width:0.36, opacity:0.84 },
  hold_wait:   { color:"#60a5fa", dash:"2.4 1.4",  width:0.28, opacity:0.72 },
  // DEFEND
  press_ball:  { color:"#f87171", dash:"none",     width:0.40, opacity:0.90 },
  step_in:     { color:"#f59e0b", dash:"1.0 0.8",  width:0.38, opacity:0.88 },
  hold_line:   { color:"#60a5fa", dash:"3.0 1.8",  width:0.30, opacity:0.76 },
};

export function IntentDirectionArrow({ gs, context, intentId, from, to }) {
  // Accept either a context + intentId (GameScreen usage)
  // or direct from/to coords (TrainingMode usage)
  if (!context?.players?.length && !(from && to)) return null;

  const id    = intentId || context?.availableIntents?.[0] || "default";
  const style = INTENT_ARROW_STYLE[id] || { color:"#38bdf8", dash:"1.2 1.0", width:0.32, opacity:0.78 };

  let route;
  if (from && to) {
    route = { from, to, color: style.color, kind: "pass", dash: style.dash };
  } else {
    route = getIntentRoute(gs, context, id);
  }
  if (!route?.from || !route?.to) return null;

  const markerId = `ia-${(context?.id || gs || "x")}-${id}`.replace(/[^a-zA-Z0-9_-]/g, "");
  const arrowId  = `${markerId}-tip`;
  const pathD    = `M ${route.from.x} ${route.from.y} L ${route.to.x} ${route.to.y}`;
  const dashArr  = style.dash !== "none" ? style.dash : undefined;
  const defendLineY = context?.players
    ?.filter(p => p.t === "h" && ["LB", "CB", "RB"].includes(p.role))
    ?.reduce((sum, p, _, arr) => sum + p.y / arr.length, 0) || 50;

  return (
    <div style={{ position:"absolute", inset:0, zIndex:7, pointerEvents:"none" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", overflow:"visible" }}>
        <defs>
          <marker id={arrowId} markerWidth="5" markerHeight="5" refX="4.6" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill={style.color} opacity="0.86"/>
          </marker>
        </defs>
        {gs === "DEFEND" && id === "hold_line" ? (
          <>
            <path d={`M 13 ${defendLineY - 15} L 13 ${defendLineY + 15}`} fill="none" stroke="#60a5fa" strokeWidth="1.15"
              strokeLinecap="round" opacity="0.18"/>
            <path d={`M 16 ${defendLineY - 18} L 16 ${defendLineY + 18}`} fill="none" stroke="#60a5fa" strokeWidth="0.68"
              strokeLinecap="round" opacity="0.88"/>
          </>
        ) : (
          <>
        {/* Glow backing line */}
        <path d={pathD} fill="none" stroke={style.color} strokeWidth={style.width * 3.2}
          strokeLinecap="round" opacity={style.opacity * 0.18} strokeDasharray={dashArr}/>
        {/* Main arrow line */}
        <path d={pathD} fill="none" stroke={style.color} strokeWidth={style.width}
          strokeLinecap="round" strokeDasharray={dashArr}
          markerEnd={`url(#${arrowId})`} opacity={style.opacity}/>
          </>
        )}
      </svg>
    </div>
  );
}


// ─── PitchCueBadges ───────────────────────────────────────────────────────────
// Change 1: Cue badges live ON the pitch, not in a separate panel.
// Each badge floats near its relevant player or zone.
// Also renders a faint zone highlight when a card is hovered (Change 2).
//
// Cue → anchor position map: derived from the context's player positions and
// zone data so badges stay meaningful regardless of situation.

const CUE_TONE_COL = { good:"#4ade80", warn:"#facc15", danger:"#f87171" };

// How each cue id maps to a zone or player on the pitch
const CUE_ZONE_ANCHORS = {
  // MIDFIELD cues
  pressure_on:  { offsetX: -8, offsetY: -8,  fromPlayer:"pressure" },
  right_open:   { offsetX: +6, offsetY: -6,  fromPlayer:"open"     },
  inside_tight: { offsetX: +2, offsetY: -10, fromCenter: true      },
  support_near: { offsetX: -6, offsetY: +6,  fromPlayer:"support"  },
  space_ahead:  { offsetX:+12, offsetY: -4,  fromPlayer:"ball"     },
  inside_lane:  { offsetX: +8, offsetY: -8,  fromCenter: true      },
  long_lane:    { offsetX:+16, offsetY:-10,  fromPlayer:"ball"     },
  // ATTACK cues
  runner_free:  { offsetX: +4, offsetY: -8,  fromPlayer:"open"     },
  shot_closing: { offsetX: -6, offsetY: -6,  fromPlayer:"pressure" },
  box_crowded:  { offsetX: +8, offsetY:  0,  fromCenter: true      },
  keeper_rushing:{ offsetX:+10, offsetY:-8,  fromPlayer:"open"     },
  corner_open:  { offsetX:+10, offsetY:-10,  fromCenter: true      },
  square_free:  { offsetX: +4, offsetY: +6,  fromPlayer:"support"  },
  near_run:     { offsetX: +6, offsetY: -6,  fromPlayer:"open"     },
  back_run:     { offsetX: +8, offsetY: +6,  fromPlayer:"support"  },
  cut_lane:     { offsetX: +6, offsetY: +4,  fromPlayer:"open"     },
  // DEFEND cues
  danger_run:   { offsetX: +6, offsetY: -8,  fromPlayer:"pressure" },
  pressure_chance:{ offsetX:-6, offsetY:-6,  fromPlayer:"support"  },
  space_behind: { offsetX: -10, offsetY: +4, fromPlayer:"ball"     },
};

// Zone highlight definitions per hovered intent (Change 2)
// Each entry describes a faint coloured ellipse/rect on the pitch
const INTENT_ZONE_HIGHLIGHT = {
  go_wide:      { type:"ellipse", cx:72, cy:72, rx:14, ry:18, color:"#38bdf8" },
  drive_on:     { type:"rect",    x:54,  y:36,  w:22,  h:28,  color:"#f97316" },
  play_safe:    { type:"ellipse", cx:40, cy:55, rx:12, ry:10,  color:"#facc15" },
  play_through: { type:"rect",    x:48,  y:38,  w:14,  h:24,  color:"#34d399" },
  go_long:      { type:"rect",    x:64,  y:30,  w:28,  h:12,  color:"#f59e0b" },
  finish:       { type:"ellipse", cx:92, cy:50, rx:8,  ry:12,  color:"#fb7185" },
  place_shot:   { type:"ellipse", cx:93, cy:43, rx:6,  ry:8,   color:"#34d399" },
  power_shot:   { type:"ellipse", cx:92, cy:50, rx:7,  ry:10,  color:"#fb7185" },
  slip_pass:    { type:"ellipse", cx:82, cy:50, rx:10, ry:14,  color:"#34d399" },
  square_pass:  { type:"ellipse", cx:80, cy:56, rx:9,  ry:10,  color:"#60a5fa" },
  cut_back:     { type:"rect",    x:76,  y:52,  w:12,  h:18,  color:"#34d399" },
  near_post:    { type:"ellipse", cx:90, cy:42, rx:6,  ry:8,   color:"#f59e0b" },
  back_post:    { type:"ellipse", cx:90, cy:62, rx:6,  ry:8,   color:"#a78bfa" },
  hold_wait:    { type:"ellipse", cx:70, cy:50, rx:10, ry:10,  color:"#60a5fa" },
  press_ball:   { type:"ellipse", cx:45, cy:48, rx:10, ry:10,  color:"#f87171" },
  step_in:      { type:"ellipse", cx:40, cy:50, rx:8,  ry:12,  color:"#f59e0b" },
  hold_line:    { type:"rect",    x:18,  y:30,  w:6,   h:40,  color:"#60a5fa" },
};

export function PitchCueBadges({ context, previewIntentId, gs, showBadges = false }) {
  if (!context) return null;

  const cues    = context.cues || [];
  const players = context.players || [];
  const ball    = context.ball || { x:50, y:50 };
  const dominantIntentId = previewIntentId || context.availableIntents?.[0] || null;
  const dominantCueId = (INTENTS[gs] || []).find(i => i.id === dominantIntentId)?.targetCue || cues[0]?.id || null;
  const visibleCues = cues
    .map((cue, order) => ({ cue, order, rank: cue.id === dominantCueId ? 0 : cue.tone === "good" ? 1 : cue.tone === "danger" ? 2 : 3 }))
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .slice(0, 2)
    .map(item => item.cue);

  // Build anchor map from context player roles
  const anchorMap = {};
  const pressurePlayers = new Set(context.pressurePlayers || context.pressurePlayerIds || []);
  const openPlayers     = new Set(context.openPlayers || []);
  const supportPlayers  = new Set(context.supportOptions || []);

  for (const p of players) {
    if (p.hB)                    anchorMap.ball     = p;
    if (pressurePlayers.has(p.id)) anchorMap.pressure = p;
    if (openPlayers.has(p.id))     anchorMap.open     = p;
    if (supportPlayers.has(p.id))  anchorMap.support  = p;
  }
  anchorMap.center = { x: (gs === "ATTACK" ? 75 : gs === "DEFEND" ? 30 : 50), y: 50 };

  const getBadgePos = (cue) => {
    const rule = CUE_ZONE_ANCHORS[cue.id];
    if (!rule) {
      // fallback: scatter near ball
      const idx = cues.indexOf(cue);
      return { x: ball.x + (idx % 2 === 0 ? -10 : +10), y: ball.y - 8 - idx * 6 };
    }
    let base;
    if (rule.fromCenter) base = anchorMap.center;
    else if (rule.fromPlayer === "ball")     base = anchorMap.ball     || anchorMap.center;
    else if (rule.fromPlayer === "pressure") base = anchorMap.pressure || anchorMap.ball;
    else if (rule.fromPlayer === "open")     base = anchorMap.open     || anchorMap.ball;
    else if (rule.fromPlayer === "support")  base = anchorMap.support  || anchorMap.ball;
    else base = anchorMap.ball || anchorMap.center;

    return {
      x: (base?.x ?? 50) + (rule.offsetX || 0),
      y: (base?.y ?? 50) + (rule.offsetY || 0),
    };
  };

  // Zone highlight for hovered intent
  const zoneHl = previewIntentId ? INTENT_ZONE_HIGHLIGHT[previewIntentId] : null;

  // Detect if SUPPORT_NEAR should get offset (if open player exists, likely to conflict)
  const zoneFill = gs === "DEFEND" ? 0.05 : 0.10;
  const zoneStroke = gs === "DEFEND" ? 0.18 : 0.28;
  const zoneStrokeOpacity = gs === "DEFEND" ? 0.22 : 0.35;
  const phaseBadgeOpacity = gs === "DEFEND" ? 0.5 : 1;
  const zoneForRender = zoneHl && gs === "DEFEND" && zoneHl.type === "ellipse"
    ? { ...zoneHl, rx: Math.min(zoneHl.rx, 8), ry: Math.min(zoneHl.ry, 10) }
    : zoneHl;

  return (
    <div style={{ position:"absolute", inset:0, zIndex:8, pointerEvents:"none" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", overflow:"visible" }}>

        {/* Change 2: Zone highlight for hovered card */}
        {zoneForRender && (
          zoneForRender.type === "ellipse"
            ? <ellipse cx={zoneForRender.cx} cy={zoneForRender.cy} rx={zoneForRender.rx} ry={zoneForRender.ry}
                fill={zoneForRender.color} fillOpacity={zoneFill} stroke={zoneForRender.color}
                strokeWidth={zoneStroke} strokeOpacity={zoneStrokeOpacity}
                style={{ transition:"all .22s ease" }}/>
            : <rect x={zoneForRender.x} y={zoneForRender.y} width={zoneForRender.w} height={zoneForRender.h}
                rx="2" fill={zoneForRender.color} fillOpacity={zoneFill} stroke={zoneForRender.color}
                strokeWidth={zoneStroke} strokeOpacity={zoneStrokeOpacity}
                style={{ transition:"all .22s ease" }}/>
        )}

        {/* Connector dots from badge to anchor */}
        {showBadges && visibleCues.map((cue) => {
          const pos = getBadgePos(cue);
          const anchor = (() => {
            const rule = CUE_ZONE_ANCHORS[cue.id];
            if (!rule) return null;
            if (rule.fromPlayer === "ball")     return anchorMap.ball;
            if (rule.fromPlayer === "pressure") return anchorMap.pressure;
            if (rule.fromPlayer === "open")     return anchorMap.open;
            if (rule.fromPlayer === "support")  return anchorMap.support;
            return null;
          })();
          const col = CUE_TONE_COL[cue.tone] || "#94a3b8";
          if (!anchor) return null;
          return (
            <line key={`con-${cue.id}`}
              x1={pos.x} y1={pos.y + 1.4}
              x2={anchor.x} y2={anchor.y}
              stroke={col} strokeWidth="0.40" strokeOpacity="0.60"
              strokeDasharray="0.6 0.5"/>
          );
        })}
      </svg>

      {/* Change 1: Floating cue badges — HTML positioned absolutely */}
      {showBadges && visibleCues.map((cue, cueIndex) => {
        let pos = getBadgePos(cue);
        const col = CUE_TONE_COL[cue.tone] || "#94a3b8";
        const isDominant = cue.id === dominantCueId || cueIndex === 0;
        // Special offset for SUPPORT_NEAR to avoid pulse ring overlap
        if (cue.id === "support_near" && anchorMap.open) {
          pos = { x: pos.x - 3.5, y: pos.y + 3 };
        }
        // clamp to pitch bounds
        const left = Math.max(2, Math.min(80, pos.x));
        const top  = Math.max(4, Math.min(86, pos.y));

        return (
          <div key={cue.id} style={{
            position:"absolute",
            left:`${left}%`, top:`${top}%`,
            transform:"translate(-50%, -50%)",
            display:"flex", alignItems:"center", gap:"2px",
            padding:isDominant ? "1px 4px 1px 3px" : "1px 3px",
            borderRadius:"4px",
            background:`rgba(3,8,5,.82)`,
            border:`1px solid ${col}55`,
            backdropFilter:"blur(6px)",
            boxShadow:`0 2px 8px rgba(0,0,0,.45), 0 0 6px ${col}22`,
            opacity:isDominant ? phaseBadgeOpacity : phaseBadgeOpacity * 0.62,
            pointerEvents:"none",
            whiteSpace:"nowrap",
            animation:"flashIn .3s ease",
            zIndex:8,
          }}>
            <span style={{
              width:"4px", height:"4px", borderRadius:"50%",
              background:col,
              boxShadow:`0 0 3px ${col}`,
              flexShrink:0,
            }}/>
            <span style={{
              fontFamily:"var(--f-mono)", fontSize:"5px",
              letterSpacing:".12em", color:col,
              lineHeight:1,
            }}>
              {cue.label.toUpperCase()}
            </span>
          </div>
        );
      })}

      {/* Change 2: Open player pulse ring when go_wide / slip_pass / cut_back hovered */}
      {previewIntentId && ["go_wide","slip_pass","cut_back","near_post","back_post"].includes(previewIntentId) && anchorMap.open && (
        <div style={{
          position:"absolute",
          left:`${anchorMap.open.x}%`,
          top:`${anchorMap.open.y}%`,
          transform:"translate(-50%,-50%)",
          width:"36px", height:"36px",
          borderRadius:"50%",
          border:`1.5px solid ${INTENT_ARROW_STYLE[previewIntentId]?.color || "#38bdf8"}`,
          boxShadow:`0 0 12px ${INTENT_ARROW_STYLE[previewIntentId]?.color || "#38bdf8"}55`,
          animation:"carrierPulse 1.1s ease-in-out infinite",
          pointerEvents:"none",
          zIndex:9,
        }}/>
      )}

      {/* Change 2: Pressure player warning ring when press/drive/step hovered */}
      {previewIntentId && ["press_ball","drive_on","step_in"].includes(previewIntentId) && anchorMap.pressure && (
        <div style={{
          position:"absolute",
          left:`${anchorMap.pressure.x}%`,
          top:`${anchorMap.pressure.y}%`,
          transform:"translate(-50%,-50%)",
          width:"34px", height:"34px",
          borderRadius:"50%",
          border:`1.5px solid #f87171`,
          boxShadow:`0 0 10px rgba(248,113,113,.5)`,
          animation:"dangerPulse 0.9s ease-in-out infinite",
          pointerEvents:"none",
          zIndex:9,
        }}/>
      )}
    </div>
  );
}

// ─── ScoreBar ─────────────────────────────────────────────────────────────────
export function ScoreBar({ homeClub, awayClub = "RIVALS FC", score, matchTime, gs, isSecondHalf, formationShape, popH, popA }) {
  const zm = ZONE[gs] || ZONE.MIDFIELD;
  const homeShort = (homeClub || "ZAP").split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();
  const awayShort = (awayClub || "RIVALS").split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();
  const homeName  = (homeClub || "ZAP").replace(/ FC$/i, "");
  const awayName  = (awayClub || "RIVALS").replace(/ FC$/i, "");

  return (
    <div style={{
      position: "absolute", top: "10px", left: "50%",
      transform: "translateX(-50%)",
      width: "min(700px, calc(100% - 24px))",
      zIndex: 30, pointerEvents: "none",
      display: "flex", alignItems: "center",
      height: "56px",
      background: "linear-gradient(180deg, rgba(6,14,10,.92) 0%, rgba(2,7,4,.88) 100%)",
      border: "1px solid rgba(255,255,255,.10)",
      borderRadius: "14px",
      boxShadow: "0 14px 40px rgba(0,0,0,.42), 0 1px 0 rgba(255,255,255,.05) inset",
      backdropFilter: "blur(20px)",
      overflow: "hidden",
    }}>
      {/* Accent top line */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${zm.col}66,transparent)` }}/>

      {/* HOME team */}
      <div style={{
        display:"flex", alignItems:"center", gap:"10px",
        padding:"0 16px", flex:1, minWidth:0,
      }}>
        {/* Badge */}
        <div style={{
          width:"34px", height:"34px", borderRadius:"9px", flexShrink:0,
          background:"linear-gradient(135deg,#18c158,#0a6e30)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"var(--f-disp)", fontSize:"11px", color:"#fff", fontWeight:900,
          boxShadow:"0 0 14px rgba(24,193,88,.36)",
          border:"1px solid rgba(24,193,88,.4)",
        }}>{homeShort}</div>
        <div style={{ minWidth:0 }}>
          <div style={{
            fontFamily:"var(--f-disp)", fontSize:"15px", letterSpacing:"1.5px",
            color:"#fff", lineHeight:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>{homeName}</div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".14em", color:"rgba(255,255,255,.3)", marginTop:"2px" }}>{formationShape}</div>
        </div>
      </div>

      {/* CENTER score block */}
      <div style={{
        flexShrink:0,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"0 20px",
        position:"relative",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <span className={popH ? "pop" : ""} style={{
            fontFamily:"var(--f-disp)", fontSize:"34px", color:"#fff",
            lineHeight:1, minWidth:"28px", textAlign:"center",
          }}>{score.h}</span>
          <span style={{
            fontFamily:"var(--f-mono)", fontSize:"18px",
            color:"rgba(255,255,255,.28)", margin:"0 2px", lineHeight:1,
          }}>–</span>
          <span className={popA ? "pop" : ""} style={{
            fontFamily:"var(--f-disp)", fontSize:"34px", color:"#fff",
            lineHeight:1, minWidth:"28px", textAlign:"center",
          }}>{score.a}</span>
        </div>
        {/* Time badge */}
        <div style={{
          fontFamily:"var(--f-mono)", fontSize:"9px", fontWeight:700, letterSpacing:".12em",
          color: isSecondHalf ? "#d4a017" : "#18c158",
          marginTop:"2px", lineHeight:1,
        }}>{matchTime}</div>
      </div>

      {/* AWAY team */}
      <div style={{
        display:"flex", alignItems:"center", gap:"10px", justifyContent:"flex-end",
        padding:"0 16px", flex:1, minWidth:0,
      }}>
        <div style={{ minWidth:0, textAlign:"right" }}>
          <div style={{
            fontFamily:"var(--f-disp)", fontSize:"15px", letterSpacing:"1.5px",
            color:"rgba(255,255,255,.75)", lineHeight:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>{awayName}</div>
          <div style={{
            fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".14em",
            color:"rgba(255,255,255,.25)", marginTop:"2px",
          }}>{ZONE[gs]?.lbl || gs}</div>
        </div>
        {/* Away badge */}
        <div style={{
          width:"34px", height:"34px", borderRadius:"9px", flexShrink:0,
          background:"linear-gradient(135deg,#c0392b,#7b0e07)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"var(--f-disp)", fontSize:"11px", color:"#fff", fontWeight:900,
          border:"1px solid rgba(248,113,113,.35)",
        }}>{awayShort}</div>
      </div>

      {/* Live indicator dot */}
      <div style={{
        position:"absolute", top:"8px", right:"12px",
        width:"5px", height:"5px", borderRadius:"50%",
        background:zm.col, boxShadow:`0 0 7px ${zm.col}`,
        animation:"pulse 1.8s ease infinite",
      }}/>
    </div>
  );
}
// ─── StatPanel ─────────────────────────────────────────────────────────────────
// Wide sidebar panel — left side, full height section
export function StatPanel({ gs, stats, momentum = "normal" }) {
  const phaseKey = gs === "ATTACK" ? "atk" : gs === "MIDFIELD" ? "mid" : "def";
  const cpuKey   = gs === "MIDFIELD" ? "cpu_mid" : gs === "ATTACK" ? "cpu_def" : "cpu_atk";

  const statDefs = [
    { k: "atk", lbl: "Attack",  short: "ATK", val: stats.atk, col: "#f87171", icon: "⚡" },
    { k: "mid", lbl: "Midfield", short: "MID", val: stats.mid, col: "#facc15", icon: "◈" },
    { k: "def", lbl: "Defence",  short: "DEF", val: stats.def, col: "#60a5fa", icon: "🛡" },
  ];

  return (
    <div style={{
      position: "absolute",
      top: "76px", left: "0",
      width: "148px",
      zIndex: 20,
      display: "flex", flexDirection: "column",
      gap: "7px",
      padding: "9px 9px 10px 8px",
      borderRadius: "0 8px 8px 0",
      border: "1px solid rgba(255,255,255,.10)",
      borderLeft: "0",
      background: `
        linear-gradient(90deg, rgba(1,5,3,.98), rgba(3,11,7,.90) 58%, rgba(5,15,10,.68)),
        radial-gradient(ellipse 120% 80% at 0% 50%, rgba(24,193,88,.16), transparent 62%)
      `,
      backdropFilter: "blur(16px)",
      boxShadow: "14px 18px 40px rgba(0,0,0,.34), inset -1px 0 0 rgba(255,255,255,.06), inset 0 1px 0 rgba(255,255,255,.06)",
      clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 9px, 100% calc(100% - 9px), calc(100% - 7px) 100%, 0 100%)",
      pointerEvents: "none",
    }}>
      <div style={{
        position:"absolute", top:"8px", bottom:"8px", left:0, width:"3px",
        background:`linear-gradient(180deg, transparent, ${statDefs.find(d => d.k === phaseKey)?.col || "#18c158"}, transparent)`,
        boxShadow:`0 0 16px ${statDefs.find(d => d.k === phaseKey)?.col || "#18c158"}88`,
      }}/>
      <div style={{
        position:"absolute", inset:"0 0 auto 0", height:"1px",
        background:"linear-gradient(90deg, rgba(255,255,255,.18), transparent)",
      }}/>
      {/* Header */}
      <div style={{
        position: "relative",
        fontFamily: "var(--f-mono)", fontSize: "7px",
        letterSpacing: ".18em", color: "rgba(255,255,255,.48)",
        textTransform: "uppercase",
        paddingLeft:"3px",
      }}>TEAM STATS</div>
      {momentum !== "normal" && (
        <div style={{
          margin:"-2px 0 1px",
          padding:"5px 7px",
          borderRadius:"6px",
          border:`1px solid ${momentum === "in_form" ? "rgba(74,222,128,.32)" : "rgba(248,113,113,.32)"}`,
          background:momentum === "in_form" ? "rgba(34,197,94,.10)" : "rgba(127,29,29,.14)",
          color:momentum === "in_form" ? "#4ade80" : "#f87171",
          fontFamily:"var(--f-mono)",
          fontSize:"7px",
          letterSpacing:".12em",
          textTransform:"uppercase",
        }}>
          {momentum === "in_form" ? "IN FORM" : "UNDER PRESSURE"}
        </div>
      )}

      {/* Stat rows */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "7px" }}>
        {statDefs.map(d => {
          const isActive = d.k === phaseKey;
          const cpuVal   = isActive ? (stats[cpuKey] || 5) : null;
          const diff     = isActive ? d.val - (cpuVal || 5) : 0;
          const pct      = clamp(d.val * 10, 0, 100);

          return (
            <div key={d.k} style={{
              position:"relative",
              background: isActive
                ? `linear-gradient(135deg, ${d.col}2c, rgba(2,7,5,.82) 46%, rgba(0,0,0,.60))`
                : "linear-gradient(135deg, rgba(255,255,255,.035), rgba(0,0,0,.42))",
              border: `1px solid ${isActive ? d.col + "78" : "rgba(255,255,255,.08)"}`,
              borderLeft: `2px solid ${isActive ? d.col : "rgba(255,255,255,.13)"}`,
              borderRadius: "7px",
              padding: isActive ? "9px 8px 8px" : "7px 8px",
              transition: "all .35s ease",
              animation: isActive ? "phaseIn .3s ease" : "none",
              boxShadow: isActive
                ? `0 0 0 1px ${d.col}18, 0 8px 24px rgba(0,0,0,.20), 0 0 22px ${d.col}20, inset 0 1px 0 rgba(255,255,255,.08)`
                : "inset 0 1px 0 rgba(255,255,255,.035)",
              overflow:"hidden",
            }}>
              {isActive && (
                <div style={{
                  position:"absolute", top:0, right:0, width:"32px", height:"100%",
                  background:`linear-gradient(100deg, transparent, ${d.col}18)`,
                  clipPath:"polygon(44% 0, 100% 0, 100% 100%, 0 100%)",
                }}/>
              )}
              {/* Row top */}
              <div style={{ position:"relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isActive ? "6px" : "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{
                    width:isActive ? "19px" : "16px",
                    height:isActive ? "19px" : "16px",
                    display:"inline-flex",
                    alignItems:"center",
                    justifyContent:"center",
                    borderRadius:"5px",
                    fontSize: isActive ? "12px" : "10px",
                    background:isActive ? `${d.col}24` : "rgba(255,255,255,.045)",
                    boxShadow:isActive ? `0 0 12px ${d.col}28` : "none",
                  }}>{d.icon}</span>
                  <span style={{
                    fontFamily: "var(--f-mono)", fontSize: isActive ? "8px" : "7px",
                    letterSpacing: ".1em", color: isActive ? d.col : "rgba(255,255,255,.38)",
                    fontWeight: 700,
                  }}>{d.short}</span>
                </div>
                <span style={{
                  fontFamily: "var(--f-disp)", fontSize: isActive ? "19px" : "13px",
                  color: isActive ? d.col : "rgba(255,255,255,.3)", lineHeight: 1,
                  transition: "all .3s",
                }}>{d.val}</span>
              </div>

              {/* Bar */}
              <div style={{
                height: isActive ? "4px" : "2px",
                background: "rgba(255,255,255,.06)",
                borderRadius: "999px", overflow: "hidden",
                transition: "height .3s",
                position:"relative",
              }}>
                <div style={{
                  height: "100%", borderRadius: "999px",
                  width: pct + "%",
                  background: isActive
                    ? `linear-gradient(90deg, ${d.col}, ${d.col}88)`
                    : "rgba(255,255,255,.15)",
                  transition: "width .5s ease",
                  boxShadow: isActive ? `0 0 8px ${d.col}` : "none",
                }} />
              </div>

              {/* CPU comparison — active only */}
              {isActive && cpuVal != null && (
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginTop: "6px",
                  paddingTop: "6px",
                  borderTop: "1px solid rgba(255,255,255,.05)",
                  position:"relative",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: "6px", color: "rgba(255,255,255,.2)", letterSpacing: ".1em" }}>RIVALS</span>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: "9px", color: "rgba(248,113,113,.7)", fontWeight: 700 }}>{cpuVal}</span>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    background: diff > 0 ? "rgba(74,222,128,.1)" : diff < 0 ? "rgba(248,113,113,.1)" : "rgba(255,255,255,.05)",
                    border: `1px solid ${diff > 0 ? "rgba(74,222,128,.25)" : diff < 0 ? "rgba(248,113,113,.25)" : "rgba(255,255,255,.07)"}`,
                    borderRadius: "6px", padding: "3px 8px",
                  }}>
                    <span style={{
                      fontFamily: "var(--f-mono)", fontSize: "9px", fontWeight: 700,
                      color: diff > 0 ? "#4ade80" : diff < 0 ? "#f87171" : "rgba(255,255,255,.3)",
                    }}>
                      {diff > 0 ? `+${diff} ▲` : diff < 0 ? `${diff} ▼` : "= EVEN"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* STR Energy bar */}
      {stats.str != null && (
        <div style={{
          position: "relative", marginTop: "auto",
          padding: "10px 12px",
          background: "rgba(0,0,0,.5)",
          border: "1px solid rgba(255,255,255,.06)",
          borderLeft: "3px solid rgba(212,160,23,.5)",
          borderRadius: "0 8px 8px 0",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "7px", letterSpacing: ".12em", color: "rgba(212,160,23,.7)" }}>⚡ STR</span>
            <span style={{ fontFamily: "var(--f-disp)", fontSize: "13px", color: "#d4a017" }}>{stats.str}</span>
          </div>
          <div style={{ height: "3px", background: "rgba(255,255,255,.06)", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "999px",
              width: clamp(stats.str * 10, 0, 100) + "%",
              background: "linear-gradient(90deg, #d4a017, #f59e0b)",
              transition: "width .5s ease",
              boxShadow: "0 0 6px rgba(212,160,23,.6)",
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ResolutionScreen ─────────────────────────────────────────────────────────
// Turn resolution - shows decision vs rivals comparison with outcomes.
export function ResolutionScreen({
  gs,
  playerAction,
  rivalAction,
  resultOk = null,
  isResolving = false,
  message,
  onContinue,
  turnResult,
  context,
  homeClub = "ZAP FC",
  awayClub = "RIVALS FC",
  score = null,
}) {
  if (playerAction == null) return null;

  const selectedIntentId = context?.availableIntents?.[playerAction] || null;
  const playerIntent = turnResult?.playerIntent || (INTENTS[gs] || []).find(i => i.id === selectedIntentId) || ACTIONS[gs]?.[playerAction] || null;
  const cpuIntent = turnResult?.cpuIntent || null;
  const outcomeLabels = new Set(["GOAL", "CONCEDED", "MISS", "DEFENDED", "OPPONENT READ"]);
  const safeCpuLabel = turnResult?.cpuLbl && !outcomeLabels.has(String(turnResult.cpuLbl).toUpperCase())
    ? turnResult.cpuLbl
    : null;
  const rawRivalActionLabel = turnResult?.cpuIntent?.lbl || safeCpuLabel || (typeof rivalAction === "number"
    ? ACTIONS[gs]?.[rivalAction]?.lbl || "HOLD SHAPE"
    : rivalAction || ACTIONS[gs]?.[2]?.lbl || "HOLD SHAPE");
  const playerCopy = getReadCopy(playerIntent || selectedIntentId, {
    name: playerIntent?.lbl || "READ",
    sub: playerIntent?.dsc || ACTION_DECISIONS[gs]?.[playerAction] || "",
  });
  const rivalCopy = cpuIntent
    ? getReadCopy(cpuIntent, { name:rawRivalActionLabel, sub:"" })
    : { name:String(rawRivalActionLabel || "HOLD SHAPE").toUpperCase(), sub:"" };
  const playerActionLabel = playerCopy.name;
  const rivalActionLabel = isResolving
    ? "WAITING"
    : rivalCopy.name;

  const readRelation = playerIntent?.beats?.includes(cpuIntent?.id)
    ? "beats"
    : playerIntent?.losesTo?.includes(cpuIntent?.id)
      ? "loses"
      : "wins";
  const outcomeCol = isResolving ? "#facc15" : resultOk ? "#4ade80" : "#ef4444";
  const why = isResolving
    ? (message || "Waiting for the opponent read.")
    : turnResult?.why
      ? turnResult.why
      : readRelation === "beats"
        ? resultOk
          ? `${rivalActionLabel} gave ${playerActionLabel} the space it needed.`
          : `${rivalActionLabel} countered ${playerActionLabel} before it could work.`
        : readRelation === "loses"
          ? resultOk
            ? `${rivalActionLabel} challenged the first option, but ${playerActionLabel} still got through.`
            : `${rivalActionLabel} took away the space ${playerActionLabel} needed.`
          : resultOk
            ? `${playerActionLabel} won the turn.`
            : `${rivalActionLabel} won the turn.`;
  const statusLabel = isResolving
    ? "RESOLVING..."
    : resultOk
      ? "CORRECT READ"
      : "WRONG READ";
  const matchSide = ({ club, read, tone, align = "left" }) => (
    <div style={{
      minWidth:0,
      textAlign:align,
    }}>
      <div style={{ minWidth:0 }}>
        <div style={{ color:"rgba(255,255,255,.44)", fontFamily:"var(--f-mono)", fontSize:"6.5px", letterSpacing:".16em", textTransform:"uppercase", lineHeight:1 }}>
          {align === "right" ? "THEM" : "YOU"}
        </div>
        <div style={{ marginTop:"3px", color:"rgba(255,255,255,.76)", fontFamily:"var(--f-body)", fontSize:"9px", fontWeight:700, lineHeight:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {club}
        </div>
        <strong style={{
          display:"block",
          marginTop:"5px",
          color:isResolving && align === "right" ? "rgba(255,255,255,.48)" : tone,
          fontFamily:"var(--f-cond)",
          fontSize:"clamp(17px, 2.2vw, 24px)",
          fontWeight:800,
          letterSpacing:".04em",
          lineHeight:.95,
          textTransform:"uppercase",
          whiteSpace:"nowrap",
          overflow:"hidden",
          textOverflow:"ellipsis",
          textShadow:`0 0 16px ${tone}44`,
        }}>{read}</strong>
      </div>
    </div>
  );

  return (
    <div style={{
      position:"fixed",
      inset:0,
      zIndex:80,
      display:"flex",
      alignItems:"flex-end",
      justifyContent:"center",
      padding:"18px 18px clamp(42px, 9vh, 82px)",
      boxSizing:"border-box",
      pointerEvents:"none",
    }}>
    <div style={{
      width:"min(620px, calc(100% - 36px))",
      borderRadius:"14px",
      border:`1px solid ${outcomeCol}44`,
      background:"linear-gradient(180deg, rgba(2,10,6,.94), rgba(0,3,2,.91))",
      boxShadow:`0 18px 54px rgba(0,0,0,.48), 0 0 32px ${outcomeCol}22, inset 0 1px 0 rgba(255,255,255,.06)`,
      backdropFilter:"blur(14px)",
      overflow:"hidden",
      pointerEvents:"auto",
      animation:"phaseIn .22s ease both",
    }}>
      <div style={{
        display:"grid",
        gridTemplateColumns:"minmax(0,1fr) 52px minmax(0,1fr)",
        gap:"10px",
        alignItems:"center",
        padding:"10px 12px 8px",
      }}>
        {matchSide({ club:homeClub, read:playerActionLabel, tone:!isResolving && !resultOk ? "#ef4444" : "#22d35f" })}
        <div style={{ display:"grid", placeItems:"center", gap:"4px", minWidth:0 }}>
          <div style={{
            width:"38px",
            height:"38px",
            borderRadius:"50%",
            border:`1px solid ${outcomeCol}55`,
            background:`radial-gradient(circle, ${outcomeCol}22, rgba(0,0,0,.72) 70%)`,
            color:outcomeCol,
            display:"grid",
            placeItems:"center",
            fontFamily:"var(--f-disp)",
            fontSize:"11px",
            letterSpacing:".08em",
            boxShadow:`0 0 18px ${outcomeCol}26`,
          }}>VS</div>
          <span style={{ color:"rgba(255,255,255,.38)", fontFamily:"var(--f-mono)", fontSize:"6px", letterSpacing:".14em" }}>
            {ZONE[gs]?.lbl || gs}
          </span>
        </div>
        {matchSide({ club:awayClub, read:rivalActionLabel, tone:!isResolving && resultOk ? "#ef4444" : "#22d35f", align:"right" })}
      </div>

      <div style={{
        minHeight:"30px",
        padding:"0 12px 9px",
        display:"grid",
        gridTemplateColumns:!isResolving ? "minmax(0,1fr) auto" : "1fr",
        gap:"10px",
        alignItems:"center",
      }}>
        <div style={{
          minWidth:0,
          borderRadius:"8px",
          border:`1px solid ${outcomeCol}35`,
          background:`linear-gradient(90deg, ${outcomeCol}16, rgba(255,255,255,.035), ${outcomeCol}10)`,
          color:outcomeCol,
          fontFamily:"var(--f-cond)",
          fontSize:"clamp(14px,1.45vw,18px)",
          fontWeight:800,
          letterSpacing:".08em",
          textTransform:"uppercase",
          textAlign:"center",
          padding:"7px 10px 6px",
          whiteSpace:"nowrap",
          overflow:"hidden",
          textOverflow:"ellipsis",
        }}>
          {isResolving ? (
            <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"6px" }}>
              THINKING
              <span style={{ display:"inline-flex", gap:"3px", transform:"translateY(-1px)" }}>
                {[0, 1, 2].map((dot) => (
                  <i key={dot} style={{
                    width:"4px",
                    height:"4px",
                    borderRadius:"50%",
                    background:outcomeCol,
                    animation:`thinkingDot 1.05s ${dot * 0.16}s ease-in-out infinite`,
                  }} />
                ))}
              </span>
            </span>
          ) : statusLabel}
        </div>
        {!isResolving && (
          <button onClick={onContinue} style={{
            minWidth:"112px",
            height:"32px",
            borderRadius:"8px",
            background:outcomeCol,
            color:"#020504",
            fontFamily:"var(--f-body)",
            fontSize:"11px",
            fontWeight:900,
            letterSpacing:".08em",
            textTransform:"uppercase",
          }}>
            Continue
          </button>
        )}
      </div>

      {isResolving && (
        <div style={{ display:"flex", justifyContent:"center", gap:"7px", padding:"0 12px 11px" }}>
          {[0, 1, 2, 3, 4].map((dot) => (
            <span key={dot} style={{
              width:"5px",
              height:"5px",
              borderRadius:"50%",
              background:outcomeCol,
              opacity:.38,
              boxShadow:`0 0 12px ${outcomeCol}77`,
              animation:`thinkingDot 1.2s ${dot * 0.12}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      )}

      {!isResolving && (
        <div style={{ padding:"8px 12px 10px", color:"rgba(238,245,240,.66)", fontFamily:"var(--f-body)", fontSize:"11px", lineHeight:1.25, textAlign:"center" }}>
          {why}
        </div>
      )}
    </div>
    </div>
  );
}

// ─── EncounterCue ─────────────────────────────────────────────────────────────
// One-line situation summary above the active moment
export function EncounterCue({ gs, context, phase }) {
  if (phase !== "playing" || !context?.players?.length) return null;
  
  const cues = {
    MIDFIELD: [
      "You receive in midfield. Pressure is coming. One teammate is opening wide.",
      "Your midfielder has space to run. A defender is closing. You can go long or keep it.",
      "The ball is loose in the middle. You and a rival are both there. Be first.",
      "You have possession wide. Their defender is tight. You can cross or cut back.",
      "Your playmaker is in a pocket. Space opens to the right. You control the tempo.",
    ],
    ATTACK: [
      "You have a clear sight of goal. Their keeper is set. One touch and shoot.",
      "Your winger has isolated their defender. The box is opening. Time to strike.",
      "You win a loose ball near the box. Chaos for a moment. What do you do?",
      "Your striker makes a run. The ball is coming. Timing is everything.",
      "You're one-on-one with the keeper. Everything happens now.",
    ],
    DEFEND: [
      "Their striker is running at you. The ball is close. Block or cover?",
      "They counter with numbers. Your line is stretched. How do you slow it?",
      "A cross is coming in. The box is crowded. Who do you mark?",
      "You've lost possession. Their attack is forming. React now or it's too late.",
      "The ball is in the air. Heads, feet, or clear? Make your choice.",
    ],
  };
  
  const situationCues = cues[gs] || cues.MIDFIELD;
  const cue = situationCues[stableIndex(context?.id || gs, situationCues.length)];
  
  return (
    <div style={{
      position: "absolute",
      top: "74px", left: "50%",
      transform: "translateX(-50%)",
      width: "min(620px, 90%)",
      zIndex: 24,
      pointerEvents: "none",
    }}>
      <div style={{
        padding: "11px 16px",
        borderRadius: "9px",
        background: "linear-gradient(135deg, rgba(6,14,10,.92), rgba(3,8,5,.88))",
        border: "1px solid rgba(255,255,255,.12)",
        boxShadow: "0 8px 24px rgba(0,0,0,.48)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          fontFamily: "var(--f-body)",
          fontSize: "13px",
          color: "rgba(238,245,240,.85)",
          lineHeight: 1.5,
          textAlign: "center",
          fontStyle: "italic",
        }}>
          {cue}
        </div>
      </div>
    </div>
  );
}

// ─── OpponentThreat ───────────────────────────────────────────────────────────
// Shows what the opponent is likely trying to do
export function OpponentThreat({ gs, context, phase }) {
  if (phase !== "playing" || !context?.players?.length) return null;
  
  const threats = {
    MIDFIELD: [
      { intention: "Press inside", detail: "They want to trap the ball carrier." },
      { intention: "Control the channels", detail: "Block passing lanes through the middle." },
      { intention: "Force a long ball", detail: "Pressure to take you out of short passing." },
      { intention: "Win second ball", detail: "They're pressing to create a turnover." },
      { intention: "Shift the play", detail: "Trying to force you wide before attacking." },
    ],
    ATTACK: [
      { intention: "Compress the box", detail: "Making it hard to find space for a shot." },
      { intention: "Stay tight to striker", detail: "No room to shoot—they're on you fast." },
      { intention: "Cut out the pass", detail: "Blocking the support runner to isolate you." },
      { intention: "Aerial dominance", detail: "They're stronger in the air. Beware set pieces." },
      { intention: "Offside trap", detail: "Watch the line—they're trying to play you offside." },
    ],
    DEFEND: [
      { intention: "Speed and precision", detail: "Fast passes, finding gaps. Stay compact." },
      { intention: "Exploit the wings", detail: "Cross and cutback is their pattern." },
      { intention: "Direct threat", detail: "Direct runner is dangerous. Mark tight." },
      { intention: "Numerical overload", detail: "They have more players forward. Defend depth." },
      { intention: "Break your line", detail: "Through ball is coming. Position tight." },
    ],
  };
  
  const opponentThreats = threats[gs] || threats.MIDFIELD;
  const threat = opponentThreats[stableIndex(`threat:${context?.id || gs}`, opponentThreats.length)];
  
  return (
    <div style={{
      position: "absolute",
      top: "104px", right: "14px",
      width: "min(280px, calc(100% - 28px))",
      zIndex: 23,
      pointerEvents: "none",
    }}>
      <div style={{
        padding: "10px 14px",
        borderRadius: "9px",
        background: "linear-gradient(135deg, rgba(127,29,29,.88), rgba(69,10,10,.84))",
        border: "1px solid rgba(248,113,113,.15)",
        boxShadow: "0 8px 24px rgba(239,68,68,.2)",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{
          fontFamily: "var(--f-mono)",
          fontSize: "7px",
          letterSpacing: ".16em",
          color: "rgba(248,113,113,.6)",
          marginBottom: "6px",
          textTransform: "uppercase",
          fontWeight: 700,
        }}>
          OPPONENT THREAT
        </div>
        <div style={{
          fontFamily: "var(--f-body)",
          fontSize: "12px",
          color: "#fff",
          fontWeight: 600,
          marginBottom: "4px",
          lineHeight: 1.2,
        }}>
          {threat.intention}
        </div>
        <div style={{
          fontFamily: "var(--f-body)",
          fontSize: "11px",
          color: "rgba(255,200,200,.65)",
          lineHeight: 1.3,
          fontStyle: "italic",
        }}>
          {threat.detail}
        </div>
      </div>
    </div>
  );
}

// ─── ActionCards ──────────────────────────────────────────────────────────────
// Redesigned decision interface with rich football narrative and visual feedback
export function ActionCards({ gs, phase, onAction, context, onPreviewIntent, disabled = false }) {
  const active = phase === "playing" && !disabled;
  const intentIds = context?.availableIntents || (INTENTS[gs] || []).map(x => x.id);
  const intentPool = INTENTS[gs] || [];
  const actions = intentIds.map((id, index) => {
    const intent = intentPool.find(x => x.id === id) || intentPool[index];
    const fallback = ACTIONS[gs]?.[index] || {};
    return intent ? { ...fallback, ...intent, idx: intent.idx ?? index } : { ...fallback, idx:index, id };
  }).slice(0, 3);

  // Enhanced read-based descriptions
  const readDescriptions = {
    MIDFIELD: {
      "drive_on": { title: "Take it yourself", text: "Run at them.", context: "Use it when the gap is open.", col: "#f97316" },
      "go_wide": { title: "Give it wide", text: "Find the free man.", context: "Use it when the flank is open.", col: "#38bdf8" },
      "play_safe": { title: "Keep it", text: "Don't risk it.", context: "Use it when the safe pass is on.", col: "#facc15" },
      "play_through": { title: "Find the runner", text: "Split them open.", context: "Use it before the press lands.", col: "#34d399" },
      "go_long": { title: "Go direct", text: "Hit it long.", context: "Use it when the runner is in behind.", col: "#f59e0b" },
      "slip_pass": { title: "Slide them in", text: "Release the run.", context: "Use it when the runner breaks.", col: "#34d399" },
      "hold_wait": { title: "Hold it up", text: "Wait for help.", context: "Use it when support is close.", col: "#a78bfa" },
      "press_middle": { title: "Press middle", text: "Close the centre.", context: "Use it before they drive through.", col: "#ef4444" },
      "cover_wide": { title: "Cover wide", text: "Protect the flank.", context: "Use it when the wide runner is free.", col: "#f59e0b" },
      "drop_off": { title: "Drop off", text: "Give no space.", context: "Use it when the direct ball is coming.", col: "#94a3b8" },
    },
    ATTACK: {
      "finish": { title: "Shoot", text: "Hit it now.", context: "Use it before the defender steps.", col: "#fb7185" },
      "slip_pass": { title: "Slide them in", text: "Release the run.", context: "Use it when the man is free in the box.", col: "#34d399" },
      "hold_wait": { title: "Hold it up", text: "Wait for help.", context: "Use it when the box is packed.", col: "#60a5fa" },
      "place_shot": { title: "Pick your spot", text: "Place it low.", context: "Use it when the corner is unguarded.", col: "#34d399" },
      "power_shot": { title: "Hit through it", text: "Pure power.", context: "Use it when the keeper is coming out.", col: "#fb7185" },
      "square_pass": { title: "Square it", text: "Tap-in for them.", context: "Use it when the square ball is on.", col: "#60a5fa" },
      "near_post": { title: "Near post", text: "Attack it early.", context: "Use it when the near run is on.", col: "#f59e0b" },
      "back_post": { title: "Back post", text: "Float to the far side.", context: "Use it when the far-post run is free.", col: "#a78bfa" },
      "cut_back": { title: "Cut it back", text: "Late runner arriving.", context: "Use it when the cutback is on.", col: "#34d399" },
      "go_wide": { title: "Give it wide", text: "Find the free man.", context: "Use the space before it closes.", col: "#f59e0b" },
      "drive_on": { title: "Take it yourself", text: "Run at them.", context: "Use your speed before they react.", col: "#f97316" },
    },
    DEFEND: {
      "press_ball": { title: "Block shot", text: "Stop the shot.", context: "Use it when the shot is coming.", col: "#ef4444" },
      "step_in": { title: "Go and win it", text: "Step in and take it.", context: "Use it before the runner breaks.", col: "#f59e0b" },
      "hold_line": { title: "Hold your ground", text: "Don't step out.", context: "Use it when the gap behind is the danger.", col: "#60a5fa" },
      "hold_wait": { title: "Hold it up", text: "Wait for help.", context: "Survive the moment.", col: "#3b82f6" },
      "drive_on": { title: "Take it yourself", text: "Run at them.", context: "Go after the loose ball first.", col: "#f97316" },
    },
  };

  const phaseReads = readDescriptions[gs] || readDescriptions.MIDFIELD;

  return (
    <div style={{
      position: "absolute",
      left: "50%", bottom: "10px",
      transform: "translateX(-50%)",
      width: "min(760px, calc(100% - 24px))",
      zIndex: 25,
      borderRadius: "14px",
      overflow: "visible",
      border: "none",
      background: "transparent",
      boxShadow: "none",
    }}>
      {/* Horizontal card layout */}
      <div style={{ display:"flex", gap:"8px", padding:"7px", justifyContent:"center", flexWrap:"wrap" }}>
        {[0, 1, 2].map((slotIndex) => {
          const index = slotIndex;
          const a = actions[slotIndex];

          // Locked slot: formation restricts this intent
          if (!a) return (
            <div key={`locked-${slotIndex}`} style={{
              minHeight:"58px",
              display:"flex", flexDirection:"row",
              alignItems:"center", justifyContent:"center", gap:"8px",
              padding:"8px 14px",
              borderRadius:"8px",
              border:"1px solid rgba(255,255,255,.08)",
              background:"linear-gradient(135deg,rgba(8,14,10,.34),rgba(0,0,0,.38))",
              opacity:0.4,
              flex:"1 1 0",
              minWidth:"150px",
              maxWidth:"246px",
            }}>
              <div style={{
                width:"32px", height:"32px", borderRadius:"7px",
                display:"flex", alignItems:"center", justifyContent:"center",
                border:"1px solid rgba(255,255,255,.10)",
                color:"rgba(255,255,255,.24)",
                fontFamily:"var(--f-mono)", fontSize:"13px",
              }}>▣</div>
            </div>
          );

          // Normal card
          const read = phaseReads[a.id] || { title: a.lbl || "OPTION", text: a.dsc || "Make your choice", context: "", col: "#60a5fa" };
          const actionCopy = getReadCopy(a, { name:read.title, sub:read.text });
          const hoverSub = getReadHoverSub(context, a.id);
          const accent = read.col || a.rc || "#60a5fa";

          return (
            <button
              className="read-action-button"
              key={`${gs}-${a.id || index}`}
              disabled={!active}
              onMouseEnter={() => { active && onPreviewIntent?.(a.id); }}
              onFocus={() => { active && onPreviewIntent?.(a.id); }}
              onMouseLeave={() => { active && onPreviewIntent?.(null); }}
              onBlur={() => { active && onPreviewIntent?.(null); }}
              onClick={() => active && onAction(index)}
              style={{
                "--read-col": accent,
                "--read-delay": `${index * 60}ms`,
                background:"none", border:"none", padding:0,
                cursor: active ? "pointer" : "not-allowed",
                WebkitTapHighlightColor:"transparent",
                animation: active ? `btnStagger .28s cubic-bezier(.25,.46,.45,.94) ${index * 60}ms both` : "none",
                flex:"1 1 0",
                minWidth:"150px",
                maxWidth:"246px",
              }}
            >
              <div
                className="read-action-card"
                style={{
                  minHeight: "58px",
                  display: "grid",
                  gridTemplateColumns: "44px minmax(0,1fr)",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 13px 8px 10px",
                  borderRadius: "8px",
                  border: active ? `1px solid ${accent}d0` : "1px solid rgba(255,255,255,.07)",
                  background: active
                    ? `linear-gradient(135deg, ${accent}24 0%, rgba(2,7,5,.92) 42%, rgba(1,4,3,.82) 100%)`
                    : "rgba(6,10,8,.55)",
                  opacity: active ? 1 : 0.28,
                  boxShadow: active
                    ? `0 8px 20px rgba(0,0,0,.42), 0 0 0 1px ${accent}1f, 0 0 14px ${accent}20, inset 0 1px 0 rgba(255,255,255,.08)`
                    : "none",
                  transition: "transform .18s cubic-bezier(.34,.69,.64,1), border-color .18s ease, box-shadow .18s ease, background .18s ease",
                  position: "relative",
                  overflow: "hidden",
                  clipPath:"polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))",
                }}
              >
                <span className="read-action-card__ray"/>
                <span className="read-action-card__sheen"/>
                <span style={{
                  position:"absolute", left:0, top:"12px", bottom:"12px", width:"3px",
                  borderRadius:"0 999px 999px 0",
                  background:accent,
                  boxShadow:`0 0 14px ${accent}aa`,
                }}/>

                <TacticalGlyph intentId={a.id} color={accent}/>

                {/* Title and description */}
                <div style={{ minWidth:0, display:"flex", flexDirection:"column", gap:"4px", position:"relative" }}>
                  <div style={{
                    fontFamily:"var(--f-disp)", fontSize:"16px", color:"#fff",
                    letterSpacing:"1.4px", lineHeight:.9, textTransform:"uppercase",
                    fontWeight: 800,
                    textShadow:`0 0 16px ${accent}44`,
                  }}>
                    {actionCopy.name}
                  </div>
                  {(actionCopy.sub || hoverSub) && (
                    <div className="read-action-card__sub" style={{
                      fontFamily:"var(--f-mono)", fontSize:"8.5px",
                      color:"rgba(238,245,240,.78)", lineHeight:1.15,
                      letterSpacing: ".05em",
                      whiteSpace:"nowrap",
                      overflow:"hidden",
                      textOverflow:"ellipsis",
                    }}>
                      <span className="read-action-card__sub-default">{actionCopy.sub}</span>
                      {hoverSub && <span className="read-action-card__sub-hover">{hoverSub}</span>}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
// ─── Commentary ───────────────────────────────────────────────────────────────
export function Commentary({ text }) {
  if (!text) return null;
  return (
    <div key={text} style={{
      position: "absolute", bottom: "176px", left: "50%",
      transform: "translateX(-50%)",
      width: "min(520px, 60%)", zIndex: 28,
      textAlign: "center", pointerEvents: "none",
      animation: "commentIn .28s ease",
    }}>
      <div style={{
        display: "inline-block",
        background: "rgba(0,0,0,.75)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "8px", padding: "6px 16px",
        backdropFilter: "blur(10px)",
      }}>
        <span style={{
          fontFamily: "var(--f-body)", fontStyle: "italic",
          fontSize: "11px", color: "rgba(255,255,255,.75)", lineHeight: 1.5,
        }}>{text}</span>
      </div>
    </div>
  );
}

// ─── CPUChoiceBanner ──────────────────────────────────────────────────────────
export function CPUChoiceBanner({ choice }) {
  if (!choice) return null;
  return (
    <div style={{
      position: "absolute", top: "68px", right: "12px",
      width: "200px", zIndex: 35,
      animation: "slideDown .26s cubic-bezier(.34,1.56,.64,1)",
    }}>
      <div style={{
        borderRadius: "12px", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(127,29,29,.97), rgba(69,10,10,.97))",
        border: "1px solid rgba(248,113,113,.25)",
        boxShadow: "0 6px 24px rgba(239,68,68,.2)",
        backdropFilter: "blur(12px)",
      }}>
        {/* Header */}
        <div style={{
          padding: "7px 12px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "7px", letterSpacing: ".18em", color: "rgba(252,165,165,.55)" }}>RIVALS CHOSE</span>
          <span style={{ fontSize: "12px" }}>⚔️</span>
        </div>
        {/* Body */}
        <div style={{ padding: "10px 12px 12px" }}>
          <div style={{
            fontFamily: "var(--f-disp)", fontSize: "20px",
            letterSpacing: "1.5px", color: "#fca5a5", lineHeight: 1,
            marginBottom: "4px",
          }}>{choice.lbl?.toUpperCase()}</div>
          <div style={{
            fontFamily: "var(--f-body)", fontStyle: "italic",
            fontSize: "9px", color: "rgba(255,255,255,.38)", lineHeight: 1.4,
          }}>{choice.narr}</div>
          <div style={{
            marginTop: "10px", display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 10px",
            background: choice.favorable ? "rgba(22,101,52,.3)" : "rgba(127,29,29,.3)",
            borderRadius: "6px",
            border: `1px solid ${choice.favorable ? "rgba(74,222,128,.2)" : "rgba(248,113,113,.2)"}`,
          }}>
            <span style={{ fontSize: "14px" }}>{choice.favorable ? "✓" : "✗"}</span>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "8px", fontWeight: 700,
              color: choice.favorable ? "#4ade80" : "#f87171",
              letterSpacing: ".08em",
            }}>{choice.favorable ? "GOOD CALL" : "COUNTERED"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ResultFlash ──────────────────────────────────────────────────────────────
export function ResultFlash({ result }) {
  if (!result) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 22,
      display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: result.ok ? "rgba(22,101,52,.1)" : "rgba(127,29,29,.12)",
        backdropFilter: "blur(1px)",
      }} />
      <div style={{
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
        padding: "18px 36px 14px",
        borderRadius: "20px",
        background: result.ok ? "rgba(8,24,14,.94)" : "rgba(24,8,8,.94)",
        border: `1px solid ${result.ok ? "rgba(74,222,128,.3)" : "rgba(248,113,113,.3)"}`,
        boxShadow: `0 12px 48px ${result.ok ? "rgba(74,222,128,.2)" : "rgba(248,113,113,.2)"}`,
        animation: "bounceIn .35s cubic-bezier(.34,1.56,.64,1)",
      }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: "8px", letterSpacing: ".22em",
          color: result.ok ? "rgba(74,222,128,.65)" : "rgba(248,113,113,.65)",
        }}>{result.ok ? "SUCCESS" : "FAILED"}</div>
        <div style={{
          fontFamily: "var(--f-disp)", fontSize: "22px",
          letterSpacing: "2px", color: result.ok ? "#4ade80" : "#f87171", lineHeight: 1,
        }}>{result.msg}</div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ msg }) {
  return (
    <div style={{
      position: "absolute", bottom: "200px", left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(6,12,9,.96)", border: "1px solid rgba(255,255,255,.09)",
      borderRadius: "8px", padding: "7px 14px",
      fontFamily: "var(--f-mono)", fontSize: "10px", color: "rgba(255,255,255,.65)",
      whiteSpace: "nowrap", zIndex: 999, pointerEvents: "none",
      animation: "flashIn .2s ease",
    }}>{msg}</div>
  );
}

// ─── TxPendingBadge ───────────────────────────────────────────────────────────
export function TxPendingBadge() {
  return (
    <div style={{
      position: "absolute", bottom: "200px", left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(212,160,23,.12)", border: "1px solid rgba(212,160,23,.28)",
      borderRadius: "8px", padding: "6px 16px",
      fontFamily: "var(--f-mono)", fontSize: "9px", color: "var(--gold)",
      zIndex: 999, pointerEvents: "none",
      animation: "flashIn .2s ease",
      display: "flex", alignItems: "center", gap: "6px",
    }}>
      <span style={{ animation: "pulse 1.2s ease infinite" }}>⛓</span>
      On-chain tx pending…
    </div>
  );
}
