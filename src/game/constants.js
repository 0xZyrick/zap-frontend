// ─── constants.js ─────────────────────────────────────────────────────────────
// All static game data. No logic, no React. Import anywhere.

export const ACTIONS = {
  MIDFIELD: [
    { lbl: "Go through", dsc: "Break the middle", rc: "#f87171", dir: "drive", id: "drive_on" },
    { lbl: "Go wide",    dsc: "Release wide",     rc: "#60a5fa", dir: "wide",  id: "go_wide"  },
    { lbl: "Go long",    dsc: "Go direct",        rc: "#f59e0b", dir: "long",  id: "go_long"  },
  ],
  ATTACK: [
    { lbl: "Slip pass",   dsc: "Release the run", rc: "#34d399", dir: "thru",  id: "slip_pass" },
    { lbl: "Finish",      dsc: "Hit it now",      rc: "#f87171", dir: "shoot", id: "finish"    },
    { lbl: "Hold & wait", dsc: "Wait for help",   rc: "#60a5fa", dir: "hold",  id: "hold_wait" },
  ],
  DEFEND: [
    { lbl: "Hold shape", dsc: "Hold the line", rc: "#60a5fa", dir: "shape",  id: "hold_line"  },
    { lbl: "Step up",    dsc: "Go win it",     rc: "#f59e0b", dir: "tackle", id: "step_in"    },
    { lbl: "Block shot", dsc: "Stop the shot", rc: "#f87171", dir: "block",  id: "press_ball" },
  ],
};

export const CUE_LABELS = {
  space_ahead: "Gap is open",
  long_lane: "Runner is in behind",
  inside_tight: "Middle is packed",
  pressure_on: "Man on you",
  foul_risk: "Last man -- he'll foul",
  support_near: "Safe pass on",
  right_open: "Free man right",
  aerial_threat: "Ball coming in",
  back_run: "Far post run",
  danger_run: "Runner breaking",
  space_behind: "Gap behind the line",
  pressure_chance: "You can press",
  near_run: "Attack the near post",
  cut_lane: "Cutback on",
  runner_free: "Man free in the box",
  shot_closing: "Defender stepping",
  box_crowded: "Box packed",
  keeper_rushing: "Keeper coming out",
  corner_open: "Corner unguarded",
  square_free: "Tap-in on",
  inside_lane: "Split them open",
};

export const SITS = {
  MIDFIELD: [
    { name: "Build From Back",   tag: "POSSESSION",     dsc: "Dictate the tempo",                    pv: [0,0,0,0,0] },
    { name: "Under High Press",  tag: "UNDER PRESSURE", dsc: "They're closing down",                 pv: [3,2,2,3,3] },
    { name: "Transition",        tag: "TRANSITION",     dsc: "Game is wide open",                    pv: [2,3,3,2,2] },
    { name: "Wide Overload",     tag: "OVERLOAD",       dsc: "Numbers out wide",                     pv: [4,3,4,4,4] },
    { name: "Counter Launch",    tag: "QUICK BREAK",    dsc: "Space behind them",                    pv: [3,4,4,3,3] },
    { name: "Central Pocket",    tag: "HALF TURN",      dsc: "Receive between the lines",            pv: [2,4,2,3,2] },
    { name: "Second Ball Fight", tag: "DUEL",           dsc: "Loose ball in midfield",               pv: [3,3,4,2,3] },
    { name: "Touchline Trap",    tag: "TIGHT SPACE",    dsc: "Pinned near the sideline",             pv: [4,2,3,4,2] },
    { name: "Tempo Reset",       tag: "CONTROL",        dsc: "Slow it down and re-shape",            pv: [1,2,1,1,1] },
    { name: "Diagonal Lane",     tag: "SWITCH ON",      dsc: "Far side runner is free",              pv: [3,4,3,4,3] },
  ],
  ATTACK: [
    { name: "Edge of the Box",    tag: "SHOOTING CHANCE", dsc: "20 yards, clear sight",             pv: [0,0,0,0,0] },
    { name: "1v1 with Keeper",    tag: "GOLDEN CHANCE",   dsc: "Just you and him",                  pv: [3,2,2,3,3] },
    { name: "2v1 Overload",       tag: "OVERLOAD",        dsc: "Man over in the box",               pv: [3,4,3,3,3] },
    { name: "Cross Incoming",     tag: "SET PIECE",       dsc: "Ball from wide",                    pv: [2,3,2,2,3] },
    { name: "Final Third Press",  tag: "HIGH PRESS",      dsc: "Winning ball in half",              pv: [2,3,2,4,2] },
    { name: "Cutback Window",     tag: "FREE RUNNER",     dsc: "Late runner arriving central",      pv: [2,4,2,3,2] },
    { name: "Near Post Dash",     tag: "BOX RUN",         dsc: "Attack the first contact",          pv: [3,3,2,2,4] },
    { name: "Back Post Float",    tag: "AERIAL THREAT",   dsc: "Far-post delivery hangs up",        pv: [2,4,3,2,3] },
    { name: "Rebound Chaos",      tag: "SCRAMBLE",        dsc: "Keeper spills in traffic",          pv: [3,2,4,3,3] },
    { name: "Isolated Full-Back", tag: "1V1",             dsc: "Beat your man on the outside",      pv: [4,3,3,4,2] },
  ],
  DEFEND: [
    { name: "Last Man Back",      tag: "DANGER",       dsc: "One mistake = goal",                   pv: [0,0,0,0,0] },
    { name: "Counter Attack",     tag: "EMERGENCY",    dsc: "They broke — 3v2",                     pv: [3,2,3,3,3] },
    { name: "2v2 Scramble",       tag: "SCRAMBLE",     dsc: "Track the runners",                    pv: [3,2,3,3,3] },
    { name: "Corner Danger",      tag: "SET PIECE",    dsc: "Ball into area",                       pv: [2,3,2,2,4] },
    { name: "Through Ball Peril", tag: "URGENT",       dsc: "Striker in behind",                    pv: [2,3,4,2,2] },
    { name: "Cutback Alarm",      tag: "RECOVERY",     dsc: "Runner arriving top of box",           pv: [2,4,3,2,3] },
    { name: "Back-Post Leak",     tag: "WEAK SIDE",    dsc: "Far side is exposed",                  pv: [3,2,2,4,4] },
    { name: "Press Broken",       tag: "LINE BROKEN",  dsc: "They are running at your back line",   pv: [4,3,4,3,2] },
    { name: "Box Wall",           tag: "DEEP BLOCK",   dsc: "Everyone behind the ball",             pv: [1,1,2,1,2] },
    { name: "Recycled Pressure",  tag: "SECOND PHASE", dsc: "They keep coming after the clearance", pv: [3,3,2,3,4] },
  ],
};

export const INTENTS = {
  MIDFIELD: [
    { id:"drive_on",     idx:0, lbl:"Go through",        dsc:"Break the middle",   feel:"Sharp",          rc:"#f87171", icon:"↑", line:"mid", targetCue:"space_ahead" },
    { id:"go_wide",      idx:1, lbl:"Go wide",           dsc:"Release wide",       feel:"Keeps the ball", rc:"#60a5fa", icon:"→", line:"mid", targetCue:"right_open"  },
    { id:"go_long",      idx:2, lbl:"Go long",           dsc:"Go direct",          feel:"Direct",         rc:"#f59e0b", icon:"↟", line:"mid", targetCue:"long_lane"   },
    { id:"play_safe",    idx:2, lbl:"Keep it",           dsc:"Don't risk it",      feel:"Controlled",     rc:"#facc15", icon:"▣", line:"mid", targetCue:"support_near"},
    { id:"play_through", idx:0, lbl:"Find the runner",   dsc:"Split them open",    feel:"Quick release",  rc:"#34d399", icon:"↗", line:"mid", targetCue:"inside_lane" },
  ],
  ATTACK: [
    { id:"slip_pass",   idx:0, lbl:"Slide them in",    dsc:"Release the run",       feel:"Quick release",  rc:"#34d399", icon:"↗", targetCue:"runner_free" },
    { id:"finish",      idx:1, lbl:"Shoot",            dsc:"Hit it now",            feel:"Back yourself",  rc:"#f87171", icon:"●", targetCue:"shot_closing" },
    { id:"hold_wait",   idx:2, lbl:"Hold it up",       dsc:"Wait for help",         feel:"Controlled",     rc:"#60a5fa", icon:"◌", targetCue:"box_crowded" },
    { id:"place_shot",  idx:0, lbl:"Pick your spot",   dsc:"Place it low",          feel:"Quick release",  rc:"#34d399", icon:"◎", targetCue:"corner_open" },
    { id:"power_shot",  idx:1, lbl:"Hit through it",   dsc:"Pure power",            feel:"Back yourself",  rc:"#fb7185", icon:"●", targetCue:"keeper_rushing" },
    { id:"square_pass", idx:2, lbl:"Square it",        dsc:"Tap-in for them",       feel:"Keeps the ball", rc:"#60a5fa", icon:"→", targetCue:"square_free" },
    { id:"near_post",   idx:0, lbl:"Near post",        dsc:"Attack it early",       feel:"Commit to it",   rc:"#f59e0b", icon:"↘", targetCue:"near_run" },
    { id:"back_post",   idx:1, lbl:"Back post",        dsc:"Float to the far side", feel:"Quick release",  rc:"#a78bfa", icon:"↗", targetCue:"back_run" },
    { id:"cut_back",    idx:2, lbl:"Cut it back",      dsc:"Late runner arriving",  feel:"Controlled",     rc:"#34d399", icon:"↙", targetCue:"cut_lane" },
  ],
  DEFEND: [
    { id:"hold_line",  idx:0, lbl:"Hold shape", dsc:"Hold the line", feel:"No mistakes",  rc:"#60a5fa", icon:"▣", targetCue:"space_behind" },
    { id:"step_in",    idx:1, lbl:"Step up",    dsc:"Go win it",     feel:"Commit to it", rc:"#f59e0b", icon:"◇", targetCue:"danger_run" },
    { id:"press_ball", idx:2, lbl:"Block shot", dsc:"Stop the shot", feel:"Disciplined",  rc:"#f87171", icon:"!", targetCue:"pressure_chance" },
  ],
};

export const OPPONENT_INTENTS = {
  MIDFIELD: [
    { id:"drop_off",     idx:0, lbl:"Drop off",      dsc:"Give ground",       rc:"#94a3b8" },
    { id:"press_middle", idx:1, lbl:"Press middle",  dsc:"Close the middle",  rc:"#ef4444" },
    { id:"cover_wide",   idx:2, lbl:"Cover wide",    dsc:"Protect the flank", rc:"#f59e0b" },
  ],
  ATTACK: [
    { id:"hold_shape", idx:0, lbl:"Hold shape", dsc:"Stay compact", rc:"#94a3b8" },
    { id:"step_up",    idx:1, lbl:"Step up",    dsc:"Push up",      rc:"#f59e0b" },
    { id:"block_shot", idx:2, lbl:"Block shot", dsc:"Stop the shot", rc:"#ef4444" },
  ],
  DEFEND: [
    { id:"slip_pass", idx:0, lbl:"Slip pass",   dsc:"Release the run", rc:"#34d399" },
    { id:"finish",    idx:1, lbl:"Finish",      dsc:"Hit it now",      rc:"#f87171" },
    { id:"hold_wait", idx:2, lbl:"Hold & wait", dsc:"Wait for help",   rc:"#60a5fa" },
  ],
};

