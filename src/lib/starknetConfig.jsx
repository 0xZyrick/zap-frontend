// ─────────────────────────────────────────────────────────────────────────────
//  ZAP · Starknet React Configuration
//  Sets up StarknetConfig with Cartridge Controller connector and session policies
//  for gas-less game actions.
// ─────────────────────────────────────────────────────────────────────────────

import { StarknetConfig, jsonRpcProvider, cartridge } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import {
  CHAIN_ID,
  CONTRACTS,
  FORCED_SEPOLIA,
  IS_SEPOLIA,
  KATANA_CHAIN_ID,
  RPC_URL,
  SEPOLIA_CHAIN_ID,
  USE_CARTRIDGE,
} from "./dojoConfig";

// ── Chain Definitions ─────────────────────────────────────────────────────────
const sepolia = {
  id: BigInt("0x534e5f5345504f4c4941"), // "SN_SEPOLIA" hex
  name: "Sepolia",
  network: "sepolia",
  testnet: true,
  nativeCurrency: {
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    name: "Stark",
    symbol: "STRK",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://api.cartridge.gg/x/starknet/sepolia"] },
    public: { http: ["https://api.cartridge.gg/x/starknet/sepolia"] },
  },
};

const mainnet = {
  id: BigInt("0x534e5f4d41494e"), // "SN_MAIN" hex
  name: "Mainnet",
  network: "mainnet",
  testnet: false,
  nativeCurrency: {
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    name: "Stark",
    symbol: "STRK",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://api.cartridge.gg/x/starknet/mainnet"] },
    public: { http: ["https://api.cartridge.gg/x/starknet/mainnet"] },
  },
};

// ── Katana Chain Definition ───────────────────────────────────────────────────
const KATANA_URL = RPC_URL || "http://localhost:5050";

const katana = {
  id: BigInt(KATANA_CHAIN_ID),
  name: "Katana",
  network: "katana",
  testnet: true,
  nativeCurrency: {
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    name: "Stark",
    symbol: "STRK",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [KATANA_URL] },
    public: { http: [KATANA_URL] },
  },
  paymasterRpcUrls: {
    avnu: { http: [KATANA_URL] },
  },
};

// ── Session Policies (Gas-less Transactions) ──────────────────────────────────
// Pre-approve game actions so each turn doesn't require user confirmation
const policies = {
  contracts: {
    [CONTRACTS.game_actions]: {
      methods: [
        {
          name: "start_game",
          entrypoint: "start_game",
          description: "Start a new game session",
        },
        {
          name: "dev_resolve_turn",
          entrypoint: "dev_resolve_turn",
          description: "Submit turn action (dev)",
        },
        {
          name: "submit_turn_action",
          entrypoint: "submit_turn_action",
          description: "Submit turn action (prod with VRF)",
        },
        {
          name: "continue_after_halftime",
          entrypoint: "continue_after_halftime",
          description: "Continue to second half",
        },
        {
          name: "claim_game_reward",
          entrypoint: "claim_game_reward",
          description: "Claim game reward",
        },
      ],
    },
    [CONTRACTS.player_actions]: {
      methods: [
        {
          name: "register_player",
          entrypoint: "register_player",
          description: "Register a new player",
        },
        {
          name: "set_formation",
          entrypoint: "set_formation",
          description: "Set team formation",
        },
        {
          name: "equip_starter",
          entrypoint: "equip_starter",
          description: "Equip starter card",
        },
        {
          name: "unequip_starter",
          entrypoint: "unequip_starter",
          description: "Unequip starter card",
        },
      ],
    },
    [CONTRACTS.market_actions]: {
      methods: [
        {
          name: "purchase_card_from_shop",
          entrypoint: "purchase_card_from_shop",
          description: "Purchase card from shop",
        },
        {
          name: "sell_card_to_shop",
          entrypoint: "sell_card_to_shop",
          description: "Sell card to shop",
        },
      ],
    },
  },
};

// ── Provider Configuration ────────────────────────────────────────────────────
const provider = jsonRpcProvider({
  rpc: (chain) => {
    if (chain?.id === BigInt(KATANA_CHAIN_ID)) {
      return { nodeUrl: KATANA_URL, blockIdentifier: "latest" };
    }
    if (chain?.id === sepolia.id) {
      return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
    }
    if (chain?.id === mainnet.id) {
      return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
    }
    return { nodeUrl: KATANA_URL };
  },
});

const SEPOLIA_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const MAINNET_URL = "https://api.cartridge.gg/x/starknet/mainnet";
const STALE_CHAIN_NEEDLES = [
  KATANA_CHAIN_ID,
  "0x57505f5a41504643",
  "WP_ZAPFC",
  "wp_zapfc",
];

function clearStaleControllerChainSelection() {
  if (typeof window === "undefined") return;

  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      for (let i = storage.length - 1; i >= 0; i -= 1) {
        const key = storage.key(i);
        if (!key) continue;

        const value = storage.getItem(key) || "";
        const lowerKey = key.toLowerCase();
        const lowerValue = value.toLowerCase();
        const isControllerKey =
          lowerKey.includes("cartridge") ||
          lowerKey.includes("controller") ||
          lowerKey.includes("starknet");
        const hasStaleChain = STALE_CHAIN_NEEDLES.some((needle) => {
          const lowerNeedle = needle.toLowerCase();
          return lowerKey.includes(lowerNeedle) || lowerValue.includes(lowerNeedle);
        });

        if (isControllerKey && hasStaleChain) {
          storage.removeItem(key);
        }
      }
    } catch {
      // Storage can be unavailable in locked-down browsers; the connector still
      // receives the corrected default chain below.
    }
  }
}

if (IS_SEPOLIA || FORCED_SEPOLIA) {
  clearStaleControllerChainSelection();
}

// ── Controller Connector (Created outside React) ───────────────────────────────
// This must be created once at module level, not inside components
const activeChainId = IS_SEPOLIA ? SEPOLIA_CHAIN_ID : CHAIN_ID;
const activeChain = IS_SEPOLIA ? sepolia : katana;
const configuredChains = IS_SEPOLIA ? [sepolia, mainnet] : [katana, sepolia, mainnet];
const controllerChains = IS_SEPOLIA
  ? [
      { rpcUrl: SEPOLIA_URL },
      { rpcUrl: MAINNET_URL },
    ]
  : [
      { rpcUrl: KATANA_URL },
      { rpcUrl: SEPOLIA_URL },
      { rpcUrl: MAINNET_URL },
    ];

const connector = new ControllerConnector({
  chains: controllerChains,
  defaultChainId: activeChainId,
  policies: USE_CARTRIDGE ? policies : undefined,
  rpcUrl: RPC_URL,
  shouldOverridePresetPolicies: true,
});

// ── Starknet Provider Wrapper ─────────────────────────────────────────────────
export function StarknetProvider({ children }) {
  return (
    <StarknetConfig
      autoConnect={USE_CARTRIDGE}
      defaultChainId={BigInt(activeChainId)}
      chains={configuredChains}
      provider={provider}
      connectors={[connector]}
      initialChain={activeChain}
      explorer={cartridge}
    >
      {children}
    </StarknetConfig>
  );
}
