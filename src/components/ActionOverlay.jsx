import React from 'react';

/**
 * ActionOverlay: Close football-moment annotations.
 *
 * Section language follows the flow of play:
 * - DEFENCE BEHIND: keeper/cover behind the ball
 * - MOMENT: carrier, pressure, support
 * - ATTACK AHEAD: runner/keeper ahead of the ball
 *
 * The camera is responsible for keeping these players in view:
 * - ball carrier
 * - nearest pressing defender
 * - wide runner
 * - nearby support option
 */

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distSq = (a, b) => ((a?.x ?? 0) - (b?.x ?? 0)) ** 2 + ((a?.y ?? 0) - (b?.y ?? 0)) ** 2;

function pickMomentPlayers(context) {
  const { ballCarrierId, openPlayers = [], supportOptions = [], pressurePlayers = [], players = [] } = context || {};
  const ballCarrier = players.find(p => p.id === ballCarrierId);
  const byId = (id) => players.find(p => p.id === id) || null;

  const pressurePlayer = pressurePlayers
    .map(byId)
    .filter(Boolean)
    .sort((a, b) => distSq(a, ballCarrier) - distSq(b, ballCarrier))[0] ||
    players
      .filter(p => ballCarrier && p.t !== ballCarrier.t)
      .sort((a, b) => distSq(a, ballCarrier) - distSq(b, ballCarrier))[0] ||
    null;

  const openRunner = openPlayers
    .map(byId)
    .filter(Boolean)
    .sort((a, b) => Math.abs((b.y ?? 50) - 50) - Math.abs((a.y ?? 50) - 50))[0] ||
    null;

  const supportPlayer = supportOptions
    .map(byId)
    .filter(Boolean)
    .sort((a, b) => distSq(a, ballCarrier) - distSq(b, ballCarrier))[0] ||
    null;

  const carrierDirection = ballCarrier?.t === "a" ? -1 : 1;
  const ownKeeper = players.find(p => p.t === ballCarrier?.t && p.role === "GK") || null;
  const opponentKeeper = players.find(p => p.t !== ballCarrier?.t && p.role === "GK") || null;

  return { ballCarrier, pressurePlayer, openRunner, supportPlayer, ownKeeper, opponentKeeper, carrierDirection };
}

function PlayerRing({ player, label, color, radius = 3.8, dash = "" }) {
  if (!player) return null;
  const labelY = clamp(player.y - radius - 2.2, 5, 95);
  return (
    <g>
      <circle cx={player.x} cy={player.y} r={radius} fill={`${color}18`} stroke={color} strokeWidth="0.55" opacity="0.95" />
      <circle cx={player.x} cy={player.y} r={radius + 1.7} fill="none" stroke={color} strokeWidth="0.24" opacity="0.46" strokeDasharray={dash || "1.4 1"} />
      <text x={player.x} y={labelY} textAnchor="middle" fill={color} fontSize="2.1" fontWeight="900" fontFamily="var(--f-disp)" letterSpacing="0.18em">
        {label}
      </text>
    </g>
  );
}

