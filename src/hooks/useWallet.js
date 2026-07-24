import { useConnect, useAccount, useProvider, useDisconnect } from "@starknet-react/core";
import { useMemo } from "react";
import { USE_CARTRIDGE } from "../lib/dojoConfig";
import { devAccount, devProvider } from "../lib/starknetDev";

export function useWallet() {
  const { connectAsync, connectors, isPending } = useConnect();
  const { account: starknetAccount, address, isConnected } = useAccount();
  const { provider: starknetProvider } = useProvider();
  const { disconnect: disconnectStarknet } = useDisconnect();

  const readyConnector = useMemo(
    () => connectors.find((c) => {
      const id = `${c.id || ""} ${c.name || ""}`.toLowerCase();
      return !id.includes("controller") && !id.includes("cartridge") && c.available?.() !== false;
    }),
    [connectors],
  );
  const cartridgeConnector = useMemo(
    () => connectors.find((c) => {
      const id = `${c.id || ""} ${c.name || ""}`.toLowerCase();
      return id.includes("controller") || id.includes("cartridge");
    }),
    [connectors],
  );

  const connect_wallet = async (mode = "cartridge") => {
    // Dev mode — return prefunded Katana account directly, no Controller needed
    if (!USE_CARTRIDGE) {
      return { account: devAccount, provider: devProvider, address: devAccount.address };
    }
    if (isConnected && starknetAccount && starknetProvider) {
      return { account: starknetAccount, provider: starknetProvider, address };
    }
    const connector = mode === "ready" ? readyConnector : cartridgeConnector;
    if (!connector && mode === "ready") throw new Error("Install Argent X or Braavos to use Ready wallet.");
    if (!connector) throw new Error("Cartridge Controller is not available. Try Ready wallet.");
    await connectAsync({ connector });
    let connectedAddress = null;
    try {
      const accounts = await connector.request?.({
        type: "wallet_requestAccounts",
        params: { silent_mode: true },
      });
      connectedAddress = accounts?.[0] || null;
    } catch {}
    const account = await connector.account(starknetProvider);
    const provider = account?.provider || starknetProvider;
    const walletAddress = account?.address || connectedAddress || address;
    if (!account || !walletAddress) {
      throw new Error("Wallet connection did not return an address");
    }
    return {
      connected: true,
      account,
      provider,
      address: walletAddress,
    };
  };

  // In dev mode expose the dev account directly
  const activeAccount  = USE_CARTRIDGE ? starknetAccount  : devAccount;
  const activeProvider = USE_CARTRIDGE ? starknetProvider : devProvider;
  const activeAddress  = USE_CARTRIDGE ? address          : devAccount.address;

  return {
    account:    activeAccount,
    address:    activeAddress,
    provider:   activeProvider,
    loading:    isPending,
    error:      null,
    connect:    connect_wallet,
    isConnected: isConnected,
    disconnect: disconnectStarknet,
    hasReadyWallet: !!readyConnector,
    hasCartridgeWallet: !!cartridgeConnector,
  };
}