// ─── OPPONENT PERSONALITIES ───────────────────────────────────────────────────
// Each named opponent has a bias toward certain intents.
// weights: { [opponentIntentId]: probability 0-1 } — must sum to ~1 per phase
// style: flavour label shown on pre-match scouting note
export const OPPONENT_PROFILES = [
  {
    names: ["Apex Rovers", "Storm United", "Press FC"],
    style: "HIGH PRESS",
    scoutNote: "Press everything. Force errors high up.",
    kitColor: "#ef4444",
    weights: {
      MIDFIELD: { drop_off: 0.15, press_middle: 0.60, cover_wide: 0.25 },
      ATTACK:   { hold_shape: 0.18, step_up: 0.58, block_shot: 0.24 },
      DEFEND:   { slip_pass: 0.28, finish: 0.52, hold_wait: 0.20 },
    },
  },
  {
    names: ["Eastbank Rangers", "Iron Gate FC", "Lock City"],
    style: "HOLD SHAPE",
    scoutNote: "Sit deep. Stay compact. Hit on the break.",
    kitColor: "#94a3b8",
    weights: {
      MIDFIELD: { drop_off: 0.58, press_middle: 0.18, cover_wide: 0.24 },
      ATTACK:   { hold_shape: 0.58, step_up: 0.17, block_shot: 0.25 },
      DEFEND:   { slip_pass: 0.20, finish: 0.24, hold_wait: 0.56 },
    },
  },
  {
    names: ["Metro Albion", "Velocity City", "Crown Park FC"],
    style: "COVER WIDE",
    scoutNote: "Defend the flanks. Force play through the middle.",
    kitColor: "#f59e0b",
    weights: {
      MIDFIELD: { drop_off: 0.18, press_middle: 0.20, cover_wide: 0.62 },
      ATTACK:   { hold_shape: 0.24, step_up: 0.26, block_shot: 0.50 },
      DEFEND:   { slip_pass: 0.54, finish: 0.28, hold_wait: 0.18 },
    },
  },
  {
    names: ["Harbor Athletic", "Redline United", "Union Vale", "Northbridge XI"],
    style: "BALANCED",
    scoutNote: "No obvious weakness. Read the moment.",
    kitColor: "#a78bfa",
    weights: {
      MIDFIELD: { drop_off: 0.34, press_middle: 0.33, cover_wide: 0.33 },
      ATTACK:   { hold_shape: 0.34, step_up: 0.33, block_shot: 0.33 },
      DEFEND:   { slip_pass: 0.34, finish: 0.33, hold_wait: 0.33 },
    },
  },
];

// Helper: get profile for a named opponent
export const getOpponentProfile = (name) => {
  for (const p of OPPONENT_PROFILES) {
    if (p.names.some(n => name?.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes((name || "").toLowerCase()))) return p;
  }
  return OPPONENT_PROFILES[3]; // balanced fallback
};

// ─── FORMATION → INTENT UNLOCK MAP ───────────────────────────────────────────
// Each formation locks/unlocks specific intents per phase.
// If a phase key is absent the default three intents for that phase are used.
export const FORMATION_INTENTS = {
  "press-433": {
    MIDFIELD: ["drive_on", "go_wide", "go_long"],
    ATTACK:   ["slip_pass", "finish", "hold_wait"],
    DEFEND:   ["hold_line", "step_in", "press_ball"],
  },
  "control-433": {
    MIDFIELD: ["drive_on", "go_wide", "go_long"],
    ATTACK:   ["slip_pass", "finish", "hold_wait"],
    DEFEND:   ["hold_line", "step_in", "press_ball"],
  },
  "pivot-4231": {
    MIDFIELD: ["drive_on", "go_wide", "go_long"],
    ATTACK:   ["slip_pass", "finish", "hold_wait"],
    DEFEND:   ["hold_line", "step_in", "press_ball"],
  },
  "classic-442": {
    MIDFIELD: ["drive_on", "go_wide", "go_long"],
    ATTACK:   ["slip_pass", "finish", "hold_wait"],
    DEFEND:   ["hold_line", "step_in", "press_ball"],
  },
  "diamond-41212": {
    MIDFIELD: ["drive_on", "go_wide", "go_long"],
    ATTACK:   ["slip_pass", "finish", "hold_wait"],
    DEFEND:   ["hold_line", "step_in", "press_ball"],
  },
  "wide-352": {
    MIDFIELD: ["drive_on", "go_wide", "go_long"],
    ATTACK:   ["slip_pass", "finish", "hold_wait"],
    DEFEND:   ["hold_line", "step_in", "press_ball"],
  },
  "storm-343": {
    MIDFIELD: ["drive_on", "go_wide", "go_long"],
    ATTACK:   ["slip_pass", "finish", "hold_wait"],
    DEFEND:   ["hold_line", "step_in", "press_ball"],
  },
  "lock-532": {
    MIDFIELD: ["drive_on", "go_wide", "go_long"],
    ATTACK:   ["slip_pass", "finish", "hold_wait"],
    DEFEND:   ["hold_line", "step_in", "press_ball"],
  },
  "low-541": {
    MIDFIELD: ["drive_on", "go_wide", "go_long"],
    ATTACK:   ["slip_pass", "finish", "hold_wait"],
    DEFEND:   ["hold_line", "step_in", "press_ball"],
  },
};

// ─── CUE FEEDBACK LIBRARY ─────────────────────────────────────────────────────
// Maps (intentId + active_cue_id) → precise verdict line shown on resolution screen.
// Used in resolveIntent to produce specific situational feedback instead of generic strings.
export const CUE_FEEDBACK = {
  // MIDFIELD
  go_wide: {
    inside_tight: "WIDE — found the free man.",
    pressure_on:  "WIDE — escaped the pressure.",
    right_open:   "WIDE — flank opened up.",
    support_near: "WIDE — kept it moving.",
    default_win:  "WIDE opened the play.",
    default_lose: "WIDE — flank was locked down.",
  },
  drive_on: {
    inside_tight: "DRIVE — middle was packed. No gap.",
    space_ahead:  "DRIVE — broke through the gap.",
    pressure_on:  "DRIVE — lost the touch.",
    right_open:   "DRIVE — ran into cover.",
    default_win:  "DRIVE broke the line.",
    default_lose: "DRIVE — no opening.",
  },
  play_safe: {
    support_near: "SAFE — kept possession moving.",
    pressure_on:  "SAFE — right call under pressure.",
    inside_tight: "SAFE — didn't force it.",
    right_open:   "SAFE — let them reset.",
    default_win:  "SAFE kept control.",
    default_lose: "SAFE — nothing happened.",
  },
  play_through: {
    inside_lane:  "WIDE — split them open.",
    pressure_on:  "WIDE — runner escaped.",
    default_win:  "WIDE found the runner.",
    default_lose: "WIDE — middle was sealed.",
  },
  go_long: {
    long_lane:    "LONG — direct and in behind.",
    pressure_on:  "LONG — went direct and escaped.",
    right_open:   "LONG — gave them time to reset.",
    default_win:  "LONG went direct. Got there.",
    default_lose: "LONG — marked and covered.",
  },
  // ATTACK
  slip_pass: {
    runner_free:   "SPLIT — free man in the box.",
    box_crowded:   "SPLIT — found the gap anyway.",
    shot_closing:  "SPLIT — released before they closed.",
    default_win:   "SPLIT — runner through clean.",
    default_lose:  "SPLIT — runner was marked.",
  },
  finish: {
    shot_closing:  "FINISH — hit it before they moved.",
    box_crowded:   "FINISH — struck through the crowd.",
    runner_free:   "FINISH — keeper was there.",
    default_win:   "FINISH. Goal.",
    default_lose:  "FINISH — chance closed.",
  },
  hold_wait: {
    box_crowded:   "HOLD — waited until help arrived.",
    runner_free:   "HOLD — free man, but you waited too long.",
    default_win:   "HOLD — waited and found support.",
    default_lose:  "HOLD — they recovered.",
  },
  place_shot: {
    keeper_rushing: "FINISH — keeper rushed, you picked the spot.",
    corner_open:    "FINISH — corner was there.",
    default_win:    "FINISH — picked the corner. Goal.",
    default_lose:   "FINISH — corner was blocked.",
  },
  power_shot: {
    square_free:    "FINISH — struck it anyway.",
    default_win:    "FINISH — too strong. Goal.",
    default_lose:   "FINISH — keeper was big.",
  },
  square_pass: {
    square_free:    "SLIP — square to the free man.",
    keeper_rushing: "SLIP — keeper out, exposed the goal.",
    default_win:    "SLIP — simple finish.",
    default_lose:   "SLIP — man was covered.",
  },
  near_post: {
    near_run:      "FINISH — beat the first man.",
    back_run:      "FINISH — near worked anyway.",
    default_win:   "FINISH — near post perfect.",
    default_lose:  "FINISH — defender was there.",
  },
  back_post: {
    back_run:      "FINISH — found the back post run.",
    near_run:      "FINISH — back post was right.",
    default_win:   "FINISH — back post runner connected.",
    default_lose:  "FINISH — line held firm.",
  },
  cut_back: {
    cut_lane:      "SLIP — late runner arriving.",
    default_win:   "SLIP — beat the line.",
    default_lose:  "SLIP — line was solid.",
  },
  // DEFEND
  press_ball: {
    danger_run:       "BLOCK — stopped the final action.",
    pressure_chance:  "BLOCK — shut the shot down.",
    space_behind:     "BLOCK — gap opened behind.",
    default_win:      "BLOCK — stopped the shot.",
    default_lose:     "BLOCK — they found the finish.",
  },
  hold_line: {
    space_behind:     "HOLD — protected the gap.",
    danger_run:       "HOLD — line caught the runner.",
    pressure_chance:  "HOLD — protected the box.",
    default_win:      "HOLD — held firm.",
    default_lose:     "HOLD — they still shot.",
  },
  step_in: {
    danger_run:       "STEP — won it clean.",
    space_behind:     "STEP — gap opened behind.",
    default_win:      "STEP — went and won it.",
    default_lose:     "STEP — too slow. Shot came.",
  },
};

