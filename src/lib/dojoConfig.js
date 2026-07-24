import manifestDev from "./manifest_dev.json";
import manifestSepolia from "./manifest_sepolia.json";

const env = import.meta.env || {};
const rawRpcUrl = env.VITE_STARKNET_RPC_URL || "";
const rawToriiUrl = env.VITE_TORII_URL || "";
const deprecatedZapKatana =
  rawRpcUrl.includes("/x/zapfc/katana") ||
  rawToriiUrl.includes("/x/zapfc/torii");
const rawChainProfile = (env.VITE_CHAIN_PROFILE || env.VITE_CHAIN || "sepolia").toLowerCase();
const rawDojoProfile = (env.VITE_DOJO_PROFILE || env.VITE_NETWORK || "").toLowerCase();
const wantsCartridge = env.VITE_USE_CARTRIDGE
  ? env.VITE_USE_CARTRIDGE === "true"
  : true;
const isLocalRpc = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(rawRpcUrl);
const allowKatanaController = env.VITE_ALLOW_KATANA_CONTROLLER === "true";
const staleKatanaProfile =
  ["katana", "slot", "wp_zapfc"].includes(rawChainProfile) ||
  ["katana", "slot", "wp_zapfc"].includes(rawDojoProfile);
const forceSepolia =
  deprecatedZapKatana ||
  (wantsCartridge && staleKatanaProfile && !isLocalRpc && !allowKatanaController);
const CHAIN_PROFILE = (forceSepolia
  ? "sepolia"
  : rawChainProfile).toLowerCase();
const DEFAULT_PROFILE = CHAIN_PROFILE === "sepolia" || CHAIN_PROFILE === "starknet-sepolia"
  ? "sepolia"
  : "katana";
const PROFILE = (forceSepolia
  ? "sepolia"
  : env.VITE_DOJO_PROFILE || env.VITE_NETWORK || DEFAULT_PROFILE).toLowerCase();
const manifests = {
  dev: manifestDev,
  local: manifestDev,
  katana: manifestDev,
  slot: manifestSepolia,
  live: manifestSepolia,
  sepolia: manifestSepolia,
};
const manifest = manifests[PROFILE] || manifestSepolia;
const isSepolia = CHAIN_PROFILE === "sepolia" || CHAIN_PROFILE === "starknet-sepolia";
const isLocalProfile = PROFILE === "dev" || PROFILE === "local" || PROFILE === "katana";
const CARTRIDGE_SEPOLIA_RPC = "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9";

const normalizeRpcUrl = (url) => {
  const trimmed = String(url || "").replace(/\/$/, "");
  if (trimmed === "https://api.cartridge.gg/x/starknet/sepolia") {
    return CARTRIDGE_SEPOLIA_RPC;
  }
  return trimmed;
};

const byTag = Object.fromEntries(
  (manifest.contracts || []).map((c) => [c.tag, c.address])
);
const requireAddress = (tag) => {
  const address = byTag[tag];
  if (!address) throw new Error(`Missing ${tag} in ${PROFILE} manifest`);
  return address;
};

export const DOJO_MANIFEST   = manifest;
export const WORLD_ADDRESS   = manifest.world.address;
export const NAMESPACE       = "zapfc";
export const DOJO_PROFILE    = PROFILE;
export const IS_SEPOLIA      = isSepolia;
export const FORCED_SEPOLIA  = forceSepolia;

export const KATANA_CHAIN_ID = env.VITE_KATANA_CHAIN_ID || "0x57505f5a41504643";
export const SEPOLIA_CHAIN_ID = "0x534e5f5345504f4c4941";
export const CHAIN_ID = isSepolia ? SEPOLIA_CHAIN_ID : KATANA_CHAIN_ID;

export const RPC_URL = normalizeRpcUrl(forceSepolia ? CARTRIDGE_SEPOLIA_RPC : env.VITE_STARKNET_RPC_URL || (
  isSepolia
    ? CARTRIDGE_SEPOLIA_RPC
    : "http://localhost:5050"
));
export const TORII_URL = forceSepolia ? "https://api.cartridge.gg/x/starknet/sepolia/torii" : env.VITE_TORII_URL || (
  isSepolia
    ? "https://api.cartridge.gg/x/starknet/sepolia/torii"
    : "http://localhost:8080"
);
export const USE_CARTRIDGE = env.VITE_USE_CARTRIDGE
  ? env.VITE_USE_CARTRIDGE === "true"
  : !isLocalProfile || isSepolia;
export const USE_DEV_RESOLVE = env.VITE_USE_DEV_RESOLVE
  ? env.VITE_USE_DEV_RESOLVE === "true"
  : !isSepolia;

const GAME_ACTIONS_ADDRESS   = requireAddress("zapfc-game_actions");
const MARKET_ACTIONS_ADDRESS = requireAddress("zapfc-market_actions");
const PLAYER_ACTIONS_ADDRESS = requireAddress("zapfc-player_actions");
const PVP_ACTIONS_ADDRESS    = byTag["zapfc-pvp_actions"] || null;

export const CONTRACTS = {
  game_actions:                 GAME_ACTIONS_ADDRESS,
  market_actions:               MARKET_ACTIONS_ADDRESS,
  player_actions:               PLAYER_ACTIONS_ADDRESS,
  pvp_actions:                  PVP_ACTIONS_ADDRESS,
  dojo_starter_game_actions:    GAME_ACTIONS_ADDRESS,
  dojo_starter_market_actions:  MARKET_ACTIONS_ADDRESS,
  dojo_starter_player_actions:  PLAYER_ACTIONS_ADDRESS,
  dojo_starter_pvp_actions:     PVP_ACTIONS_ADDRESS,
};

// Slot-hosted Katana prefunded account
export const DEV_ACCOUNT = {
  address:    "0x6677fe62ee39c7b07401f754138502bab7fac99d2d3c5d37df7d1c6fab10819",
  privateKey: "0x3e3979c1ed728490308054fe357a9f49cf67f80f9721f44cc57235129e090f4",
};
