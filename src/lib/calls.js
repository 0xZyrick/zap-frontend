// ─────────────────────────────────────────────────────────────────────────────
//  ZAP · Contract Calls
//  Every on-chain interaction lives here.
//  Each function accepts an `account` (starknet.js Account) + params,
//  executes the call, and returns the tx hash.
// ─────────────────────────────────────────────────────────────────────────────

import { shortString } from "starknet";
import { CONTRACTS, TORII_URL, USE_DEV_RESOLVE } from "./dojoConfig";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Encode a plain string as felt252 (max 31 chars). */
export const toFelt = (str) => shortString.encodeShortString(String(str));

const ZERO_ADDRESS = "0x0";
const NO_PENDING_ACTION = 255;
const STATUS_ACTIVE = 0;
const sessionCursorKey = () => `zapfc:lastSessionId:${CONTRACTS.game_actions}`;

const asBigInt = (value) => {
  try {
    if (value === undefined || value === null) return null;
    return BigInt(value);
  } catch {
    return null;
  }
};

const sameAddress = (a, b) => {
  const aa = asBigInt(a ?? ZERO_ADDRESS);
  const bb = asBigInt(b ?? ZERO_ADDRESS);
  return aa !== null && bb !== null && aa === bb;
};

const toriiGraphqlUrl = () => `${String(TORII_URL || "").replace(/\/$/, "")}/graphql`;

const decodeFeltString = (value) => {
  try {
    return value ? shortString.decodeShortString(value) : null;
  } catch {
    return null;
  }
};

const waitForTx = (provider, txHash) => {
  if (!provider || !txHash) return null;
  return provider.waitForTransaction(txHash);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const rememberSessionId = (sessionId) => {
  try {
    if (sessionId) localStorage.setItem(sessionCursorKey(), sessionId.toString());
  } catch {}
};

const rememberedSessionId = () => {
  try {
    return Number(localStorage.getItem(sessionCursorKey()) || 0);
  } catch {
    return 0;
  }
};

const eventValues = (receipt) => {
  const out = [];
  for (const event of receipt?.events || []) {
    out.push(...(event.keys || []), ...(event.data || []));
  }
  return out;
};

export const isAlreadyRegisteredError = (error) =>
  (error?.message || String(error || "")).includes("Already registered");

export async function getPlayerRegistry(walletAddress) {
  if (!walletAddress || !TORII_URL) return null;

  try {
    const response = await fetch(toriiGraphqlUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: `
          query PlayerRegistry($wallet: ContractAddress!) {
            dojoStarterPlayerRegistryModels(first: 1, where: { walletEQ: $wallet }) {
              edges {
                node {
                  wallet
                  registered
                  club_name
                  rep
                  wins
                  losses
                  draws
                  streak
                  coins
                  total_matches
                }
              }
            }
          }
        `,
        variables: { wallet: walletAddress },
      }),
    });

    if (!response.ok) throw new Error(`Torii registry query failed: ${response.status}`);

    const payload = await response.json();
    if (payload?.errors?.length) {
      throw new Error(payload.errors.map((err) => err.message).join("; "));
    }

    const node = payload?.data?.dojoStarterPlayerRegistryModels?.edges?.[0]?.node || null;
    return node ? { ...node, clubName: decodeFeltString(node.club_name) } : null;
  } catch {
    return null;
  }
}

const isFreshActiveSession = (session) => {
  if (!session) return false;
  const state = unpackState(session.state);
  return (
    state.status === STATUS_ACTIVE &&
    state.turnNumber === 0 &&
    state.half === 1 &&
    state.scoreH === 0 &&
    state.scoreA === 0 &&
    state.pendingAction === NO_PENDING_ACTION
  );
};

const validateSession = async (provider, sessionId, playerAddress, options = {}) => {
  if (!sessionId || sessionId <= 0n) return null;
  const session = await getSession(provider, sessionId);
  if (
    session &&
    session.sessionId === sessionId &&
    sameAddress(session.player, playerAddress) &&
    (!options.freshActive || isFreshActiveSession(session))
  ) {
    rememberSessionId(sessionId);
    return sessionId;
  }
  return null;
};

