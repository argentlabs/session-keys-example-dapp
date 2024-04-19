import { CreateSessionOptions, SessionParams, createSessionAccount } from "@argent/x-sessions";
import { FC } from "react";
import { Account } from "starknet";

import { ETHTokenAddress, provider } from "@/constants";
import { Status } from "@/helpers/status";
import { StarknetWindowObject } from "starknetkit";
import { StarknetWindowObject as StarknetWindowObjectSN } from "starknet-types";
import { parseUnits } from "@/helpers/token";

interface HybridSessionKeysSignProps {
  wallet: StarknetWindowObject;
  setTransactionStatus: (status: Status) => void;
  setHybridSessionAccount: (account: Account) => void;
}

const HybridSessionKeysSign: FC<HybridSessionKeysSignProps> = ({
  wallet,
  setTransactionStatus,
  setHybridSessionAccount,
}) => {
  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setTransactionStatus("approve");

      const sessionParams: SessionParams = {
        allowedMethods: [
          {
            "Contract Address": ETHTokenAddress,
            selector: "transfer",
          },
        ],
        expiry: Math.floor((Date.now() + 1000 * 60 * 60 * 24) / 1000) as any,
        metaData: {
          projectID: "test-dapp",
          txFees: [
            {
              tokenAddress: ETHTokenAddress,
              maxAmount: parseUnits("0.1", 18).value.toString(),
            },
          ],
        },
      };

      /* const options: CreateSessionOptions = { wallet: wallet as StarknetWindowObjectSN, useWalletRequestMethods: true }; */

      setHybridSessionAccount(
        await createSessionAccount({
          provider,
          account: wallet.account,
          sessionParams,
          /* options, */
        })
      );

      setTransactionStatus("success");
    } catch (e) {
      console.error(e);
      setTransactionStatus("idle");
    }
  };

  return (
    <form onSubmit={handleCreateSessionSubmit} className="flex flex-col p-4 gap-3">
      <h2 className="text-white">Create session keys</h2>
      <button className="bg-blue-300 p-2 rounded-lg" type="submit">
        Authorize session
      </button>
    </form>
  );
};

export { HybridSessionKeysSign };
