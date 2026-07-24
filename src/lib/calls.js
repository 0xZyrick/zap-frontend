// ─────────────────────────────────────────────────────────────────────────────
//  ZAP · Contract Calls
//  Every on-chain interaction lives here.
//  Each function accepts an `account` (starknet.js Account) + params,
//  executes the call, and returns the tx hash.
// ─────────────────────────────────────────────────────────────────────────────

import { hash, num, shortString } from "starknet";
import { CONTRACTS, TORII_URL, USE_DEV_RESOLVE } from "./dojoConfig";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Encode a plain string as felt252 (max 31 chars). */
export const toFelt = (str) => shortString.encodeShortString(String(str));

const ZERO_ADDRESS = "0x0";
const NO_PENDING_ACTION = 255;
const STATUS_ACTIVE = 0;
const sessionCursorKey = () => `zapfc:lastSessionId:${CONTRACTS.game_actions}`;
const pvpSessionCursorKey = () => `zapfc:lastPvpSessionId:${CONTRACTS.pvp_actions || "none"}`;
const STARK_FIELD_PRIME = BigInt("0x800000000000011000000000000000000000000000000000000000000000001");

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

const normalizeFelt = (value) => {
  const felt = asBigInt(value);
  if (felt === null) throw new Error(`Invalid felt value: ${String(value)}`);
  const normalized = ((felt % STARK_FIELD_PRIME) + STARK_FIELD_PRIME) % STARK_FIELD_PRIME;
  return normalized;
};

const feltHex = (value) => num.toHex(normalizeFelt(value));

export const makePvpSalt = () => {
  const bytes = new Uint8Array(31);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) + BigInt(byte);
  if (value === 0n) value = BigInt(Date.now());
  return feltHex(value);
};

export const computePvpCommitHash = ({
  action,
  salt,
  playerAddress,
  sessionId,
  turnNumber,
}) => hash.computePoseidonHashOnElements([
  feltHex(action),
  feltHex(salt),
  feltHex(playerAddress),
  feltHex(sessionId),
  feltHex(turnNumber),
]);

const toriiGraphqlUrl = () => (
  import.meta.env.DEV
    ? "/torii/graphql"
    : `${String(TORII_URL || "").replace(/\/$/, "")}/graphql`
);

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

const rememberPvpSessionId = (sessionId) => {
  try {
    if (sessionId) localStorage.setItem(pvpSessionCursorKey(), sessionId.toString());
  } catch {}
};

const rememberedPvpSessionId = () => {
  try {
    return Number(localStorage.getItem(pvpSessionCursorKey()) || 0);
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
            zapfcPlayerRegistryModels(first: 1, where: { walletEQ: $wallet }) {
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

    const node = payload?.data?.zapfcPlayerRegistryModels?.edges?.[0]?.node || null;
    return node ? { ...node, clubName: decodeFeltString(node.club_name) } : null;
  } catch {
    return null;
  }
}

export async function getGlobalLeaderboard(limit = 50) {
  if (!TORII_URL) return [];

  try {
    const response = await fetch(toriiGraphqlUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: `
          query GlobalLeaderboard($first: Int!) {
            zapfcPlayerRegistryModels(first: $first) {
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
              totalCount
            }
          }
        `,
        variables: { first: Math.max(1, Math.min(Number(limit) || 50, 100)) },
      }),
    });

    if (!response.ok) throw new Error(`Torii leaderboard query failed: ${response.status}`);

    const payload = await response.json();
    if (payload?.errors?.length) {
      throw new Error(payload.errors.map((err) => err.message).join("; "));
    }

    return (payload?.data?.zapfcPlayerRegistryModels?.edges || [])
      .filter((edge) => !!edge?.node?.registered)
      .map((edge, index) => {
        const node = edge?.node || {};
        return {
          id: node.wallet || `global-${index}`,
          wallet: node.wallet,
          name: decodeFeltString(node.club_name) || "UNKNOWN FC",
          pts: Number(node.rep || 0),
          rep: Number(node.rep || 0),
          wins: Number(node.wins || 0),
          draws: Number(node.draws || 0),
          losses: Number(node.losses || 0),
          streak: Number(node.streak || 0),
          coins: Number(node.coins || 0),
          total: Number(node.total_matches || 0),
          cpu: false,
          source: "torii",
        };
      })
      .sort((a, b) => b.rep - a.rep || b.wins - a.wins || a.losses - b.losses)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  } catch {
    return [];
  }
}