// ─── TURN SITUATIONS ──────────────────────────────────────────────────────────
// Expanded: 10 MIDFIELD, 9 ATTACK, 8 DEFEND situations
export const TURN_SITUATIONS = {
  MIDFIELD: [
    {
      id:"midfield_pocket", title:"Midfield Pocket",
      summary:"Pressure is coming and the wide side is opening.",
      ballZone:"central_midfield", ballCarrierId:"h_cm", pressure:"medium", openSide:"right", insideCrowded:true,
      cues:[
        { id:"pressure_on",  label:"Pressure On",  sub:"Defender closing", tone:"danger" },
        { id:"right_open",   label:"Right Open",   sub:"Lots of space",    tone:"good"   },
        { id:"inside_tight", label:"Inside Tight", sub:"Pocket closing",   tone:"warn"   },
        { id:"support_near", label:"Support Near", sub:"2 players close",  tone:"good"   },
      ],
      activePlayerIds:["h_cm","h_rw","h_rb","h_dm","a_cm","a_lm","a_lb"],
      supportOptionIds:["h_rw","h_rb","h_dm"], pressurePlayerIds:["a_cm"], openPlayerIds:["h_rw"],
      crowdedZone:{ x:54, y:34, w:22, h:30, label:"Inside tight" },
      routePreview:{ from:"h_cm", to:"h_rw", kind:"safe", label:"open side" },
      availableIntents:["go_wide","drive_on","play_safe"], opponentBias:["press_inside","cover_wide","hold_shape"],
      readMatrix:{
        go_wide:{ beats:"press_inside", losesTo:"cover_wide" },
        drive_on:{ beats:"cover_wide", losesTo:"press_inside" },
        play_safe:{ beats:"cover_wide", losesTo:"hold_shape" },
      },
    },
    {
      id:"build_from_back", title:"Build From Back",
      summary:"You are deep and the opponent is pressing.",
      ballZone:"left_midfield", ballCarrierId:"h_lb", pressure:"high", openSide:"inside", insideCrowded:false,
      cues:[
        { id:"pressure_on", label:"Pressure On",  sub:"Closing fast",    tone:"danger" },
        { id:"inside_lane", label:"Inside Lane",  sub:"Pass is there",   tone:"good"   },
        { id:"right_open",  label:"Wide Outlet",  sub:"Switch is open",  tone:"good"   },
        { id:"long_lane",   label:"Long Lane",    sub:"Channel free",    tone:"warn"   },
      ],
      activePlayerIds:["h_lb","h_lw","h_dm","a_rm","a_cm"],
      supportOptionIds:["h_lw","h_dm"], pressurePlayerIds:["a_rm"], openPlayerIds:["h_lw"],
      crowdedZone:{ x:28, y:30, w:17, h:30, label:"pressure" },
      routePreview:{ from:"h_lb", to:"h_dm", kind:"safe", label:"support" },
      availableIntents:["play_through","go_wide","go_long"], opponentBias:["drop_off","press_middle","cover_wide"],
      readMatrix:{
        play_through:{ beats:"drop_off", losesTo:"press_middle" },
        go_wide:{ beats:"press_middle", losesTo:"cover_wide" },
        go_long:{ beats:"cover_wide", losesTo:"drop_off" },
      },
    },
    {
      id:"half_space_turn", title:"Half-Space Turn",
      summary:"Midfielder receives between the lines under medium pressure.",
      ballZone:"central_midfield", ballCarrierId:"h_am", pressure:"medium", openSide:"right", insideCrowded:false,
      cues:[
        { id:"inside_lane",  label:"Lane Open",    sub:"Turn and go",     tone:"good"   },
        { id:"pressure_on",  label:"Pressure On",  sub:"Closing quickly", tone:"danger" },
        { id:"right_open",   label:"Wide Free",    sub:"Runner outside",  tone:"good"   },
        { id:"support_near", label:"Support Near", sub:"Safe option",     tone:"good"   },
      ],
      activePlayerIds:["h_am","h_cm","h_rw","a_cm","a_dm"],
      supportOptionIds:["h_cm","h_rw"], pressurePlayerIds:["a_cm"], openPlayerIds:["h_rw"],
      crowdedZone:{ x:56, y:30, w:18, h:26, label:"contested" },
      routePreview:{ from:"h_am", to:"h_rw", kind:"safe", label:"wide release" },
      availableIntents:["drive_on","go_wide","play_safe"], opponentBias:["press_inside","hold_shape","cover_wide"],
      readMatrix:{
        drive_on:{ beats:"hold_shape", losesTo:"press_inside" },
        go_wide:{ beats:"press_inside", losesTo:"cover_wide" },
        play_safe:{ beats:"cover_wide", losesTo:"hold_shape" },
      },
    },
    {
      id:"wide_overload", title:"Wide Overload",
      summary:"Numbers out wide. Choose how to exploit the overlap.",
      ballZone:"right_midfield", ballCarrierId:"h_rb", pressure:"low", openSide:"right", insideCrowded:true,
      cues:[
        { id:"right_open",   label:"Overload Right", sub:"2v1 outside",   tone:"good"   },
        { id:"inside_tight", label:"Inside Blocked", sub:"No central gap", tone:"warn"  },
        { id:"space_ahead",  label:"Space Ahead",    sub:"Carry option",   tone:"good"  },
        { id:"support_near", label:"Support Close",  sub:"Triangle formed",tone:"good"  },
      ],
      activePlayerIds:["h_rb","h_rw","h_cm","a_lm","a_lb"],
      supportOptionIds:["h_rw","h_cm"], pressurePlayerIds:["a_lm"], openPlayerIds:["h_rw"],
      crowdedZone:{ x:60, y:55, w:20, h:24, label:"central block" },
      routePreview:{ from:"h_rb", to:"h_rw", kind:"safe", label:"overlap" },
      availableIntents:["go_wide","drive_on","play_safe"], opponentBias:["cover_wide","hold_shape","press_inside"],
      readMatrix:{
        go_wide:{ beats:"hold_shape", losesTo:"cover_wide" },
        drive_on:{ beats:"hold_shape", losesTo:"press_inside" },
        play_safe:{ beats:"press_inside", losesTo:"hold_shape" },
      },
    },
    {
      id:"counter_launch", title:"Counter Launch",
      summary:"Ball won high. Space behind their defence is open.",
      ballZone:"central_midfield", ballCarrierId:"h_dm", pressure:"low", openSide:"ahead", insideCrowded:false,
      cues:[
        { id:"space_ahead",  label:"Space Ahead",  sub:"Defence stretched", tone:"good"  },
        { id:"long_lane",    label:"Long Channel",  sub:"Runner in behind",  tone:"good"  },
        { id:"support_near", label:"Support Near",  sub:"Safe recycle",      tone:"good"  },
        { id:"pressure_on",  label:"Foul Risk",     sub:"Last man closing",  tone:"warn"  },
      ],
      activePlayerIds:["h_dm","h_st","h_rw","a_cb1","a_cb2"],
      supportOptionIds:["h_cm","h_lw"], pressurePlayerIds:["a_cb1"], openPlayerIds:["h_st"],
      crowdedZone:null,
      routePreview:{ from:"h_dm", to:"h_st", kind:"direct", label:"through ball" },
      availableIntents:["go_long","drive_on","play_safe"], opponentBias:["drop_off","hold_shape","press_middle"],
      readMatrix:{
        go_long:{ beats:"drop_off", losesTo:"hold_shape" },
        drive_on:{ beats:"press_middle", losesTo:"hold_shape" },
        play_safe:{ beats:"hold_shape", losesTo:"drop_off" },
      },
    },
    {
      id:"transition_open", title:"Transition",
      summary:"Ball won in a turnover. Both teams are disorganised.",
      ballZone:"central_midfield", ballCarrierId:"h_cm", pressure:"medium", openSide:"left", insideCrowded:false,
      cues:[
        { id:"space_ahead",  label:"Space Open",   sub:"Both teams scrambling", tone:"good"  },
        { id:"right_open",   label:"Wide Left",    sub:"Flank is free",        tone:"good"  },
        { id:"pressure_on",  label:"Chase On",     sub:"They're running back",  tone:"warn"  },
        { id:"inside_lane",  label:"Central Gap",  sub:"Hole through middle",   tone:"good"  },
      ],
      activePlayerIds:["h_cm","h_lw","h_am","a_cm","a_rb"],
      supportOptionIds:["h_lw","h_am"], pressurePlayerIds:["a_cm"], openPlayerIds:["h_lw"],
      crowdedZone:null,
      routePreview:{ from:"h_cm", to:"h_lw", kind:"pass", label:"wide ball" },
      availableIntents:["go_wide","drive_on","play_through"], opponentBias:["press_inside","hold_shape","cover_wide"],
      readMatrix:{
        go_wide:{ beats:"press_inside", losesTo:"cover_wide" },
        drive_on:{ beats:"hold_shape", losesTo:"press_inside" },
        play_through:{ beats:"cover_wide", losesTo:"hold_shape" },
      },
    },
    {
      id:"touchline_trap", title:"Touchline Trap",
      summary:"Pinned near the sideline under intense pressure.",
      ballZone:"right_midfield", ballCarrierId:"h_rw", pressure:"high", openSide:"inside", insideCrowded:false,
      cues:[
        { id:"pressure_on",  label:"Sideline Press", sub:"No space out wide",   tone:"danger" },
        { id:"inside_lane",  label:"Inside Space",   sub:"Cut inside",          tone:"good"   },
        { id:"support_near", label:"Support Near",   sub:"Safe ball available",  tone:"good"   },
        { id:"long_lane",    label:"Long Switch",    sub:"Far side is open",     tone:"warn"   },
      ],
      activePlayerIds:["h_rw","h_cm","h_rb","a_lm","a_lb"],
      supportOptionIds:["h_cm","h_rb"], pressurePlayerIds:["a_lm","a_lb"], openPlayerIds:["h_cm"],
      crowdedZone:{ x:72, y:68, w:22, h:26, label:"sideline trap" },
      routePreview:{ from:"h_rw", to:"h_cm", kind:"safe", label:"cut inside" },
      availableIntents:["play_safe","play_through","go_long"], opponentBias:["press_middle","cover_wide","drop_off"],
      readMatrix:{
        play_safe:{ beats:"press_middle", losesTo:"drop_off" },
        play_through:{ beats:"cover_wide", losesTo:"press_middle" },
        go_long:{ beats:"drop_off", losesTo:"cover_wide" },
      },
    },
    {
      id:"diagonal_lane", title:"Diagonal Lane",
      summary:"Far-side runner is free. Switch play or stay central.",
      ballZone:"left_midfield", ballCarrierId:"h_lw", pressure:"medium", openSide:"right", insideCrowded:true,
      cues:[
        { id:"right_open",   label:"Far Side Free",  sub:"Switch is on",      tone:"good"   },
        { id:"inside_tight", label:"Middle Blocked", sub:"Central press on",  tone:"warn"   },
        { id:"pressure_on",  label:"Closing Fast",   sub:"Time running out",  tone:"danger" },
        { id:"long_lane",    label:"Long Switch",    sub:"Diagonal ball on",  tone:"good"   },
      ],
      activePlayerIds:["h_lw","h_rw","h_cm","a_rm","a_cm"],
      supportOptionIds:["h_cm","h_dm"], pressurePlayerIds:["a_rm"], openPlayerIds:["h_rw"],
      crowdedZone:{ x:44, y:28, w:22, h:26, label:"central block" },
      routePreview:{ from:"h_lw", to:"h_rw", kind:"direct", label:"switch" },
      availableIntents:["go_long","play_safe","go_wide"], opponentBias:["hold_shape","press_inside","cover_wide"],
      readMatrix:{
        go_long:{ beats:"hold_shape", losesTo:"cover_wide" },
        play_safe:{ beats:"cover_wide", losesTo:"press_inside" },
        go_wide:{ beats:"press_inside", losesTo:"hold_shape" },
      },
    },
    {
      id:"central_pocket_deep", title:"Central Pocket",
      summary:"Midfielder receives between the lines with bodies around.",
      ballZone:"central_midfield", ballCarrierId:"h_dm", pressure:"high", openSide:"right", insideCrowded:true,
      cues:[
        { id:"inside_tight", label:"Packed Centre",  sub:"Nowhere to drive",  tone:"warn"   },
        { id:"pressure_on",  label:"Two On You",     sub:"Double pressure",   tone:"danger" },
        { id:"right_open",   label:"Wide Open",      sub:"One v one outside", tone:"good"   },
        { id:"support_near", label:"Back Option",    sub:"Recycle available",  tone:"good"   },
      ],
      activePlayerIds:["h_dm","h_cm","h_rw","a_st1","a_cm","a_dm"],
      supportOptionIds:["h_cm","h_rb"], pressurePlayerIds:["a_st1","a_cm"], openPlayerIds:["h_rw"],
      crowdedZone:{ x:44, y:36, w:24, h:32, label:"double press zone" },
      routePreview:{ from:"h_dm", to:"h_rw", kind:"safe", label:"escape wide" },
      availableIntents:["go_wide","play_safe","drive_on"], opponentBias:["press_inside","press_middle","hold_shape"],
      readMatrix:{
        go_wide:{ beats:"press_inside", losesTo:"cover_wide" },
        play_safe:{ beats:"press_middle", losesTo:"hold_shape" },
        drive_on:{ beats:"hold_shape", losesTo:"press_inside" },
      },
    },
    {
      id:"second_ball_fight", title:"Second Ball",
      summary:"Loose ball in midfield. First to it controls the game.",
      ballZone:"central_midfield", ballCarrierId:"h_cm", pressure:"medium", openSide:"left", insideCrowded:false,
      cues:[
        { id:"space_ahead",  label:"Ball is Loose", sub:"First to it wins",  tone:"good"   },
        { id:"pressure_on",  label:"Contest On",    sub:"They're arriving",  tone:"warn"   },
        { id:"inside_lane",  label:"Lane Available",sub:"If you win it",     tone:"good"   },
        { id:"support_near", label:"Support Set",   sub:"Options available", tone:"good"   },
      ],
      activePlayerIds:["h_cm","h_dm","h_am","a_cm","a_dm"],
      supportOptionIds:["h_dm","h_am"], pressurePlayerIds:["a_cm"], openPlayerIds:["h_am"],
      crowdedZone:{ x:46, y:38, w:20, h:28, label:"contest zone" },
      routePreview:{ from:"h_cm", to:"h_am", kind:"pass", label:"forward pass" },
      availableIntents:["drive_on","play_through","play_safe"], opponentBias:["press_inside","hold_shape","drop_off"],
      readMatrix:{
        drive_on:{ beats:"hold_shape", losesTo:"press_inside" },
        play_through:{ beats:"drop_off", losesTo:"press_inside" },
        play_safe:{ beats:"press_inside", losesTo:"hold_shape" },
      },
    },
  ],
  ATTACK: [
    {
      id:"final_third", title:"Final Third",
      summary:"Near the box, the runner is moving, and the window is small.",
      ballZone:"right_attack", ballCarrierId:"h_rw", pressure:"medium", openSide:"center", insideCrowded:false,
      cues:[
        { id:"runner_free",  label:"Runner Free",  sub:"Pass is on",         tone:"good" },
        { id:"shot_closing", label:"Shot Closing", sub:"Defender steps out", tone:"warn" },
        { id:"box_crowded",  label:"Box Busy",     sub:"Bodies inside",      tone:"warn" },
      ],
      activePlayerIds:["h_rw","h_st","h_cm","a_cb1","a_cb2","a_gk"],
      supportOptionIds:["h_st","h_cm"], pressurePlayerIds:["a_cb2"], openPlayerIds:["h_st"],
      crowdedZone:{ x:76, y:34, w:18, h:32, label:"box busy" },
      routePreview:{ from:"h_rw", to:"h_st", kind:"direct", label:"runner" },
      availableIntents:["slip_pass","finish","hold_wait"], opponentBias:["hold_shape","step_up","block_shot"],
      readMatrix:{
        slip_pass:{ beats:"hold_shape", losesTo:"step_up" },
        finish:{ beats:"step_up", losesTo:"block_shot" },
        hold_wait:{ beats:"block_shot", losesTo:"hold_shape" },
      },
    },
    {
      id:"chance_created", title:"Chance Created",
      summary:"A direct chance opens with the keeper and defender involved.",
      ballZone:"central_attack", ballCarrierId:"h_st", pressure:"high", openSide:"left", insideCrowded:false,
      cues:[
        { id:"keeper_rushing", label:"Keeper Moves", sub:"Angle closing",  tone:"warn" },
        { id:"corner_open",    label:"Corner Open",  sub:"Side netting",   tone:"good" },
        { id:"square_free",    label:"Square Pass",  sub:"Teammate free",  tone:"good" },
      ],
      activePlayerIds:["h_st","h_lw","h_am","a_gk","a_cb1","a_cb2"],
      supportOptionIds:["h_lw","h_am"], pressurePlayerIds:["a_gk","a_cb1"], openPlayerIds:["h_lw"],
      crowdedZone:{ x:84, y:38, w:12, h:24, label:"keeper zone" },
      routePreview:{ from:"h_st", to:"h_lw", kind:"direct", label:"square ball" },
      availableIntents:["place_shot","power_shot","square_pass"], opponentBias:["rush_keeper","cover_corner","stay_big"],
      readMatrix:{
        place_shot:{ beats:"rush_keeper", losesTo:"cover_corner" },
        power_shot:{ beats:"stay_big", losesTo:"rush_keeper" },
        square_pass:{ beats:"cover_corner", losesTo:"stay_big" },
      },
    },
    {
      id:"dead_ball", title:"Dead Ball",
      summary:"Set-piece delivery into a packed area.",
      ballZone:"right_attack", ballCarrierId:"h_rw", pressure:"medium", openSide:"box", insideCrowded:true,
      cues:[
        { id:"near_run", label:"Near Run",  sub:"First contact",  tone:"good" },
        { id:"back_run", label:"Back Post", sub:"Far side free",  tone:"good" },
        { id:"cut_lane", label:"Cut Back",  sub:"Late edge run",  tone:"warn" },
      ],
      activePlayerIds:["h_rw","h_st","h_am","a_cb1","a_cb2","a_gk"],
      supportOptionIds:["h_st","h_am"], pressurePlayerIds:["a_cb1","a_cb2"], openPlayerIds:["h_am"],
      crowdedZone:{ x:78, y:30, w:18, h:40, label:"set-piece pack" },
      routePreview:{ from:"h_rw", to:"h_st", kind:"direct", label:"delivery" },
      availableIntents:["near_post","back_post","cut_back"], opponentBias:["mark_zone","guard_near","hold_line"],
      readMatrix:{
        near_post:{ beats:"mark_zone", losesTo:"guard_near" },
        back_post:{ beats:"guard_near", losesTo:"hold_line" },
        cut_back:{ beats:"hold_line", losesTo:"mark_zone" },
      },
    },
    {
      id:"golden_chance", title:"Golden Chance",
      summary:"One on one with the keeper. Make it count.",
      ballZone:"central_attack", ballCarrierId:"h_st", pressure:"high", openSide:"goal", insideCrowded:false,
      cues:[
        { id:"keeper_rushing", label:"Keeper Out",   sub:"Closing angle",  tone:"danger" },
        { id:"corner_open",    label:"Corner Open",  sub:"Near post free", tone:"good"   },
        { id:"square_free",    label:"Square Man",   sub:"Tap-in option",  tone:"good"   },
      ],
      activePlayerIds:["h_st","h_lw","a_gk","a_cb1"],
      supportOptionIds:["h_lw"], pressurePlayerIds:["a_gk","a_cb1"], openPlayerIds:["h_lw"],
      crowdedZone:{ x:86, y:40, w:10, h:20, label:"keeper closing" },
      routePreview:{ from:"h_st", to:null, kind:"shot", label:"1v1" },
      availableIntents:["place_shot","power_shot","square_pass"], opponentBias:["rush_keeper","stay_big","cover_corner"],
      readMatrix:{
        place_shot:{ beats:"rush_keeper", losesTo:"stay_big" },
        power_shot:{ beats:"stay_big", losesTo:"rush_keeper" },
        square_pass:{ beats:"cover_corner", losesTo:"rush_keeper" },
      },
    },
    {
      id:"cutback_window", title:"Cutback Window",
      summary:"Runner arriving late. The cutback could open the goal.",
      ballZone:"right_attack", ballCarrierId:"h_rw", pressure:"medium", openSide:"center", insideCrowded:false,
      cues:[
        { id:"runner_free",  label:"Late Runner",  sub:"Arriving central",  tone:"good" },
        { id:"box_crowded",  label:"Box Full",     sub:"Near post packed",  tone:"warn" },
        { id:"corner_open",  label:"Far Corner",   sub:"Back post angle",   tone:"good" },
      ],
      activePlayerIds:["h_rw","h_am","h_st","a_cb1","a_cb2","a_gk"],
      supportOptionIds:["h_am","h_st"], pressurePlayerIds:["a_cb2"], openPlayerIds:["h_am"],
      crowdedZone:{ x:80, y:36, w:16, h:30, label:"near post pack" },
      routePreview:{ from:"h_rw", to:"h_am", kind:"direct", label:"cutback" },
      availableIntents:["cut_back","finish","slip_pass"], opponentBias:["hold_shape","block_shot","step_up"],
      readMatrix:{
        cut_back:{ beats:"hold_shape", losesTo:"block_shot" },
        finish:{ beats:"step_up", losesTo:"block_shot" },
        slip_pass:{ beats:"block_shot", losesTo:"step_up" },
      },
    },
    {
      id:"near_post_dash", title:"Near Post Dash",
      summary:"Your striker attacks the near post from a wide delivery.",
      ballZone:"left_attack", ballCarrierId:"h_lw", pressure:"medium", openSide:"box", insideCrowded:true,
      cues:[
        { id:"near_run",     label:"Near Run On",  sub:"First contact",      tone:"good" },
        { id:"box_crowded",  label:"Box Busy",     sub:"Defenders packed",   tone:"warn" },
        { id:"back_run",     label:"Back Post",    sub:"Far runner arriving", tone:"good" },
      ],
      activePlayerIds:["h_lw","h_st","h_am","a_cb1","a_cb2","a_gk"],
      supportOptionIds:["h_st","h_am"], pressurePlayerIds:["a_cb1"], openPlayerIds:["h_st"],
      crowdedZone:{ x:76, y:32, w:18, h:36, label:"near-post crowd" },
      routePreview:{ from:"h_lw", to:"h_st", kind:"direct", label:"near post" },
      availableIntents:["near_post","back_post","cut_back"], opponentBias:["guard_near","mark_zone","hold_line"],
      readMatrix:{
        near_post:{ beats:"mark_zone", losesTo:"guard_near" },
        back_post:{ beats:"guard_near", losesTo:"hold_line" },
        cut_back:{ beats:"hold_line", losesTo:"mark_zone" },
      },
    },
    {
      id:"rebound_chaos", title:"Rebound",
      summary:"Keeper spills the ball. First reaction wins.",
      ballZone:"central_attack", ballCarrierId:"h_am", pressure:"high", openSide:"goal", insideCrowded:true,
      cues:[
        { id:"box_crowded",   label:"Box Scramble", sub:"Chaos in the area",  tone:"warn"   },
        { id:"runner_free",   label:"Free Man",     sub:"Arrive on loose ball",tone:"good"  },
        { id:"keeper_rushing",label:"Keeper Down",  sub:"Goal exposed",       tone:"good"   },
      ],
      activePlayerIds:["h_am","h_st","h_rw","a_gk","a_cb1","a_cb2"],
      supportOptionIds:["h_st","h_rw"], pressurePlayerIds:["a_cb1","a_cb2"], openPlayerIds:["h_st"],
      crowdedZone:{ x:82, y:36, w:16, h:28, label:"scramble zone" },
      routePreview:{ from:"h_am", to:"h_st", kind:"direct", label:"poke in" },
      availableIntents:["finish","slip_pass","hold_wait"], opponentBias:["block_shot","step_up","hold_shape"],
      readMatrix:{
        finish:{ beats:"hold_shape", losesTo:"block_shot" },
        slip_pass:{ beats:"block_shot", losesTo:"step_up" },
        hold_wait:{ beats:"step_up", losesTo:"hold_shape" },
      },
    },
    {
      id:"two_v_one_box", title:"2v1 in the Box",
      summary:"Overload in the box. Play through the last defender.",
      ballZone:"central_attack", ballCarrierId:"h_st", pressure:"medium", openSide:"left", insideCrowded:false,
      cues:[
        { id:"runner_free",   label:"Spare Runner",  sub:"One free man",       tone:"good" },
        { id:"shot_closing",  label:"Defender Close",sub:"Closing the angle",  tone:"warn" },
        { id:"square_free",   label:"Square Ball",   sub:"Tap-in available",   tone:"good" },
      ],
      activePlayerIds:["h_st","h_lw","a_cb1","a_gk"],
      supportOptionIds:["h_lw"], pressurePlayerIds:["a_cb1"], openPlayerIds:["h_lw"],
      crowdedZone:null,
      routePreview:{ from:"h_st", to:"h_lw", kind:"direct", label:"square" },
      availableIntents:["slip_pass","finish","hold_wait"], opponentBias:["step_up","hold_shape","block_shot"],
      readMatrix:{
        slip_pass:{ beats:"step_up", losesTo:"hold_shape" },
        finish:{ beats:"hold_shape", losesTo:"block_shot" },
        hold_wait:{ beats:"block_shot", losesTo:"step_up" },
      },
    },
    {
      id:"power_run_box", title:"Box Arrival",
      summary:"Winger isolated the full-back. Cross or cut inside.",
      ballZone:"right_attack", ballCarrierId:"h_rw", pressure:"low", openSide:"center", insideCrowded:false,
      cues:[
        { id:"runner_free",  label:"Striker Free",  sub:"Box run arriving",   tone:"good" },
        { id:"space_ahead",  label:"Space to Cut",  sub:"Drive inside",       tone:"good" },
        { id:"box_crowded",  label:"Box Packed",    sub:"Cross into traffic",  tone:"warn" },
      ],
      activePlayerIds:["h_rw","h_st","h_am","a_rb","a_cb1","a_gk"],
      supportOptionIds:["h_st","h_am"], pressurePlayerIds:["a_rb"], openPlayerIds:["h_st"],
      crowdedZone:{ x:78, y:36, w:18, h:28, label:"crowded box" },
      routePreview:{ from:"h_rw", to:"h_st", kind:"direct", label:"cross" },
      availableIntents:["slip_pass","finish","cut_back"], opponentBias:["hold_shape","step_up","block_shot"],
      readMatrix:{
        slip_pass:{ beats:"hold_shape", losesTo:"step_up" },
        finish:{ beats:"step_up", losesTo:"block_shot" },
        cut_back:{ beats:"block_shot", losesTo:"hold_shape" },
      },
    },
  ],
  DEFEND: [
    {
      id:"defend_runner_behind", title:"Stop the Break",
      summary:"Their runner is loose. Press or hold the line.",
      ballZone:"central_defense", ballCarrierId:"a_cm", pressure:"high", openSide:"behind", insideCrowded:false,
      cues:[
        { id:"danger_run",      label:"Runner Loose", sub:"Behind you",      tone:"danger" },
        { id:"pressure_chance", label:"Can Press",    sub:"Close the ball",  tone:"good"   },
        { id:"space_behind",    label:"Space Behind", sub:"Protect it",      tone:"warn"   },
      ],
      activePlayerIds:["a_cm","a_st","h_cb1","h_cb2","h_dm"],
      supportOptionIds:["h_dm","h_cb2"], pressurePlayerIds:["h_dm"], openPlayerIds:["a_st"],
      crowdedZone:{ x:30, y:35, w:22, h:30, label:"danger" },
      routePreview:{ from:"a_cm", to:"a_st", kind:"danger", label:"danger ball" },
      availableIntents:["press_ball","hold_line","step_in"], opponentBias:["shoot_early","slip_runner","drive_on"],
      readMatrix:{
        press_ball:{ beats:"shoot_early", losesTo:"slip_runner" },
        hold_line:{ beats:"slip_runner", losesTo:"drive_on" },
        step_in:{ beats:"drive_on", losesTo:"shoot_early" },
      },
    },
    {
      id:"counter_three_v_two", title:"Counter Attack",
      summary:"They broke with numbers. Delay and recover.",
      ballZone:"central_defense", ballCarrierId:"a_cm", pressure:"high", openSide:"left", insideCrowded:false,
      cues:[
        { id:"danger_run",      label:"3v2 Break",    sub:"Overload coming",   tone:"danger" },
        { id:"space_behind",    label:"Space Behind", sub:"Keeper exposed",    tone:"warn"   },
        { id:"pressure_chance", label:"Press Option", sub:"Get tight now",     tone:"good"   },
      ],
      activePlayerIds:["a_cm","a_st1","a_st2","h_cb1","h_cb2"],
      supportOptionIds:["h_cb2"], pressurePlayerIds:["h_cb1"], openPlayerIds:["a_st1"],
      crowdedZone:{ x:22, y:32, w:24, h:36, label:"danger zone" },
      routePreview:{ from:"a_cm", to:"a_st1", kind:"danger", label:"break ball" },
      availableIntents:["hold_line","press_ball","step_in"], opponentBias:["slip_runner","drive_on","shoot_early"],
      readMatrix:{
        hold_line:{ beats:"slip_runner", losesTo:"drive_on" },
        press_ball:{ beats:"shoot_early", losesTo:"slip_runner" },
        step_in:{ beats:"drive_on", losesTo:"shoot_early" },
      },
    },
    {
      id:"through_ball_peril", title:"Ball in Behind",
      summary:"Striker in behind the defence. Last chance to stop it.",
      ballZone:"central_defense", ballCarrierId:"a_st", pressure:"high", openSide:"goal", insideCrowded:false,
      cues:[
        { id:"danger_run",      label:"Striker Clear", sub:"1v1 chance on",   tone:"danger" },
        { id:"space_behind",    label:"Space Open",    sub:"Direct run",      tone:"warn"   },
        { id:"pressure_chance", label:"GK Can Act",    sub:"Rush out option", tone:"good"   },
      ],
      activePlayerIds:["a_st","h_cb1","h_gk"],
      supportOptionIds:["h_gk"], pressurePlayerIds:["h_cb1"], openPlayerIds:["a_st"],
      crowdedZone:null,
      routePreview:{ from:"a_st", to:null, kind:"danger", label:"through ball" },
      availableIntents:["hold_line","step_in","press_ball"], opponentBias:["drive_on","shoot_early","slip_runner"],
      readMatrix:{
        hold_line:{ beats:"drive_on", losesTo:"shoot_early" },
        step_in:{ beats:"slip_runner", losesTo:"drive_on" },
        press_ball:{ beats:"shoot_early", losesTo:"slip_runner" },
      },
    },
    {
      id:"corner_danger", title:"Corner Danger",
      summary:"Ball coming into the box from a set piece.",
      ballZone:"left_defense", ballCarrierId:"a_lm", pressure:"medium", openSide:"box", insideCrowded:true,
      cues:[
        { id:"danger_run",      label:"Aerial Threat", sub:"Runner attacking",  tone:"danger" },
        { id:"space_behind",    label:"Back Post",     sub:"Far side exposed",  tone:"warn"   },
        { id:"pressure_chance", label:"Press Keeper",  sub:"Intercept delivery",tone:"good"   },
      ],
      activePlayerIds:["a_lm","a_st1","a_st2","h_cb1","h_cb2","h_gk"],
      supportOptionIds:["h_gk","h_cb2"], pressurePlayerIds:["a_st1"], openPlayerIds:["a_st2"],
      crowdedZone:{ x:12, y:30, w:20, h:40, label:"box crowd" },
      routePreview:{ from:"a_lm", to:"a_st1", kind:"danger", label:"delivery" },
      availableIntents:["step_in","hold_line","press_ball"], opponentBias:["shoot_early","slip_runner","drive_on"],
      readMatrix:{
        step_in:{ beats:"slip_runner", losesTo:"shoot_early" },
        hold_line:{ beats:"drive_on", losesTo:"slip_runner" },
        press_ball:{ beats:"shoot_early", losesTo:"drive_on" },
      },
    },
    {
      id:"cutback_alarm", title:"Cutback Alarm",
      summary:"Their winger gets to the byline. Cutback is coming.",
      ballZone:"left_defense", ballCarrierId:"a_lw", pressure:"high", openSide:"central", insideCrowded:false,
      cues:[
        { id:"danger_run",      label:"Cutback On",    sub:"Runner arriving",   tone:"danger" },
        { id:"pressure_chance", label:"Intercept",     sub:"Block the ball",    tone:"good"   },
        { id:"space_behind",    label:"Box Exposed",   sub:"No cover central",  tone:"warn"   },
      ],
      activePlayerIds:["a_lw","a_st","h_rb","h_cb1","h_gk"],
      supportOptionIds:["h_cb1"], pressurePlayerIds:["h_rb"], openPlayerIds:["a_st"],
      crowdedZone:{ x:16, y:50, w:18, h:28, label:"cutback zone" },
      routePreview:{ from:"a_lw", to:"a_st", kind:"danger", label:"cutback" },
      availableIntents:["step_in","press_ball","hold_line"], opponentBias:["slip_runner","shoot_early","drive_on"],
      readMatrix:{
        step_in:{ beats:"slip_runner", losesTo:"shoot_early" },
        press_ball:{ beats:"shoot_early", losesTo:"drive_on" },
        hold_line:{ beats:"drive_on", losesTo:"slip_runner" },
      },
    },
    {
      id:"press_broken", title:"Press Broken",
      summary:"Their player ran through your first press. Recover fast.",
      ballZone:"central_defense", ballCarrierId:"a_cm", pressure:"high", openSide:"central", insideCrowded:false,
      cues:[
        { id:"space_behind",    label:"Line Broken",   sub:"They're through",   tone:"danger" },
        { id:"danger_run",      label:"Runner Away",   sub:"Can't catch",       tone:"warn"   },
        { id:"pressure_chance", label:"Still Chase",   sub:"Press from behind", tone:"good"   },
      ],
      activePlayerIds:["a_cm","a_st","h_dm","h_cb1","h_cb2"],
      supportOptionIds:["h_cb1","h_cb2"], pressurePlayerIds:["h_dm"], openPlayerIds:["a_st"],
      crowdedZone:null,
      routePreview:{ from:"a_cm", to:"a_st", kind:"danger", label:"through run" },
      availableIntents:["hold_line","step_in","press_ball"], opponentBias:["drive_on","slip_runner","shoot_early"],
      readMatrix:{
        hold_line:{ beats:"slip_runner", losesTo:"drive_on" },
        step_in:{ beats:"drive_on", losesTo:"shoot_early" },
        press_ball:{ beats:"shoot_early", losesTo:"slip_runner" },
      },
    },
    {
      id:"two_v_two_scramble", title:"2v2 Scramble",
      summary:"Two attackers, two defenders. Track your runner.",
      ballZone:"central_defense", ballCarrierId:"a_st1", pressure:"high", openSide:"both", insideCrowded:false,
      cues:[
        { id:"danger_run",      label:"Split Runs",   sub:"Both runners free",  tone:"danger" },
        { id:"pressure_chance", label:"Ball First",   sub:"Win possession",     tone:"good"   },
        { id:"space_behind",    label:"Space Both",   sub:"Cover the channels", tone:"warn"   },
      ],
      activePlayerIds:["a_st1","a_st2","h_cb1","h_cb2"],
      supportOptionIds:["h_cb2"], pressurePlayerIds:["h_cb1"], openPlayerIds:["a_st2"],
      crowdedZone:{ x:20, y:36, w:20, h:28, label:"danger" },
      routePreview:{ from:"a_st1", to:"a_st2", kind:"danger", label:"one-two" },
      availableIntents:["step_in","hold_line","press_ball"], opponentBias:["slip_runner","drive_on","shoot_early"],
      readMatrix:{
        step_in:{ beats:"drive_on", losesTo:"shoot_early" },
        hold_line:{ beats:"slip_runner", losesTo:"drive_on" },
        press_ball:{ beats:"shoot_early", losesTo:"slip_runner" },
      },
    },
    {
      id:"box_wall", title:"Box Wall",
      summary:"They recycle and shoot from outside. Hold the block.",
      ballZone:"central_defense", ballCarrierId:"a_cm", pressure:"medium", openSide:"central", insideCrowded:true,
      cues:[
        { id:"space_behind",    label:"Shot Coming",  sub:"Long range effort",  tone:"warn"   },
        { id:"pressure_chance", label:"Close Down",   sub:"Block the shot",     tone:"good"   },
        { id:"danger_run",      label:"Runner Blind", sub:"Second ball risk",   tone:"danger" },
      ],
      activePlayerIds:["a_cm","a_am","h_cb1","h_cb2","h_dm","h_gk"],
      supportOptionIds:["h_dm","h_gk"], pressurePlayerIds:["h_cb1"], openPlayerIds:["a_am"],
      crowdedZone:{ x:18, y:34, w:18, h:32, label:"box packed" },
      routePreview:{ from:"a_cm", to:null, kind:"danger", label:"shot" },
      availableIntents:["step_in","hold_line","press_ball"], opponentBias:["shoot_early","drive_on","slip_runner"],
      readMatrix:{
        step_in:{ beats:"shoot_early", losesTo:"slip_runner" },
        hold_line:{ beats:"drive_on", losesTo:"shoot_early" },
        press_ball:{ beats:"slip_runner", losesTo:"drive_on" },
      },
    },
  ],
};

