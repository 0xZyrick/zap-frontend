// ─── GameScreen.jsx ───────────────────────────────────────────────────────────
// Orchestrates the live match. Owns all in-game state via useRef/useState.
// Delegates rendering to pitch, player, and UI sub-components.

import { useState, useEffect, useRef, useCallback } from "react";

import { PitchMarkings, PremiumBall, GoalMomentSVG } from "../pitch/pitch.jsx";
import PlayerFigure from "../players/PlayerFigure.jsx";
import MatchStadiumShell from "../ui/MatchStadiumShell.jsx";
import { ScoreBar, StatPanel, ActionCards, ResolutionScreen, Commentary, CPUChoiceBanner, ResultFlash, IntentDirectionArrow, PitchCueBadges } from "../ui/ui.jsx";
import { HalfTime, FullTime, TierChangeModal, RewardModal, DemotionModal } from "../modals/matchModals.jsx";
import GuidedCueOverlay from "../components/GuidedCueOverlay.jsx";

import {
  resolveIntent, buildTurnContext, getIntentRoute, mkTimeSeed, turnToTime,
  buildMatchRewards, checkRewardUnlock,
  simCPU, pick, clamp, rand01, getReadMatchup,
} from "./gameLogic.js";
import { myRank, getTier, getFormation } from "./gameState.js";
import { BT, RESMSG, REWARDS, OPPONENT_INTENTS, INTENTS } from "./constants.js";
import { trackTurnPlayed, trackHalftimeReached, trackMatchCompleted } from "../lib/analytics.js";

const TURNS_PER_HALF = 10;
const MAX_TURNS = TURNS_PER_HALF * 2;
const CHAIN_STATUS = {
  ACTIVE: 0,
  HALFTIME: 1,
  FINISHED: 2,
  CLAIMED: 3,
};
const EMPTY_MATCH_STATS = { shots_h:0, shots_a:0, saves_h:0, saves_a:0, attacks_h:0, attacks_a:0 };
const distSq = (a, b) => ((a?.x ?? 0) - (b?.x ?? 0)) ** 2 + ((a?.y ?? 0) - (b?.y ?? 0)) ** 2;

function getTurnContextLine({ score, gs, matchTime, momentum }) {
  if (momentum === "in_form") return "IN FORM · THEY HAVEN'T READ YOU YET";
  if (momentum === "under_pressure") return "UNDER PRESSURE · FIND YOUR WAY BACK";
  if ((score?.h ?? 0) < (score?.a ?? 0) && gs === "DEFEND") return `${score.h}-${score.a} DOWN · DEFEND · ${matchTime}`;
  if ((score?.h ?? 0) > (score?.a ?? 0) && matchTime) return `${score.h}-${score.a} UP · ${gs} · ${matchTime}`;
  return `${score?.h ?? 0}-${score?.a ?? 0} · ${gs} · GAME IS OPEN`;
}

function getTurnDirection(context, movement) {
  const target = movement?.target || movement?.route?.to || context?.routes?.[0]?.to || context?.ball;
  if (context?.openSide === "right" || target?.y > 60) return "right";
  if (context?.openSide === "left" || target?.y < 40) return "left";
  return "central";
}

function pickDefendIndexFromLoss(direction, fallbackIndex) {
  if (direction === "right") return 4; // cutback arrives from that side
  if (direction === "left") return 3;  // wide delivery arrives from that side
  return fallbackIndex;
}

function buildMomentCamera(context, gs) {
  const players = context?.players || [];
  const ballCarrier = players.find(p => p.id === context?.ballCarrierId) || players.find(p => p.hB);

  if (!ballCarrier) {
    const origin = gs === "ATTACK" ? "76% 50%" : gs === "DEFEND" ? "24% 50%" : "50% 50%";
    return { transform: gs === "ATTACK" ? "scale(1.22)" : gs === "DEFEND" ? "scale(1.16)" : "scale(1.08)", transformOrigin: origin };
  }

  const byId = (id) => players.find(p => p.id === id) || null;
  const pressurePlayer = (context.pressurePlayers || [])
    .map(byId)
    .filter(Boolean)
    .sort((a, b) => distSq(a, ballCarrier) - distSq(b, ballCarrier))[0] ||
    players
      .filter(p => p.t !== ballCarrier.t)
      .sort((a, b) => distSq(a, ballCarrier) - distSq(b, ballCarrier))[0];

  const openRunner = (context.openPlayers || [])
    .map(byId)
    .filter(Boolean)
    .sort((a, b) => Math.abs((b.y ?? 50) - 50) - Math.abs((a.y ?? 50) - 50))[0];

  const supportPlayer = (context.supportOptions || [])
    .map(byId)
    .filter(Boolean)
    .sort((a, b) => distSq(a, ballCarrier) - distSq(b, ballCarrier))[0];

  // Keep the relevant goalkeeper in the same football section without letting
  // both goals flatten the shot into a full-pitch view.
  const phaseKeeper = gs === "ATTACK"
    ? players.find(p => p.t === "a" && p.role === "GK")
    : gs === "DEFEND"
      ? players.find(p => p.t === "h" && p.role === "GK")
      : null;

  const focusPlayers = [ballCarrier, pressurePlayer, openRunner, supportPlayer, phaseKeeper].filter(Boolean);
  const xs = focusPlayers.map(p => p.x);
  const ys = focusPlayers.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(8, maxX - minX);
  const height = Math.max(8, maxY - minY);

  const xPad = gs === "MIDFIELD" ? 14 : 12;
  const yPad = gs === "MIDFIELD" ? 24 : 22;
  const rawZoom = Math.min(100 / (width + xPad), 100 / (height + yPad));
  const maxZoom = gs === "ATTACK" ? 3.35 : gs === "DEFEND" ? 3.18 : 2.85;
  const closeFloor = gs === "MIDFIELD" ? 1.72 : 1.86;
  const zoom = rawZoom >= closeFloor ? Math.min(rawZoom, maxZoom) : rawZoom;

  const direction = ballCarrier.t === "a" ? -1 : 1;
  const visibleWidth = 100 / zoom;
  const extraWidth = Math.max(0, visibleWidth - width);
  const forwardBias = direction * Math.min(4.5, Math.max(0, extraWidth * 0.22));

  let centerX = (minX + maxX) / 2 + forwardBias;
  let centerY = (minY + maxY) / 2;
  const halfW = 50 / zoom;
  const halfH = 50 / zoom;
  centerX = clamp(centerX, halfW, 100 - halfW);
  centerY = clamp(centerY, halfH + 4, 100 - halfH - 4);

  return {
    transform: `translate(${(50 - centerX) * zoom}%, ${(50 - centerY) * zoom}%) scale(${zoom})`,
    transformOrigin: "50% 50%",
  };
}