const findLatestSessionId = async (provider, playerAddress, receipt, options = {}) => {
  const minSessionId = BigInt(options.afterSessionId || 0);
  const likelyIds = eventValues(receipt)
    .map(asBigInt)
    .filter((value) => value && value > minSessionId && value <= 1_000_000n)
    .sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

  for (const id of [...new Set(likelyIds.map((id) => id.toString()))].map(BigInt)) {
    const valid = await validateSession(provider, id, playerAddress, { freshActive: true });
    if (valid) return valid;
  }

  const start = Math.max(Number(minSessionId) + 1, rememberedSessionId() + 1, 1);
  const end = start + 256;
  let latest = null;
  for (let id = start; id <= end; id += 1) {
    const valid = await validateSession(provider, BigInt(id), playerAddress, { freshActive: true });
    if (valid) latest = valid;
  }
  return latest;
};

/** Read a game session from the world via a view call. */
export async function getSession(provider, sessionId) {
  if (!provider || !sessionId) return null;
  try {
    const result = await provider.callContract({
      contractAddress: CONTRACTS.game_actions,
      entrypoint: "get_session",
      calldata: [String(sessionId)],
    });
    // result is an array of felts: [session_id, player, cpu_power, state, stats_packed, vrf_request_id]
    return {
      sessionId:    BigInt(result[0]),
      player:       result[1],
      cpuPower:     Number(result[2]),
      state:        BigInt(result[3]),
      statsPacked:  Number(result[4]),
      vrfRequestId: BigInt(result[5]),
    };
  } catch {
    return null;
  }
}

/** Unpack state u64 into its 7 fields (mirrors pack_state in utils.cairo). */
export function unpackState(state) {
  const s = BigInt(state);
  return {
    turnNumber:    Number((s >> 0n)  & 0xFFn),
    half:          Number((s >> 8n)  & 0xFFn),
    currentPhase:  Number((s >> 16n) & 0xFFn),  // 0=MF 1=ATK 2=DEF
    scoreH:        Number((s >> 24n) & 0xFFn),
    scoreA:        Number((s >> 32n) & 0xFFn),
    status:        Number((s >> 40n) & 0xFFn),  // 0=active 1=halftime 2=finished 3=claimed
    pendingAction: Number((s >> 48n) & 0xFFn),  // 255 = none
  };
}

/** Unpack stats_packed u32 into atk/mid/def. */
export function unpackStats(packed) {
  const p = Number(packed);
  return {
    atk: (p >> 0)  & 0xFF,
    mid: (p >> 8)  & 0xFF,
    def: (p >> 16) & 0xFF,
  };
}

export async function waitForSessionResolution(provider, sessionId, previousSession, options = {}) {
  const timeoutMs = options.timeoutMs ?? 45000;
  const pollMs = options.pollMs ?? 1500;
  const started = Date.now();
  const previousState = previousSession ? unpackState(previousSession.state) : null;

  while (Date.now() - started < timeoutMs) {
    const session = await getSession(provider, sessionId);
    if (session) {
      const state = unpackState(session.state);
      const turnAdvanced = previousState
        ? state.turnNumber > previousState.turnNumber || state.status !== previousState.status
        : state.pendingAction === NO_PENDING_ACTION;
      if (turnAdvanced && state.pendingAction === NO_PENDING_ACTION) {
        return session;
      }
    }
    await sleep(pollMs);
  }

  throw new Error("Timed out waiting for on-chain turn resolution");
}

// ── PlayerActions ─────────────────────────────────────────────────────────────

/**
 * Register a new player.
 * Call once on first wallet connection if player isn't registered yet.
 */
export async function registerPlayer(account, clubName) {
  try {
    return await account.execute({
      contractAddress: CONTRACTS.player_actions,
      entrypoint: "register_player",
      calldata: [toFelt(clubName)],
    });
  } catch (e) {
    if (isAlreadyRegisteredError(e)) {
      return { alreadyRegistered: true };
    }
    throw e;
  }
}

