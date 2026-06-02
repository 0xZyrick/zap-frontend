import Controller from "@cartridge/controller";
import { RPC_URL } from "./dojoConfig";

export const controller = new Controller({
  rpcUrl: RPC_URL,
});