function buildMatchSnapshot(S) {
  const repTier = clamp(Math.floor((S.rep || 50) / 60), 0, 3);
  const cpuBase = 4 + repTier;
  const timeSeed = mkTimeSeed();
  const game = {
    stats: {
      atk: Math.floor(rand01()*5)+5+(S.atkBoost||0),
      mid: Math.floor(rand01()*5)+4+(S.midBoost||0),
      def: Math.floor(rand01()*5)+4+(S.defBoost||0),
      cpu_atk: Math.floor(rand01()*4)+cpuBase,
      cpu_mid: Math.floor(rand01()*4)+cpuBase,
      cpu_def: Math.floor(rand01()*4)+cpuBase,
    },
    score:{ h:0, a:0 }, turn:1, max:MAX_TURNS,
    gs:"MIDFIELD", phase:"playing", si:0,
  };

  return { game, timeSeed, matchStats: { ...EMPTY_MATCH_STATS } };
}

function displayFromGame(g, S) {
  const context = buildTurnContext(g.gs, g.si, g.stats, S.formationId || null);
  const players = context.players;
  const holder = players.find(p => p.hB);

  return {
    gs:g.gs, score:{...g.score}, turn:g.turn,
    players, ball:holder?{x:holder.x,y:holder.y}:{x:50,y:50},
    stats:{...g.stats}, si:g.si, context,
  };
}