export default function ActionOverlay({ previewIntentId, context }) {
  const {
    ballCarrier,
    pressurePlayer,
    openRunner,
    supportPlayer,
    ownKeeper,
    opponentKeeper,
    carrierDirection,
  } = pickMomentPlayers(context);

  if (!ballCarrier) return null;

  const markerId = `moment-${context?.id || "live"}-${previewIntentId || "default"}`.replace(/[^a-zA-Z0-9_-]/g, "");
  const behindX = clamp(ballCarrier.x - carrierDirection * 18, 6, 94);
  const aheadX = clamp(ballCarrier.x + carrierDirection * 20, 6, 94);
  const sectionY = clamp(ballCarrier.y - 13, 12, 88);

  const passTarget = ["go_wide", "slip_pass"].includes(previewIntentId) ? openRunner : null;
  const supportTarget = ["play_safe", "hold_wait"].includes(previewIntentId) ? supportPlayer : null;
  const pressureTarget = ["drive_on", "press_ball", "step_in"].includes(previewIntentId) ? pressurePlayer : null;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 11,
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <marker id={`${markerId}-blue`} markerWidth="5" markerHeight="5" refX="4.6" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#38bdf8" />
        </marker>
        <marker id={`${markerId}-gold`} markerWidth="5" markerHeight="5" refX="4.6" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#facc15" />
        </marker>
        <marker id={`${markerId}-orange`} markerWidth="5" markerHeight="5" refX="4.6" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#f97316" />
        </marker>
        <marker id={`${markerId}-red`} markerWidth="5" markerHeight="5" refX="4.6" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#fb7185" />
        </marker>
      </defs>

      {/* Directional moment sections. These sit on the pitch and zoom with the play. */}
      <rect x={Math.min(behindX, ballCarrier.x)} y="0" width={Math.abs(ballCarrier.x - behindX)} height="100" fill="#60a5fa" opacity="0.035" />
      <rect x={Math.min(ballCarrier.x, aheadX)} y="0" width={Math.abs(aheadX - ballCarrier.x)} height="100" fill="#22c55e" opacity="0.04" />
      <line x1={ballCarrier.x} y1="0" x2={ballCarrier.x} y2="100" stroke="rgba(255,255,255,.14)" strokeWidth="0.16" strokeDasharray="1.3 1.1" />
      <text x={behindX} y={sectionY} textAnchor="middle" fill="rgba(147,197,253,0.86)" fontSize="2.35" fontWeight="900" fontFamily="var(--f-disp)" letterSpacing="0.2em">
        DEFENCE BEHIND
      </text>
      <text x={aheadX} y={sectionY} textAnchor="middle" fill="rgba(74,222,128,0.86)" fontSize="2.35" fontWeight="900" fontFamily="var(--f-disp)" letterSpacing="0.2em">
        ATTACK AHEAD
      </text>

      {ownKeeper && (
        <text x={ownKeeper.x} y={clamp(ownKeeper.y + 7, 8, 96)} textAnchor="middle" fill="rgba(147,197,253,0.82)" fontSize="2.1" fontWeight="900" fontFamily="var(--f-disp)" letterSpacing="0.18em">
          GK
        </text>
      )}
      {opponentKeeper && (
        <text x={opponentKeeper.x} y={clamp(opponentKeeper.y + 7, 8, 96)} textAnchor="middle" fill="rgba(74,222,128,0.82)" fontSize="2.1" fontWeight="900" fontFamily="var(--f-disp)" letterSpacing="0.18em">
          GK
        </text>
      )}

      <PlayerRing player={ballCarrier} label="BALL" color="#60a5fa" radius={4.6} />
      <PlayerRing player={pressurePlayer} label="PRESS" color="#fb7185" radius={4.2} dash="0.8 0.7" />
      <PlayerRing player={openRunner} label="WIDE" color="#38bdf8" radius={4.1} />
      <PlayerRing player={supportPlayer} label="SUPPORT" color="#facc15" radius={3.9} />

      {pressurePlayer && (
        <line
          x1={pressurePlayer.x}
          y1={pressurePlayer.y}
          x2={ballCarrier.x}
          y2={ballCarrier.y}
          stroke="#fb7185"
          strokeWidth="0.42"
          strokeDasharray="1.6 1.1"
          opacity="0.78"
          markerEnd={`url(#${markerId}-red)`}
        />
      )}

      {openRunner && (
        <path
          d={`M ${ballCarrier.x} ${ballCarrier.y} Q ${(ballCarrier.x + openRunner.x) / 2} ${Math.min(ballCarrier.y, openRunner.y) - 6} ${openRunner.x} ${openRunner.y}`}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={passTarget ? "0.74" : "0.38"}
          strokeDasharray="1.6 1.1"
          opacity={passTarget ? "0.96" : "0.42"}
          markerEnd={`url(#${markerId}-blue)`}
        />
      )}

      {supportPlayer && (
        <line
          x1={ballCarrier.x}
          y1={ballCarrier.y}
          x2={supportPlayer.x}
          y2={supportPlayer.y}
          stroke="#facc15"
          strokeWidth={supportTarget ? "0.72" : "0.34"}
          strokeDasharray="1.9 1.4"
          opacity={supportTarget ? "0.92" : "0.42"}
          markerEnd={`url(#${markerId}-gold)`}
        />
      )}

      {pressureTarget && (
        <>
          <line
            x1={ballCarrier.x}
            y1={ballCarrier.y}
            x2={clamp(ballCarrier.x + carrierDirection * 9, 4, 96)}
            y2={clamp(ballCarrier.y - 5, 6, 94)}
            stroke="#f97316"
            strokeWidth="0.74"
            opacity="0.88"
            markerEnd={`url(#${markerId}-orange)`}
          />
          <circle cx={(ballCarrier.x + pressurePlayer.x) / 2} cy={(ballCarrier.y + pressurePlayer.y) / 2} r="4.2" fill="none" stroke="#f97316" strokeWidth="0.32" opacity="0.58" strokeDasharray="1.2 0.9" />
        </>
      )}
    </svg>
  );
}
