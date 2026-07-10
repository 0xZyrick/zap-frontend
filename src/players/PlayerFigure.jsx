// ─── PlayerFigure.jsx ─────────────────────────────────────────────────────────
// Renders a pitch player using PNG pose images.
// Home team  → full-colour PNG  + state glow via drop-shadow
// Away team  → same PNG darkened to a silhouette
//
// ⚠️  DROP YOUR THREE PNG FILES INTO  src/players/
//     and update the import paths below to match your filenames.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { PLAYER_ANIMATION_STATE, PLAYER_ASSET_FALLBACKS, PLAYER_ASSETS } from "./playerAssets.js";

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

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function useTweenPoint(target, duration = 620) {
  const targetX = target.x;
  const targetY = target.y;
  const [point, setPoint] = useState(target);
  const pointRef = useRef(target);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = pointRef.current || { x: targetX, y: targetY };
    const to = { x: targetX, y: targetY };
    const startedAt = performance.now();
    cancelAnimationFrame(rafRef.current);

    const tick = (now) => {
      const t = easeOutCubic(clamp01((now - startedAt) / Math.max(1, duration)));
      const next = {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      };
      pointRef.current = next;
      setPoint(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetX, targetY, duration]);

  return point;
}

// Resolve animation key from explicit pose tag first, then fall back to state.
// p.pose is set by getPlayerPose() in gameLogic: "run"|"defend"|"idle".
function getAnimationStateFromTag(poseTag, isGoalkeeper) {
  if (poseTag === PLAYER_ANIMATION_STATE.GK_DIVE || poseTag === "gk_dive") return PLAYER_ANIMATION_STATE.GK_DIVE;
  if (poseTag === PLAYER_ANIMATION_STATE.GK_READY || poseTag === "gk_ready") return PLAYER_ANIMATION_STATE.GK_READY;
  if (poseTag === "run" || poseTag === PLAYER_ANIMATION_STATE.RUNNING) return PLAYER_ANIMATION_STATE.RUNNING;
  if (poseTag === "defend" || poseTag === PLAYER_ANIMATION_STATE.DEFENSE) return PLAYER_ANIMATION_STATE.DEFENSE;
  if (isGoalkeeper) return PLAYER_ANIMATION_STATE.GK_READY;
  return PLAYER_ANIMATION_STATE.IDLE;
}

function getAnimationState(state, gs, poseTag, isGoalkeeper) {
  // If the player has an explicit pose from the situation data, use it
  if (poseTag) return getAnimationStateFromTag(poseTag, isGoalkeeper);
  // Fallback: derive from visual state
  if (isGoalkeeper) return PLAYER_ANIMATION_STATE.GK_READY;
  if (state === "ballCarrier")   return gs === "DEFEND" ? PLAYER_ANIMATION_STATE.DEFENSE : PLAYER_ANIMATION_STATE.RUNNING;
  if (state === "underPressure") return PLAYER_ANIMATION_STATE.DEFENSE;
  if (state === "open")          return PLAYER_ANIMATION_STATE.RUNNING;
  if (state === "selected")      return PLAYER_ANIMATION_STATE.RUNNING;
  return PLAYER_ANIMATION_STATE.IDLE;
}

function resolvePlayerAsset(teamStyle, animationState) {
  return PLAYER_ASSETS[teamStyle]?.[animationState] || PLAYER_ASSET_FALLBACKS[animationState] || PLAYER_ASSET_FALLBACKS.idle;
}

function getAssetFallback(animationState) {
  return PLAYER_ASSET_FALLBACKS[animationState] || PLAYER_ASSET_FALLBACKS.idle;
}