/** Switch formation. formationId is a felt252 constant — pass as hex string. */
export async function setFormation(account, formationId) {
  return account.execute({
    contractAddress: CONTRACTS.player_actions,
    entrypoint: "set_formation",
    calldata: [formationId],
  });
}

/**
 * Equip a card as starter for its role.
 * role must match felt252 values: 'striker' | 'midfielder' | 'defender'
 */
export async function equipStarter(account, cardId, role) {
  return account.execute({
    contractAddress: CONTRACTS.player_actions,
    entrypoint: "equip_starter",
    calldata: [String(cardId), toFelt(role)],
  });
}

export async function unequipStarter(account, role) {
  return account.execute({
    contractAddress: CONTRACTS.player_actions,
    entrypoint: "unequip_starter",
    calldata: [toFelt(role)],
  });
}

// ── GameActions ───────────────────────────────────────────────────────────────

/**
 * Start a new game against a CPU opponent.
 * cpuIdx: 0–6 (lower = harder, from constants.cairo).
 * Returns session_id from events — use waitForTransaction then parse events,
 * or use the return value if using Torii subscription.
 * For dev simplicity we parse the tx receipt.
 */
export async function startGame(account, provider, cpuIdx = 3) {
  if (!account) throw new Error("No account for startGame");
  if (!provider) throw new Error("No provider for startGame");
  
  const afterSessionId = rememberedSessionId();
  const tx = await account.execute({
    contractAddress: CONTRACTS.game_actions,
    entrypoint: "start_game",
    calldata: [String(cpuIdx)],
  });

  const receipt = await waitForTx(provider, tx.transaction_hash);
  const sessionId = await findLatestSessionId(provider, account.address, receipt, { afterSessionId });

  if (!sessionId) throw new Error("Failed to extract session ID from transaction");
  return { txHash: tx.transaction_hash, sessionId };
}

/**
 * Dev-only turn resolver (Katana). Bypasses VRF with a local seed.
 * actionIdx: 0 | 1 | 2 (matches ACTIONS[phase] order in Zap.jsx)
 * seed: random u128 as string
 */
export async function devResolveTurn(account, sessionId, actionIdx, seed) {
  if (!account) throw new Error("No account for devResolveTurn");
  
  return account.execute({
    contractAddress: CONTRACTS.game_actions,
    entrypoint: "dev_resolve_turn",
    calldata: [
      String(sessionId),
      String(actionIdx),
      String(seed),
    ],
  });
}

/** Production turn resolver. Stores the action, then VRF resolves asynchronously. */
export async function submitTurnAction(account, sessionId, actionIdx) {
  return account.execute({
    contractAddress: CONTRACTS.game_actions,
    entrypoint: "submit_turn_action",
    calldata: [
      String(sessionId),
      String(actionIdx),
    ],
  });
}

/** Advance to second half after halftime screen. */
export async function continueAfterHalftime(account, sessionId) {
  return account.execute({
    contractAddress: CONTRACTS.game_actions,
    entrypoint: "continue_after_halftime",
    calldata: [String(sessionId)],
  });
}

/** Claim rewards at the end of a finished game. */
export async function claimGameReward(account, sessionId) {
  return account.execute({
    contractAddress: CONTRACTS.game_actions,
    entrypoint: "claim_game_reward",
    calldata: [String(sessionId)],
  });
}

// ── MarketActions ─────────────────────────────────────────────────────────────

/** Buy a card directly from the shop at its fixed price. */
export async function purchaseCardFromShop(account, cardId) {
  return account.execute({
    contractAddress: CONTRACTS.market_actions,
    entrypoint: "purchase_card_from_shop",
    calldata: [String(cardId)],
  });
}

/** Sell a card back to the shop for 50% refund. */
export async function sellCardToShop(account, cardId) {
  return account.execute({
    contractAddress: CONTRACTS.market_actions,
    entrypoint: "sell_card_to_shop",
    calldata: [String(cardId)],
  });
}
