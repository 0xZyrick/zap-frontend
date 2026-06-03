import manifestDev from "./manifest_dev.json";
import manifestSepolia from "./manifest_sepolia.json";

const env = import.meta.env || {};
const CHAIN_PROFILE = (env.VITE_CHAIN_PROFILE || env.VITE_CHAIN || "katana").toLowerCase();
const DEFAULT_PROFILE = CHAIN_PROFILE === "sepolia" || CHAIN_PROFILE === "starknet-sepolia"
  ? "sepolia"
  : "katana";
const PROFILE = (env.VITE_DOJO_PROFILE || env.VITE_NETWORK || DEFAULT_PROFILE).toLowerCase();
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
export const NAMESPACE       = "dojo_starter";
export const DOJO_PROFILE    = PROFILE;
export const IS_SEPOLIA      = isSepolia;

export const KATANA_CHAIN_ID = env.VITE_KATANA_CHAIN_ID || "0x57505f5a41504643";
export const SEPOLIA_CHAIN_ID = "0x534e5f5345504f4c4941";
export const CHAIN_ID = isSepolia ? SEPOLIA_CHAIN_ID : KATANA_CHAIN_ID;

export const RPC_URL = env.VITE_STARKNET_RPC_URL || (
  isSepolia
    ? "https://api.cartridge.gg/x/starknet/sepolia"
    : "https://api.cartridge.gg/x/zapfc/katana"
);
export const TORII_URL = env.VITE_TORII_URL || (
  isSepolia
    ? "https://api.cartridge.gg/x/starknet/sepolia/torii"
    : "https://api.cartridge.gg/x/zapfc/torii"
);
export const USE_CARTRIDGE = env.VITE_USE_CARTRIDGE
  ? env.VITE_USE_CARTRIDGE === "true"
  : !isLocalProfile || isSepolia;
export const USE_DEV_RESOLVE = env.VITE_USE_DEV_RESOLVE
  ? env.VITE_USE_DEV_RESOLVE === "true"
  : !isSepolia;

const GAME_ACTIONS_ADDRESS   = requireAddress("dojo_starter-game_actions");
const MARKET_ACTIONS_ADDRESS = requireAddress("dojo_starter-market_actions");
const PLAYER_ACTIONS_ADDRESS = requireAddress("dojo_starter-player_actions");

export const CONTRACTS = {
  game_actions:                 GAME_ACTIONS_ADDRESS,
  market_actions:               MARKET_ACTIONS_ADDRESS,
  player_actions:               PLAYER_ACTIONS_ADDRESS,
  dojo_starter_game_actions:    GAME_ACTIONS_ADDRESS,
  dojo_starter_market_actions:  MARKET_ACTIONS_ADDRESS,
  dojo_starter_player_actions:  PLAYER_ACTIONS_ADDRESS,
};

// Slot-hosted Katana prefunded account
export const DEV_ACCOUNT = {
  address:    "0x6677fe62ee39c7b07401f754138502bab7fac99d2d3c5d37df7d1c6fab10819",
  privateKey: "0x3e3979c1ed728490308054fe357a9f49cf67f80f9721f44cc57235129e090f4",
};