export default function GameScreen({ S, setS, LB, setLB, saveLB, onHome, showToast, dojo, account, provider, opponent }) {
  const [initialSnapshot] = useState(() => buildMatchSnapshot(S));
  const gRef     = useRef(initialSnapshot.game);
  const timerRef = useRef(null);
  const matchStatsRef = useRef(initialSnapshot.matchStats);
  const chainStartedRef = useRef(false);
  const halftimeContinueRef = useRef(false);

  // ── Derived formation info ───────────────────────────────────────────────
  const formation = getFormation(S.formationId);

  // ── Display state (what the pitch renders) ───────────────────────────────
  const [disp, setDisp] = useState(() => displayFromGame(initialSnapshot.game, S));
  const [phase,       setPhase]       = useState(initialSnapshot.game.phase);
  const [commentary,  setCommentary]  = useState("");
  const [cpuChoice,   setCpuChoice]   = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [previewIntentId, setPreviewIntentId] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [pendingTurn, setPendingTurn] = useState(null);
  const [chainStarting, setChainStarting] = useState(false);
  const [chainFailed, setChainFailed] = useState(false);
  const [result,      setResult]      = useState(null);
  const [momentOvl,   setMomentOvl]   = useState(null);
  const [htOvl,       setHtOvl]       = useState(null);
  const [ftOvl,       setFtOvl]       = useState(null);
  const [celebrate,   setCelebrate]   = useState(false);
  const [reward,      setReward]      = useState(null);
  const [tierOvl,     setTierOvl]     = useState(null);
  const [demotionOvl, setDemotionOvl] = useState(null);
  const [transitionOvl, setTransitionOvl] = useState(null);
  const [popH,        setPopH]        = useState(false);
  const [popA,        setPopA]        = useState(false);
  const [,            setTimePop]     = useState(false);
  const [timeSeed,    setTimeSeed]    = useState(initialSnapshot.timeSeed);
  const [showCueBadges, setShowCueBadges] = useState(() => {
    try { return localStorage.getItem("zap_show_cue_badges") === "1"; } catch (_) { return false; }
  });

  // ── Momentum system (Fix 6) ──────────────────────────────────────────────
  // consecutiveCorrect / consecutiveWrong drive "In Form" / "Under Pressure"
  const momentumRef   = useRef({ correct: 0, wrong: 0, state: "normal" });
  // Analytics turn counters
  const turnCountRef  = useRef({ total: 0, correct: 0, wrong: 0 });
  const [momentumDisplay, setMomentumDisplay] = useState("normal");

  // ── Guided first-match overlay (Fix: guided onboarding) ─────────────────
  // Only active when S.trainingDone is true but guidedTurnsDismissed < [1,2]
  // i.e. first real match after training, first two turns only.
  const isFirstMatch = S?.trainingDone && (S?.total || 0) === 0;
  const [guidedDismissed, setGuidedDismissed] = useState(
    new Set(S?.guidedTurnsDismissed || [])
  );
  const handleGuideDismiss = (turnNum) => {
    setGuidedDismissed(prev => {
      const next = new Set(prev);
      next.add(turnNum);
      return next;
    });
    // Persist so it never shows again even if they quit mid-match
    if (setS && S) {
      const ns = { ...S, guidedTurnsDismissed: [...(S.guidedTurnsDismissed || []), turnNum] };
      setS(ns);
    }
  };
  // Tracks opponent intents seen in first half for half-time scouting (Fix 7)
  const opponentIntentLogRef = useRef([]);

  const toggleCueBadges = () => {
    setShowCueBadges(prev => {
      const next = !prev;
      try { localStorage.setItem("zap_show_cue_badges", next ? "1" : "0"); } catch (_) {}
      return next;
    });
  };

  // ── Build a fresh game object ────────────────────────────────────────────
  const mkGame = useCallback(() => {
    const snapshot = buildMatchSnapshot(S);
    setTimeSeed(snapshot.timeSeed);
    matchStatsRef.current = snapshot.matchStats;
    return snapshot.game;
  }, [S, setTimeSeed]);

  const startChainMatch = useCallback(async () => {
    if (!dojo || !account) return;
    chainStartedRef.current = true;
    setChainStarting(true);
    setChainFailed(false);
    const repTier = clamp(Math.floor((S.rep || 50) / 60), 0, 6);
    const cpuIdx  = Math.max(0, 6 - repTier);

    try {
      const result = await dojo.doStartGame(cpuIdx);
      if (!result?.sessionId) throw new Error("No on-chain session id was returned");
    } catch {
      setChainFailed(true);
      showToast("⚠️ Blockchain connection issue — gameplay active client-side");
    } finally {
      setChainStarting(false);
    }
  }, [account, dojo, S.rep, showToast, setChainStarting, setChainFailed]);

  // ── Sync game object → display state ────────────────────────────────────
  const sync = (g) => {
    setDisp(displayFromGame(g, S));
    setPhase(g.phase);
    setCommentary("");
    setPreviewIntentId(null);
    setTimePop(true);
    setTimeout(() => setTimePop(false), 400);
  };

  // ── Initialise on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (dojo && account && !chainStartedRef.current) startChainMatch();
  }, [account, dojo, startChainMatch]);

  // ── Advance to next turn (or halftime / full-time) ───────────────────────
  const showHalftime = (g) => {
    g.phase = "halftime";
    const context = buildTurnContext(g.gs, g.si, g.stats, S.formationId || null);
    const pl = context.players;
    const holder = pl.find(p => p.hB);
    setDisp({
      gs:g.gs,
      score:{...g.score},
      turn:g.turn,
      players:pl,
      ball:holder ? {x:holder.x,y:holder.y} : {x:50,y:50},
      stats:{...g.stats},
      si:g.si,
      context,
    });
    // Compute most-used opponent intent for scouting note (Fix 7)
    const intentCounts = {};
    for (const id of opponentIntentLogRef.current) {
      intentCounts[id] = (intentCounts[id] || 0) + 1;
    }
    const topOpponentIntent = Object.entries(intentCounts).sort((a,b) => b[1]-a[1])[0];
    const tc = turnCountRef.current;
    trackHalftimeReached({
      score:        g.score,
      turnsCorrect: tc.correct,
      turnsWrong:   tc.wrong,
    });
    setHtOvl({
      score:{...g.score},
      matchStats:{...matchStatsRef.current},
      topOpponentIntent: topOpponentIntent ? { id: topOpponentIntent[0], count: topOpponentIntent[1] } : null,
    });
  };

  const advanceTurn = (g, nextGs, turnResult = null) => {
    const prevGs = g.gs;
    g.si++;
    g.gs = nextGs;
    
    if (prevGs === "MIDFIELD" && nextGs === "DEFEND") {
      g.si = pickDefendIndexFromLoss(turnResult?.lossDirection, g.si);
    }

    if (prevGs === "MIDFIELD" && (nextGs === "ATTACK" || nextGs === "DEFEND")) {
      setTransitionOvl({
        to:nextGs,
        from:prevGs,
        ok:!!turnResult?.ok,
        direction:turnResult?.lossDirection || turnResult?.gainDirection || "central",
        intentId:turnResult?.playerIntent?.id || null,
        key:`${nextGs}-${g.turn}-${g.si}-${turnResult?.lossDirection || turnResult?.gainDirection || "central"}`,
      });
      setTimeout(() => setTransitionOvl(null), 2000);
    }

    if (turnResult?.chainStatus === CHAIN_STATUS.HALFTIME) {
      showHalftime(g);
      return;
    }

    if (turnResult?.chainStatus === CHAIN_STATUS.FINISHED) {
      endGame(g);
      return;
    }

    // Check if game should end (defensive check; chain status wins above)
    if (g.turn > MAX_TURNS) {
      endGame(g); 
      return; 
    }

    // Local/offline fallback uses the same pacing as the deployed contract.
    if (g.turn === TURNS_PER_HALF + 1 && g.phase !== "halftime") {
      showHalftime(g);
      return;
    }

    g.phase = "playing";
    sync(g);
  };

  // ── Player picks an action ───────────────────────────────────────────────
  const doAct = async (idx) => {
    const g = gRef.current;
    if (!g || g.phase !== "playing") return;

    const needsChainSession = dojo && account && provider && !chainFailed;
    if (needsChainSession && (chainStarting || !dojo.sessionId)) {
      showToast("⏳ Starting on-chain match...");
      return;
    }

    g.phase = "result";
    setSelectedAction(idx);
    const previewIntent = context?.availableIntents?.[idx] || null;
    setPreviewIntentId(previewIntent);
    setSelectedRate(null);
    setSelectedOutcome(null);
    setPendingTurn(null);
    setPhase("result");
    clearTimeout(timerRef.current);

    const bt = BT[g.gs][idx];
    const prevScoreH = g.score.h;
    const prevScoreA = g.score.a;
    const prevPhase = g.gs;

    setCpuChoice({ lbl:"Resolving...", favorable:null, narr:"" });

    const buildLocalTurnResult = () => {
      const context = buildTurnContext(prevPhase, g.si, g.stats, S.formationId || null);
      const local = resolveIntent({ context, playerIntent: context.availableIntents?.[idx] || idx, stats: g.stats });
      const goalScored = local.nextGs === "GOAL";
      const conceded = local.nextGs === "CONCEDE";

      if (goalScored) g.score.h += 1;
      if (conceded) g.score.a += 1;
      g.turn += 1;

      return {
        source: "client",
        ok: local.ok,
        goalScored,
        conceded,
        nextGs: goalScored || conceded ? "MIDFIELD" : local.nextGs,
        cpuLbl: local.cpuLbl,
        cpuIntent: local.cpuIntent,
        playerIntent: local.playerIntent,
        favorable: local.favorable,
        narr: local.narr,
        rate: local.rate,
        cm: local.commentary,
        explanation: local.explanation,
        movement: local.movement,
        effects: local.effects,
        lossDirection: !local.ok ? getTurnDirection(context, local.movement) : null,
        gainDirection: local.ok ? getTurnDirection(context, local.movement) : null,
        context,
      };
    };

    const buildChainTurnResult = async () => {
      if (!dojo) throw new Error("Dojo not initialized");
      if (!account) throw new Error("Account not connected");
      if (!provider) throw new Error("Provider not initialized");
      
      const context = buildTurnContext(prevPhase, g.si, g.stats, S.formationId || null);
      const intentId = context.availableIntents?.[idx] || null;
      const route = getIntentRoute(prevPhase, context, intentId);
      
      const chainResult = await dojo.doResolveTurn(idx, prevScoreH, prevScoreA, prevPhase);
      
      if (!chainResult) throw new Error("Turn resolution returned empty");

      const phaseMap = { 0: "MIDFIELD", 1: "ATTACK", 2: "DEFEND" };
      const nextGs = phaseMap[chainResult.currentPhase] || "MIDFIELD";

      g.score.h = chainResult.scoreH;
      g.score.a = chainResult.scoreA;
      g.turn = Math.min(chainResult.turnNumber + 1, MAX_TURNS);

      const playerIntentBase = (INTENTS[prevPhase] || []).find(i => i.id === intentId) || (INTENTS[prevPhase] || [])[idx] || null;
      const opponentId = Number.isInteger(chainResult.cpuAction)
        ? context.opponentIntents?.[chainResult.cpuAction] || null
        : null;
      const cpuIntent = Number.isInteger(chainResult.cpuAction)
        ? (OPPONENT_INTENTS[prevPhase] || []).find(i => i.id === opponentId) || null
        : null;
      const matchup = getReadMatchup(context, intentId, opponentId);
      const playerIntent = playerIntentBase
        ? { ...playerIntentBase, beats: matchup.beats ? [matchup.beats] : [], losesTo: matchup.losesTo ? [matchup.losesTo] : [] }
        : null;

      let cm = chainResult.actionSuccess ? "The read won." : "The read lost.";
      let why = chainResult.actionSuccess ? "The read won." : "The read lost.";
      let cpuLbl = cpuIntent?.lbl || "OPPONENT READ";
      let favorable = chainResult.actionSuccess;

      if (chainResult.goalScored) {
        cm = "Goal! Ball in the net!";
        cpuLbl = "GOAL";
        favorable = true;
        why = "The chain resolved this as a goal.";
      } else if (chainResult.conceded) {
        cm = "Conceded! Opposition scores!";
        cpuLbl = "CONCEDED";
        favorable = false;
        why = "The chain resolved this as a concession.";
      } else if (prevPhase === "ATTACK") {
        cm = pick(["Shot saved by keeper", "Just wide of the goal"]);
        cpuLbl = "MISS";
        favorable = false;
        why = "The read lost.";
      } else if (prevPhase === "DEFEND") {
        cm = chainResult.actionSuccess ? "Defended well!" : "They found a way through.";
        cpuLbl = chainResult.actionSuccess ? "DEFENDED" : "CONCEDED";
        favorable = chainResult.actionSuccess;
        why = chainResult.actionSuccess ? "The read won." : "The read lost.";
      } else {
        cm = chainResult.actionSuccess
          ? "You win midfield and move into attack."
          : "They win the midfield read and break forward.";
        why = chainResult.actionSuccess ? "The read won." : "The read lost.";
      }

      return {
        source: "chain",
        chainStatus: chainResult.status,
        chainHalf: chainResult.half,
        chainTurn: chainResult.turnNumber,
        ok: chainResult.actionSuccess,
        goalScored: chainResult.goalScored,
        conceded: chainResult.conceded,
        nextGs: chainResult.goalScored || chainResult.conceded ? "MIDFIELD" : nextGs,
        cpuLbl,
        cpuIntent,
        playerIntent,
        favorable,
        why,
        narr: "(On-chain)",
        rate: null,
        cm,
        matchupResult: matchup.result,
        readRelation: matchup.relation,
        lossDirection: !chainResult.actionSuccess ? getTurnDirection(context, { target: route?.to || context?.ball }) : null,
        gainDirection: chainResult.actionSuccess ? getTurnDirection(context, { target: route?.to || context?.ball }) : null,
        movement: {
          ballFrom: context?.ballCarrierId,
          ballTo: route?.to?.id || null,
          route: route?.kind || null,
          target: route?.to || context?.ball || null,
        },
        context,
      };
    };

    try {
      let turnResult;
      if (dojo && account && provider && !chainFailed) {
        turnResult = await buildChainTurnResult();
      } else {
        turnResult = buildLocalTurnResult();
      }

      // Update match stats
      // Update momentum counter (Fix 6)
      const mom = momentumRef.current;
      if (turnResult.ok) {
        mom.correct = (mom.correct || 0) + 1;
        mom.wrong   = 0;
        mom.state   = mom.correct >= 3 ? "in_form" : "normal";
      } else {
        mom.wrong   = (mom.wrong || 0) + 1;
        mom.correct = 0;
        mom.state   = mom.wrong >= 3 ? "under_pressure" : "normal";
      }
      setMomentumDisplay(mom.state);

      // Analytics — track every turn decision
      const tc = turnCountRef.current;
      tc.total   += 1;
      if (turnResult.ok) tc.correct += 1; else tc.wrong += 1;
      trackTurnPlayed({
        turn:             g.turn,
        phase:            prevPhase,
        intentId:         turnResult.playerIntent?.id   || String(idx),
        intentLabel:      turnResult.playerIntent?.lbl  || String(idx),
        outcome:          turnResult.ok,
        readRelation:     turnResult.readRelation || "wins",
        opponentIntentId: turnResult.cpuIntent?.id || turnResult.cpuLbl || "",
        matchStats:       g.stats,
      });

      // Log opponent intent for half-time scouting (Fix 7)
      if (turnResult.cpuIntent?.id) {
        opponentIntentLogRef.current.push(turnResult.cpuIntent.id);
      }

      setSelectedRate(turnResult.rate);
      setSelectedOutcome(turnResult.ok);
      if (prevPhase === "ATTACK") { matchStatsRef.current.shots_h++; matchStatsRef.current.attacks_h++; }
      if (prevPhase === "DEFEND" && !turnResult.conceded) matchStatsRef.current.saves_h++;
      if (prevPhase === "DEFEND" && turnResult.conceded) matchStatsRef.current.shots_a++;
      if (prevPhase === "MIDFIELD") matchStatsRef.current.attacks_h++;

      const targetBall = turnResult.movement?.target || { x:bt.x, y:bt.y };
      setDisp(d => ({ ...d, ball:{ x:targetBall.x, y:targetBall.y }, context: turnResult.context || d.context }));
      setCpuChoice({ lbl:turnResult.cpuLbl, favorable:turnResult.favorable, narr:turnResult.narr });
      setTimeout(() => setCommentary(turnResult.cm), 300);
      setPendingTurn({ turnResult, prevPhase });

    } catch (e) {
      setCpuChoice(null);
      setSelectedRate(null);
      setSelectedOutcome(null);
      setPendingTurn(null);
      setPhase("playing");
      g.phase = "playing";
      const errorMsg = e?.message || "Unknown error";
      showToast(`❌ Turn failed: ${errorMsg}`);
    }
  };

  const continueAfterResolution = () => {
    const g = gRef.current;
    if (!g || !pendingTurn) return;

    const { turnResult, prevPhase } = pendingTurn;
    clearTimeout(timerRef.current);
    setPendingTurn(null);
    setSelectedAction(null);
    setSelectedRate(null);
    setSelectedOutcome(null);
    setCpuChoice(null);
    setCommentary("");

    if (turnResult.goalScored) {
      setPopH(true); setTimeout(() => setPopH(false), 400);
      setCelebrate(true); setTimeout(() => setCelebrate(false), 2400);
      setMomentOvl({ type:pick(["goal_left","goal_centre","goal_right"]), isGoal:true, isConcede:false, label:"GOAL!", cm:turnResult.cm });
      timerRef.current = setTimeout(() => { setMomentOvl(null); advanceTurn(g, "MIDFIELD", turnResult); }, 2600);
    } else if (turnResult.conceded) {
      setPopA(true); setTimeout(() => setPopA(false), 400);
      setMomentOvl({ type:pick(["goal_left","goal_centre","goal_right"]), isGoal:false, isConcede:true, label:"CONCEDED", cm:turnResult.cm });
      timerRef.current = setTimeout(() => { setMomentOvl(null); advanceTurn(g, "MIDFIELD", turnResult); }, 2600);
    } else {
      if (prevPhase === "ATTACK") {
        const missType = pick(["post","miss_wide","save_keeper"]);
        setMomentOvl({ type:missType, isGoal:false, isConcede:false,
          label:missType==="post"?"OFF THE POST!":missType==="miss_wide"?"JUST WIDE!":"GREAT SAVE!", cm:turnResult.cm });
        setTimeout(() => setMomentOvl(null), 1800);
      }
      const msg = turnResult.ok ? RESMSG[prevPhase]?.s : RESMSG[prevPhase]?.f;
      setResult({ ok:turnResult.ok, msg:msg || (turnResult.ok ? "Action succeeded" : "Action failed") });
      timerRef.current = setTimeout(() => { setResult(null); advanceTurn(g, turnResult.nextGs, turnResult); }, 1600);
    }
  };

  // ── End of match ─────────────────────────────────────────────────────────
  const endGame = async (g) => {
    const { score } = g;
    g.phase = "finished";
    setPhase("finished");
    clearTimeout(timerRef.current);
    const prevRank  = myRank(S, LB);
    const prevTier  = getTier(prevRank);

    const { repDelta, breakdowns, nextState: ns } = buildMatchRewards(score, S);
    ns.lastDelta    = repDelta;
    ns.lastPrevRank = prevRank;

    const newLB   = simCPU(LB);
    const newRank = myRank(ns, newLB);
    const newTier = getTier(newRank);

    setS(ns);
    setLB(newLB);
    saveLB?.(newLB, ns.wallet);

    // Mark game as finished on blockchain
    if (dojo && account) {
      try {
        await dojo.doClaimReward();
      } catch {
        // Non-blocking: local rewards screen still reflects the completed match.
      }
    }

    const tca = turnCountRef.current;
    trackMatchCompleted({
      score,
      win:           score.h > score.a,
      draw:          score.h === score.a,
      repDelta,
      turnsPlayed:   tca.total,
      turnsCorrect:  tca.correct,
      turnsWrong:    tca.wrong,
      formationId:   S?.formationId || "unknown",
      opponentStyle: "unknown",
    });
    setFtOvl({ h:score.h, a:score.a, win:score.h>score.a, draw:score.h===score.a, delta:repDelta, bd:breakdowns, prevRank, newRank, prevTier, newTier, matchStats:{...matchStatsRef.current} });
    if (prevTier.name !== newTier.name) {
      const isPromotion = newRank < prevRank;
      if (isPromotion) {
        setTimeout(() => setTierOvl({ prevTier, newTier, dir:"up" }), 1200);
      } else {
        setTimeout(() => setDemotionOvl({ fromTier:prevTier, toTier:newTier, newRank }), 1200);
      }
    }

    const rewardType = checkRewardUnlock(ns);
    if (rewardType) setTimeout(() => setReward({ type:rewardType, S:ns }), 2200);
  };

  // ── Claim / skip reward ──────────────────────────────────────────────────
  const claimReward = async (skipped) => {
    const type = reward?.type;
    const rS   = reward?.S || S;
    setReward(null);
    if (!type) return;

    const cfg = REWARDS[type];
    let ns    = { ...rS };

    if (type === "firstWin") {
      ns.firstWinClaimed = true;
      if (!skipped) { ns.rep = (ns.rep||0)+cfg.rep; showToast(`🎁 +${cfg.rep} Rep Bonus!`); }
    } else {
      if (!ns.streakRewardsClaimed) ns.streakRewardsClaimed = {};
      ns.streakRewardsClaimed["5"] = true;
      if (!skipped) { ns.rep = (ns.rep||0)+cfg.rep; showToast(`⚡ +${cfg.rep} Rep!`); }
    }

    setS(ns);
    if (type === "firstWin" && ns.streak === 5 && !ns.streakRewardsClaimed?.["5"]) {
      setTimeout(() => setReward({ type:"fiveStreak", S:ns }), 300);
    }
  };

  // ── Derived render values ────────────────────────────────────────────────
  const { gs, score, turn, players, ball, stats, si, context } = disp;
  const zm         = { MIDFIELD:{ col:"#facc15" }, ATTACK:{ col:"#4ade80" }, DEFEND:{ col:"#f87171" } }[gs];
  const matchTime  = turnToTime(turn, timeSeed);
  const isSecondHalf = turn > TURNS_PER_HALF;
  const turnContextLine = getTurnContextLine({ score, gs, matchTime, momentum: momentumDisplay });
  const showGuide = isFirstMatch && !guidedDismissed.has(turn);

  // Close moment camera: big players, while preserving the carrier/press/runner/support read.
  const phaseCamera = buildMomentCamera(context, gs);
  const opponentName = opponent?.name || "RIVALS FC";

  const restartMatch = async () => {
    clearTimeout(timerRef.current);
    setFtOvl(null);
    setTierOvl(null);
    setDemotionOvl(null);
    setReward(null);
    setHtOvl(null);
    setMomentOvl(null);
    setResult(null);
    setCpuChoice(null);
    setSelectedAction(null);
    setSelectedRate(null);
    setSelectedOutcome(null);
    setPendingTurn(null);
    setCommentary("");

    momentumRef.current  = { correct: 0, wrong: 0, state: "normal" };
    turnCountRef.current = { total: 0, correct: 0, wrong: 0 };
    opponentIntentLogRef.current = [];
    const g = mkGame();
    gRef.current = g;
    sync(g);

    chainStartedRef.current = false;
    if (dojo && account) await startChainMatch();
  };

  return (
    <MatchStadiumShell>
    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", background:"transparent" }}>
      <div style={{ position:"absolute", inset:0, overflow:"hidden", padding:"50px 18px 74px", boxSizing:"border-box" }}>
        {/* ── 3-D Pitch ─────────────────────────────────────────────────── */}
        <div style={{ position:"absolute", inset:0, overflow:"hidden" }}>
          <div style={{
            position:"absolute", left:"4.5%", right:"4.5%", top:"8.5%", bottom:"10.5%",
            borderRadius:"16px",
            overflow:"hidden",
            background:`
              repeating-linear-gradient(
                180deg,
                #2c6a28 0px,
                #2c6a28 68px,
                #245e22 68px,
                #245e22 136px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(255,255,255,.018) 0px,
                rgba(255,255,255,.018) 1px,
                transparent 1px,
                transparent 42px
              ),
              radial-gradient(
                ellipse 70% 46% at 50% 50%,
                rgba(95, 165, 69, .11) 0%,
                transparent 62%
              ),
              linear-gradient(
                180deg,
                #1f4f1d 0%,
                #2a6425 50%,
                #1d4619 100%
              )
            `,
            boxShadow:"0 22px 54px rgba(0,0,0,.32), inset 0 0 0 1px rgba(232,255,232,.10), inset 0 0 36px rgba(0,0,0,.12)",
            filter:"saturate(1.04) brightness(.95) contrast(1.04)",
            transform: phaseCamera.transform,
            transformOrigin: phaseCamera.transformOrigin,
            transition: "transform 0.95s cubic-bezier(0.22,1,0.36,1)",
            willChange: "transform",
          }}>
            <PitchMarkings/>

            {/* ── Stadium atmosphere ─────────────────────────────────── */}
            {/* Floodlight glow from corner towers */}
            <div style={{ position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
              background:`
                radial-gradient(ellipse 34% 24% at 5% 0%,   rgba(255,250,210,.12) 0%, transparent 65%),
                radial-gradient(ellipse 34% 24% at 95% 0%,  rgba(255,250,210,.12) 0%, transparent 65%),
                radial-gradient(ellipse 26% 18% at 5% 100%, rgba(255,250,210,.07) 0%, transparent 65%),
                radial-gradient(ellipse 26% 18% at 95% 100%,rgba(255,250,210,.07) 0%, transparent 65%)
              `}}/>
            {/* Crowd darkness pressing in from edges */}
            <div style={{ position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
              background:"radial-gradient(ellipse 88% 80% at 50% 50%, transparent 36%, rgba(0,0,0,.22) 62%, rgba(0,0,0,.56) 100%)"}}/>
            {/* ATTACK: threat aura bleeds in from right box */}
            {false && gs === "ATTACK" && (
              <div style={{ position:"absolute", right:0, top:"14%", bottom:"14%", width:"36%", zIndex:3, pointerEvents:"none",
                background:"linear-gradient(270deg, rgba(239,68,68,.09) 0%, transparent 100%)",
                animation:"dangerPulse 1.5s ease-in-out infinite"}}/>
            )}
            {/* DEFEND: threat aura bleeds in from left box */}
            {false && gs === "DEFEND" && (
              <div style={{ position:"absolute", left:0, top:"14%", bottom:"14%", width:"36%", zIndex:3, pointerEvents:"none",
                background:"linear-gradient(90deg, rgba(239,68,68,.09) 0%, transparent 100%)",
                animation:"dangerPulse 1.5s ease-in-out infinite"}}/>
            )}

            {/* Zone tint */}
            <div style={{ position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
              background: "transparent",
              transition:"background .6s" }}/>

            {/* Broadcast/tactics vignette */}
            <div style={{ position:"absolute", inset:0, zIndex:4, pointerEvents:"none",
              background:`
                radial-gradient(ellipse 88% 68% at 50% 50%, transparent 64%, rgba(0,0,0,.10) 100%),
                linear-gradient(180deg, rgba(0,0,0,.08) 0%, transparent 24%, transparent 78%, rgba(0,0,0,.10) 100%)
              ` }}/>

            {/* Change 1+2: Pitch cue badges + zone highlights */}
            {phase === "playing" && false && (
              <PitchCueBadges
                context={context}
                previewIntentId={previewIntentId}
                gs={gs}
                showBadges={showCueBadges}
              />
            )}

            {false && <IntentDirectionArrow gs={gs} context={context} intentId={previewIntentId}/>}

            {/* Ball spotlight */}
            <div style={{ position:"absolute", zIndex:5, pointerEvents:"none",
              width:"42%", height:"42%",
              left:`${ball.x}%`, top:`${ball.y}%`, transform:"translate(-50%,-50%)",
              background:`radial-gradient(ellipse 34% 34% at 50% 50%,${zm.col}12 0%,transparent 70%)`,
              transition:"left .6s cubic-bezier(.25,.46,.45,.94),top .5s cubic-bezier(.25,.46,.45,.94)",
              animation:"glowPulse 2s ease-in-out infinite" }}/>

            {/* Players */}
            <div style={{ position:"absolute", inset:0, zIndex:6, pointerEvents:"none" }}>
              {players.map((p, i) => {
                const isActive = p.hB;
                // Away players are never fully ghosted — they are real threats (Fix 10)
                const isFar    = p.emphasis === "dim" && !p.tags?.includes("pressure") && (!p.hB && Math.abs(p.x-ball.x)>38);
                return <PlayerFigure key={p.id || i} p={p} idx={i} celebrate={celebrate} gs={gs} isActive={isActive} isFar={isFar} context={context} previewIntentId={previewIntentId}/>;
              })}
            </div>

            {/* Ball */}
            <div style={{ position:"absolute", inset:0, zIndex:10, pointerEvents:"none" }}>
              <PremiumBall ball={ball} gs={gs}/>
            </div>
          </div>
        </div>

        {/* ── Fixed HUD overlays ────────────────────────────────────────── */}

        {/* Top gradient */}
        <div style={{ position:"absolute", left:0, right:0, top:0, height:"12%", zIndex:12, pointerEvents:"none", background:"linear-gradient(180deg,rgba(1,4,3,.16) 0%,rgba(3,8,5,.05) 52%,transparent 100%)" }}/>
        {/* Bottom gradient */}
        <div style={{ position:"absolute", left:0, right:0, bottom:0, height:"14%", zIndex:12, pointerEvents:"none", background:"linear-gradient(0deg,rgba(1,4,3,.18) 0%,rgba(3,8,5,.05) 54%,transparent 100%)" }}/>

        {false && transitionOvl && (
          <div key={transitionOvl.key} style={{ position:"absolute", inset:0, zIndex:24, pointerEvents:"none", overflow:"hidden", animation:"phaseWash 2s ease forwards" }}>
            <div style={{
              position:"absolute", inset:"-18% -30%",
              background: transitionOvl.to === "ATTACK"
                ? "linear-gradient(100deg,transparent 0%,rgba(74,222,128,.06) 24%,rgba(74,222,128,.34) 48%,rgba(250,204,21,.2) 58%,transparent 78%)"
                : "linear-gradient(280deg,transparent 0%,rgba(248,113,113,.07) 24%,rgba(248,113,113,.34) 48%,rgba(250,204,21,.16) 58%,transparent 78%)",
              transform: transitionOvl.to === "ATTACK" ? "translateX(-46%) skewX(-12deg)" : "translateX(46%) skewX(12deg)",
              animation: transitionOvl.to === "ATTACK" ? "phaseRushRight 1.9s cubic-bezier(.2,.8,.2,1) forwards" : "phaseRushLeft 1.9s cubic-bezier(.2,.8,.2,1) forwards",
            }}/>
            <div style={{
              position:"absolute",
              left: transitionOvl.direction === "right" ? "63%" : transitionOvl.direction === "left" ? "37%" : "50%",
              top:"52%",
              width:"12px",
              height:"12px",
              borderRadius:"50%",
              background:"#fff",
              boxShadow:`0 0 22px ${transitionOvl.to === "ATTACK" ? "#4ade80" : "#f87171"}`,
              animation:"carrierPulse 1.1s ease-in-out infinite",
            }}/>
            <div style={{
              position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
              padding:"10px 18px 9px", borderRadius:"10px",
              border:`1px solid ${transitionOvl.to === "ATTACK" ? "rgba(74,222,128,.4)" : "rgba(248,113,113,.4)"}`,
              background:"rgba(3,8,5,.78)", backdropFilter:"blur(10px)",
              boxShadow:"0 16px 48px rgba(0,0,0,.35)",
              textAlign:"center", animation:"phaseTitlePop 1s ease forwards",
            }}>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".28em", color:"rgba(255,255,255,.48)", marginBottom:"3px" }}>
                {transitionOvl.to === "ATTACK"
                  ? "CORRECT READ · BALL MOVES ON"
                  : transitionOvl.intentId === "go_wide"
                    ? `BALL LOST ${transitionOvl.direction.toUpperCase()}`
                    : transitionOvl.intentId === "drive_on"
                      ? "BALL LOST CENTRAL"
                      : "TURNOVER"}
              </div>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"30px", letterSpacing:"3px", lineHeight:1, color:transitionOvl.to === "ATTACK" ? "#4ade80" : "#f87171" }}>
                {transitionOvl.to === "ATTACK" ? "ATTACKING THIRD" : "TRACK BACK"}
              </div>
            </div>
          </div>
        )}

        {/* CPU choice banner */}
        {false && <CPUChoiceBanner choice={cpuChoice}/>}

        {/* Score bar */}
        <ScoreBar
          homeClub={S.clubName || "ZAP"}
          awayClub={opponentName}
          score={score}
          matchTime={matchTime}
          gs={gs}
          isSecondHalf={isSecondHalf}
          formationShape={formation.shape}
          popH={popH}
          popA={popA}
        />

        {/* Stat panel */}
        <StatPanel gs={gs} stats={stats} momentum={momentumDisplay}/>

        {/* Commentary */}
        {false && <Commentary text={commentary}/>}

        {phase === "playing" && false && (
          <div style={{
            position:"absolute",
            left:"50%",
            bottom:"124px",
            transform:"translateX(-50%)",
            zIndex:24,
            width:"min(620px, calc(100% - 24px))",
            textAlign:"center",
            pointerEvents:"none",
          }}>
            <div style={{
              display:"inline-flex",
              alignItems:"center",
              justifyContent:"center",
              padding:"6px 11px",
              borderRadius:"7px",
              border:"1px solid rgba(255,255,255,.10)",
              background:"rgba(2,7,5,.62)",
              backdropFilter:"blur(10px)",
              color:"rgba(255,255,255,.68)",
              fontFamily:"var(--f-mono)",
              fontSize:"8px",
              letterSpacing:".16em",
              whiteSpace:"nowrap",
            }}>{turnContextLine}</div>
          </div>
        )}

        {phase === "playing" && false && (
          <button
            type="button"
            onClick={toggleCueBadges}
            aria-pressed={showCueBadges}
            title={showCueBadges ? "Hide cue badges" : "Show cue badges"}
            style={{
              position:"absolute",
              right:"16px",
              bottom:"126px",
              zIndex:26,
              width:"34px",
              height:"34px",
              borderRadius:"8px",
              border:`1px solid ${showCueBadges ? "rgba(74,222,128,.48)" : "rgba(255,255,255,.12)"}`,
              background:showCueBadges ? "rgba(34,197,94,.16)" : "rgba(2,7,5,.62)",
              color:showCueBadges ? "#4ade80" : "rgba(255,255,255,.56)",
              fontFamily:"var(--f-disp)",
              fontSize:"15px",
              lineHeight:1,
              cursor:"pointer",
              boxShadow:"0 10px 30px rgba(0,0,0,.28)",
              backdropFilter:"blur(10px)",
            }}
          >
            i
          </button>
        )}

        {/* Decision / resolution screens */}
        {phase === "result" ? (
          <ResolutionScreen
            gs={gs}
            playerAction={selectedAction}
            rivalAction={cpuChoice?.lbl || "COUNTER"}
            successRate={selectedRate}
            resultOk={selectedOutcome}
            isResolving={!pendingTurn}
            message={commentary || "Resolving your choice..."}
            onContinue={continueAfterResolution}
            context={context}
            turnResult={pendingTurn?.turnResult}
          />
        ) : (
          <ActionCards
            gs={gs}
            si={si}
            phase={phase}
            onAction={doAct}
            context={context}
            previewIntentId={previewIntentId}
            onPreviewIntent={setPreviewIntentId}
            disabled={dojo && account && provider && !chainFailed && (chainStarting || !dojo.sessionId)}
          />
        )}

        {/* Result flash */}
        {false && <ResultFlash result={!momentOvl ? result : null}/>}

        {false && showGuide && (
          <GuidedCueOverlay
            turn={turn}
            cues={context?.cues || []}
            dismissed={!showGuide}
            onDismiss={handleGuideDismiss}
          />
        )}

        {/* ── Goal / save / miss cinematic ───────────────────────────── */}
        {momentOvl && (
          <div style={{
            position:"absolute", inset:0, zIndex:30, display:"flex", alignItems:"center", justifyContent:"center",
            padding:"18px", animation:"goalBurst .28s ease",
            background: momentOvl.isGoal
              ? "radial-gradient(ellipse 80% 70% at 50% 44%,rgba(13,92,44,.58),rgba(2,5,3,.9) 72%),linear-gradient(180deg,rgba(255,255,255,.04),rgba(0,0,0,.22))"
              : momentOvl.isConcede
                ? "radial-gradient(ellipse 80% 70% at 50% 44%,rgba(127,29,29,.62),rgba(2,5,3,.92) 72%),linear-gradient(180deg,rgba(255,255,255,.035),rgba(0,0,0,.24))"
                : "radial-gradient(ellipse 80% 70% at 50% 44%,rgba(146,64,14,.48),rgba(2,5,3,.9) 72%),linear-gradient(180deg,rgba(255,255,255,.035),rgba(0,0,0,.22))",
          }}>
            <div style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:.28,
              background:"repeating-linear-gradient(0deg,rgba(255,255,255,.08) 0 1px,transparent 1px 7px)" }}/>
            <div style={{
              width:"min(760px,100%)", borderRadius:"16px", overflow:"hidden",
              border:`1px solid ${momentOvl.isGoal ? "rgba(74,222,128,.42)" : momentOvl.isConcede ? "rgba(248,113,113,.42)" : "rgba(251,191,36,.34)"}`,
              background:"linear-gradient(180deg,rgba(7,16,11,.94),rgba(4,9,7,.98))",
              boxShadow:"0 28px 90px rgba(0,0,0,.62)",
            }}>
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px",
                padding:"9px 12px", borderBottom:"1px solid rgba(255,255,255,.08)",
                background:"rgba(255,255,255,.035)",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", minWidth:0 }}>
                  <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:momentOvl.isGoal?"#4ade80":momentOvl.isConcede?"#f87171":"#fbbf24", boxShadow:`0 0 14px ${momentOvl.isGoal?"#4ade80":momentOvl.isConcede?"#f87171":"#fbbf24"}` }}/>
                  <span style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".22em", color:"rgba(255,255,255,.56)", whiteSpace:"nowrap" }}>
                    MATCH MOMENT
                  </span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"9px", fontFamily:"var(--f-cond)", fontWeight:800, fontSize:"12px", letterSpacing:".08em", color:"rgba(255,255,255,.7)" }}>
                  <span>{S.clubName || "ZAP"}</span>
                  <span style={{ fontFamily:"var(--f-disp)", fontSize:"19px", color:"var(--tx)" }}>
                    {momentOvl.isGoal ? score.h+1 : score.h} – {momentOvl.isConcede ? score.a+1 : score.a}
                  </span>
                  <span>{opponentName}</span>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1.1fr) minmax(220px,.9fr)", gap:"0", alignItems:"stretch" }}>
                <div style={{
                  minHeight:"220px", padding:"18px", display:"flex", alignItems:"center", justifyContent:"center",
                  background:"linear-gradient(180deg,#155f30,#1e8b46 55%,#0d3b1f)",
                  position:"relative", overflow:"hidden",
                }}>
                  <div style={{ position:"absolute", inset:0, opacity:.24, background:"repeating-linear-gradient(90deg,rgba(255,255,255,.09) 0 1px,transparent 1px 18px)" }}/>
                  <div style={{ width:"100%", maxWidth:"360px", filter:"drop-shadow(0 18px 24px rgba(0,0,0,.35))", position:"relative" }}>
                    <GoalMomentSVG type={momentOvl.type}/>
                  </div>
                </div>

                <div style={{
                  padding:"22px 18px 18px", display:"flex", flexDirection:"column", justifyContent:"center",
                  background:`linear-gradient(135deg,${momentOvl.isGoal ? "rgba(74,222,128,.13)" : momentOvl.isConcede ? "rgba(248,113,113,.13)" : "rgba(251,191,36,.11)"},transparent 56%)`,
                }}>
                  <div style={{
                    fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".22em",
                    color:momentOvl.isGoal?"rgba(74,222,128,.75)":momentOvl.isConcede?"rgba(248,113,113,.75)":"rgba(251,191,36,.75)",
                    marginBottom:"8px",
                  }}>
                    {momentOvl.isGoal ? "BALL IN THE NET" : momentOvl.isConcede ? "DEFENCE BEATEN" : momentOvl.type === "save_keeper" ? "KEEPER ACTION" : momentOvl.type === "post" ? "OFF THE FRAME" : "CHANCE MISSED"}
                  </div>
                  <div style={{
                    fontFamily:"var(--f-disp)", fontSize:"clamp(38px,7vw,64px)", letterSpacing:"4px", lineHeight:.9,
                    color:momentOvl.isGoal?"#4ade80":momentOvl.isConcede?"#f87171":"#fbbf24",
                    textShadow:momentOvl.isGoal?"0 0 36px rgba(74,222,128,.4)":momentOvl.isConcede?"0 0 36px rgba(248,113,113,.4)":"0 0 34px rgba(251,191,36,.34)",
                    animation:"momentHeadline .62s cubic-bezier(.34,1.56,.64,1)",
                    marginBottom:"10px",
                  }}>{momentOvl.label}</div>
                  <div style={{ fontFamily:"var(--f-body)", fontStyle:"italic", fontSize:"13px", maxWidth:"280px", lineHeight:1.45, color:"rgba(255,255,255,.68)" }}>{momentOvl.cm}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Half-time */}
        {htOvl && (
          <HalfTime
            score={htOvl.score} S={S} matchStats={htOvl.matchStats}
            opponentName={opponentName}
            topOpponentIntent={htOvl.topOpponentIntent}
            onContinue={async () => {
              const g = gRef.current; if (!g) return;
              if (halftimeContinueRef.current) return;
              halftimeContinueRef.current = true;

              if (dojo && account) {
                try {
                  await dojo.doContinueHalftime();
                } catch (e) {
                  showToast("⚠️ Blockchain error: " + e.message);
                  halftimeContinueRef.current = false;
                  return;
                }
              }

              setHtOvl(null);
              g.gs = "MIDFIELD";
              g.turn = Math.max(g.turn, TURNS_PER_HALF + 1);
              g.phase = "playing";
              halftimeContinueRef.current = false;
              sync(g);
            }}
          />
        )}

        {/* Full-time */}
        {ftOvl && (
          <FullTime
            data={ftOvl} S={S} LB={LB}
            opponentName={opponentName}
            onAgain={restartMatch}
            onHome={() => { setFtOvl(null); setTierOvl(null); onHome(); }}
          />
        )}

        {tierOvl && <TierChangeModal data={tierOvl} onClose={() => setTierOvl(null)}/>}
        {demotionOvl && <DemotionModal fromTier={demotionOvl.fromTier} toTier={demotionOvl.toTier} newRank={demotionOvl.newRank} clubName={S.clubName} onClose={() => setDemotionOvl(null)}/>}
      </div>

      {reward && <RewardModal cfg={REWARDS[reward.type]} onClaim={() => claimReward(false)} onSkip={() => claimReward(true)}/>}
    </div>
    </MatchStadiumShell>
  );
}
