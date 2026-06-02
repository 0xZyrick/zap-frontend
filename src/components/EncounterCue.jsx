import React from 'react';

export default function EncounterCue({ context, gameState }) {
  const { openPlayers = [], pressurePlayers = [] } = context || {};
  
  // Analyze the situation
  let cue = "";
  
  if (gameState === "ATTACK") {
    if (pressurePlayers?.length > 0) {
      const hasOpen = openPlayers?.length > 0;
      cue = hasOpen 
        ? "Pressure is coming. The wide side is opening."
        : "Pressure is coming. Move the ball quickly.";
    } else {
      const hasOpen = openPlayers?.length > 0;
      cue = hasOpen
        ? "You have space. A teammate is opening wide."
        : "You have room to move. Scan the field.";
    }
  } else if (gameState === "DEFEND") {
    cue = "Mark your player. Close down the space.";
  }
  
  return (
    <div style={{
      position: "absolute",
      top: "60px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0, 0, 0, 0.5)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      padding: "12px 20px",
      borderRadius: "8px",
      color: "#fff",
      fontFamily: "var(--f-body, sans-serif)",
      fontSize: "13px",
      fontWeight: 500,
      letterSpacing: "0.5px",
      maxWidth: "400px",
      textAlign: "center",
      animation: "fadeInUp 0.4s ease",
      backdropFilter: "blur(4px)",
      zIndex: 20,
    }}>
      {cue}
    </div>
  );
}
