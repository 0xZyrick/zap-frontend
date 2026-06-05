// ─────────────────────────────────────────────────────────────────────────────
//  ZAP · ConnectButton
//  Wallet connection button that displays connection status and handles
//  Cartridge Controller connection with session policies.
// ─────────────────────────────────────────────────────────────────────────────

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useEffect } from "react";

export function ConnectButton({ onConnected, onDisconnected }) {
  const { account, address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const displayAddress = isConnected && address
    ? address.slice(0, 6) + "···" + address.slice(-4)
    : "";

  // Get the Cartridge controller connector
  const controllerConnector = connectors.find((c) =>
    c.id?.toLowerCase().includes("controller")
  );

  // Notify parent of connection state changes
  useEffect(() => {
    if (isConnected && address) {
      onConnected?.({ account, address });
    } else {
      onDisconnected?.();
    }
  }, [isConnected, address, account, onConnected, onDisconnected]);

  const handleConnect = async () => {
    if (isConnected) {
      disconnect();
      return;
    }

    if (controllerConnector) {
      try {
        await connectAsync({ connector: controllerConnector });
      } catch {
        // Connection failures are surfaced by the wallet/controller UI.
      }
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isPending || !controllerConnector}
      style={{
        padding: "10px 16px",
        borderRadius: "8px",
        border: "2px solid #18c158",
        background: isConnected
          ? "linear-gradient(135deg, rgba(24,193,88,.15), rgba(24,193,88,.05))"
          : "rgba(24,193,88,.08)",
        color: "#18c158",
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: ".1em",
        cursor: isPending || !controllerConnector ? "not-allowed" : "pointer",
        opacity: isPending || !controllerConnector ? 0.5 : 1,
        transition: "all 0.2s ease",
      }}
    >
      {isPending ? "🔄 Connecting..." : isConnected ? `✓ ${displayAddress}` : "Connect Wallet"}
    </button>
  );
}
