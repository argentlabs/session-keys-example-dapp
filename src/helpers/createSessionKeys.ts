import { ETHTokenAddress } from "@/constants";
import { createOffchainSessionV5 } from "@argent/x-sessions";
import { AccountInterface, num } from "starknet";
import { parseUnits } from "./token";

const createSessionKeys = async (sessionKey: string, approvedFees: string, account: AccountInterface) => {
  return await createOffchainSessionV5(
    {
      sessionKey,
      expirationTime: Math.floor((Date.now() + 1000 * 60 * 60 * 24) / 1000), // 1 day in seconds
      allowedMethods: [
        {
          contractAddress: ETHTokenAddress,
          method: "transfer",
        },
      ],
    },
    account as any,
    {
      tokenAddress: ETHTokenAddress, // Only used for test purposes in this dapp
      maximumAmount: {
        low: num.toHex(parseUnits(approvedFees, 18).value) as `0x${string}`,
        high: "0x0",
      },
    }
  );
};

export { createSessionKeys };