// ─── PLAYER_POSES ─────────────────────────────────────────────────────────────
// Maps player situation role to PNG pose.
// "run" = attacking/motion PNG, "defend" = defensive stance, "idle" = standing
export const PLAYER_POSES = {
  ballCarrier:   "run",
  open:          "run",
  support:       "idle",
  active:        "idle",
  pressure:      "defend",
  threat:        "run",
  home_default:  "idle",
  away_default:  "defend",
  MIDFIELD_home: "idle",
  MIDFIELD_away: "defend",
  ATTACK_home:   "run",
  ATTACK_away:   "defend",
  DEFEND_home:   "defend",
  DEFEND_away:   "run",
};

// Helper: resolve the correct pose for any player given their situation context.
// Called in gameLogic withSituationAdjustments — result stored as p.pose
export const getPlayerPose = (player, situation, gs) => {
  const isHome = (player.id || player.t || "").startsWith("h");
  if (player.hB || player.id === situation?.ballCarrierId) return "run";
  const openIds     = new Set(situation?.openPlayerIds     || []);
  const pressureIds = new Set(situation?.pressurePlayerIds || []);
  const supportIds  = new Set(situation?.supportOptionIds  || []);
  if (openIds.has(player.id))     return "run";
  if (pressureIds.has(player.id)) return "defend";
  if (supportIds.has(player.id))  return "idle";
  if (gs === "ATTACK")  return isHome ? "run"    : "defend";
  if (gs === "DEFEND")  return isHome ? "defend" : "run";
  return isHome ? "idle" : "defend";
};

