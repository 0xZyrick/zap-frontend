const idlePng = "/assets/players/player_idle.png";
const attackPng = "/assets/players/player_attack.png";
const defensePng = "/assets/players/player_defend.png";

export const PLAYER_ANIMATION_STATE = {
  IDLE: "idle",
  RUNNING: "running",
  DEFENSE: "defense",
  GK_READY: "gk-ready",
  GK_DIVE: "gk-dive",
};

export const PLAYER_ASSETS = {
  player: {
    [PLAYER_ANIMATION_STATE.IDLE]: idlePng,
    [PLAYER_ANIMATION_STATE.RUNNING]: attackPng,
    [PLAYER_ANIMATION_STATE.DEFENSE]: defensePng,
    [PLAYER_ANIMATION_STATE.GK_READY]: "/assets/players/player_gk_ready.png",
    [PLAYER_ANIMATION_STATE.GK_DIVE]: "/assets/players/player_gk_dive.png",
  },
  opponent: {
    [PLAYER_ANIMATION_STATE.IDLE]: "/assets/players/opponent_idle.png",
    [PLAYER_ANIMATION_STATE.RUNNING]: "/assets/players/opponent_attack.png",
    [PLAYER_ANIMATION_STATE.DEFENSE]: "/assets/players/opponent_defend.png",
    [PLAYER_ANIMATION_STATE.GK_READY]: "/assets/players/opponent_gk_ready.png",
    [PLAYER_ANIMATION_STATE.GK_DIVE]: "/assets/players/opponent_gk_dive.png",
  },
};

export const PLAYER_ASSET_FALLBACKS = {
  [PLAYER_ANIMATION_STATE.IDLE]: idlePng,
  [PLAYER_ANIMATION_STATE.RUNNING]: attackPng,
  [PLAYER_ANIMATION_STATE.DEFENSE]: defensePng,
  [PLAYER_ANIMATION_STATE.GK_READY]: defensePng,
  [PLAYER_ANIMATION_STATE.GK_DIVE]: attackPng,
};