const pvpSessionFromNode = (node) => {
  if (!node?.session_id) return null;
  const sessionId = asBigInt(node.session_id);
  if (!sessionId) return null;

  return {
    sessionId,
    home: node.home,
    away: node.away,
    lobbyStatus: Number(node.lobby_status || 0),
    state: BigInt(node.state || 0),
    turnStage: Number(node.turn_stage || 0),
    turnDeadline: BigInt(node.turn_deadline || 0),
    createdAt: BigInt(node.created_at || 0),
    stateFields: unpackState(node.state || 0),
  };
};

async function getLatestPvpSessionForHome(homeAddress, options = {}) {
  if (!homeAddress || !TORII_URL) return null;
  const afterSessionId = BigInt(options.afterSessionId || 0);

  try {
    const response = await fetch(toriiGraphqlUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: `
          query LatestPvpSession($home: ContractAddress!) {
            zapfcPvpSessionModels(first: 50, where: { homeEQ: $home }) {
              edges {
                node {
                  session_id
                  home
                  away
                  lobby_status
                  state
                  turn_stage
                  turn_deadline
                  created_at
                }
              }
            }
          }
        `,
        variables: { home: homeAddress },
      }),
    });

    if (!response.ok) throw new Error(`Torii PVP query failed: ${response.status}`);
    const payload = await response.json();
    if (payload?.errors?.length) {
      throw new Error(payload.errors.map((err) => err.message).join("; "));
    }

    return (payload?.data?.zapfcPvpSessionModels?.edges || [])
      .map((edge) => pvpSessionFromNode(edge?.node))
      .filter((session) => (
        session &&
        session.sessionId > afterSessionId &&
        sameAddress(session.home, homeAddress)
      ))
      .sort((a, b) => (a.sessionId > b.sessionId ? -1 : a.sessionId < b.sessionId ? 1 : 0))[0] || null;
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

const validatePvpSession = async (provider, sessionId, playerAddress, options = {}) => {
  if (!sessionId || sessionId <= 0n) return null;
  const session = await getPvpSession(provider, sessionId);
  if (!session || session.sessionId !== sessionId) return null;

  const matchesHome = sameAddress(session.home, playerAddress);
  const matchesAway = sameAddress(session.away, playerAddress);
  if (options.role === "home" && !matchesHome) return null;
  if (options.role === "away" && !matchesAway) return null;
  if (!options.role && !matchesHome && !matchesAway) return null;

  rememberPvpSessionId(sessionId);
  return sessionId;
};

