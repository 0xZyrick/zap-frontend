// ─── analytics.js ─────────────────────────────────────────────────────────────
// PostHog analytics wrapper for ZAP.
// All tracking is anonymous — no personal data, no wallet addresses logged.
// Session ID is generated locally and never tied to a real identity.
//
// To activate: set your PostHog project API key in the POSTHOG_KEY constant below.
// Get your key at: https://app.posthog.com → Project Settings → Project API Key
//
// Events tracked:
//   zap_app_opened          — first load
//   zap_club_created        — player creates a club name
//   zap_training_started    — training mode begins
//   zap_training_completed  — training mode finished
//   zap_training_abandoned  — player left training before finishing
//   zap_match_started       — kick off pressed (formation, opponent style)
//   zap_turn_played         — every turn decision (intent, outcome, phase, turn#)
//   zap_halftime_reached    — half time hit
//   zap_match_completed     — full time (score, win/loss, read accuracy)
//   zap_match_abandoned     — player quit mid-match
//   zap_formation_selected  — pre-match formation pick
//   zap_onboarding_step     — guided overlay dismissed (turn 1 or 2)
// ─────────────────────────────────────────────────────────────────────────────

// ── CONFIG — replace with your real PostHog project key ──────────────────────
const POSTHOG_KEY  = "YOUR_POSTHOG_PROJECT_KEY";  // e.g. "phc_xxxxxxxxxxxx"
const POSTHOG_HOST = "https://app.posthog.com";
const ENABLED      = POSTHOG_KEY !== "YOUR_POSTHOG_PROJECT_KEY";

// ── Session ID — anonymous, local, regenerated each browser session ──────────
const getSessionId = () => {
  try {
    let id = sessionStorage.getItem("zap_sid");
    if (!id) {
      id = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("zap_sid", id);
    }
    return id;
  } catch (_) {
    return "s_" + Math.random().toString(36).slice(2);
  }
};

// ── Persistent anonymous device ID — survives sessions for return-visit tracking
const getDeviceId = () => {
  try {
    let id = localStorage.getItem("zap_did");
    if (!id) {
      id = "d_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("zap_did", id);
    }
    return id;
  } catch (_) {
    return "d_unknown";
  }
};

// ── PostHog lazy loader ───────────────────────────────────────────────────────
let _ph = null;
let _loadPromise = null;

const loadPostHog = () => {
  if (_ph) return Promise.resolve(_ph);
  if (_loadPromise) return _loadPromise;
  if (!ENABLED) return Promise.resolve(null);

  _loadPromise = new Promise((resolve) => {
    try {
      // Load PostHog script dynamically — no bundler dependency
      const script = document.createElement("script");
      script.src   = "https://cdn.posthog.com/array/latest/array.full.js";
      script.async = true;
      script.onload = () => {
        try {
          window.posthog?.init(POSTHOG_KEY, {
            api_host:             POSTHOG_HOST,
            autocapture:          false,   // manual only — no accidental PII capture
            capture_pageview:     false,
            capture_pageleave:    false,
            persistence:          "localStorage+cookie",
            disable_session_recording: true,
            loaded: (ph) => {
              // Identify anonymously using device ID — no wallet, no name
              ph.identify(getDeviceId());
              _ph = ph;
              resolve(ph);
            },
          });
        } catch {
          resolve(null);
        }
      };
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    } catch (_e) {
      resolve(null);
    }
  });

  return _loadPromise;
};

// ── Core capture fn ───────────────────────────────────────────────────────────
const capture = async (event, props = {}) => {
  if (!ENABLED) {
    return;
  }

  try {
    const ph = await loadPostHog();
    if (!ph) return;
    ph.capture(event, {
      ...props,
      session_id:  getSessionId(),
      device_id:   getDeviceId(),
      ts:          Date.now(),
    });
  } catch {
    // Never throw — analytics must never break the game
  }
};

// ─── Public tracking API ──────────────────────────────────────────────────────

/** Call once on first render */
export const trackAppOpened = () =>
  capture("zap_app_opened", { referrer: document.referrer || "direct" });

/** Player chose a club name and entered */
export const trackClubCreated = () =>
  capture("zap_club_created");

/** Training mode screen appeared */
export const trackTrainingStarted = () =>
  capture("zap_training_started");

/** Player completed all 3 training situations */
export const trackTrainingCompleted = () =>
  capture("zap_training_completed");

/** Player left training before finishing */
export const trackTrainingAbandoned = (stepReached = 0) =>
  capture("zap_training_abandoned", { step_reached: stepReached });

/** Pre-match formation chosen */
export const trackFormationSelected = (formationId, formationShape) =>
  capture("zap_formation_selected", { formation_id: formationId, formation_shape: formationShape });

/** Kick off — match begins */
export const trackMatchStarted = ({ formationId, formationShape, opponentStyle, isFirstMatch }) =>
  capture("zap_match_started", {
    formation_id:    formationId,
    formation_shape: formationShape,
    opponent_style:  opponentStyle || "unknown",
    is_first_match:  !!isFirstMatch,
  });

/**
 * Every turn decision.
 * This is the richest event — drives retention and mechanic analysis.
 */
export const trackTurnPlayed = ({
  turn, phase, intentId, intentLabel,
  outcome,          // true = win, false = loss
  readRelation,     // "beats" | "wins" | "loses"
  opponentIntentId,
  matchStats = {},
}) =>
  capture("zap_turn_played", {
    turn,
    phase,
    intent_id:          intentId,
    intent_label:       intentLabel,
    outcome:            outcome ? "win" : "loss",
    read_relation:      readRelation,
    opponent_intent_id: opponentIntentId,
    player_mid_stat:    matchStats.mid,
    player_atk_stat:    matchStats.atk,
    player_def_stat:    matchStats.def,
  });

/** Half time reached */
export const trackHalftimeReached = ({ score, turnsCorrect, turnsWrong }) =>
  capture("zap_halftime_reached", {
    score_home:    score?.h ?? 0,
    score_away:    score?.a ?? 0,
    turns_correct: turnsCorrect,
    turns_wrong:   turnsWrong,
  });

/**
 * Full time — most important retention event.
 * read_accuracy = correct reads / total turns (0–1)
 */
export const trackMatchCompleted = ({
  score, win, draw,
  repDelta, turnsPlayed,
  turnsCorrect, turnsWrong,
  formationId, opponentStyle,
}) =>
  capture("zap_match_completed", {
    score_home:     score?.h ?? 0,
    score_away:     score?.a ?? 0,
    result:         win ? "win" : draw ? "draw" : "loss",
    rep_delta:      repDelta,
    turns_played:   turnsPlayed,
    turns_correct:  turnsCorrect,
    turns_wrong:    turnsWrong,
    read_accuracy:  turnsPlayed > 0 ? Math.round((turnsCorrect / turnsPlayed) * 100) / 100 : 0,
    formation_id:   formationId,
    opponent_style: opponentStyle || "unknown",
  });

/** Player navigated away from an active match */
export const trackMatchAbandoned = ({ turn, phase, score }) =>
  capture("zap_match_abandoned", {
    abandoned_at_turn:  turn,
    abandoned_in_phase: phase,
    score_home:         score?.h ?? 0,
    score_away:         score?.a ?? 0,
  });

/** Guided overlay dismissed — tells you if onboarding is landing */
export const trackOnboardingStep = (turnNum) =>
  capture("zap_onboarding_step", { guide_turn: turnNum });
