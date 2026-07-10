import Controller from "@cartridge/controller";
import { CHAIN_ID, RPC_URL } from "./dojoConfig";

export const controller = new Controller({
  chains: [{ rpcUrl: RPC_URL }],
  defaultChainId: CHAIN_ID,
  rpcUrl: RPC_URL,
});