// ─── ZONE ─────────────────────────────────────────────────────────────────────
export const ZONE = {
  MIDFIELD: { col:"#facc15", lbl:"MIDFIELD", tint:"transparent",         danim:false },
  ATTACK:   { col:"#4ade80", lbl:"ATTACK",   tint:"rgba(22,163,74,.04)", danim:false },
  DEFEND:   { col:"#f87171", lbl:"DEFEND",   tint:"rgba(185,28,28,.12)", danim:true  },
};

// ─── ACTION_MODS ──────────────────────────────────────────────────────────────
export const ACTION_MODS = {
  MIDFIELD: [  0.12,  0.02, -0.08 ],
  ATTACK:   [  0.05,  0.10, -0.05 ],
  DEFEND:   [  0.08, -0.02,  0.04 ],
};

// ─── BASE ─────────────────────────────────────────────────────────────────────
// Fallback positions. Ball carrier forward, free runner isolated ahead,
// pressure player tight, support behind, defenders in compact band.
export const BASE = {
  MIDFIELD: [
    { x:44, y:50, r:"Y", hB:true,  t:"h", pose:"run"    },
    { x:32, y:44, r:"m", hB:false, t:"h", pose:"idle"   },
    { x:66, y:70, r:"m", hB:false, t:"h", pose:"run"    },
    { x:52, y:44, r:"o", hB:false, t:"a", pose:"defend" },
    { x:54, y:58, r:"o", hB:false, t:"a", pose:"defend" },
  ],
  ATTACK: [
    { x:80, y:50, r:"Y", hB:true,  t:"h", pose:"run"    },
    { x:78, y:34, r:"m", hB:false, t:"h", pose:"run"    },
    { x:78, y:66, r:"m", hB:false, t:"h", pose:"run"    },
    { x:86, y:44, r:"o", hB:false, t:"a", pose:"defend" },
    { x:86, y:56, r:"o", hB:false, t:"a", pose:"defend" },
  ],
  DEFEND: [
    { x:22, y:50, r:"Y", hB:false, t:"h", pose:"defend" },
    { x:18, y:38, r:"m", hB:false, t:"h", pose:"defend" },
    { x:18, y:62, r:"m", hB:false, t:"h", pose:"defend" },
    { x:40, y:46, r:"o", hB:true,  t:"a", pose:"run"    },
    { x:46, y:58, r:"o", hB:false, t:"a", pose:"run"    },
  ],
};

