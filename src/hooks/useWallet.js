import { useConnect, useAccount, useProvider, useDisconnect } from "@starknet-react/core";
import { useMemo } from "react";
import { USE_CARTRIDGE } from "../lib/dojoConfig";
import { devAccount, devProvider } from "../lib/starknetDev";

export function useWallet() {
  const { connectAsync, connectors, isPending } = useConnect();
  const { account: starknetAccount, address, isConnected } = useAccount();
  const { provider: starknetProvider } = useProvider();
  const { disconnect: disconnectStarknet } = useDisconnect();

  const connector = useMemo(() => connectors.find((c) => c.id?.includes("controller")), [connectors]);

  const connect_wallet = async () => {
    // Dev mode — return prefunded Katana account directly, no Controller needed
    if (!USE_CARTRIDGE) {
      return { account: devAccount, provider: devProvider, address: devAccount.address };
    }
    if (isConnected && starknetAccount && starknetProvider) {
      return { account: starknetAccount, provider: starknetProvider, address };
    }
    if (!connector) throw new Error("No Cartridge Controller connector available");
    const result = await connectAsync({ connector });
    return {
      connected: true,
      account: result?.account || starknetAccount,
      provider: starknetProvider,
      address: result?.account?.address || address,
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
  };
}
