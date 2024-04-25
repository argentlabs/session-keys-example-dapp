import { RpcProvider, constants } from "starknet";

export const ETHTokenAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_7",
  chainId: constants.StarknetChainId.SN_SEPOLIA,
});
