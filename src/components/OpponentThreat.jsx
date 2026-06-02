import React from 'react';

export default function OpponentThreat({ context, gameState }) {
  const { pressurePlayers = [] } = context || {};
  
  let threat = "";
  let threatType = "default";
  
  if (gameState === "ATTACK") {
    if (pressurePlayers?.length > 0) {
      threat = "Opponent tendency: Press inside. They want to trap the ball carrier.";
      threatType = "press";
    } else {
      threat = "Opponent is holding shape. Stay alert for counter-press.";
      threatType = "hold";
    }
  } else if (gameState === "DEFEND") {
    threat = "Opponent is looking to break forward. Mark tight.";
    threatType = "breakaway";
  }
  
  const threatColor = threatType === "press" 
    ? "rgba(239, 68, 68, 0.7)"
    : threatType === "breakaway"
      ? "rgba(251, 146, 60, 0.7)"
      : "rgba(100, 116, 139, 0.5)";
  
  return (
    <div style={{
      position: "absolute",
      bottom: "100px",
      right: "20px",
      background: threatColor,
      border: "1px solid rgba(255, 255, 255, 0.15)",
      padding: "12px 16px",
      borderRadius: "8px",
      color: "#fff",
      fontFamily: "var(--f-body, sans-serif)",
      fontSize: "12px",
      fontWeight: 500,
      maxWidth: "220px",
      animation: "slideInRight 0.4s ease",
      backdropFilter: "blur(4px)",
      zIndex: 19,
      lineHeight: 1.4,
    }}>
      {threat}
    </div>
  );
}
