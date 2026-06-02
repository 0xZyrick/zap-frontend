// ─── PlayerFigure.jsx ─────────────────────────────────────────────────────────
// Renders a pitch player using PNG pose images.
// Home team  → full-colour PNG  + state glow via drop-shadow
// Away team  → same PNG darkened to a silhouette
//
// ⚠️  DROP YOUR THREE PNG FILES INTO  src/players/
//     and update the import paths below to match your filenames.
// ─────────────────────────────────────────────────────────────────────────────

const idlePng    = "/assets/players/player_idle.png";
const attackPng  = "/assets/players/player_attack.png";
const defensePng = "/assets/players/player_defend.png";

// ── helpers ──────────────────────────────────────────────────────────────────

const ROLE_NUMBERS = {
  GK:1, LB:3, CB:5, RB:2, DM:6,
  CM:8, AM:10, LM:11, RM:7, LW:11, RW:7, ST:9,
};

function getIntentTargetId(context, intentId) {
  if (!context || !intentId) return null;
  const players = context.players || [];
  const byId    = id => players.find(p => p.id === id) || null;
  const firstHome = (ids = []) =>
    ids.map(byId).find(p => p?.t === "h") ||
    ids.map(byId).find(Boolean) || null;
  const open    = firstHome(context.openPlayers);
  const support = firstHome(context.supportOptions);
  const routeTo = context.routes?.[0]?.to?.id;
  if (["go_wide","slip_pass"].includes(intentId))  return open?.id || support?.id || routeTo || null;
  if (["play_safe","hold_wait"].includes(intentId))return support?.id || open?.id || routeTo || null;
  if (["drive_on","finish"].includes(intentId))    return context.ballCarrierId || null;
  if (["press_ball","step_in"].includes(intentId)) return support?.id || firstHome(context.activePlayerIds)?.id || null;
  if (intentId === "hold_line")                    return firstHome(context.activePlayerIds)?.id || null;
  return routeTo || null;
}

// Resolve PNG from explicit pose tag first, then fall back to state-derived logic.
// p.pose is set by getPlayerPose() in gameLogic — "run"|"defend"|"idle"
function getPoseFromTag(poseTag) {
  if (poseTag === "run")    return attackPng;
  if (poseTag === "defend") return defensePng;
  return idlePng;
}

function getPose(state, gs, poseTag) {
  // If the player has an explicit pose from the situation data, use it
  if (poseTag) return getPoseFromTag(poseTag);
  // Fallback: derive from visual state
  if (state === "ballCarrier")   return gs === "DEFEND" ? defensePng : attackPng;
  if (state === "underPressure") return defensePng;
  if (state === "open")          return attackPng;
  if (state === "selected")      return attackPng;
  return idlePng;
}

function getHomeFilter(state) {
  switch (state) {
    case "ballCarrier":
      return "drop-shadow(0 0 10px rgba(96,165,250,0.95)) drop-shadow(0 0 22px rgba(96,165,250,0.50)) drop-shadow(0 2px 5px rgba(0,0,0,0.55))";
    case "open":
      return "drop-shadow(0 0 9px rgba(34,197,94,0.90)) drop-shadow(0 0 18px rgba(34,197,94,0.42)) drop-shadow(0 2px 4px rgba(0,0,0,0.50))";
    case "underPressure":
      return "drop-shadow(0 0 9px rgba(239,68,68,0.92)) drop-shadow(0 0 18px rgba(239,68,68,0.46)) drop-shadow(0 2px 4px rgba(0,0,0,0.55))";
    case "selected":
      return "drop-shadow(0 0 10px rgba(255,255,255,0.88)) drop-shadow(0 2px 4px rgba(0,0,0,0.50))";
    case "goalkeeper":
      return "drop-shadow(0 0 7px rgba(74,222,128,0.72)) drop-shadow(0 2px 4px rgba(0,0,0,0.48))";
    case "support":
      return "drop-shadow(0 2px 5px rgba(0,0,0,0.45))";
    default:
      return "drop-shadow(0 2px 4px rgba(0,0,0,0.38))";
  }
}

function getGroundGlow(state) {
  if (state === "ballCarrier")   return "rgba(96,165,250,0.30)";
  if (state === "open")          return "rgba(34,197,94,0.26)";
  if (state === "underPressure") return "rgba(239,68,68,0.30)";
  if (state === "selected")      return "rgba(255,255,255,0.22)";
  return null;
}

function getBadgeColor(state) {
  if (state === "ballCarrier")   return "rgba(96,165,250,0.95)";
  if (state === "open")          return "rgba(34,197,94,0.92)";
  if (state === "underPressure") return "rgba(239,68,68,0.92)";
  if (state === "goalkeeper")    return "rgba(74,222,128,0.88)";
  return "rgba(10,18,12,0.84)";
}

// ── component ────────────────────────────────────────────────────────────────