function getFigureShadow(state) {
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

function getAwayGroundGlow(state) {
  if (state === "ballCarrier")   return "rgba(248,113,113,0.22)";
  if (state === "underPressure") return "rgba(250,204,21,0.20)";
  if (state === "open")          return "rgba(248,113,113,0.18)";
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

export default function PlayerFigure({ p, isActive, isFar, context, previewIntentId, gs, reaction }) {
  const isHome = p.t === "h";
  const teamStyle = isHome ? "player" : "opponent";
  const tweenDuration = Number(p.tween?.duration || 620);
  const pos = useTweenPoint({ x:p.x, y:p.y }, tweenDuration);
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

  const animationState = getAnimationState(state, gs, p.pose, isGoalkeeper);
  const pose = resolvePlayerAsset(teamStyle, animationState);
  const poseFallback = getAssetFallback(animationState);
  const groundGlow = isHome ? getGroundGlow(state) : getAwayGroundGlow(state);

  const lean = p.angle || 0;
  const stanceTransform = animationState === PLAYER_ANIMATION_STATE.GK_READY
    ? "scaleX(1.12) scaleY(0.92) translateY(3px) "
    : animationState === PLAYER_ANIMATION_STATE.GK_DIVE
      ? "scaleX(1.18) rotate(-15deg) "
      : "";
  const imgTransform = `${isHome ? "" : "scaleX(-1) "}${stanceTransform}rotate(${lean}deg)`;
  const isReacting = reaction?.playerId === p.id;
  const isMarkerReacting = reaction?.markerId === p.id;
  const reactionDir = isHome ? 1 : -1;

  // Carrier's own reaction: forward nudge on a won read, a small flinch back
  // on a lost one.
  const carrierX = isReacting ? (reaction.ok ? 10 * reactionDir : -8 * reactionDir) : 0;
  const carrierRotate = isReacting && !reaction.ok ? -8 * reactionDir : 0;

  // Marker's reaction: only animates when the marker actually won the duel
  // (reaction.ok === false means the attacker's read lost). This is the
  // "interception" beat -- a real closing lunge toward the ball, not just a
  // flinch, and it gets a longer transition below so it has time to read.
  const markerLunging = isMarkerReacting && reaction && !reaction.ok;
  const markerX = markerLunging ? 16 * reactionDir : 0;
  const markerRotate = markerLunging ? 10 * reactionDir : 0;

  const reactionX = carrierX + markerX;
  const reactionRotate = carrierRotate + markerRotate;
  const reactionActive = isReacting || markerLunging;
  const wrapperTransform = `translate(-50%, -50%) translateX(${reactionX}px) rotate(${reactionRotate}deg)`;

  // Pulse animation class
  const anim = state === "ballCarrier"
    ? "figureCarrierPulse 1.7s ease-in-out infinite"
    : state === "underPressure"
      ? "figurePressurePulse 0.55s ease-in-out infinite"
      : "none";

  const showBadge = figH >= 40 && isPhaseKey && (isHome || isActive || isPressure || isOpen);
  const badgeBg = isHome ? getBadgeColor(state) : "rgba(96,12,12,0.88)";

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x + "%",
        top:  pos.y + "%",
        transform: wrapperTransform,
        transition:
          `transform ${reactionActive ? "0.85s" : ".3s"} cubic-bezier(.2,.82,.22,1), ` +
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
          onError={(e) => {
            if (e.currentTarget.src.endsWith(poseFallback)) return;
            e.currentTarget.src = poseFallback;
          }}
          style={{
            display: "block",
            height: figH,
            width: "auto",
            objectFit: "contain",
            filter: getFigureShadow(state),
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
            background: badgeBg,
            color: "#fff",
            fontFamily: "var(--f-disp,monospace)",
            fontSize: Math.max(8, figH * 0.16) + "px",
            fontWeight: 800,
            lineHeight: 1,
            padding: "2px 6px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            letterSpacing: "0.04em",
            boxShadow: isHome ? "0 1px 5px rgba(0,0,0,0.65)" : "0 1px 5px rgba(0,0,0,0.72),0 0 0 1px rgba(248,113,113,.28)",
          }}>
            {ROLE_NUMBERS[p.role] || "?"}
          </div>
        )}
      </div>
    </div>
  );
}
