// ─── gameState.js ─────────────────────────────────────────────────────────────
// State factories, normalisation, and leaderboard helpers.
// Pure JavaScript — no React, no DOM.
//
// Exports:
//   defS()            → default player state object
//   defLB()           → default CPU leaderboard array
//   normalizeState()  → validate + back-fill a raw state object
//   recalcTeamState() → re-derive boost values from squad/starters/formation
//   ranked()          → full leaderboard array sorted by rep, with .rank
//   myRank()          → player's current rank number
//   getTier()         → TIER entry for a given rank number
//   getFormation()    → FORMATIONS entry by id
//   getCard()         → MCARDS entry by id

import {
  CPU_P, MCARDS, FORMATIONS, TIERS,
  ROLE_STAT, SQUAD_LIMIT,
} from "./constants.js";

import { clamp, rand01 } from "./gameLogic.js";

// ─── Lookups ──────────────────────────────────────────────────────────────────

export const getCard      = (id) => MCARDS.find(c => c.id === id) || null;
export const getFormation = (id) => FORMATIONS.find(f => f.id === id) || FORMATIONS[1];
export const getTier      = (r)  => TIERS.find(t => r >= t.min && r <= t.max) || TIERS[4];

export const formatClubName = (name) => {
  const cleaned = String(name || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+F\.?C\.?$/i, "")
    .replace(/\bF\.?C\.?$/i, "")
    .trim();
  const base = cleaned || "ZAP";
  return `${base.toUpperCase()} FC`;
};

// ─── Default factories ────────────────────────────────────────────────────────

/** Return a fresh, empty player state. */
export const defS = () => ({
  wallet:               null,
  onchainRegistered:    false,
  clubName:             "ZAP",
  clubCreated:          false,
  rep:                  50,
  coins:                80,
  wins:                 0,
  losses:               0,
  draws:                0,
  streak:               0,
  total:                0,
  firstWinClaimed:      false,
  streakRewardsClaimed: {},
  roster:               [],
  squad:                [],
  starters:             { defender: null, midfielder: null, striker: null },
  formationId:          "control-433",
  defBoost:             0,
  midBoost:             0,
  atkBoost:             0,
  lastDelta:            0,
  lastPrevRank:         null,
  trainingDone:         false,   // true once training mode completed
  guidedTurnsDismissed: [],      // list of turn numbers where guide was dismissed
});

/** Build the initial CPU leaderboard from seed data. */
export const defLB = () =>
  CPU_P.map((c, i) => ({ id: i, name: c.n, pts: c.p, cpu: true }));

// ─── Team stat recalculation ──────────────────────────────────────────────────

/**
 * Re-derive atkBoost / midBoost / defBoost from the current squad,
 * starters, and formation. Removes invalid starter assignments.
 */
export const recalcTeamState = (state) => {
  const uniq = (list) => [...new Set((list || []).filter(Boolean))];

  const squad    = uniq((state.squad || []).slice(0, SQUAD_LIMIT));
  const starters = {
    defender:   null,
    midfielder: null,
    striker:    null,
    ...(state.starters || {}),
  };

  // Invalidate starters that no longer belong in the squad or wrong role
  for (const slot of Object.keys(starters)) {
    const card = getCard(starters[slot]);
    if (!card || !squad.includes(card.id) || card.role !== slot) {
      starters[slot] = null;
    }
  }

  const formation = getFormation(state.formationId);
  const boosts    = { atk: formation.mods.atk, mid: formation.mods.mid, def: formation.mods.def };

  Object.entries(starters).forEach(([slot, id]) => {
    const card = getCard(id);
    if (card) boosts[ROLE_STAT[slot]] += card.boost;
  });

  // Full XI bonus
  if (Object.values(starters).every(Boolean)) boosts.mid += 1;

  return {
    ...state,
    squad,
    roster:     squad,          // legacy alias
    starters,
    formationId: formation.id,
    atkBoost:   boosts.atk,
    midBoost:   boosts.mid,
    defBoost:   boosts.def,
  };
};

// ─── State normalisation ──────────────────────────────────────────────────────

/**
 * Merge a raw persisted/incoming object against the defaults,
 * then run recalcTeamState to ensure all derived fields are correct.
 * Safe to call with anything — null, partial, or stale saves.
 */
export const normalizeState = (raw) => {
  const base       = { ...defS(), ...(raw || {}) };
  base.clubName = formatClubName(base.clubName);
  if (raw && raw.clubCreated === undefined && base.clubName && base.clubName !== "ZAP") {
    base.clubCreated = true;
  }
  const legacyRostr = Array.isArray(base.roster) ? base.roster.filter(Boolean) : [];
  const squad      = [...new Set([...(base.squad || []), ...legacyRostr])].slice(0, SQUAD_LIMIT);

  const starters   = { ...defS().starters, ...(base.starters || {}) };
  ["defender","midfielder","striker"].forEach(slot => {
    const card = getCard(starters[slot]);
    if (!card || card.role !== slot || !squad.includes(card.id)) {
      starters[slot] = squad.find(id => getCard(id)?.role === slot) || null;
    }
  });

  if (base.coins === undefined) base.coins = 80;

  return recalcTeamState({ ...base, squad, starters });
};

// ─── Leaderboard helpers ──────────────────────────────────────────────────────

/** Merge CPU entries with the player, sort by rep, add .rank. */
export const ranked = (S, LB) => {
  const all = [
    ...LB,
    { id: -1, name: S.clubName || "YOU", pts: S.rep, cpu: false },
  ];
  all.sort((a, b) => b.pts - a.pts);
  return all.map((p, i) => ({ ...p, rank: i + 1 }));
};

/** Return the player's current rank number. */
export const myRank = (S, LB) =>
  ranked(S, LB).find(p => !p.cpu)?.rank || 50;

// ─── In-game stat generation ──────────────────────────────────────────────────

/**
 * Create the initial stats block for a new match, factoring in player boosts
 * and scaling CPU difficulty with rep tier.
 */
export const mkMatchStats = (S) => {
  const repTier = clamp(Math.floor((S.rep || 50) / 60), 0, 3);
  const cpuBase = 4 + repTier;

  return {
    atk:     Math.floor(rand01() * 5) + 5 + (S.atkBoost || 0),
    mid:     Math.floor(rand01() * 5) + 4 + (S.midBoost || 0),
    def:     Math.floor(rand01() * 5) + 4 + (S.defBoost || 0),
    cpu_atk: Math.floor(rand01() * 4) + cpuBase,
    cpu_mid: Math.floor(rand01() * 4) + cpuBase,
    cpu_def: Math.floor(rand01() * 4) + cpuBase,
  };
};

/** Active phase stat key for the player. */
export const getPhaseStatKey = (gs) =>
  gs === "ATTACK" ? "atk" : gs === "MIDFIELD" ? "mid" : "def";