export default function PlayerFigure({ p, isActive, isFar, context, previewIntentId, gs }) {
  const isHome = p.t === "h";
  const tags   = new Set(p.tags || []);

  const isOpen         = tags.has("open");
  const isPressure     = tags.has("pressure");
  const isSupport      = tags.has("support");
  const isInvolved     = tags.has("active");
  const isGoalkeeper   = p.role === "GK";
  const isIntentTarget = getIntentTargetId(context, previewIntentId) === p.id;

  // Phase-aware relevance
  const isPhaseKey = gs === "ATTACK"
    ? (isActive || isOpen || isPressure || isGoalkeeper || isSupport || isIntentTarget)
    : gs === "DEFEND"
      ? (isActive || isPressure || isSupport || isGoalkeeper || isIntentTarget)
      : true;

  const isDim = !isActive && !isIntentTarget &&
    (p.emphasis === "dim" || isFar || !isPhaseKey);

  let state = "default";
  if (isGoalkeeper)   state = "goalkeeper";
  if (isSupport)      state = "support";
  if (isOpen)         state = "open";
  if (isPressure)     state = "underPressure";
  if (isIntentTarget) state = "selected";
  if (isActive)       state = "ballCarrier";

  // Figure height in px
  const figH = isActive                          ? 68
    : isIntentTarget                             ? 60
    : isPressure                                 ? 56
    : isOpen                                     ? 58
    : isGoalkeeper && gs !== "MIDFIELD"          ? 54
    : !isPhaseKey                                ? 36
    : isSupport || isInvolved                    ? 50
    : isDim                                      ? 40
    : 44;

  const opacity = isActive       ? 1
    : isIntentTarget             ? 1
    : !isPhaseKey                ? 0.52
    : isDim                      ? 0.62
    : isSupport                  ? 0.88
    : 0.94;

  const pose       = getPose(state, gs, p.pose);
  const groundGlow = isHome ? getGroundGlow(state) : null;

  // Home: full colour + glow  |  Away: dark silhouette
  const imgFilter = isHome
    ? getHomeFilter(state)
    : "brightness(0.52) saturate(0.45) sepia(0.6) hue-rotate(320deg) contrast(1.1) drop-shadow(0 2px 6px rgba(0,0,0,0.55))";

  const lean = p.angle || 0;
  const imgTransform = `${isHome ? "" : "scaleX(-1) "}rotate(${lean}deg)`;

  // Pulse animation class
  const anim = state === "ballCarrier"
    ? "figureCarrierPulse 1.7s ease-in-out infinite"
    : state === "underPressure"
      ? "figurePressurePulse 0.55s ease-in-out infinite"
      : "none";

  const showBadge = isHome && figH >= 40 && isPhaseKey;

  return (
    <div
      style={{
        position: "absolute",
        left: p.x + "%",
        top:  p.y + "%",
        transform: "translate(-50%, -50%)",
        transition:
          "left .42s cubic-bezier(.2,.82,.22,1), " +
          "top  .42s cubic-bezier(.2,.82,.22,1), " +
          "opacity .28s ease",
        opacity,
        zIndex: isActive ? 12
          : isIntentTarget || isPressure || isOpen ? 10
          : isGoalkeeper ? 9
          : isSupport || isInvolved ? 8
          : 6,
        pointerEvents: "none",
      }}
    >
      {/* Motion trail for open runners */}
      {isOpen && !isActive && [0,1,2].map(i => {
        const d = Math.max(3, figH * (0.17 - i * 0.04));
        const dist = figH * (0.55 + i * 0.26);
        const trailBehind = p.runDir < 0 ? 1 : -1;
        return (
          <div key={`t${i}`} style={{
            position: "absolute",
            width: d, height: d,
            borderRadius: "50%",
            background: `rgba(34,197,94,${0.42 - i * 0.13})`,
            top: "60%",
            left: `calc(50% ${trailBehind < 0 ? "-" : "+"} ${dist}px)`,
            transform: "translateY(-50%)",
          }}/>
        );
      })}

      {/* YOU label */}
      {isActive && p.r === "Y" && (
        <div style={{
          position: "absolute",
          top: "-24px", left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--f-disp,monospace)",
          fontSize: "11px", fontWeight: 900,
          color: "#fbbf24", letterSpacing: ".18em",
          whiteSpace: "nowrap",
          textShadow: "0 0 18px rgba(251,191,36,.95),0 0 7px rgba(251,191,36,.55),0 2px 3px rgba(0,0,0,.95)",
          animation: "glowPulse 1.8s ease-in-out infinite",
        }}>YOU</div>
      )}

      {/* Figure */}
      <div style={{ position: "relative", display: "inline-block" }}>

        {/* Ground glow — oval under the player's feet */}
        {groundGlow && (
          <div style={{
            position: "absolute",
            bottom: "-3px", left: "50%",
            transform: "translateX(-50%)",
            width: figH * 0.70, height: figH * 0.16,
            borderRadius: "50%",
            background: groundGlow,
            filter: "blur(7px)",
            pointerEvents: "none",
          }}/>
        )}

        <img
          src={pose}
          alt=""
          draggable={false}
          style={{
            display: "block",
            height: figH,
            width: "auto",
            objectFit: "contain",
            filter: imgFilter,
            transform: imgTransform,
            transition: "filter .3s ease, height .32s ease",
            animation: anim,
          }}
        />

        {/* Number badge below figure */}
        {showBadge && (
          <div style={{
            position: "absolute",
            bottom: "-15px", left: "50%",
            transform: "translateX(-50%)",
            background: getBadgeColor(state),
            color: "#fff",
            fontFamily: "var(--f-disp,monospace)",
            fontSize: Math.max(8, figH * 0.16) + "px",
            fontWeight: 800,
            lineHeight: 1,
            padding: "2px 6px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            letterSpacing: "0.04em",
            boxShadow: "0 1px 5px rgba(0,0,0,0.65)",
          }}>
            {ROLE_NUMBERS[p.role] || "?"}
          </div>
        )}
      </div>
    </div>
  );
}
