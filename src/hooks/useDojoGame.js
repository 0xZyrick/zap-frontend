// ─────────────────────────────────────────────────────────────────────────────
//  ZAP · useDojoGame
//  Thin hook that wraps every on-chain call the game UI needs.
//  Keeps Zap.jsx clean — it only calls these methods.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from "react";
import {
  registerPlayer,
  setFormation,
  equipStarter,
  unequipStarter,
  startGame,
  devResolveTurn,
  submitTurnAction,
  continueAfterHalftime,
  claimGameReward,
  purchaseCardFromShop,
  sellCardToShop,
  getSession,
  waitForSessionResolution,
  unpackState,
  unpackStats,
} from "../lib/calls";
import { USE_DEV_RESOLVE } from "../lib/dojoConfig";

const STATUS_ACTIVE = 0;
const STATUS_HALFTIME = 1;

export function useDojoGame(account, provider) {
  const [txPending, setTxPending] = useState(false);
  const [txError,   setTxError]   = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const sessionIdRef              = useRef(null);

  // ── Utility: wrap any call with pending/error state ──────────────────────
  const exec = useCallback(async (fn, ...args) => {
    if (!account) throw new Error("Wallet not connected");
    setTxPending(true);
    setTxError(null);
    try {
      const result = await fn(account, ...args);
      // If the call returns a tx hash, wait for it
      if (result?.transaction_hash && provider) {
        await provider.waitForTransaction(result.transaction_hash);
      }
      return result;
    } catch (e) {
      const msg = e?.message || String(e);
      setTxError(msg);
      console.error("TX failed:", msg);
      throw e;
    } finally {
      setTxPending(false);
    }
  }, [account, provider]);

  // ── Player ────────────────────────────────────────────────────────────────

  const doRegister = useCallback((clubName) =>
    exec(registerPlayer, clubName), [exec]);

  const doSetFormation = useCallback((formationId) =>
    exec(setFormation, formationId), [exec]);

  const doEquipStarter = useCallback((cardId, role) =>
    exec(equipStarter, cardId, role), [exec]);

  const doUnequipStarter = useCallback((role) =>
    exec(unequipStarter, role), [exec]);

  // ── Game ──────────────────────────────────────────────────────────────────

  /**
   * Start a game. Returns { sessionId, txHash }.
   * cpuIdx 0 = hardest, 6 = easiest — map from your repTier logic.
   */
  const doStartGame = useCallback(async (cpuIdx) => {
    setTxPending(true);
    setTxError(null);
    try {
      const result = await startGame(account, provider, cpuIdx);
      sessionIdRef.current = result.sessionId;
      setSessionId(result.sessionId);
      if (!result.sessionId) {
        throw new Error("Game started, but no on-chain session id was found");
      }
      return result;
    } catch (e) {
      setTxError(e?.message || String(e));
      throw e;
    } finally {
      setTxPending(false);
    }
  }, [account, provider]);

  /**
   * Submit a turn action and read back the resulting session state.
   * actionIdx: 0 | 1 | 2
   * Returns the unpacked session with turn result info
   */
  const doResolveTurn = useCallback(async (actionIdx, prevScoreH, prevScoreA, prevPhase) => {
    if (!provider) {
      throw new Error("Provider not initialized for turn resolution");
    }
    
    const sessionId = sessionIdRef.current;
    if (!sessionId) throw new Error("No active session");

    console.log("[doResolveTurn] Starting turn resolution", { sessionId, actionIdx, provider: !!provider });
    const before = await getSession(provider, sessionId);
    console.log("[doResolveTurn] Before state:", before);

    let devSeed = null;
    let cpuAction = null;
    if (USE_DEV_RESOLVE) {
      // Generate a pseudo-random seed for hosted/local Katana dev worlds.
      devSeed = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
      cpuAction = Number(devSeed % 3n);
      console.log("[doResolveTurn] Submitting dev_resolve_turn", { sessionId, actionIdx, seed: devSeed.toString() });
      await exec(devResolveTurn, sessionId, actionIdx, devSeed);
    } else {
      console.log("[doResolveTurn] Submitting submit_turn_action", { sessionId, actionIdx });
      await exec(submitTurnAction, sessionId, actionIdx);
    }

    // Read back updated state from chain
    console.log("[doResolveTurn] Waiting for session resolution...");
    const session = USE_DEV_RESOLVE
      ? await getSession(provider, sessionId)
      : await waitForSessionResolution(provider, sessionId, before);
    
    if (!session) {
      console.error("[doResolveTurn] Failed to read session after turn");
      return null;
    }

    const unpacked = unpackState(session.state);
    const stats = unpackStats(session.statsPacked);

    // Determine if action succeeded from the contract phase rules.
    const goalScored = unpacked.scoreH > prevScoreH;
    const conceded = unpacked.scoreA > prevScoreA;
    const success = prevPhase === "MIDFIELD"
      ? unpacked.currentPhase === 1
      : prevPhase === "ATTACK"
        ? goalScored
        : !conceded;
    
    // Determine actual outcome from blockchain state
    let outcome = success ? "success" : "fail";
    if (goalScored) outcome = "goal";
    else if (conceded) outcome = "concede";
    else if (prevPhase === "ATTACK" && !success) outcome = "miss";
    else if (prevPhase === "MIDFIELD") outcome = success ? "attack" : "defend";

    console.log("[doResolveTurn] Turn resolved", { outcome, success, goalScored, conceded, newPhase: unpacked.currentPhase, cpuAction });

    return {
      ...unpacked,
      ...stats,
      cpuPower: session.cpuPower,
      sessionId,
      player: session.player,
      vrfRequestId: session.vrfRequestId,
      actionSuccess: success,
      goalScored,
      conceded,
      cpuAction,
      seed: devSeed,
      outcome,
      newPhase: unpacked.currentPhase,
    };
  }, [exec, provider]);

  const doContinueHalftime = useCallback(async () => {
    if (!provider) throw new Error("Provider not initialized for halftime");
    const sessionId = sessionIdRef.current;
    if (!sessionId) throw new Error("No active session");

    const readState = async () => {
      const session = await getSession(provider, sessionId);
      return session ? { session, state: unpackState(session.state) } : null;
    };

    const before = await readState();
    if (!before) throw new Error("Could not read halftime session");

    if (before.state.status === STATUS_ACTIVE && before.state.half === 2) {
      return before.state;
    }

    if (before.state.status !== STATUS_HALFTIME) {
      throw new Error(`Not at halftime yet (status ${before.state.status})`);
    }

    try {
      await exec(continueAfterHalftime, sessionId);
    } catch (e) {
      const afterError = await readState();
      if (afterError?.state.status === STATUS_ACTIVE && afterError.state.half === 2) {
        return afterError.state;
      }
      throw e;
    }

    const started = Date.now();
    while (Date.now() - started < 15000) {
      const next = await readState();
      if (next?.state.status === STATUS_ACTIVE && next.state.half === 2) {
        return next.state;
      }
      await new Promise((resolve) => setTimeout(resolve, 900));
    }

    throw new Error("Timed out waiting for second half to activate");
  }, [exec, provider]);

  const doClaimReward = useCallback(async () => {
    await exec(claimGameReward, sessionIdRef.current);
    sessionIdRef.current = null;
    setSessionId(null);
  }, [exec]);

  // ── Market ────────────────────────────────────────────────────────────────

  const doBuyCard = useCallback((cardId) =>
    exec(purchaseCardFromShop, cardId), [exec]);

  const doSellCard = useCallback((cardId) =>
    exec(sellCardToShop, cardId), [exec]);

  return {
    txPending,
    txError,
    sessionId,
    doRegister,
    doSetFormation,
    doEquipStarter,
    doUnequipStarter,
    doStartGame,
    doResolveTurn,
    doContinueHalftime,
    doClaimReward,
    doBuyCard,
    doSellCard,
  };
}