// ─── SCENES ───────────────────────────────────────────────────────────────────
// Story-first positioning. Every row tells ONE clear visual story.
// Layout per row: [0]=ball carrier, [1]=home support, [2]=home secondary/free runner
//                 [3]=opponent pressure/threat,       [4]=opponent secondary
// x=left→right (home attacks right), y=top→bottom. Range 0-100.
// pose: "run"|"defend"|"idle" — which PNG sprite to show
export const SCENES = {
  MIDFIELD: [
    // 0: midfield_pocket — FREE MAN RIGHT dominant story
    // Carrier central-left. Defender tight behind. Right channel wide open.
    [{x:41,y:50,hB:true,pose:"run"},    {x:30,y:42,hB:false,pose:"idle"},   {x:70,y:72,hB:false,pose:"run"},    {x:49,y:44,hB:false,pose:"defend"}, {x:52,y:58,hB:false,pose:"defend"}],
    // 1: build_from_back — PRESSURE HIGH, inside lane available
    // Carrier deep left. Opponent pressing from front. Lane through middle open.
    [{x:22,y:55,hB:true,pose:"run"},    {x:36,y:46,hB:false,pose:"idle"},   {x:18,y:34,hB:false,pose:"idle"},   {x:30,y:48,hB:false,pose:"defend"}, {x:44,y:38,hB:false,pose:"defend"}],
    // 2: half_space_turn — BETWEEN THE LINES, gap ahead, wide runner free
    [{x:50,y:44,hB:true,pose:"run"},    {x:40,y:52,hB:false,pose:"idle"},   {x:66,y:70,hB:false,pose:"run"},    {x:58,y:40,hB:false,pose:"defend"}, {x:62,y:56,hB:false,pose:"defend"}],
    // 3: wide_overload — 2v1 RIGHT. Carrier right, overlap ahead, outnumbered defender
    [{x:58,y:68,hB:true,pose:"run"},    {x:70,y:74,hB:false,pose:"run"},    {x:48,y:54,hB:false,pose:"idle"},   {x:65,y:62,hB:false,pose:"defend"}, {x:52,y:46,hB:false,pose:"defend"}],
    // 4: counter_launch — STRIKER IN BEHIND. Carrier central, striker in space, defenders scrambling
    [{x:46,y:50,hB:true,pose:"run"},    {x:70,y:44,hB:false,pose:"run"},    {x:38,y:58,hB:false,pose:"idle"},   {x:68,y:56,hB:false,pose:"defend"}, {x:74,y:62,hB:false,pose:"defend"}],
    // 5: transition_open — WIDE LEFT FREE. Carrier central, flank open, opponents chasing
    [{x:48,y:50,hB:true,pose:"run"},    {x:64,y:34,hB:false,pose:"run"},    {x:56,y:62,hB:false,pose:"idle"},   {x:54,y:44,hB:false,pose:"defend"}, {x:60,y:52,hB:false,pose:"defend"}],
    // 6: touchline_trap — PINNED WIDE. Carrier touchline, two closing, only inside escape
    [{x:62,y:80,hB:true,pose:"run"},    {x:50,y:72,hB:false,pose:"idle"},   {x:44,y:60,hB:false,pose:"idle"},   {x:66,y:72,hB:false,pose:"defend"}, {x:58,y:78,hB:false,pose:"defend"}],
    // 7: diagonal_lane — SWITCH NEEDED. Carrier left, far right runner isolated, middle blocked
    [{x:38,y:32,hB:true,pose:"run"},    {x:26,y:44,hB:false,pose:"idle"},   {x:74,y:70,hB:false,pose:"run"},    {x:44,y:28,hB:false,pose:"defend"}, {x:52,y:44,hB:false,pose:"defend"}],
    // 8: central_pocket_deep — DOUBLE PRESS. Two tight centrally, wide right escape
    [{x:44,y:50,hB:true,pose:"run"},    {x:34,y:52,hB:false,pose:"idle"},   {x:68,y:68,hB:false,pose:"run"},    {x:50,y:44,hB:false,pose:"defend"}, {x:48,y:56,hB:false,pose:"defend"}],
    // 9: second_ball — CONTESTED. Loose ball central, two arriving, teammate supporting
    [{x:50,y:48,hB:true,pose:"run"},    {x:58,y:56,hB:false,pose:"run"},    {x:40,y:56,hB:false,pose:"idle"},   {x:52,y:42,hB:false,pose:"defend"}, {x:44,y:48,hB:false,pose:"defend"}],
  ],
  ATTACK: [
    // 0: final_third — RUNNER FREE central. Carrier right third, striker free, defender stepping
    [{x:74,y:68,hB:true,pose:"run"},    {x:82,y:50,hB:false,pose:"run"},    {x:76,y:44,hB:false,pose:"run"},    {x:78,y:60,hB:false,pose:"defend"}, {x:84,y:46,hB:false,pose:"defend"}],
    // 1: chance_created — KEEPER COMING OUT. Square man free, corner open
    [{x:84,y:50,hB:true,pose:"run"},    {x:80,y:30,hB:false,pose:"run"},    {x:80,y:68,hB:false,pose:"idle"},   {x:90,y:50,hB:false,pose:"defend"}, {x:86,y:44,hB:false,pose:"defend"}],
    // 2: dead_ball — SET PIECE. Near and far post runs visible
    [{x:84,y:82,hB:true,pose:"run"},    {x:88,y:42,hB:false,pose:"run"},    {x:90,y:62,hB:false,pose:"run"},    {x:88,y:46,hB:false,pose:"defend"}, {x:88,y:56,hB:false,pose:"defend"}],
    // 3: golden_chance — THROUGH ON GOAL. Running at keeper, square option left
    [{x:83,y:50,hB:true,pose:"run"},    {x:78,y:34,hB:false,pose:"run"},    {x:76,y:62,hB:false,pose:"idle"},   {x:92,y:50,hB:false,pose:"defend"}, {x:87,y:56,hB:false,pose:"defend"}],
    // 4: cutback_window — BYLINE RIGHT. Late runner arriving central, near post packed
    [{x:86,y:78,hB:true,pose:"run"},    {x:78,y:58,hB:false,pose:"run"},    {x:82,y:44,hB:false,pose:"run"},    {x:84,y:46,hB:false,pose:"defend"}, {x:82,y:60,hB:false,pose:"defend"}],
    // 5: near_post_dash — LEFT DELIVERY. Near post attacked, far post less marked
    [{x:84,y:22,hB:true,pose:"run"},    {x:88,y:42,hB:false,pose:"run"},    {x:90,y:60,hB:false,pose:"run"},    {x:88,y:38,hB:false,pose:"defend"}, {x:88,y:54,hB:false,pose:"defend"}],
    // 6: rebound_chaos — SCRAMBLE. Loose ball, keeper down, free man arriving
    [{x:82,y:50,hB:true,pose:"run"},    {x:78,y:42,hB:false,pose:"run"},    {x:80,y:60,hB:false,pose:"run"},    {x:84,y:44,hB:false,pose:"defend"}, {x:86,y:56,hB:false,pose:"defend"}],
    // 7: two_v_one_box — 2v1. Carrier central, free man left, lone defender choosing
    [{x:82,y:52,hB:true,pose:"run"},    {x:80,y:34,hB:false,pose:"run"},    {x:78,y:64,hB:false,pose:"idle"},   {x:86,y:48,hB:false,pose:"defend"}, {x:90,y:50,hB:false,pose:"defend"}],
    // 8: power_run_box — 1v1 WIDE. Carrier right vs fullback, striker free in box
    [{x:76,y:72,hB:true,pose:"run"},    {x:84,y:52,hB:false,pose:"run"},    {x:78,y:56,hB:false,pose:"idle"},   {x:78,y:68,hB:false,pose:"defend"}, {x:84,y:44,hB:false,pose:"defend"}],
    // 9: (extra slot)
    [{x:78,y:50,hB:true,pose:"run"},    {x:71,y:28,hB:false,pose:"run"},    {x:71,y:70,hB:false,pose:"idle"},   {x:86,y:40,hB:false,pose:"defend"}, {x:82,y:61,hB:false,pose:"defend"}],
  ],
  DEFEND: [
    // 0: defend_runner_behind — RUNNER BREAKING. Attacker ahead, runner in space
    [{x:26,y:50,hB:false,pose:"defend"},{x:20,y:38,hB:false,pose:"defend"},{x:20,y:64,hB:false,pose:"defend"},{x:42,y:44,hB:true, pose:"run"},    {x:54,y:58,hB:false,pose:"run"}],
    // 1: counter_three_v_two — 3v2 BREAK. Outnumbered, attackers spread wide
    [{x:28,y:42,hB:false,pose:"defend"},{x:26,y:62,hB:false,pose:"defend"},{x:18,y:50,hB:false,pose:"defend"},{x:46,y:36,hB:true, pose:"run"},    {x:52,y:52,hB:false,pose:"run"}],
    // 2: through_ball_peril — STRIKER IN BEHIND. Running at keeper, last man chasing
    [{x:16,y:50,hB:false,pose:"defend"},{x:22,y:42,hB:false,pose:"defend"},{x:24,y:58,hB:false,pose:"defend"},{x:38,y:48,hB:true, pose:"run"},    {x:46,y:54,hB:false,pose:"run"}],
    // 3: corner_danger — AERIAL SET PIECE. Near post packed, far post threat free
    [{x:20,y:44,hB:false,pose:"defend"},{x:18,y:58,hB:false,pose:"defend"},{x:12,y:50,hB:false,pose:"defend"},{x:22,y:40,hB:true, pose:"run"},    {x:26,y:62,hB:false,pose:"run"}],
    // 4: cutback_alarm — WINGER BYLINE. Cutback incoming, box exposed centrally
    [{x:22,y:52,hB:false,pose:"defend"},{x:18,y:40,hB:false,pose:"defend"},{x:12,y:50,hB:false,pose:"defend"},{x:16,y:74,hB:true, pose:"run"},    {x:28,y:54,hB:false,pose:"run"}],
    // 5: press_broken — LINE BROKEN. Attacker through, defenders recovering
    [{x:22,y:46,hB:false,pose:"defend"},{x:20,y:58,hB:false,pose:"defend"},{x:12,y:50,hB:false,pose:"defend"},{x:40,y:50,hB:true, pose:"run"},    {x:52,y:44,hB:false,pose:"run"}],
    // 6: two_v_two_scramble — 2v2. Split runners, defenders tracking
    [{x:24,y:40,hB:false,pose:"defend"},{x:22,y:62,hB:false,pose:"defend"},{x:14,y:50,hB:false,pose:"defend"},{x:40,y:46,hB:true, pose:"run"},    {x:44,y:62,hB:false,pose:"run"}],
    // 7: box_wall — SHOT FROM OUTSIDE. Shooter lining up, defenders in block
    [{x:18,y:44,hB:false,pose:"defend"},{x:16,y:58,hB:false,pose:"defend"},{x:10,y:50,hB:false,pose:"defend"},{x:34,y:48,hB:true, pose:"run"},    {x:28,y:56,hB:false,pose:"idle"}],
    // 8-9: extra slots
    [{x:20,y:50,hB:false,pose:"defend"},{x:14,y:38,hB:false,pose:"defend"},{x:14,y:62,hB:false,pose:"defend"},{x:33,y:44,hB:true, pose:"run"},    {x:34,y:57,hB:false,pose:"run"}],
    [{x:26,y:50,hB:false,pose:"defend"},{x:18,y:34,hB:false,pose:"defend"},{x:18,y:67,hB:false,pose:"defend"},{x:44,y:39,hB:true, pose:"run"},    {x:48,y:64,hB:false,pose:"run"}],
  ],
};