const findLatestPvpSessionId = async (provider, playerAddress, receipt, options = {}) => {
  const minSessionId = BigInt(options.afterSessionId || 0);
  const likelyIds = eventValues(receipt)
    .map(asBigInt)
    .filter((value) => value && value > 0n && value <= 1_000_000n)
    .sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

  for (const id of [...new Set(likelyIds.map((id) => id.toString()))].map(BigInt)) {
    const valid = await validatePvpSession(provider, id, playerAddress, options);
    if (valid) return valid;
  }

  const cursor = Math.max(Number(minSessionId), rememberedPvpSessionId(), 0);
  const start = Math.max(cursor - 256, 1);
  const end = cursor + 512;
  let latest = null;
  for (let id = start; id <= end; id += 1) {
    const valid = await validatePvpSession(provider, BigInt(id), playerAddress, options);
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

/** Read a PVP session from the PVP action contract. */
export async function getPvpSession(provider, sessionId) {
  if (!provider || !sessionId || !CONTRACTS.pvp_actions) return null;
  try {
    const result = await provider.callContract({
      contractAddress: CONTRACTS.pvp_actions,
      entrypoint: "get_session",
      calldata: [String(sessionId)],
    });
    return {
      sessionId:    BigInt(result[0]),
      home:         result[1],
      away:         result[2],
      lobbyStatus:  Number(result[3]),
      state:        BigInt(result[4]),
      turnStage:    Number(result[5]),
      turnDeadline: BigInt(result[6]),
      createdAt:    BigInt(result[7]),
      stateFields:  unpackState(result[4]),
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

// ── PvpActions ────────────────────────────────────────────────────────────────

const requirePvpContract = () => {
  if (!CONTRACTS.pvp_actions) throw new Error("PVP contract missing from manifest");
};

export async function createPvpRoom(account, provider) {
  if (!account) throw new Error("No account for createPvpRoom");
  if (!provider) throw new Error("No provider for createPvpRoom");
  requirePvpContract();

  const afterSessionId = rememberedPvpSessionId();
  const tx = await account.execute({
    contractAddress: CONTRACTS.pvp_actions,
    entrypoint: "create_room",
    calldata: [],
  });
  const receipt = await waitForTx(provider, tx.transaction_hash);
  let sessionId = await findLatestPvpSessionId(provider, account.address, receipt, {
    afterSessionId,
    role: "home",
  });

  let indexedSession = null;
  for (let attempt = 0; !sessionId && attempt < 8; attempt += 1) {
    if (attempt > 0) await sleep(750);
    indexedSession = await getLatestPvpSessionForHome(account.address, { afterSessionId });
    if (indexedSession?.sessionId) {
      sessionId = indexedSession.sessionId;
      rememberPvpSessionId(sessionId);
    }
  }

  if (!sessionId) {
    throw new Error(`PVP room created, but no session id was found. Tx: ${tx.transaction_hash}`);
  }
  return {
    txHash: tx.transaction_hash,
    sessionId,
    session: await getPvpSession(provider, sessionId) || indexedSession,
  };
}

export async function joinPvpRoom(account, provider, sessionId) {
  if (!account) throw new Error("No account for joinPvpRoom");
  if (!provider) throw new Error("No provider for joinPvpRoom");
  requirePvpContract();

  const tx = await account.execute({
    contractAddress: CONTRACTS.pvp_actions,
    entrypoint: "join_room",
    calldata: [String(sessionId)],
  });
  await waitForTx(provider, tx.transaction_hash);
  rememberPvpSessionId(sessionId);
  return { txHash: tx.transaction_hash, session: await getPvpSession(provider, sessionId) };
}

export async function cancelPvpRoom(account, provider, sessionId) {
  if (!account) throw new Error("No account for cancelPvpRoom");
  requirePvpContract();

  const tx = await account.execute({
    contractAddress: CONTRACTS.pvp_actions,
    entrypoint: "cancel_room",
    calldata: [String(sessionId)],
  });
  await waitForTx(provider, tx.transaction_hash);
  return { txHash: tx.transaction_hash, session: await getPvpSession(provider, sessionId) };
}

export async function commitPvpTurn(account, provider, sessionId, action, salt, turnNumber) {
  if (!account) throw new Error("No account for commitPvpTurn");
  requirePvpContract();

  const commitHash = computePvpCommitHash({
    action,
    salt,
    playerAddress: account.address,
    sessionId,
    turnNumber,
  });
  const tx = await account.execute({
    contractAddress: CONTRACTS.pvp_actions,
    entrypoint: "commit_turn",
    calldata: [String(sessionId), commitHash],
  });
  await waitForTx(provider, tx.transaction_hash);
  return {
    txHash: tx.transaction_hash,
    commitHash,
    salt: feltHex(salt),
    session: await getPvpSession(provider, sessionId),
  };
}

export async function revealPvpTurn(account, provider, sessionId, action, salt) {
  if (!account) throw new Error("No account for revealPvpTurn");
  requirePvpContract();

  const tx = await account.execute({
    contractAddress: CONTRACTS.pvp_actions,
    entrypoint: "reveal_turn",
    calldata: [String(sessionId), String(action), feltHex(salt)],
  });
  await waitForTx(provider, tx.transaction_hash);
  return { txHash: tx.transaction_hash, session: await getPvpSession(provider, sessionId) };
}

export async function continuePvpAfterHalftime(account, provider, sessionId) {
  if (!account) throw new Error("No account for continuePvpAfterHalftime");
  requirePvpContract();

  const tx = await account.execute({
    contractAddress: CONTRACTS.pvp_actions,
    entrypoint: "continue_after_halftime",
    calldata: [String(sessionId)],
  });
  await waitForTx(provider, tx.transaction_hash);
  return { txHash: tx.transaction_hash, session: await getPvpSession(provider, sessionId) };
}

export async function claimPvpTimeout(account, provider, sessionId) {
  if (!account) throw new Error("No account for claimPvpTimeout");
  requirePvpContract();

  const tx = await account.execute({
    contractAddress: CONTRACTS.pvp_actions,
    entrypoint: "claim_timeout",
    calldata: [String(sessionId)],
  });
  await waitForTx(provider, tx.transaction_hash);
  return { txHash: tx.transaction_hash, session: await getPvpSession(provider, sessionId) };
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
