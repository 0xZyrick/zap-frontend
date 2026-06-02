import React, { useId } from "react";
import "./playerToken.css";

const VALID_STATES = new Set([
  "default",
  "ballCarrier",
  "open",
  "support",
  "underPressure",
  "marked",
  "tired",
  "star",
  "goalkeeper",
  "selected",
]);

export default function PlayerToken({
  team = "home",
  number,
  role,
  state = "default",
  size = 44,
  stamina = 100,
  className = "",
}) {
  const safeState = VALID_STATES.has(state) ? state : "default";
  const isGoalkeeper = safeState === "goalkeeper" || role === "GK";
  const isBallCarrier = safeState === "ballCarrier";
  const rawId = useId().replace(/:/g, "");
  const innerId = `token-inner-${rawId}`;
  const jerseyId = `token-jersey-${rawId}`;
  const ringId = `token-ring-${rawId}`;

  const label =
    number !== undefined && number !== null
      ? String(number)
      : role
        ? String(role).toUpperCase().slice(0, 3)
        : "";

  const staminaValue = Math.max(0, Math.min(100, stamina));

  return (
    <div
      className={[
        "player-token",
        `player-token--${team}`,
        `player-token--${safeState}`,
        isGoalkeeper ? "player-token--keeper-style" : "",
        className,
      ].filter(Boolean).join(" ")}
      style={{
        "--token-size": `${size}px`,
        "--stamina": staminaValue,
      }}
    >
      <svg className="player-token__svg" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id={innerId} cx="50%" cy="35%" r="68%">
            <stop offset="0%" className="player-token__inner-stop-top" />
            <stop offset="62%" className="player-token__inner-stop-mid" />
            <stop offset="100%" className="player-token__inner-stop-bottom" />
          </radialGradient>

          <linearGradient id={jerseyId} x1="32" y1="24" x2="70" y2="76">
            <stop offset="0%" className="player-token__jersey-stop-top" />
            <stop offset="100%" className="player-token__jersey-stop-bottom" />
          </linearGradient>

          <linearGradient id={ringId} x1="18" y1="14" x2="84" y2="88">
            <stop offset="0%" className="player-token__ring-stop-top" />
            <stop offset="55%" className="player-token__ring-stop-mid" />
            <stop offset="100%" className="player-token__ring-stop-bottom" />
          </linearGradient>
        </defs>

        <circle className="player-token__shadow" cx="50" cy="50" r="47" />
        <circle className="player-token__outer" cx="50" cy="50" r="43" stroke={`url(#${ringId})`} />
        <circle className="player-token__mid" cx="50" cy="50" r="37" />
        <circle className="player-token__inner" cx="50" cy="50" r="32" fill={`url(#${innerId})`} />

        <path
          className="player-token__body"
          fill={`url(#${jerseyId})`}
          d="M34 72 L38 44 L31 39 L39 25 L46 29 C48 31 52 31 54 29 L61 25 L69 39 L62 44 L66 72 Z"
        />
        <path className="player-token__neck" d="M43 28 C45 34 55 34 57 28 L54 24 L46 24 Z" />

        {isGoalkeeper && (
          <g className="player-token__keeper-icon">
            <circle cx="76" cy="77" r="11" />
            <path d="M70 80 L72 70 L75 68 L77 72 L80 70 L81 75 L79 84 L73 84 Z" />
          </g>
        )}

        {safeState === "underPressure" && (
          <g className="player-token__warning-icon">
            <circle cx="78" cy="22" r="11" />
            <path d="M78 16 L78 24" />
            <circle cx="78" cy="28.5" r="1.8" />
          </g>
        )}

        {safeState === "marked" && (
          <g className="player-token__target">
            <path d="M22 33 L22 22 L33 22" />
            <path d="M67 22 L78 22 L78 33" />
            <path d="M78 67 L78 78 L67 78" />
            <path d="M33 78 L22 78 L22 67" />
          </g>
        )}

        {safeState === "star" && (
          <g className="player-token__star-badge">
            <circle cx="77" cy="23" r="12" />
            <path d="M77 14 L80 20 L87 21 L82 26 L83 33 L77 30 L71 33 L72 26 L67 21 L74 20 Z" />
          </g>
        )}

        {/* Facing direction — alive, intentional, not a dead dot */}
        <g className="player-token__facing">
          {team === "home"
            ? <path d="M80 46 L88 50 L80 54 L82.5 50 Z" />
            : <path d="M20 46 L12 50 L20 54 L17.5 50 Z" />
          }
        </g>

        {isBallCarrier && (
          <g className="player-token__ball">
            <circle cx="76" cy="76" r="12.5" />
            <path d="M76 67 L81 71 L79 77.5 L73 77.5 L71 71 Z" />
            <path d="M71 71 L66 70" />
            <path d="M81 71 L86 70" />
            <path d="M73 77.5 L70 84" />
            <path d="M79 77.5 L82 84" />
          </g>
        )}
      </svg>

      <span className="player-token__label">{label}</span>
      {role && <span className="player-token__role">{String(role).toUpperCase().slice(0, 3)}</span>}

      {safeState === "tired" && (
        <span className="player-token__stamina" style={{ width: `${staminaValue}%` }} />
      )}
    </div>
  );
}
