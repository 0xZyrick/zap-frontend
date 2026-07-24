import { Account, RpcProvider } from "starknet";
import { DEV_ACCOUNT, RPC_URL } from "./dojoConfig";

// Wrapper RPC provider that converts "pending" to "latest" for Cartridge Katana compatibility
class KatanaRpcProvider extends RpcProvider {
  constructor(options) {
    super({ ...options, blockIdentifier: "latest" });

    // starknet.js account.execute() calls the provider's internal channel
    // directly for getClassAt/getNonce/fee estimation. Patch that boundary too.
    if (this.channel) {
      this.channel.blockIdentifier = "latest";
      const fetch = this.channel.fetch.bind(this.channel);
      this.channel.fetch = async (method, params, id) => {
        const response = await fetch(method, this.normalizeBlockIds(params), id);
        if (method !== "starknet_estimateFee") return response;

        return {
          json: async () => this.normalizeEstimateFeeResponse(await response.json()),
        };
      };
    }
  }

  normalizeBlockIds(value) {
    if (value === "pending") return "latest";
    if (Array.isArray(value)) return value.map((item) => this.normalizeBlockIds(item));
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, this.normalizeBlockIds(item)])
      );
    }
    return value;
  }

  normalizeEstimateFeeResponse(body) {
    if (!Array.isArray(body?.result)) return body;

    return {
      ...body,
      result: body.result.map((fee) => {
        if (!fee || fee.gas_consumed !== undefined) return fee;

        return {
          ...fee,
          gas_consumed: fee.l1_gas_consumed ?? fee.l2_gas_consumed ?? "0x0",
          gas_price: fee.l1_gas_price ?? fee.l2_gas_price ?? "0x0",
          data_gas_consumed: fee.l1_data_gas_consumed ?? "0x0",
          data_gas_price: fee.l1_data_gas_price ?? "0x0",
          unit: fee.unit ?? "FRI",
        };
      }),
    };
  }

  async getNonceForAddress(contractAddress, blockIdentifier = "latest") {
    return super.getNonceForAddress(contractAddress, blockIdentifier === "pending" ? "latest" : blockIdentifier);
  }
}

export const devProvider = new KatanaRpcProvider({ nodeUrl: RPC_URL });

export const devAccount = (() => {
  const acc = new Account({
    provider: devProvider,
    address: DEV_ACCOUNT.address,
    signer: DEV_ACCOUNT.privateKey,
    cairoVersion: undefined,
    transactionVersion: "0x3",
  });
  return acc;
})();
