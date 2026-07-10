// ─── gameLogic.js ─────────────────────────────────────────────────────────────
// Pure JavaScript. No React, no DOM. Import anywhere.

import {
  ACTION_MODS, CPU_ACTIONS, MATCHUP_MODS, MATCHUP_NARR,
  TRANS, COMM, SITS, RW, CW, INTENTS, OPPONENT_INTENTS, TURN_SITUATIONS, SCENES,
  CUE_FEEDBACK, FORMATION_INTENTS, CUE_LABELS, getOpponentProfile, getPlayerPose,
} from "./constants.js";

// ─── Core randomness ──────────────────────────────────────────────────────────
export const rand01 = () => {
  if (globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
  }
  const v = Math.sin(Date.now() * 999.91 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ─── Weighted random pick ─────────────────────────────────────────────────────
// Pick from array using a weights object { id: probability }
const weightedPick = (options, weights) => {
  if (!weights || !options.length) return options[Math.floor(rand01() * options.length)];
  let total = 0;
  const roll = rand01();
  for (const opt of options) {
    total += (weights[opt.id] || 0);
    if (roll <= total) return opt;
  }
  return options[options.length - 1];
};

// ─── Cue-aware feedback ───────────────────────────────────────────────────────
// Returns a precise, situation-specific verdict line for the resolution screen.
export const getCueFeedback = (intentId, activeCueIds = [], ok = true) => {
  void activeCueIds;
  const map = CUE_FEEDBACK[intentId];
  if (!map) return ok ? "Read it right." : "Wrong read.";
  return ok ? (map.default_win || "Read it right.") : (map.default_lose || "Wrong read.");
};

// ─── Formation intent resolver ────────────────────────────────────────────────
// Returns the intent IDs available for this formation + phase combo.
// Falls back to the situation's own availableIntents if no override found.
export const getFormationIntents = (formationId, gs, situationIntents) => {
  const map = FORMATION_INTENTS[formationId];
  if (!map || !map[gs]) return situationIntents;
  // Intersect formation intents with what this situation supports; fall back to
  // formation list if there's no overlap (shouldn't happen in practice)
  const situationSet = new Set(situationIntents);
  const filtered = map[gs].filter(id => situationSet.has(id));
  return filtered.length >= 2 ? filtered : map[gs];
};

const CANONICAL_READS = {
  MIDFIELD: {
    player: ["drive_on", "go_wide", "go_long"],
    opponent: ["drop_off", "press_middle", "cover_wide"],
    matrix: {
      drive_on: { beats: "drop_off", losesTo: "press_middle" },
      go_wide: { beats: "press_middle", losesTo: "cover_wide" },
      go_long: { beats: "cover_wide", losesTo: "drop_off" },
    },
  },
  ATTACK: {
    player: ["slip_pass", "finish", "hold_wait"],
    opponent: ["hold_shape", "step_up", "block_shot"],
    matrix: {
      slip_pass: { beats: "hold_shape", losesTo: "step_up" },
      finish: { beats: "step_up", losesTo: "block_shot" },
      hold_wait: { beats: "step_up", losesTo: "hold_shape" },
    },
  },
  DEFEND: {
    player: ["hold_line", "step_in", "press_ball"],
    opponent: ["slip_pass", "finish", "hold_wait"],
    matrix: {
      hold_line: { beats: "hold_wait", losesTo: "slip_pass" },
      step_in: { beats: "slip_pass", losesTo: "hold_wait" },
      press_ball: { beats: "finish", losesTo: "slip_pass" },
    },
  },
};

const MIDFIELD_DEFENCE_READS = {
  player: ["press_middle", "cover_wide", "drop_off"],
  opponent: ["drive_on", "go_wide", "go_long"],
  matrix: {
    press_middle: { beats: "drive_on", losesTo: "go_wide" },
    cover_wide: { beats: "go_long", losesTo: "go_wide" },
    drop_off: { beats: "go_wide", losesTo: "go_long" },
  },
};

const swapPlayerId = (id) => {
  const map = {
    h_gk:"a_gk", h_lb:"a_lb", h_cb1:"a_cb1", h_cb2:"a_cb2", h_rb:"a_rb",
    h_dm:"a_dm", h_cm:"a_cm", h_am:"a_cm", h_lw:"a_lm", h_rw:"a_rm", h_st:"a_st1",
    a_gk:"h_gk", a_lb:"h_lb", a_cb1:"h_cb1", a_cb2:"h_cb2", a_rb:"h_rb",
    a_dm:"h_dm", a_cm:"h_cm", a_lm:"h_lw", a_rm:"h_rw", a_st1:"h_st", a_st2:"h_st", a_st:"h_st",
  };
  return map[id] || id;
};

const swapIds = (ids = []) => ids.map(swapPlayerId);

const opponentMidfieldSituation = (situation) => ({
  ...situation,
  id: `${situation.id}_opponent`,
  title: "Defend Midfield",
  summary: "They restart through midfield. Stop the move before it becomes a full attack.",
  ballCarrierId: swapPlayerId(situation.ballCarrierId),
  activePlayerIds: swapIds(situation.activePlayerIds),
  supportOptionIds: swapIds(situation.supportOptionIds),
  pressurePlayerIds: swapIds(situation.pressurePlayerIds),
  openPlayerIds: swapIds(situation.openPlayerIds),
  routePreview: situation.routePreview
    ? {
        ...situation.routePreview,
        from: swapPlayerId(situation.routePreview.from),
        to: swapPlayerId(situation.routePreview.to),
        label: "opponent move",
      }
    : null,
});

// ─── Player layout ────────────────────────────────────────────────────────────
const PHASE_PLAYER_LAYOUTS = {
  MIDFIELD: {
    home: [
      { id:"h_gk",  role:"GK", x:7,  y:50 }, { id:"h_lb",  role:"LB", x:22, y:25 },
      { id:"h_cb1", role:"CB", x:22, y:42 }, { id:"h_cb2", role:"CB", x:22, y:58 },
      { id:"h_rb",  role:"RB", x:22, y:75 }, { id:"h_dm",  role:"DM", x:38, y:58 },
      { id:"h_cm",  role:"CM", x:45, y:48 }, { id:"h_am",  role:"AM", x:56, y:40 },
      { id:"h_lw",  role:"LW", x:56, y:23 }, { id:"h_rw",  role:"RW", x:70, y:73 },
      { id:"h_st",  role:"ST", x:70, y:50 },
    ],
    away: [
      { id:"a_gk",  role:"GK", x:94, y:50 }, { id:"a_lb",  role:"LB", x:78, y:76 },
      { id:"a_cb1", role:"CB", x:79, y:42 }, { id:"a_cb2", role:"CB", x:79, y:58 },
      { id:"a_rb",  role:"RB", x:78, y:24 }, { id:"a_dm",  role:"DM", x:63, y:53 },
      { id:"a_cm",  role:"CM", x:57, y:45 }, { id:"a_lm",  role:"LM", x:61, y:30 },
      { id:"a_rm",  role:"RM", x:62, y:70 }, { id:"a_st1", role:"ST", x:50, y:38 },
      { id:"a_st2", role:"ST", x:50, y:62 },
    ],
  },
  ATTACK: {
    home: [
      { id:"h_gk",  role:"GK", x:7,  y:50 }, { id:"h_lb",  role:"LB", x:34, y:22 },
      { id:"h_cb1", role:"CB", x:30, y:42 }, { id:"h_cb2", role:"CB", x:30, y:58 },
      { id:"h_rb",  role:"RB", x:38, y:78 }, { id:"h_dm",  role:"DM", x:52, y:58 },
      { id:"h_cm",  role:"CM", x:60, y:43 }, { id:"h_am",  role:"AM", x:70, y:50 },
      { id:"h_lw",  role:"LW", x:76, y:24 }, { id:"h_rw",  role:"RW", x:78, y:70 },
      { id:"h_st",  role:"ST", x:84, y:50 },
    ],
    away: [
      { id:"a_gk",  role:"GK", x:94, y:50 }, { id:"a_lb",  role:"LB", x:83, y:73 },
      { id:"a_cb1", role:"CB", x:84, y:43 }, { id:"a_cb2", role:"CB", x:84, y:58 },
      { id:"a_rb",  role:"RB", x:83, y:28 }, { id:"a_dm",  role:"DM", x:75, y:52 },
      { id:"a_cm",  role:"CM", x:70, y:38 }, { id:"a_lm",  role:"LM", x:72, y:68 },
      { id:"a_rm",  role:"RM", x:67, y:28 }, { id:"a_st1", role:"ST", x:58, y:44 },
      { id:"a_st2", role:"ST", x:58, y:60 },
    ],
  },
  DEFEND: {
    home: [
      { id:"h_gk",  role:"GK", x:7,  y:50 }, { id:"h_lb",  role:"LB", x:18, y:25 },
      { id:"h_cb1", role:"CB", x:20, y:42 }, { id:"h_cb2", role:"CB", x:20, y:58 },
      { id:"h_rb",  role:"RB", x:18, y:75 }, { id:"h_dm",  role:"DM", x:32, y:52 },
      { id:"h_cm",  role:"CM", x:39, y:40 }, { id:"h_am",  role:"AM", x:45, y:60 },
      { id:"h_lw",  role:"LW", x:52, y:26 }, { id:"h_rw",  role:"RW", x:52, y:73 },
      { id:"h_st",  role:"ST", x:57, y:50 },
    ],
    away: [
      { id:"a_gk",  role:"GK", x:94, y:50 }, { id:"a_lb",  role:"LB", x:64, y:73 },
      { id:"a_cb1", role:"CB", x:62, y:42 }, { id:"a_cb2", role:"CB", x:62, y:58 },
      { id:"a_rb",  role:"RB", x:64, y:25 }, { id:"a_dm",  role:"DM", x:53, y:52 },
      { id:"a_cm",  role:"CM", x:48, y:46 }, { id:"a_lm",  role:"LM", x:51, y:70 },
      { id:"a_rm",  role:"RM", x:51, y:30 }, { id:"a_st1", role:"ST", x:38, y:40 },
      { id:"a_st2", role:"ST", x:43, y:56 },
    ],
  },
};

const cueIdOf = (cue) => (typeof cue === "string" ? cue : cue?.id);

const cueIds = (situation) => new Set((situation?.cues || []).map(cueIdOf).filter(Boolean));

const normalizeCueLabel = (cue) => {
  if (!cue) return cue;
  const id = cueIdOf(cue);
  const rawLabel = typeof cue === "string" ? "" : cue.label;
  const pressureAsFoul = id === "pressure_on" && /foul/i.test(rawLabel || "");
  const label = pressureAsFoul ? CUE_LABELS.foul_risk : (CUE_LABELS[id] || rawLabel || id);
  return typeof cue === "string" ? { id, label } : { ...cue, id, label };
};

const buildScenePositions = (players, situation) => {
  // Only ever use positions EXPLICITLY attached to this exact situation
  // (situation.positions). The old fallback matched SCENES[phase][sceneIndex % length]
  // purely by array-index arithmetic -- coincidental, not a real reference -- so a
  // hand-authored "2v1 overload" layout could silently end up attached to a totally
  // different situation the moment either array's length or order changed.
  //
  // Removing that fallback means the cue-driven logic below (pressure/open/insideTight/
  // longChannel/spaceBehind/dangerRun) is now the single source of truth for position,
  // for every situation, every time. Keep SCENES only for genuinely one-off moments
  // (e.g. a scripted set piece) by setting situation.positions directly on that
  // situation's own object -- never through sceneIndex.
  if (situation?.positions) return situation.positions;
  return null;
};

const withSituationAdjustments = (players, situation, phase = "MIDFIELD") => {
  const cues = cueIds(situation);
  const ballBase = players.find(p => p.id === situation.ballCarrierId) || null;
  const pressureIds = new Set(situation.pressurePlayerIds || []);
  const openIds = new Set(situation.openPlayerIds || []);
  const activeIds = new Set(situation.activePlayerIds || []);
  const homeCarrier = ballBase?.id?.startsWith("h_") ?? true;
  const forward = homeCarrier ? 1 : -1;
  const carrier = ballBase || { x: 50, y: 50 };
  const pressureList = players.filter(p => pressureIds.has(p.id));
  const openList = players.filter(p => openIds.has(p.id));
  const hasInsideTight = cues.has("inside_tight");
  const hasLongChannel = cues.has("long_lane");
  const hasDangerRun = cues.has("danger_run");
  const hasSpaceBehind = cues.has("space_behind");
  const hasBoxCrowded = cues.has("box_crowded");
  const hasRunnerFree = cues.has("runner_free");
  const hasShotClosing = cues.has("shot_closing");
  const authoredPositions = buildScenePositions(players, situation);

  const clampPt = (x, y) => ({
    x: clamp(x, 4, 96),
    y: clamp(y, 7, 93),
  });

  const adjust = (p) => {
    let x = p.x;
    let y = p.y;
    let angle = p.angle || 0;
    let runDir = p.runDir || 0;
    const home = p.id.startsWith("h_");

    if (pressureIds.has(p.id) && carrier) {
      const pressureIndex = pressureList.findIndex(pp => pp.id === p.id);
      const side = pressureIndex % 2 === 0 ? -1 : 1;
      const pt = clampPt(carrier.x - forward * (4.8 + pressureIndex * 2.2), carrier.y + side * (5.5 + pressureIndex * 1.8));
      x = pt.x; y = pt.y;
      angle = home ? 8 : -8;
    }

    if (openIds.has(p.id) && carrier) {
      const openIndex = openList.findIndex(pp => pp.id === p.id);
      const flankBias = p.role === "LW" || p.role === "LM" ? -18 : p.role === "RW" || p.role === "RM" ? 18 : openIndex % 2 ? 13 : -13;
      const push = hasDangerRun ? 20
        : hasLongChannel ? 23
        : hasRunnerFree ? 22
        : hasShotClosing ? 12
        : 16;
      const pt = clampPt(carrier.x + forward * push, carrier.y + flankBias);
      x = pt.x; y = pt.y;
      angle = home ? -5 : 5;
      runDir = forward;
    }

    if (hasInsideTight && !home && ["DM", "CM", "CB", "LM", "RM", "ST"].includes(p.role)) {
      const cluster = {
        DM: [59, 49],
        CM: [56, 45],
        CB: p.id.endsWith("1") ? [63, 42] : [63, 58],
        LM: [60, 38],
        RM: [60, 62],
        ST: p.id.endsWith("1") ? [52, 43] : [52, 57],
      }[p.role];
      if (cluster && Math.abs(p.x - carrier.x) < 30) {
        x = cluster[0];
        y = cluster[1];
      }
    }

    // box_crowded: the ATTACK-phase counterpart to inside_tight. Pulls the away
    // side's defenders into a tight knot in front of their own goal, instead of
    // their normal spread-out defensive shape -- visualizing "the box is packed"
    // the same way inside_tight visualizes "the middle is packed".
    if (hasBoxCrowded && !home && ["CB", "LB", "RB", "DM", "CM"].includes(p.role)) {
      const cluster = {
        CB: p.id.endsWith("1") ? [87, 44] : [87, 56],
        LB: [88, 62],
        RB: [88, 38],
        DM: [85, 50],
        CM: [83, 46],
      }[p.role];
      if (cluster) {
        x = cluster[0];
        y = cluster[1];
      }
    }

    if (hasLongChannel) {
      if (p.id === "h_st" || openIds.has(p.id)) {
        const pt = clampPt(Math.max(x, carrier.x + 24), p.role === "ST" ? 47 : y);
        x = pt.x; y = pt.y; runDir = 1; angle = -4;
      }
      if (!home && ["CB", "LB", "RB"].includes(p.role)) {
        x = Math.min(x, 70);
      }
    }

    if (hasSpaceBehind && situation.phase !== "ATTACK") {
      if (home && ["CB", "LB", "RB"].includes(p.role)) x = Math.max(x, 24);
      if (home && p.role === "GK") x = Math.min(x, 8);
      if (!home && openIds.has(p.id)) {
        const pt = clampPt(Math.min(x, 36), y);
        x = pt.x; y = pt.y; runDir = -1; angle = 6;
      }
    }

    if (hasDangerRun && !home && (activeIds.has(p.id) || openIds.has(p.id))) {
      runDir = -1;
      angle = 7;
    }

    if (phase === "MIDFIELD" && homeCarrier && home && p.id !== situation.ballCarrierId && !authoredPositions?.[p.id]) {
      const wideSide = situation.openSide === "left" ? -1 : 1;
      if (p.role === "ST") {
        const pt = clampPt(carrier.x + 28, carrier.y - 7);
        x = pt.x; y = pt.y; runDir = 1; angle = -4;
      } else if (["RW", "LW", "RB", "LB", "RM", "LM"].includes(p.role)) {
        const pt = clampPt(carrier.x + 20, wideSide > 0 ? 78 : 22);
        x = pt.x; y = pt.y; runDir = 1; angle = wideSide > 0 ? -5 : 5;
      } else if (["AM", "CM", "DM"].includes(p.role)) {
        const pt = clampPt(carrier.x + 13, carrier.y + (carrier.y > 52 ? -10 : 10));
        x = pt.x; y = pt.y;
      }
    }

    if (authoredPositions?.[p.id]) {
      const pos = authoredPositions[p.id];
      x = pos.x ?? x;
      y = pos.y ?? y;
      angle = pos.angle ?? angle;
      runDir = pos.runDir ?? runDir;
    }

    return { ...p, x, y, angle, runDir };
  };

  const ids = {
    active:   new Set(situation.activePlayerIds   || []),
    support:  new Set(situation.supportOptionIds  || []),
    pressure: new Set(situation.pressurePlayerIds || []),
    open:     new Set(situation.openPlayerIds     || []),
  };
  return players.map(adjust).map((p) => {
    const home  = p.id.startsWith("h_");
    const isBall = p.id === situation.ballCarrierId;
    const tags  = [];
    if (ids.active.has(p.id))   tags.push("active");
    if (ids.support.has(p.id))  tags.push("support");
    if (ids.pressure.has(p.id)) tags.push("pressure");
    if (ids.open.has(p.id))     tags.push("open");
    return {
      ...p,
      t: home ? "h" : "a",
      r: home ? (isBall ? "Y" : "m") : "o",
      hB: isBall,
      tags,
      emphasis: isBall || ids.active.has(p.id) || ids.support.has(p.id) || ids.pressure.has(p.id) || ids.open.has(p.id) ? "focus" : "dim",
      pose: authoredPositions?.[p.id]?.pose || getPlayerPose(p, situation, situation?.phase || phase),
      enterFrom: p.id.startsWith("h_") ? { x: -6, y:p.y } : { x: 106, y:p.y },
    };
  });
};

const firstBy = (players, predicate) => players.find(predicate) || null;

const firstHomeByRole = (players, roles, side = null) => {
  const sideOk = (p) => {
    if (side === "right") return p.y >= 52;
    if (side === "left") return p.y <= 48;
    return true;
  };
  for (const role of roles) {
    const match = firstBy(players, p => p.t === "h" && p.role === role && sideOk(p)) ||
      firstBy(players, p => p.id?.startsWith("h_") && p.role === role && sideOk(p));
    if (match) return match;
  }
  for (const role of roles) {
    const match = firstBy(players, p => p.t === "h" && p.role === role) ||
      firstBy(players, p => p.id?.startsWith("h_") && p.role === role);
    if (match) return match;
  }
  return null;
};

const firstAwayByRole = (players, roles, side = null) => {
  const sideOk = (p) => {
    if (side === "right") return p.y >= 52;
    if (side === "left") return p.y <= 48;
    return true;
  };
  for (const role of roles) {
    const match = firstBy(players, p => p.t === "a" && p.role === role && sideOk(p)) ||
      firstBy(players, p => p.id?.startsWith("a_") && p.role === role && sideOk(p));
    if (match) return match;
  }
  for (const role of roles) {
    const match = firstBy(players, p => p.t === "a" && p.role === role) ||
      firstBy(players, p => p.id?.startsWith("a_") && p.role === role);
    if (match) return match;
  }
  return null;
};

const getReadOptionIds = (players, situation, gs) => {
  const ids = [];
  const add = (playerOrId) => {
    const id = typeof playerOrId === "string" ? playerOrId : playerOrId?.id;
    if (id && !ids.includes(id)) ids.push(id);
  };
  const byId = (id) => findById(players, id);
  const idsToPlayers = (list = []) => list.map(byId).filter(Boolean);
  const side = situation.openSide === "left" || situation.openSide === "right" ? situation.openSide : null;

  add(situation.ballCarrierId);

  if (gs === "MIDFIELD") {
    const offBallHome = players.filter(p => p.id !== situation.ballCarrierId);
    for (const p of idsToPlayers(situation.pressurePlayerIds)) add(p);
    add(firstAwayByRole(players, ["CM", "DM", "RM", "LM"]));
    add(firstHomeByRole(offBallHome, ["RW", "LW", "RB", "LB", "RM", "LM"], side));
    add(firstHomeByRole(players, ["ST"]));
    add(firstHomeByRole(offBallHome, ["AM", "CM", "DM"]));
    return ids;
  }

  if (gs === "ATTACK") {
    add(idsToPlayers(situation.openPlayerIds).find(p => p.id?.startsWith("h_")));
    add(firstAwayByRole(players, ["CB", "LB", "RB", "DM"]));
    for (const p of idsToPlayers(situation.pressurePlayerIds)) add(p);
    add(idsToPlayers(situation.supportOptionIds).find(p => p.id?.startsWith("h_")));
    add(firstAwayByRole(players, ["CB", "DM", "RB", "LB"]));
    add(firstBy(players, p => p.id === "a_gk"));
    return ids;
  }

  if (gs === "DEFEND") {
    add(firstBy(players, p => p.id === "h_gk"));
    add(idsToPlayers(situation.openPlayerIds).find(p => p.id?.startsWith("a_")));
    add(firstAwayByRole(players, ["ST", "RW", "LW", "AM"]));
    add(idsToPlayers(situation.pressurePlayerIds).find(p => p.id?.startsWith("h_")));
    add(idsToPlayers(situation.supportOptionIds).find(p => p.id?.startsWith("h_")));
    add(firstHomeByRole(players, ["CB", "DM", "RB", "LB"]));
  }

  return ids;
};

const limitVisiblePlayers = (players, situation, gs) => {
  const readOptionIds = getReadOptionIds(players, situation, gs);
  const explicit = situation.visiblePlayerIds?.length ? new Set(situation.visiblePlayerIds) : null;
  if (explicit) {
    const orderedExplicit = [...readOptionIds, ...(situation.visiblePlayerIds || [])];
    const seenExplicit = new Set();
    return orderedExplicit
      .filter(id => {
        if (!id || seenExplicit.has(id)) return false;
        if (!explicit.has(id) && !readOptionIds.includes(id)) return false;
        seenExplicit.add(id);
        return true;
      })
      .map(id => findById(players, id))
      .filter(Boolean)
      .slice(0, 7);
  }

  const routeIds = [situation.routePreview?.from, situation.routePreview?.to].filter(Boolean);
  const priorityGroups = [
    [situation.ballCarrierId],
    situation.pressurePlayerIds || [],
    readOptionIds,
    routeIds,
    situation.openPlayerIds || [],
    situation.supportOptionIds || [],
    situation.activePlayerIds || [],
    gs === "ATTACK" ? ["a_gk"] : gs === "DEFEND" ? ["h_gk"] : [],
  ];

  const orderedIds = [];
  const seen = new Set();
  for (const group of priorityGroups) {
    for (const id of group) {
      if (id && !seen.has(id)) {
        seen.add(id);
        orderedIds.push(id);
      }
    }
  }

  const byId = new Map(players.map(p => [p.id, p]));
  const visible = orderedIds.map(id => byId.get(id)).filter(Boolean);
  const visibleIds = new Set(visible.map(p => p.id));
  const rolePriority = gs === "ATTACK"
    ? ["CB", "DM", "LB", "RB", "CM"]
    : gs === "DEFEND"
      ? ["ST", "RW", "LW", "AM", "CM"]
      : ["CM", "DM", "RM", "LM", "ST"];
  const roleRank = (role) => {
    const rank = rolePriority.indexOf(role);
    return rank === -1 ? rolePriority.length : rank;
  };
  const awayOutfield = players
    .filter(p => p.t === "a" && p.role !== "GK" && !visibleIds.has(p.id))
    .sort((a, b) => roleRank(a.role) - roleRank(b.role));

  for (const p of awayOutfield) {
    const count = visible.filter(v => v.t === "a" && v.role !== "GK").length;
    if (count >= 2 || visible.length >= 7) break;
    visible.push(p);
    visibleIds.add(p.id);
  }

  return visible.slice(0, 7);
};

const findById = (players, id) => players.find(p => p.id === id) || null;

const makeRoute = (players, routePreview) => {
  if (!routePreview?.from || !routePreview?.to) return null;
  const from = findById(players, routePreview.from);
  const to   = findById(players, routePreview.to);
  if (!from || !to) return null;
  return {
    ...routePreview,
    from: { id: from.id, x: from.x, y: from.y },
    to:   { id: to.id,   x: to.x,   y: to.y   },
  };
};

// ─── buildTurnContext ─────────────────────────────────────────────────────────
// Now accepts formationId so intent list reflects tactical choice
export const buildTurnContext = (gs = "MIDFIELD", si = 0, stats = {}, formationId = null, flow = {}) => {
  const pool      = TURN_SITUATIONS[gs] || TURN_SITUATIONS.MIDFIELD;
  const baseSituation = pool[si % pool.length] || pool[0];
  const midfieldSide = gs === "MIDFIELD" ? (flow?.midfieldSide || "home") : null;
  const situation = gs === "MIDFIELD" && midfieldSide === "away"
    ? opponentMidfieldSituation(baseSituation)
    : baseSituation;
  const layout    = PHASE_PLAYER_LAYOUTS[gs] || PHASE_PLAYER_LAYOUTS.MIDFIELD;
  const allPlayers = withSituationAdjustments([...(layout.home || []), ...(layout.away || [])], situation, gs, si);
  const carrier   = findById(allPlayers, situation.ballCarrierId) || allPlayers.find(p => p.hB) || allPlayers[0];
  const route     = makeRoute(allPlayers, situation.routePreview);
  const players   = limitVisiblePlayers(allPlayers, situation, gs);

  const canonical = gs === "MIDFIELD" && midfieldSide === "away"
    ? MIDFIELD_DEFENCE_READS
    : (CANONICAL_READS[gs] || CANONICAL_READS.MIDFIELD);
  const availableIntents = canonical.player;
  const opponentIntents = canonical.opponent;
  const canonicalSituation = {
    ...situation,
    availableIntents,
    opponentBias: opponentIntents,
    readMatrix: canonical.matrix,
  };

  return {
    id: `${gs}-${midfieldSide || "phase"}-${si}-${situation.id}`,
    gs,
    phase: gs,
    midfieldSide,
    si,
    stats,
    formationId,
    title:       situation.title,
    summary:     situation.summary,
    situation: canonicalSituation,
    ballZone:    situation.ballZone,
    ballCarrierId: carrier?.id,
    pressure:    situation.pressure,
    openSide:    situation.openSide,
    insideCrowded: !!situation.insideCrowded,
    cues:        (situation.cues || []).map(normalizeCueLabel),
    cueIds:      Array.from(cueIds(situation)),
    players,
    ball:        carrier ? { x: carrier.x, y: carrier.y } : { x: 50, y: 50 },
    activePlayerIds:  situation.activePlayerIds  || [],
    supportOptions:   situation.supportOptionIds || [],
    pressurePlayers:  situation.pressurePlayerIds || [],
    openPlayers:      situation.openPlayerIds    || [],
    crowdedZone:      situation.crowdedZone      || null,
    routes:           route ? [route] : [],
    availableIntents: availableIntents.length ? availableIntents : (INTENTS[gs] || []).map(i => i.id),
    opponentIntents:  opponentIntents.length  ? opponentIntents  : (OPPONENT_INTENTS[gs] || []).map(i => i.id),
  };
};

const intentByIdOrIndex = (gs, intent) => {
  const list = INTENTS[gs] || INTENTS.MIDFIELD;
  if (typeof intent === "number") return list[intent] || list[0];
  return list.find(i => i.id === intent) || list[0];
};

export const getIntentRoute = (gs = "MIDFIELD", context = {}, intentId = null) => {
  if (!context?.players?.length) return null;

  const players = context.players || [];
  const carrier = findById(players, context.ballCarrierId) || players.find(p => p.hB) || players[0];
  if (!carrier) return null;

  const byId      = (id) => findById(players, id);
  const firstHome = (ids = []) => ids.map(byId).find(p => p?.t === "h") || ids.map(byId).find(Boolean) || null;
  const clampPt   = (pt) => ({ x: clamp(pt.x, 3, 97), y: clamp(pt.y, 6, 94) });
  const id        = intentId || context.availableIntents?.[0] || "default";
  const baseRoute = context.routes?.[0];
  const open      = firstHome(context.openPlayers);
  const support   = firstHome(context.supportOptions);
  const pressure  = firstHome(context.pressurePlayers);
  const side      = context.openSide === "left" || context.openSide === "right" ? context.openSide : null;
  const offBallHomePlayers = players.filter(p => p.id !== carrier.id);
  const wide      = firstHomeByRole(offBallHomePlayers, ["RW", "LW", "RB", "LB", "RM", "LM"], side);
  const long      = firstHomeByRole(players, ["ST"]) || firstHomeByRole(players, ["LW", "RW"], side);
  const central   = firstHomeByRole(offBallHomePlayers, ["AM", "CM", "DM"]);

  if (gs === "MIDFIELD") {
    if (id === "go_wide")      return { kind:"pass",   color:"#38bdf8", dash:"1.4 1.15", from:carrier, to:wide || open || support || baseRoute?.to };
    if (id === "play_through") return { kind:"pass",   color:"#34d399", dash:"1.4 1.15", from:carrier, to:central || support || baseRoute?.to };
    if (id === "drive_on")     return { kind:"carry",  color:"#f97316", dash:"none",     from:carrier, to:clampPt({ x: carrier.x + 15, y: carrier.y - 5 }) };
    if (id === "play_safe")    return { kind:"reset",  color:"#facc15", dash:"2 1.6",    from:carrier, to:support || clampPt({ x: carrier.x - 13, y: carrier.y + 8 }) };
    if (id === "go_long")      return { kind:"direct", color:"#f59e0b", dash:"2.4 1.2",  from:carrier, to:long || clampPt({ x: carrier.x + 28, y: carrier.y - 10 }) };
    if (id === "press_middle") return { kind:"press",  color:"#ef4444", dash:"none",     from:pressure || support || clampPt({ x: carrier.x + 8, y: carrier.y }), to:carrier };
    if (id === "cover_wide")   return { kind:"cover",  color:"#f59e0b", dash:"2 1.2",    from:support || pressure || clampPt({ x: carrier.x + 10, y: carrier.y + 10 }), to:open || baseRoute?.to || carrier };
    if (id === "drop_off")     return { kind:"hold",   color:"#94a3b8", dash:"3 2",      from:support || pressure || carrier, to:clampPt({ x: carrier.x - 14, y: carrier.y }) };
  }

  if (gs === "ATTACK") {
    if (id === "finish" || id === "place_shot" || id === "power_shot")
      return { kind:"shot",  color: id === "place_shot" ? "#34d399" : "#fb7185", dash:"none", from:carrier, to:clampPt({ x: 96, y: id === "place_shot" ? 43 : 50 }) };
    if (id === "slip_pass")  return { kind:"pass",   color:"#34d399", dash:"1.4 1.15", from:carrier, to:open || support || baseRoute?.to };
    if (id === "square_pass" || id === "cut_back") return { kind:"pass", color:"#60a5fa", dash:"1.4 1.15", from:carrier, to:open || support || baseRoute?.to };
    if (id === "near_post")  return { kind:"direct", color:"#f59e0b", dash:"none",    from:carrier, to:clampPt({ x: 91, y: 42 }) };
    if (id === "back_post")  return { kind:"direct", color:"#a78bfa", dash:"2 1.2",   from:carrier, to:clampPt({ x: 90, y: 63 }) };
    if (id === "hold_wait")  return { kind:"reset",  color:"#60a5fa", dash:"2 1.6",   from:carrier, to:support || clampPt({ x: carrier.x - 10, y: carrier.y + 12 }) };
  }

  if (gs === "DEFEND") {
    const defender = support || firstHome(context.pressurePlayers) || firstHome(context.activePlayerIds);
    if (id === "press_ball") return { kind:"press", color:"#fb7185", dash:"none",   from:defender || clampPt({ x: carrier.x - 10, y: carrier.y }), to:carrier };
    if (id === "step_in")    return { kind:"duel",  color:"#f59e0b", dash:"1.2 1",  from:defender || clampPt({ x: carrier.x - 8,  y: carrier.y - 4 }), to:clampPt({ x: carrier.x + 3, y: carrier.y }) };
    if (id === "hold_line")  return { kind:"hold",  color:"#60a5fa", dash:"3 2",    from:carrier, to:clampPt({ x: carrier.x - 12, y: carrier.y }) };
  }

  if (baseRoute?.from && baseRoute?.to) return { kind: baseRoute.kind || "pass", color:"#38bdf8", dash:"1.4 1.15", from:baseRoute.from, to:baseRoute.to };
  return null;
};

const opponentByIdOrIndex = (gs, intent) => {
  const list = [...(OPPONENT_INTENTS[gs] || OPPONENT_INTENTS.MIDFIELD), ...(INTENTS[gs] || [])];
  if (typeof intent === "number") return list[intent] || list[0];
  return list.find(i => i.id === intent) || list[0];
};

export const getReadMatchup = (context, playerIntentId, opponentIntentId) => {
  const rule = context?.situation?.readMatrix?.[playerIntentId] || null;
  if (!rule || !opponentIntentId) return { result: 1, relation: "wins", beats: null, losesTo: null };
  if (rule.beats   === opponentIntentId) return { result: 2, relation: "beats",   beats: rule.beats, losesTo: rule.losesTo };
  if (rule.losesTo === opponentIntentId) return { result: 0, relation: "loses",   beats: rule.beats, losesTo: rule.losesTo };
  return { result: 1, relation: "wins", beats: rule.beats, losesTo: rule.losesTo };
};

// ─── pickOpponentIntent ───────────────────────────────────────────────────────
// Uses opponent personality weights when an opponentName is supplied.
const difficultyWeights = (context, playerIntentId, baseWeights = null, difficulty = "medium") => {
  const options = context?.opponentIntents || [];
  const rule = context?.situation?.readMatrix?.[playerIntentId] || null;
  if (!rule || !options.length) return baseWeights;

  const tiers = {
    easy:   { good: 0.56, counter: 0.16 },
    medium: { good: 0.40, counter: 0.30 },
    hard:   { good: 0.25, counter: 0.47 },
  };
  const tier = tiers[difficulty] || tiers.medium;
  const otherShare = Math.max(0, 1 - tier.good - tier.counter);
  const others = options.filter(id => id !== rule.beats && id !== rule.losesTo);
  const weights = {};

  for (const id of options) {
    if (id === rule.beats) weights[id] = tier.good;
    else if (id === rule.losesTo) weights[id] = tier.counter;
    else weights[id] = others.length ? otherShare / others.length : 0;
  }

  return weights;
};

export const pickOpponentIntent = (context, playerIntentId, opponentName = null, difficulty = "medium") => {
  const gs      = context?.gs || "MIDFIELD";
  const options = (context?.opponentIntents || []).map(id => opponentByIdOrIndex(gs, id));
  if (!options.length) return opponentByIdOrIndex(gs, 0);

  let baseWeights = null;
  if (opponentName) {
    const profile = getOpponentProfile(opponentName);
    baseWeights = profile?.weights?.[gs] || null;
  }

  const weights = difficultyWeights(context, playerIntentId, baseWeights, difficulty) || baseWeights;
  if (weights) return weightedPick(options, weights);

  // No personality → flat random
  return options[Math.floor(rand01() * options.length)] || options[0];
};

const nextPhaseForIntent = (gs, ok, context) => {
  if (gs === "MIDFIELD" && context?.midfieldSide === "away") {
    return { nextGs: ok ? "MIDFIELD" : "DEFEND", nextMidfieldSide: ok ? "home" : null };
  }
  if (gs === "MIDFIELD") {
    return { nextGs: ok ? "ATTACK" : "MIDFIELD", nextMidfieldSide: ok ? null : "away" };
  }
  if (gs === "ATTACK") {
    return { nextGs: ok ? "GOAL" : "MIDFIELD", nextMidfieldSide: "away" };
  }
  if (gs === "DEFEND") {
    return { nextGs: ok ? "MIDFIELD" : "CONCEDE", nextMidfieldSide: "home" };
  }
  return { nextGs: ok ? TRANS[gs].s : TRANS[gs].f, nextMidfieldSide: null };
};

// ─── resolveIntent ────────────────────────────────────────────────────────────
// FIX 1: Deterministic outcome.
//   readMatrix beats  → ok = true  (guaranteed, no coin flip)
//   readMatrix loses  → ok = false (guaranteed)
//   middle matchup    → ok = true  (matching on-chain)
//
// FIX 2: Cue-aware feedback via getCueFeedback.
// FIX 9: Consequence chain info returned in nextGs.
export const resolveIntent = ({ context, playerIntent, opponentIntent, stats = {}, opponentName = null, difficulty = "medium" }) => {
  void stats;
  const gs      = context?.gs || "MIDFIELD";
  const pIntent = intentByIdOrIndex(gs, playerIntent);
  const oIntent = opponentIntent
    ? opponentByIdOrIndex(gs, opponentIntent)
    : pickOpponentIntent(context, pIntent?.id, opponentName, difficulty);

  const matchup = getReadMatchup(context, pIntent?.id, oIntent?.id);

  // ── DETERMINISTIC RESOLUTION (Fix 1) ────────────────────────────────────
  let ok;
  if (matchup.result === 2) {
    // Correct read: always win
    ok = true;
  } else if (matchup.result === 0) {
    // Wrong read: always lose
    ok = false;
  } else {
    // Middle matchup: the action still wins the turn.
    ok = true;
  }

  const { nextGs, nextMidfieldSide } = nextPhaseForIntent(gs, ok, context);
  const route   = getIntentRoute(gs, context, pIntent?.id) || context?.routes?.[0] || null;
  const ballTo  = route?.to || context?.ball || { x: 50, y: 50 };

  // ── CUE-AWARE FEEDBACK (Fix 2) ───────────────────────────────────────────
  const activeCueIds = (context?.cues || []).map(cueIdOf).filter(Boolean);
  const why = getCueFeedback(pIntent?.id, activeCueIds, ok);

  const counterLine = matchup.result === 2
    ? `Rivals chose ${oIntent.lbl} — your read had the right answer.`
    : matchup.result === 0
      ? `Rivals chose ${oIntent.lbl} — that countered your idea.`
      : `Rivals chose ${oIntent.lbl} — your read won the turn.`;

  const outcomeLine = ok
    ? gs === "MIDFIELD" && context?.midfieldSide === "away" ? "Midfield pressure worked and you won it back."
      : gs === "MIDFIELD" ? "Ball progressed and you kept possession."
      : gs === "ATTACK" ? "The chance stayed alive."
      : "Danger was handled."
    : gs === "MIDFIELD" && context?.midfieldSide === "away" ? "They pushed through midfield and entered danger."
      : gs === "MIDFIELD" ? "The move broke down and they can attack midfield."
      : gs === "ATTACK" ? "The chance disappeared."
      : "They found a way through.";

  return {
    ok,
    cpuIdx:       oIntent.idx,
    cpuLbl:       oIntent.lbl,
    cpuIntent:    oIntent,
    playerIntent: {
      ...pIntent,
      beats:    matchup.beats   ? [matchup.beats]   : [],
      losesTo:  matchup.losesTo ? [matchup.losesTo] : [],
    },
    matchupResult: matchup.result,
    readRelation:  matchup.relation,
    narr:          counterLine,
    favorable:     matchup.result !== 0,
    rate:          matchup.result === 2 ? 1 : matchup.result === 0 ? 0 : 0.5,
    commentary:    `${why} ${outcomeLine}`,
    // why is the precise cue-aware line — used in ResolutionScreen
    why,
    explanation:   `${why} ${counterLine} ${outcomeLine}`,
    nextGs,
    nextMidfieldSide,
    movement: {
      ballFrom: context?.ballCarrierId,
      ballTo:   route?.to?.id || null,
      route:    route?.kind   || null,
      target:   ballTo,
    },
    effects: ok
      ? ["Possession kept", gs === "MIDFIELD" && context?.midfieldSide === "away" ? "Ball recovered" : gs === "MIDFIELD" ? "Ball advanced" : "Pressure relieved"]
      : ["Possession lost", "Momentum swings"],
  };
};

// ─── Win-rate calculation ─────────────────────────────────────────────────────
export const calcWinRate = (gs, stats) => {
  let myVal, cpuVal;
  if (gs === "MIDFIELD") { myVal = stats.mid || 5; cpuVal = stats.cpu_mid || 5; }
  else if (gs === "ATTACK")  { myVal = stats.atk || 5; cpuVal = stats.cpu_def || 5; }
  else                       { myVal = stats.def || 5; cpuVal = stats.cpu_atk || 5; }
  return clamp(0.52 + (myVal - cpuVal) * 0.045, 0.28, 0.82);
};

// ─── Single turn resolution (legacy path, kept for chain fallback) ────────────
export const resolveAction = (gs, actionIdx, sitIdx, stats) => {
  const cpuRoll = rand01();
  const cpuIdx  = cpuRoll < 0.35 ? 0 : cpuRoll < 0.68 ? 1 : 2;

  const baseRate    = calcWinRate(gs, stats);
  const actMod      = (ACTION_MODS[gs]   || [])[actionIdx] || 0;
  const matchupMod  = ((MATCHUP_MODS[gs] || {})[actionIdx] || {})[cpuIdx] || 0;
  const sit         = SITS[gs][sitIdx % SITS[gs].length];
  const sitPressure = ((sit.pv || [])[actionIdx] || 0) * 0.018;

  const finalRate = clamp(baseRate + actMod + matchupMod - sitPressure, 0.18, 0.88);
  const ok        = rand01() < finalRate;

  const favorable = matchupMod >= 0;
  const narr      = pick(favorable ? MATCHUP_NARR[gs].fav : MATCHUP_NARR[gs].bad) || "";
  const commentary = pick(ok ? COMM[gs][actionIdx].s : COMM[gs][actionIdx].f);
  const nextGs    = ok ? TRANS[gs].s : TRANS[gs].f;
  const cpuLbl    = CPU_ACTIONS[gs][cpuIdx];

  return { ok, cpuIdx, cpuLbl, narr, favorable, rate: finalRate, commentary, nextGs };
};

// ─── Match clock seed ─────────────────────────────────────────────────────────
export const mkTimeSeed = () => {
  const half = (start, end, count) => {
    const weights = Array.from({ length: count - 1 }, () => 0.65 + rand01() * 1.45);
    const total = weights.reduce((sum, w) => sum + w, 0);
    let minute = start;

    return [
      ...weights.map((w, idx) => {
        minute += ((end - start) * w) / total;
        const floor = start + idx + 1;
        const ceiling = end - (count - idx - 2);
        return clamp(Math.round(minute), floor, ceiling);
      }),
      end,
    ];
  };

  return [...half(1, 45, 10), ...half(47, 90, 10)];
};

export const turnToTime = (turn, ts) => {
  const fallback = [3, 8, 13, 18, 24, 29, 34, 39, 43, 45, 49, 54, 58, 63, 68, 73, 78, 83, 88, 90];
  const source = ts?.length ? ts : fallback;
  return `${source[clamp(turn - 1, 0, source.length - 1)]}'`;
};

export const mkFormation = (gs, si, stats = {}, formationId = null) =>
  buildTurnContext(gs, si, stats, formationId).players;

// ─── Camera transform ─────────────────────────────────────────────────────────
export const getCamTransform = (contextOrGs, bx, by, mode = "decision") => {
  if (typeof contextOrGs === "string") {
    const gs   = contextOrGs;
    const zoom = gs === "MIDFIELD" ? 1.78 : 2.14;
    const hw   = 50 / zoom;
    const cx   = clamp(bx, hw, 100 - hw);
    const cy   = clamp(by, hw + 5, 100 - hw - 5);
    return `scale(${zoom}) translate(${50 - cx}%,${50 - cy}%)`;
  }

  const context = contextOrGs || {};
  const ball    = context.ball || { x: bx ?? 50, y: by ?? 50 };
  const routes  = context.routes || [];
  const target  = routes[0]?.to || ball;
  const centerX = mode === "resolution" ? (ball.x * 0.55 + target.x * 0.45) : (ball.x * 0.68 + target.x * 0.32);
  const centerY = mode === "resolution" ? (ball.y * 0.55 + target.y * 0.45) : (ball.y * 0.72 + target.y * 0.28);
  const zoom    = mode === "resolution" ? 1.62 : mode === "replay" ? 2.06 : 1.48;
  const hw      = 50 / zoom;
  const cx      = clamp(centerX, hw, 100 - hw);
  const cy      = clamp(centerY, hw + 4, 100 - hw - 4);
  return `scale(${zoom}) translate(${50 - cx}%,${50 - cy}%)`;
};

// ─── End-of-match reward calculation ─────────────────────────────────────────
export const buildMatchRewards = (score, S) => {
  const { h, a } = score;
  const win   = h > a;
  const draw  = h === a;
  let repDelta  = 0;
  let coinDelta = 0;
  const breakdowns = [];
  const ns = { ...S };

  if (win) {
    repDelta  += RW.win;
    coinDelta += CW.win;
    breakdowns.push({ l: "Victory", v: `+${RW.win}`, c: "#4ade80" });
    ns.wins   = (S.wins   || 0) + 1;
    ns.streak = (S.streak || 0) + 1;
    if (h > 0) {
      const gb = h * RW.gol;
      repDelta  += gb;
      coinDelta += h * CW.gol;
      breakdowns.push({ l: h + " Goal" + (h > 1 ? "s" : ""), v: `+${gb}`, c: "#d4a017" });
    }
    if (a === 0) {
      repDelta  += RW.cs;
      coinDelta += CW.cs;
      breakdowns.push({ l: "Clean Sheet", v: `+${RW.cs}`, c: "#a78bfa" });
    }
    const sb = RW.streaks.find(s => ns.streak === s.n);
    if (sb) {
      repDelta += sb.pts;
      breakdowns.push({ l: sb.lbl, v: `+${sb.pts}`, c: "#d4a017" });
    }
  } else if (draw) {
    repDelta  += RW.draw;
    coinDelta += CW.draw;
    breakdowns.push({ l: "Draw", v: `+${RW.draw}`, c: "#d4a017" });
    ns.draws  = (S.draws  || 0) + 1;
    ns.streak = 0;
  } else {
    if (h > 0) {
      const gb = h * RW.gol;
      repDelta += gb;
      breakdowns.push({ l: h + " Goal" + (h > 1 ? "s" : ""), v: `+${gb}`, c: "#d4a017" });
    }
    repDelta  -= RW.loss;
    coinDelta += CW.loss;
    breakdowns.push({ l: "Defeat", v: `-${RW.loss}`, c: "#f87171" });
    ns.losses = (S.losses || 0) + 1;
    ns.streak = 0;
  }

  ns.total  = (S.total  || 0) + 1;
  ns.rep    = Math.max(0, (S.rep   || 0) + repDelta);
  ns.coins  = Math.max(0, (S.coins || 0) + coinDelta);

  return { repDelta, coinDelta, breakdowns, nextState: ns };
};

export const checkRewardUnlock = (ns) => {
  if (ns.total === 1 && !ns.firstPlayClaimed)              return "firstPlay";
  if (ns.wins === 1 && !ns.firstWinClaimed)                return "firstWin";
  if (ns.streak === 5 && !ns.streakRewardsClaimed?.["5"])  return "fiveStreak";
  return null;
};

export const getRewardParticles = (isGold) => {
  const c  = ["#18c158","#d4a017","#60a5fa","#f97316","#a78bfa","#f87171"];
  const fl = ["#f97316","#d97706","#ef4444","#fbbf24","#f59e0b"];
  const s  = (n) => { const v = Math.sin(n * 999.91 + 78.233) * 43758.5453; return v - Math.floor(v); };
  const mp = (tp, i, b) => ({
    tp,
    l:  `${Math.round((tp==="f" ? 10 : 0) + s(b+i) * 80)}%`,
    bg: (tp==="f" ? fl : c)[i % (tp==="f" ? fl.length : c.length)],
    d:  `${(tp==="f" ? 0.9 : 1.4) + s(b+i+20) * (tp==="f" ? 0.7 : 1.2)}s`,
    dl: `${s(b+i+40) * (tp==="f" ? 0.6 : 0.8)}s`,
    r:  `${tp==="f" ? -10 + s(b+i+60)*20 : s(b+i+60)*360}deg`,
  });
  return isGold
    ? [...Array.from({length:16}, (_,i) => mp("f",i,11)), ...Array.from({length:12}, (_,i) => mp("c",i,101))]
    : Array.from({length:24}, (_,i) => mp("c",i,201));
};

export const simCPU = (LB) =>
  LB.map(p =>
    Math.random() < 0.45
      ? { ...p, pts: Math.max(1, p.pts + Math.floor(Math.random() * 18) - 7) }
      : p
  );