// ─── BT ───────────────────────────────────────────────────────────────────────
export const BT = {
  MIDFIELD: [{ x:67,y:40 },{ x:38,y:45 },{ x:78,y:27 }],
  ATTACK:   [{ x:95,y:50 },{ x:89,y:44 },{ x:77,y:50 }],
  DEFEND:   [{ x:52,y:36 },{ x:22,y:50 },{ x:24,y:51 }],
};

// ─── TRANS ────────────────────────────────────────────────────────────────────
export const TRANS = {
  MIDFIELD: { s:"ATTACK",   f:"DEFEND"  },
  ATTACK:   { s:"GOAL",     f:"DEFEND"  },
  DEFEND:   { s:"MIDFIELD", f:"CONCEDE" },
};

// ─── COMM ─────────────────────────────────────────────────────────────────────
export const COMM = {
  MIDFIELD: [
    {
      s:["Unstoppable surge — the defence is split wide open!","Pace and power, he bursts right through the midfield!","Beautiful weight on that run — space opened up ahead!","He drives forward and nobody can get near him!","Line broken! They're into the final third now.","Tremendous energy from the midfielder — charging through!"],
      f:["Caught in possession — risky business there.","Heavy touch and they pounce on it immediately.","Pressed into a mistake — the ball is lost.","Misread the run and a counter is on.","The drive stalls. Closed down quickly and well.","Too ambitious — intercepted with ease."],
    },
    {
      s:["Perfect weight — keeps possession moving nicely.","Crisp one-touch, they recycle it beautifully.","Patient build-up, working into some lovely space.","Good combination play, shifting the defence left and right.","No risk taken — but the ball keeps ticking.","Smart, simple football — keeping the shape compact."],
      f:["Intercepted! They're straight on the counter!","Misplaced — danger suddenly brewing now.","Sloppy touch and they punish it immediately.","Ball given away in a terrible area — they're in trouble.","Too slow in the decision and the press wins the ball.","Turned over. The crowd gasps."],
    },
    {
      s:["Inch-perfect diagonal — switches the play completely!","Over the top and there's a runner in behind!","Long switch finds the overlap — what a ball!","Brilliant vision — opens up the entire right channel.","Lofted perfectly, the striker is in on goal!","Raking pass splits the whole midfield block!"],
      f:["Keeper claims it comfortably — too ambitious.","Overhit, straight through to their goalkeeper.","Intercepted by the last man — let off there.","Misread in the air — cleared with ease.","Poor connection — ball loops out of play.","Wayward delivery — gives it straight back."],
    },
  ],
  ATTACK: [
    {
      s:["GOAAAAL! Absolutely unstoppable! 🔥","Back of the net!! What a finish!","HE SCORES!! The crowd erupts! 🎉","GOAL! Clinical finish — the keeper had no chance!","TOP CORNER! Perfection. Pure perfection. ⚡","One-nil! Composed, cool and drilled home!"],
      f:["Off the post! Agonising — so close!","Saved! What a stop from the keeper!","Wide! Just a fraction off target.","Blocked on the line — incredible defending!","Hit straight at him — poor decision there.","Keeper spreads himself and smothers it well."],
    },
    {
      s:["Clinical through ball — perfect timing!","Threaded perfectly — it's rolled into the corner!","Slide rule pass — composed finish follows!","The layoff is sublime — low drive, keeper nowhere!","One-two and it's in! Slick, slick combination!","Delicate touch and the striker tucks it away!"],
      f:["Flagged offside — the chance is wasted!","Read brilliantly by the keeper — parried away.","Straight at him — the striker needs to do better.","Cleared off the line — they survive!","Defender reads it perfectly — no chance.","VAR check... and it's ruled out! Heartbreak."],
    },
    {
      s:["Strong hold-up play, draws a foul — free kick!","Brought down! Referee points to the spot!","Chest, control, turn — he's through on goal!","Clever link-up, creates space for the overlap.","Holds off three players — what strength!","Brilliant footwork — dribbles past the last man!"],
      f:["Muscled off — bigger defender wins that easily.","Too static — dispossessed without a fight.","Isolated up front, ball is hoofed clear.","Brave challenge — ball poked away cleanly.","Outnumbered and out-muscled there.","Turns into a dead end — gives it away cheaply."],
    },
  ],
  DEFEND: [
    {
      s:["TACKLE! Won it back! Crowd on their feet! 💪","Brilliant press — the ball is theirs again!","High press triggers a mistake — they're on the counter!","Swarmed! Ball turned over in dangerous territory for the AI!","Pressure wins it — what a block!","Intercepts the pass and breaks at pace!"],
      f:["Beaten by a simple stepover — space opened up.","Committed too early — sold the dummy completely.","Pressed too high — they're in behind!","They ride the challenge and continue to goal.","Number mismatch — left exposed by the press.","Over-committed, beaten for pace on the outside."],
    },
    {
      s:["Times it perfectly — clean tackle!","Anticipates the pass and steps across — intercepted!","Reads it brilliantly — ball poked away!","Position is everything — blocks the shooting lane.","Smart jockeying forces a bad touch!","Alert defending — cuts off the through ball!"],
      f:["Sold with a feint — goes the wrong way!","Dribbled past with ease — far too flat-footed.","Out of position and they exploit it instantly.","Wrong moment — goes to ground too early.","Stepped in but lacked conviction.","Ball slips past — a yard off the pace."],
    },
    {
      s:["Excellent shape — holds the line perfectly compact.","Organised defence snuffs out any danger.","Patient defending — absorbs the pressure well.","Offside trap WORKS! Flag goes up! 🚩","No gaps offered — disciplined shape.","Backs off, forces a bad decision — keeper claims!"],
      f:["Line drops too deep — given too much space.","Passive defending punished — they fire home!","Too much room allowed — hit on the turn and scores.","Dropped off and left them shoot from outside the box.","Sat too deep — invited the pressure on.","Gave him time to pick his spot — keeper beaten!"],
    },
  ],
};

// ─── RESMSG ───────────────────────────────────────────────────────────────────
export const RESMSG = {
  MIDFIELD: { s:"Space opened! Forward.",       f:"Lost it. They charge."    },
  ATTACK:   { s:"Good movement! Keep pushing.", f:"Chance gone. They break!" },
  DEFEND:   { s:"Cleared! Back in control.",    f:"Through! Emergency!"      },
};

// ─── CPU_ACTIONS ──────────────────────────────────────────────────────────────
export const CPU_ACTIONS = {
  MIDFIELD: [
    { id:"press_inside", idx:0, lbl:"Press Inside", rc:"#ef4444" },
    { id:"close_wide",   idx:1, lbl:"Close Wide",   rc:"#f59e0b" },
    { id:"hold_middle",  idx:2, lbl:"Hold Middle",  rc:"#94a3b8" },
  ],
  ATTACK: [
    { id:"block_shot",   idx:0, lbl:"Block Shot",   rc:"#ef4444" },
    { id:"track_runner", idx:1, lbl:"Track Runner", rc:"#f59e0b" },
    { id:"rush_keeper",  idx:2, lbl:"Rush Keeper",  rc:"#94a3b8" },
  ],
  DEFEND: [
    { id:"slow_build",   idx:0, lbl:"Slow Build",   rc:"#ef4444" },
    { id:"one_two",      idx:1, lbl:"One-Two",      rc:"#f59e0b" },
    { id:"through_ball", idx:2, lbl:"Through Ball", rc:"#94a3b8" },
  ],
};

// ─── MATCHUP_MODS ─────────────────────────────────────────────────────────────
export const MATCHUP_MODS = {
  MIDFIELD: {
    go_wide:   { press_inside:+0.14, close_wide:-0.12, hold_middle:+0.06 },
    drive_on:  { press_inside:-0.10, close_wide:+0.08, hold_middle:+0.12 },
    play_safe: { press_inside:+0.04, close_wide:+0.10, hold_middle:-0.06 },
  },
  ATTACK: {
    finish:    { block_shot:-0.14, track_runner:+0.08, rush_keeper:+0.10 },
    slip_pass: { block_shot:+0.10, track_runner:-0.12, rush_keeper:+0.06 },
    hold_wait: { block_shot:+0.06, track_runner:+0.04, rush_keeper:-0.10 },
  },
  DEFEND: {
    press_ball: { slow_build:+0.14, one_two:-0.14, through_ball:+0.04 },
    step_in:    { slow_build:+0.06, one_two:+0.08, through_ball:-0.10 },
    hold_line:  { slow_build:-0.06, one_two:+0.10, through_ball:+0.12 },
  },
};

// ─── MATCHUP_NARR ─────────────────────────────────────────────────────────────
export const MATCHUP_NARR = {
  MIDFIELD: {
    go_wide:   { press_inside:"Space opened wide!", close_wide:"Closed down quickly.", hold_middle:"Found the gap!"    },
    drive_on:  { press_inside:"Caught in traffic.", close_wide:"Burst right through!", hold_middle:"Drives into space!"},
    play_safe: { press_inside:"Recycled calmly.",   close_wide:"Found the outlet.",    hold_middle:"Slowed it down."   },
  },
  ATTACK: {
    finish:    { block_shot:"Shot blocked!",       track_runner:"Clinical finish!",     rush_keeper:"Keeper closed angle."  },
    slip_pass: { block_shot:"Pass cuts through!",  track_runner:"Runner tracked.",      rush_keeper:"Slipped in behind!"    },
    hold_wait: { block_shot:"Held up well.",        track_runner:"Waited for support.",  rush_keeper:"Keeper rushed out."    },
  },
  DEFEND: {
    press_ball: { slow_build:"Won it high!",       one_two:"Played through the press.", through_ball:"Pressure forced error." },
    step_in:    { slow_build:"Stepped and won.",   one_two:"One-two beat the step.",    through_ball:"Deflected wide."        },
    hold_line:  { slow_build:"Line held firm.",    one_two:"Shape absorbed it.",        through_ball:"Offside trap works!"    },
  },
};

// ─── RW / CW ─────────────────────────────────────────────────────────────────
export const RW = {
  win:         20, draw:8, loss:10, gol:3, cs:8,
  streaks: [
    { n:3,  pts:15, lbl:"3 WIN STREAK! 🔥" },
    { n:5,  pts:25, lbl:"5 WIN STREAK! ⚡"  },
    { n:10, pts:50, lbl:"10 WIN STREAK! 👑" },
  ],
};

export const CW = { win:18, draw:8, loss:4, gol:3, cs:5 };

// ─── REWARDS ──────────────────────────────────────────────────────────────────
export const REWARDS = {
  firstWin:   { rep:25, title:"FIRST VICTORY", sub:"Your journey begins",     icon:"🏆", extras:["🎁 Lucky Dip","⚡ Bonus XP"],       type:"green" },
  fiveStreak: { rep:50, title:"LEGENDARY RUN", sub:"Five wins on the bounce", icon:"🔥", extras:["👑 Streak Badge","💎 Elite Pack"], type:"gold"  },
};

// ─── SQUAD_LIMIT ──────────────────────────────────────────────────────────────
export const SQUAD_LIMIT = 6;

// ─── ROLE_STAT / ROLE_LABEL / ROLE_SHORT ──────────────────────────────────────
export const ROLE_STAT  = { striker:"atk", midfielder:"mid", defender:"def" };
export const ROLE_LABEL = { striker:"Front Line", midfielder:"Engine Room", defender:"Back Line" };
export const ROLE_SHORT = { striker:"ATK", midfielder:"MID", defender:"DEF" };
export const RARITY_COL = { common:"#9ab5a0", rare:"#60a5fa", elite:"#d4a017" };

// ─── TIERS ────────────────────────────────────────────────────────────────────
export const TIERS = [
  { name:"Master League", short:"MASTER", icon:"👑", col:"#d4a017", bg:"rgba(212,160,23,.12)",  min:1,  max:10 },
  { name:"Professional",  short:"PRO",    icon:"⭐", col:"#18c158", bg:"rgba(24,193,88,.12)",   min:11, max:20 },
  { name:"Elite League",  short:"ELITE",  icon:"🔥", col:"#a78bfa", bg:"rgba(167,139,250,.12)", min:21, max:30 },
  { name:"Amateur",       short:"AMT",    icon:"🎯", col:"#34d399", bg:"rgba(52,211,153,.12)",  min:31, max:40 },
  { name:"Rookie",        short:"ROOKIE", icon:"🌱", col:"#94a3b8", bg:"rgba(148,163,184,.1)",  min:41, max:50 },
];

// ─── FORMATIONS ───────────────────────────────────────────────────────────────
export const FORMATIONS = [
  { id:"press-433",    shape:"4-3-3", name:"Press 4-3-3",   desc:"Aggressive front-foot shape for quick attacks.",        mods:{ atk:2, mid:1, def:-1 } },
  { id:"control-433",  shape:"4-3-3", name:"Control 4-3-3", desc:"Balanced shape built on midfield circulation.",         mods:{ atk:1, mid:2, def:0  } },
  { id:"pivot-4231",   shape:"4-2-3-1", name:"Pivot 4-2-3-1", desc:"Double pivot control with quick runners between lines.", mods:{ atk:2, mid:0, def:1  } },
  { id:"classic-442",  shape:"4-4-2", name:"Classic 4-4-2", desc:"Solid structure with support in every lane.",           mods:{ atk:1, mid:1, def:1  } },
  { id:"diamond-41212",shape:"4-1-2-1-2", name:"Diamond 4-1-2-1-2", desc:"Central overload built for slip passes and second balls.", mods:{ atk:1, mid:3, def:-1 } },
  { id:"wide-352",     shape:"3-5-2", name:"Wide 3-5-2",    desc:"Wing-back width with numbers around midfield.",         mods:{ atk:1, mid:3, def:0  } },
  { id:"storm-343",    shape:"3-4-3", name:"Storm 3-4-3",   desc:"Heavy attacking front line that accepts defensive risk.", mods:{ atk:3, mid:0, def:-1 } },
  { id:"lock-532",     shape:"5-3-2", name:"Lock 5-3-2",    desc:"Protect your box and hit direct counters.",             mods:{ atk:0, mid:1, def:2  } },
  { id:"low-541",      shape:"5-4-1", name:"Low Block 5-4-1", desc:"Deep defensive shell for surviving dangerous opponents.", mods:{ atk:-1, mid:1, def:3 } },
];

// ─── MCARDS ───────────────────────────────────────────────────────────────────
export const MCARDS = [
  { id:1,  name:"Bolt Okafor",   role:"striker",    rarity:"common", boost:1, cost:30,  number:"9"  },
  { id:2,  name:"Flash Adeyemi", role:"striker",    rarity:"common", boost:1, cost:30,  number:"11" },
  { id:3,  name:"Volt Musa",     role:"striker",    rarity:"rare",   boost:2, cost:65,  number:"17" },
  { id:4,  name:"Storm Sule",    role:"striker",    rarity:"elite",  boost:3, cost:130, number:"99" },
  { id:5,  name:"Dribble Eze",   role:"midfielder", rarity:"common", boost:1, cost:30,  number:"8"  },
  { id:6,  name:"Press Faruk",   role:"midfielder", rarity:"common", boost:1, cost:30,  number:"6"  },
  { id:7,  name:"Crisp Amara",   role:"midfielder", rarity:"rare",   boost:2, cost:65,  number:"14" },
  { id:8,  name:"ZAP Maestro",   role:"midfielder", rarity:"elite",  boost:3, cost:130, number:"10" },
  { id:9,  name:"Wall Chukwu",   role:"defender",   rarity:"common", boost:1, cost:30,  number:"4"  },
  { id:10, name:"Steel Bello",   role:"defender",   rarity:"rare",   boost:2, cost:65,  number:"5"  },
  { id:11, name:"Titan Obi",     role:"defender",   rarity:"elite",  boost:3, cost:130, number:"3"  },
  { id:12, name:"ZAP Wall",      role:"defender",   rarity:"elite",  boost:3, cost:130, number:"2"  },
];

// ─── CPU_P ────────────────────────────────────────────────────────────────────
export const CPU_P = [
  {n:"El Maestro",p:1480},{n:"Phantom XI",p:1352},{n:"Ghost Strike",p:1267},{n:"Iron Ramos",p:1183},
  {n:"SkyFoot",p:1097},{n:"Zidane Echo",p:982},{n:"Bolt99",p:928},{n:"KingKante",p:877},
  {n:"NightOwl FC",p:838},{n:"TigerPress",p:796},{n:"Salah Heir",p:748},{n:"AfroBallon",p:708},
  {n:"LagosLion",p:668},{n:"AbujaBeast",p:631},{n:"DeltaFC",p:595},{n:"KanoKing",p:560},
  {n:"WestCoast",p:522},{n:"PortCity",p:488},{n:"RiverRun",p:452},{n:"Okonkwo",p:420},
  {n:"NairobiFC",p:390},{n:"AccraPulse",p:360},{n:"Dakar11",p:328},{n:"AbujaWolf",p:300},
  {n:"FastFoot",p:272},{n:"NileCross",p:250},{n:"SavannaStar",p:228},{n:"Ibadan01",p:202},
  {n:"EnoguFC",p:182},{n:"Zenith11",p:165},{n:"LukeSkill",p:150},{n:"ProPedro",p:136},
  {n:"SemiStar",p:124},{n:"TacticsMan",p:114},{n:"MidMark",p:104},{n:"PaceFC",p:94},
  {n:"GreenPass",p:84},{n:"NewCity",p:76},{n:"BlueStar",p:67},{n:"Rookie99",p:58},
  {n:"StartFC",p:48},{n:"LowKey",p:39},{n:"GrindFC",p:32},{n:"UnderDog",p:25},
  {n:"LastMan",p:19},{n:"FreshCut",p:14},{n:"NewBoot",p:9},{n:"ZeroFC",p:5},{n:"Beginner",p:2},
];

// ─── HT_TALK ──────────────────────────────────────────────────────────────────
export const HT_TALK = {
  winning: [
    "Strong half. Keep the press high — don't sit on it.",
    "That lead is yours to protect. Stay alert in the second half.",
    "You've earned this. Don't drop off now — keep hunting.",
  ],
  drawing: [
    "Nothing between the sides. Next goal takes it.",
    "One moment of quality wins this. Stay focused.",
    "Tight game. Keep your shape and be clinical.",
  ],
  losing: [
    "Time to dig deep. Nothing is decided.",
    "Wake up. Forty-five minutes to turn this around.",
    "They want it. Go out there and prove you want it more.",
  ],
};

// ─── FORMATION_FELT ───────────────────────────────────────────────────────────
const toFelt = (str) =>
  "0x" + Array.from(str).map(c => c.charCodeAt(0).toString(16).padStart(2,"0")).join("");

export const FORMATION_FELT = {
  "press-433":   toFelt("press-433"),
  "control-433": toFelt("control-433"),
  "pivot-4231":  toFelt("pivot-4231"),
  "classic-442": toFelt("classic-442"),
  "diamond-41212": toFelt("diamond-41212"),
  "wide-352":    toFelt("wide-352"),
  "storm-343":   toFelt("storm-343"),
  "lock-532":    toFelt("lock-532"),
  "low-541":     toFelt("low-541"),
};
